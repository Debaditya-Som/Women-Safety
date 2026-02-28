'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'prompt';

export interface PermissionsState {
  location: PermissionStatus;
  notifications: PermissionStatus;
  initialized: boolean;
  requesting: boolean;
}

const INIT_FLAG_KEY = 'sheild_perms_initialized';

function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor?.isNativePlatform?.()
  );
}

async function createNotificationChannel(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.createChannel({
      id: 'safe-arrival',
      name: 'Safe Arrival',
      description: 'Safe arrival check-ins and emergency escalation alerts',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#c2410c',
    });
  } catch {
    // Non-fatal: channel creation may fail on some versions
  }
}

async function registerNotificationActionTypes(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'SAFE_ARRIVAL_CHECK',
          actions: [
            { id: 'YES', title: 'Yes, arrived safely ✓', foreground: true },
            { id: 'NO', title: 'Need more time', foreground: true },
          ],
        },
        {
          id: 'SAFE_ARRIVAL_WARNING',
          actions: [
            { id: 'YES', title: "I'm safe now ✓", foreground: true },
            { id: 'NO', title: 'Still need more time', foreground: true },
          ],
        },
      ],
    });
  } catch {
    // Non-fatal
  }
}

export function usePermissions() {
  const [state, setState] = useState<PermissionsState>({
    location: 'unknown',
    notifications: 'unknown',
    initialized: false,
    requesting: false,
  });

  const initRef = useRef(false);

  const checkPermissions = useCallback(async (): Promise<PermissionsState> => {
    if (typeof window === 'undefined') {
      return { location: 'unknown', notifications: 'unknown', initialized: false, requesting: false };
    }

    let location: PermissionStatus = 'unknown';
    let notifications: PermissionStatus = 'unknown';

    if (isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const result = await Geolocation.checkPermissions();
        location =
          result.location === 'granted'
            ? 'granted'
            : result.location === 'denied'
              ? 'denied'
              : 'prompt';
      } catch {
        location = 'unknown';
      }

      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const result = await LocalNotifications.checkPermissions();
        notifications =
          result.display === 'granted'
            ? 'granted'
            : result.display === 'denied'
              ? 'denied'
              : 'prompt';
      } catch {
        notifications = 'unknown';
      }
    } else {
      if ('permissions' in navigator) {
        try {
          const r = await navigator.permissions.query({ name: 'geolocation' });
          location = r.state as PermissionStatus;
        } catch {
          location = 'unknown';
        }
        try {
          const r = await navigator.permissions.query({
            name: 'notifications' as PermissionName,
          });
          notifications = r.state as PermissionStatus;
        } catch {
          notifications = 'unknown';
        }
      }
      if ('Notification' in window) {
        notifications =
          Notification.permission === 'granted'
            ? 'granted'
            : Notification.permission === 'denied'
              ? 'denied'
              : 'prompt';
      }
    }

    const next: PermissionsState = {
      location,
      notifications,
      initialized: true,
      requesting: false,
    };
    setState(next);
    return next;
  }, []);

  const requestPermissions = useCallback(async (): Promise<PermissionsState> => {
    if (typeof window === 'undefined') {
      return { location: 'unknown', notifications: 'unknown', initialized: false, requesting: true };
    }

    setState((prev) => ({ ...prev, requesting: true }));

    let location: PermissionStatus = 'unknown';
    let notifications: PermissionStatus = 'unknown';

    if (isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const result = await Geolocation.requestPermissions();
        location =
          result.location === 'granted'
            ? 'granted'
            : result.location === 'denied'
              ? 'denied'
              : 'prompt';
      } catch {
        location = 'denied';
      }

      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const result = await LocalNotifications.requestPermissions();
        notifications =
          result.display === 'granted'
            ? 'granted'
            : result.display === 'denied'
              ? 'denied'
              : 'prompt';
      } catch {
        notifications = 'denied';
      }
    } else {
      // Browser / PWA
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(() => resolve(), reject, { timeout: 8000 });
        });
        location = 'granted';
      } catch {
        location = 'denied';
      }

      if ('Notification' in window) {
        try {
          const result = await Notification.requestPermission();
          notifications =
            result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'prompt';
        } catch {
          notifications = 'denied';
        }
      }
    }

    const next: PermissionsState = {
      location,
      notifications,
      initialized: true,
      requesting: false,
    };
    setState(next);
    localStorage.setItem(INIT_FLAG_KEY, '1');
    return next;
  }, []);

  const initialize = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    // Always check current status on startup
    await checkPermissions();

    // Set up notification infrastructure (non-blocking)
    await createNotificationChannel();
    await registerNotificationActionTypes();

    // On first ever launch, proactively request permissions
    if (!localStorage.getItem(INIT_FLAG_KEY)) {
      await requestPermissions();
    }
  }, [checkPermissions, requestPermissions]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    requestPermissions,
    checkPermissions,
  };
}
