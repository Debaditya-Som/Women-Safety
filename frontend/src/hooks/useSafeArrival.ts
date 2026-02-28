'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SafeArrivalStatus =
  | 'idle'
  | 'active'
  | 'awaiting_check'
  | 'awaiting_warning'
  | 'sos_triggered';

export interface SafeArrivalJourney {
  status: SafeArrivalStatus;
  journeyId: string;
  startedAt: number;
  durationMs: number;
  /** Unix ms: when the initial "Have you arrived?" notification fires */
  arrivalTime: number;
  /** Unix ms: 5 min after arrivalTime — escalate to warning */
  checkExpiry: number;
  /** Unix ms: 5 min after checkExpiry — trigger SOS */
  warningExpiry: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sheild_safe_arrival_v1';
const CHECK_WINDOW_MS = 1 * 60 * 1000;
const WARNING_WINDOW_MS = 1 * 60 * 1000;

const NOTIF_CHECK_ID = 1001;
const NOTIF_WARNING_ID = 1002;
const NOTIF_SOS_ID = 1003;

const SOS_EMERGENCY_NUMBER = '+918617795062';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor?.isNativePlatform?.()
  );
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadJourney(): SafeArrivalJourney | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SafeArrivalJourney) : null;
  } catch {
    return null;
  }
}

function persistJourney(j: SafeArrivalJourney): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(j));
  }
}

function eraseJourney(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ---------------------------------------------------------------------------
// Notification helpers
// ---------------------------------------------------------------------------

async function scheduleNotif(
  id: number,
  title: string,
  body: string,
  at: Date,
  actionTypeId?: string,
): Promise<void> {
  if (at.getTime() <= Date.now()) return; // Don't schedule past notifications

  if (isNativePlatform()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at, allowWhileIdle: true },
            actionTypeId,
            channelId: 'safe-arrival',
            smallIcon: 'ic_stat_shield',
            extra: { safeArrival: true },
          },
        ],
      });
    } catch {
      /* non-fatal: in-app timers will still escalate when app is foregrounded */
    }
  } else if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    // PWA fallback: use setTimeout-based notification
    // Note: only fires while the browser tab is open; in-app timers handle the rest
    const delay = at.getTime() - Date.now();
    setTimeout(
      () =>
        new Notification(title, {
          body,
          tag: `sa-${id}`,
          requireInteraction: true,
          icon: '/icons/icon-192x192.png',
        }),
      delay,
    );
  }
}

async function cancelNotif(id: number): Promise<void> {
  if (isNativePlatform()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch {
      /* non-fatal */
    }
  }
}

async function cancelAllNotifs(): Promise<void> {
  await Promise.all([
    cancelNotif(NOTIF_CHECK_ID),
    cancelNotif(NOTIF_WARNING_ID),
    cancelNotif(NOTIF_SOS_ID),
  ]);
}

// ---------------------------------------------------------------------------
// Location helper
// ---------------------------------------------------------------------------

async function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  if (isNativePlatform()) {
    const { Geolocation } = await import('@capacitor/geolocation');
    const pos = await Geolocation.getCurrentPosition({
      timeout: 15000,
      enableHighAccuracy: true,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      reject,
      { timeout: 15000, enableHighAccuracy: true },
    );
  });
}

// ---------------------------------------------------------------------------
// SOS dispatch
// ---------------------------------------------------------------------------

async function dispatchSOS(latitude: number, longitude: number): Promise<void> {
  const mapsLink =
    latitude !== 0
      ? `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
      : 'Location unavailable';

  await fetch('/api/send-sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude,
      longitude,
      emergencyContact: SOS_EMERGENCY_NUMBER,
    }),
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSafeArrival() {
  const [journey, setJourney] = useState<SafeArrivalJourney | null>(null);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);

  // Refs so timer/listener callbacks always read the latest values without
  // becoming stale through closure capture.
  const journeyRef = useRef<SafeArrivalJourney | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const escalationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmArrivedRef = useRef<() => void>(() => {});

  // Single source of truth for setting journey state
  function applyJourney(j: SafeArrivalJourney | null) {
    journeyRef.current = j;
    setJourney(j);
    if (j) persistJourney(j);
    else eraseJourney();
  }

  // ---------------------------------------------------------------------------
  // Core actions (defined before effects that reference them via refs)
  // ---------------------------------------------------------------------------

  const confirmArrived = useCallback(async () => {
    await cancelAllNotifs();
    applyJourney(null);
    setShowExtendDialog(false);
    setTimeRemaining(0);
    setSosError(null);
  }, []);

  // Keep ref current so Capacitor listener can call it without stale closure
  useEffect(() => {
    confirmArrivedRef.current = confirmArrived;
  }, [confirmArrived]);

  const triggerSOS = useCallback(async (j: SafeArrivalJourney) => {
    const updated: SafeArrivalJourney = { ...j, status: 'sos_triggered' };
    applyJourney(updated);
    setIsSendingSOS(true);
    setSosError(null);

    try {
      const pos = await getCurrentPosition();
      await dispatchSOS(pos.latitude, pos.longitude);
    } catch {
      // GPS failed — attempt SOS with zero coords so recipient is at least alerted
      try {
        await dispatchSOS(0, 0);
      } catch {
        setSosError('SOS could not be sent automatically. Please call emergency services directly.');
      }
    } finally {
      setIsSendingSOS(false);
    }
  }, []);

  const triggerSOSRef = useRef(triggerSOS);
  useEffect(() => {
    triggerSOSRef.current = triggerSOS;
  }, [triggerSOS]);

  // ---------------------------------------------------------------------------
  // State reconciliation (called on mount & whenever app is foregrounded)
  // ---------------------------------------------------------------------------

  const reconcile = useCallback(async () => {
    const j = loadJourney();
    if (!j) {
      applyJourney(null);
      return;
    }

    const now = Date.now();

    if (j.status === 'awaiting_warning' && now >= j.warningExpiry) {
      await triggerSOSRef.current(j);
      return;
    }

    if (j.status === 'awaiting_check' && now >= j.checkExpiry) {
      const updated = { ...j, status: 'awaiting_warning' as const };
      applyJourney(updated);
      return;
    }

    if (j.status === 'active' && now >= j.arrivalTime) {
      const updated = { ...j, status: 'awaiting_check' as const };
      applyJourney(updated);
      return;
    }

    applyJourney(j);
    if (j.status === 'active') {
      setTimeRemaining(Math.max(0, j.arrivalTime - now));
    }
  }, []);

  // ---------------------------------------------------------------------------
  // startJourney
  // ---------------------------------------------------------------------------

  const startJourney = useCallback(async (durationMs: number) => {
    const now = Date.now();
    const arrivalTime = now + durationMs;
    const checkExpiry = arrivalTime + CHECK_WINDOW_MS;
    const warningExpiry = checkExpiry + WARNING_WINDOW_MS;

    const j: SafeArrivalJourney = {
      status: 'active',
      journeyId: `j_${now}_${Math.random().toString(36).slice(2, 7)}`,
      startedAt: now,
      durationMs,
      arrivalTime,
      checkExpiry,
      warningExpiry,
    };

    await cancelAllNotifs();
    applyJourney(j);
    setTimeRemaining(durationMs);
    setShowExtendDialog(false);
    setSosError(null);

    await scheduleNotif(
      NOTIF_CHECK_ID,
      'Have you reached safely?',
      'Tap YES to confirm your safe arrival, or NO if you need more time.',
      new Date(arrivalTime),
      'SAFE_ARRIVAL_CHECK',
    );
    await scheduleNotif(
      NOTIF_WARNING_ID,
      "We're concerned about you ⚠️",
      'No response received. Please confirm you are safe — emergency alerts will be sent shortly.',
      new Date(checkExpiry),
      'SAFE_ARRIVAL_WARNING',
    );
    await scheduleNotif(
      NOTIF_SOS_ID,
      '🚨 Emergency alert being sent',
      'No safe arrival confirmation received. Emergency contacts are being notified now. Open app to cancel.',
      new Date(warningExpiry),
    );
  }, []);

  const extendJourney = useCallback(
    async (additionalMs: number) => {
      await cancelAllNotifs();
      setShowExtendDialog(false);
      await startJourney(additionalMs);
    },
    [startJourney],
  );

  const cancelJourney = useCallback(async () => {
    await cancelAllNotifs();
    applyJourney(null);
    setShowExtendDialog(false);
    setTimeRemaining(0);
    setSosError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Countdown tick (updates timeRemaining every second while active)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (journey?.status !== 'active') return;

    countdownRef.current = setInterval(() => {
      const j = journeyRef.current;
      if (!j) return;

      const remaining = j.arrivalTime - Date.now();
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        const updated = { ...j, status: 'awaiting_check' as const };
        applyJourney(updated);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [journey?.status]);

  // ---------------------------------------------------------------------------
  // Escalation timers (in-foreground — fires even if notifications are missed)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (escalationRef.current) {
      clearTimeout(escalationRef.current);
      escalationRef.current = null;
    }

    if (journey?.status === 'awaiting_check') {
      const delay = journey.checkExpiry - Date.now();
      if (delay <= 0) {
        const updated = { ...journey, status: 'awaiting_warning' as const };
        applyJourney(updated);
        return;
      }
      escalationRef.current = setTimeout(() => {
        const j = journeyRef.current;
        if (j?.status === 'awaiting_check') {
          const updated = { ...j, status: 'awaiting_warning' as const };
          applyJourney(updated);
        }
      }, delay);
    }

    if (journey?.status === 'awaiting_warning') {
      const delay = journey.warningExpiry - Date.now();
      if (delay <= 0) {
        const j = journeyRef.current;
        if (j) triggerSOSRef.current(j);
        return;
      }
      escalationRef.current = setTimeout(() => {
        const j = journeyRef.current;
        if (j?.status === 'awaiting_warning') {
          triggerSOSRef.current(j);
        }
      }, delay);
    }

    return () => {
      if (escalationRef.current) clearTimeout(escalationRef.current);
    };
  }, [journey?.status, journey?.checkExpiry, journey?.warningExpiry]);

  // ---------------------------------------------------------------------------
  // App visibility change — reconcile on foreground
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') reconcile();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reconcile]);

  // ---------------------------------------------------------------------------
  // Capacitor notification action listener
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === 'undefined' || !isNativePlatform()) return;

    let removeListener: (() => void) | null = null;

    (async () => {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const handle = await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (event) => {
            const { actionId, notification } = event;
            const isSafeArrivalNotif = [
              NOTIF_CHECK_ID,
              NOTIF_WARNING_ID,
              NOTIF_SOS_ID,
            ].includes(notification.id);
            if (!isSafeArrivalNotif) return;

            if (notification.id === NOTIF_SOS_ID) {
              const j = journeyRef.current;
              if (j && j.status !== 'sos_triggered') {
                triggerSOSRef.current(j);
              }
              return;
            }

            // Check or Warning notification
            if (actionId === 'YES') {
              confirmArrivedRef.current();
            } else if (actionId === 'NO') {
              setShowExtendDialog(true);
            }
            // actionId === 'tap' means user tapped the body — app opens, current state shows
          },
        );
        removeListener = () => handle.remove();
      } catch {
        /* Not in Capacitor context */
      }
    })();

    return () => removeListener?.();
  }, []);

  // ---------------------------------------------------------------------------
  // Initial mount — load persisted state
  // ---------------------------------------------------------------------------

  useEffect(() => {
    reconcile();
  }, [reconcile]);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  return {
    journey,
    status: journey?.status ?? ('idle' as SafeArrivalStatus),
    timeRemaining,
    showExtendDialog,
    setShowExtendDialog,
    isSendingSOS,
    sosError,
    startJourney,
    confirmArrived,
    extendJourney,
    cancelJourney,
  };
}
