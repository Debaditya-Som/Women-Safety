'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Timer,
  MapPin,
  PhoneCall,
  Plus,
  X,
  Info,
} from 'lucide-react';
import { useSafeArrival } from '@/hooks/useSafeArrival';
import { usePermissions } from '@/hooks/usePermissions';

// ---------------------------------------------------------------------------
// Duration constants
// ---------------------------------------------------------------------------

const DURATION_PRESETS = [
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '45 min', ms: 45 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '1.5 hrs', ms: 90 * 60 * 1000 },
  { label: '2 hours', ms: 120 * 60 * 1000 },
];

const EXTEND_PRESETS = [
  { label: '+15 min', ms: 15 * 60 * 1000 },
  { label: '+30 min', ms: 30 * 60 * 1000 },
  { label: '+45 min', ms: 45 * 60 * 1000 },
  { label: '+1 hour', ms: 60 * 60 * 1000 },
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCountdown(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDurationLabel(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} minutes`;
  const hrs = mins / 60;
  return hrs === Math.floor(hrs) ? `${hrs} hour${hrs > 1 ? 's' : ''}` : `${hrs} hours`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EscalationCountdown({ expiryMs }: { expiryMs: number }) {
  const [display, setDisplay] = useState(() =>
    formatCountdown(Math.max(0, expiryMs - Date.now())),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setDisplay(formatCountdown(Math.max(0, expiryMs - Date.now())));
    }, 1000);
    return () => clearInterval(id);
  }, [expiryMs]);

  return (
    <span className="tabular-nums font-mono text-sm font-medium">{display}</span>
  );
}

function PermissionBanner({
  onRequest,
}: {
  onRequest: () => void;
}) {
  return (
    <div className="mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">Permissions needed</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Safe Arrival needs location and notification access to protect you.
          </p>
          <button
            onClick={onRequest}
            className="mt-2 text-xs font-semibold text-amber-800 underline underline-offset-2"
          >
            Grant permissions →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Extend Duration Dialog (modal overlay)
// ---------------------------------------------------------------------------

function ExtendDialog({
  onExtend,
  onCancel,
}: {
  onExtend: (ms: number) => void;
  onCancel: () => void;
}) {
  const [customMins, setCustomMins] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  function handleConfirm() {
    if (customMins) {
      const mins = parseInt(customMins, 10);
      if (!isNaN(mins) && mins > 0) onExtend(mins * 60 * 1000);
    } else if (selected !== null) {
      onExtend(selected);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add more time</h2>
          <button onClick={onCancel} className="rounded-full p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          How much additional time do you need to reach your destination?
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {EXTEND_PRESETS.map((p) => (
            <button
              key={p.ms}
              onClick={() => {
                setSelected(p.ms);
                setCustomMins('');
              }}
              className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                selected === p.ms
                  ? 'border-orange-600 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Custom duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="480"
            placeholder="e.g. 20"
            value={customMins}
            onChange={(e) => {
              setCustomMins(e.target.value);
              setSelected(null);
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected && !customMins}
          className="w-full rounded-xl bg-orange-600 py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
        >
          Restart Timer
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State Views
// ---------------------------------------------------------------------------

function IdleView({
  onStart,
  permissionsGranted,
  onRequestPermissions,
}: {
  onStart: (ms: number) => Promise<void>;
  permissionsGranted: boolean;
  onRequestPermissions: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customMins, setCustomMins] = useState('');
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    let durationMs: number | null = null;
    if (customMins) {
      const mins = parseInt(customMins, 10);
      if (!isNaN(mins) && mins > 0) durationMs = mins * 60 * 1000;
    } else if (selected !== null) {
      durationMs = selected;
    }
    if (!durationMs) return;

    setStarting(true);
    await onStart(durationMs);
    setStarting(false);
  }

  const hasSelection = selected !== null || customMins.length > 0;

  return (
    <>
      {!permissionsGranted && (
        <PermissionBanner onRequest={onRequestPermissions} />
      )}

      {/* Hero card */}
      <div className="mx-4 mb-6 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 p-6 text-white shadow-lg">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold">Safe Arrival</h2>
        <p className="mt-1 text-sm text-orange-100 leading-relaxed">
          Set a timer for your journey. If you don't confirm arrival, we'll notify your emergency
          contact automatically.
        </p>
      </div>

      {/* How it works */}
      <div className="mx-4 mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          How it works
        </h3>
        <div className="space-y-3">
          {[
            { icon: Timer, text: 'Set your expected journey time' },
            { icon: Clock, text: 'Receive a check-in notification when time expires' },
            { icon: CheckCircle2, text: 'Confirm arrival or extend timer if needed' },
            { icon: PhoneCall, text: 'Emergency alert sent if no response in 10 minutes' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <Icon className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Duration selector */}
      <div className="mx-4 mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Select journey duration
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p.ms}
              onClick={() => {
                setSelected(p.ms);
                setCustomMins('');
              }}
              className={`rounded-xl border-2 py-3.5 text-sm font-semibold transition-all ${
                selected === p.ms
                  ? 'border-orange-600 bg-orange-50 text-orange-700'
                  : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-orange-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wide">
            Custom (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="480"
            placeholder="Enter minutes…"
            value={customMins}
            onChange={(e) => {
              setCustomMins(e.target.value);
              setSelected(null);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      {/* Start button */}
      <div className="mx-4 mb-8">
        <button
          onClick={handleStart}
          disabled={!hasSelection || starting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-5 text-base font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40"
        >
          {starting ? (
            <span className="animate-pulse">Starting…</span>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Start Safe Journey
            </>
          )}
        </button>
      </div>
    </>
  );
}

function ActiveView({
  timeRemaining,
  arrivalTime,
  startedAt,
  durationMs,
  onCancel,
}: {
  timeRemaining: number;
  arrivalTime: number;
  startedAt: number;
  durationMs: number;
  onCancel: () => void;
}) {
  return (
    <div className="mx-4 space-y-4">
      {/* Status badge */}
      <div className="flex items-center justify-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 w-fit mx-auto">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-semibold text-green-700">Journey Active</span>
      </div>

      {/* Countdown card */}
      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white text-center shadow-xl">
        <p className="text-sm font-medium text-green-100 mb-2">Time remaining</p>
        <div className="font-mono text-6xl font-bold tracking-tight tabular-nums">
          {formatCountdown(timeRemaining)}
        </div>
        <p className="mt-3 text-sm text-green-100">
          Check-in at {formatTime(arrivalTime)}
        </p>
      </div>

      {/* Journey details */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Started</span>
          <span className="font-medium text-gray-800">{formatTime(startedAt)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Duration set</span>
          <span className="font-medium text-gray-800">{formatDurationLabel(durationMs)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Check-in time</span>
          <span className="font-medium text-gray-800">{formatTime(arrivalTime)}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <p className="text-xs text-gray-400 leading-relaxed">
          You'll receive a notification when the timer expires. Confirm your arrival or extend the
          timer. No response within 10 minutes triggers an emergency alert.
        </p>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="w-full rounded-2xl border-2 border-gray-200 py-4 text-sm font-semibold text-gray-500 transition-colors hover:border-red-200 hover:text-red-600 active:scale-95"
      >
        Cancel Journey
      </button>
    </div>
  );
}

function AwaitingCheckView({
  checkExpiry,
  onYes,
  onNo,
}: {
  checkExpiry: number;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="mx-4 space-y-4">
      {/* Status */}
      <div className="flex items-center justify-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 w-fit mx-auto">
        <Clock className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-sm font-semibold text-amber-700">Awaiting Confirmation</span>
      </div>

      {/* Main card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Have you reached safely?</h2>
        <p className="mt-2 text-sm text-orange-100">
          Your journey timer has ended. Please confirm your safe arrival.
        </p>
      </div>

      {/* YES button */}
      <button
        onClick={onYes}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95"
      >
        <CheckCircle2 className="h-6 w-6" />
        Yes, I've arrived safely
      </button>

      {/* NO button */}
      <button
        onClick={onNo}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 py-4 text-base font-semibold text-amber-800 transition-all active:scale-95"
      >
        <Plus className="h-5 w-5" />
        No, I need more time
      </button>

      {/* Escalation warning */}
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700">Auto-escalation in</p>
            <p className="text-sm text-red-600">
              <EscalationCountdown expiryMs={checkExpiry} />
              {' '}— emergency alert will be sent if no response
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AwaitingWarningView({
  warningExpiry,
  onYes,
  onNo,
}: {
  warningExpiry: number;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="mx-4 space-y-4">
      {/* Status */}
      <div className="flex items-center justify-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-2 w-fit mx-auto">
        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
        <span className="text-sm font-semibold text-red-700">Urgent — Response Required</span>
      </div>

      {/* Warning card */}
      <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-8 text-white text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">We're concerned about you</h2>
        <p className="mt-2 text-sm text-red-100 leading-relaxed">
          No response received to the safe arrival check. Please confirm you are safe immediately.
        </p>
      </div>

      {/* YES button */}
      <button
        onClick={onYes}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95"
      >
        <CheckCircle2 className="h-6 w-6" />
        I'm safe — cancel alert
      </button>

      {/* NO button */}
      <button
        onClick={onNo}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 py-4 text-base font-semibold text-red-700 transition-all active:scale-95"
      >
        <Plus className="h-5 w-5" />
        Need more time
      </button>

      {/* SOS countdown */}
      <div className="rounded-xl border border-red-300 bg-red-100 p-4">
        <div className="flex items-start gap-2">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
          <div>
            <p className="text-sm font-bold text-red-800">Emergency SOS in</p>
            <p className="text-sm text-red-700">
              <EscalationCountdown expiryMs={warningExpiry} />
              {' '}— your location will be sent to emergency contacts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SOSTriggeredView({
  isSendingSOS,
  sosError,
  onDone,
}: {
  isSendingSOS: boolean;
  sosError: string | null;
  onDone: () => void;
}) {
  return (
    <div className="mx-4 space-y-4">
      {/* Status */}
      <div className="flex items-center justify-center gap-2 rounded-full bg-red-100 border border-red-300 px-4 py-2 w-fit mx-auto">
        <AlertOctagon className="h-3.5 w-3.5 text-red-700" />
        <span className="text-sm font-bold text-red-800">Emergency Alert Sent</span>
      </div>

      {/* SOS card */}
      <div className="rounded-2xl bg-gradient-to-br from-red-700 to-red-900 p-8 text-white text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <PhoneCall className="h-8 w-8 text-white" />
        </div>
        {isSendingSOS ? (
          <>
            <h2 className="text-2xl font-bold animate-pulse">Sending SOS…</h2>
            <p className="mt-2 text-sm text-red-200">Acquiring your location and sending alert</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">SOS Alert Sent</h2>
            <p className="mt-2 text-sm text-red-200 leading-relaxed">
              Your emergency contact has been notified with your location.
            </p>
          </>
        )}
      </div>

      {sosError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{sosError}</p>
          </div>
        </div>
      )}

      {/* Location info */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <MapPin className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">GPS location shared</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Your current coordinates have been included in the alert message
            </p>
          </div>
        </div>
      </div>

      {/* Emergency contacts reminder */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          If you need immediate help
        </p>
        <div className="space-y-2">
          {[
            { name: 'Women Helpline', number: '1091' },
            { name: 'Police Emergency', number: '100' },
            { name: 'Emergency Services', number: '112' },
          ].map(({ name, number }) => (
            <a
              key={number}
              href={`tel:${number}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:bg-red-50"
            >
              <span className="text-sm font-medium text-gray-700">{name}</span>
              <span className="flex items-center gap-1 text-sm font-bold text-red-600">
                <PhoneCall className="h-3.5 w-3.5" />
                {number}
              </span>
            </a>
          ))}
        </div>
      </div>

      <button
        onClick={onDone}
        disabled={isSendingSOS}
        className="w-full rounded-2xl border-2 border-gray-200 py-4 text-sm font-semibold text-gray-600 disabled:opacity-40"
      >
        Start New Journey
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SafeArrivalPage() {
  const {
    status,
    journey,
    timeRemaining,
    showExtendDialog,
    setShowExtendDialog,
    isSendingSOS,
    sosError,
    startJourney,
    confirmArrived,
    extendJourney,
    cancelJourney,
  } = useSafeArrival();

  const { location, notifications, requestPermissions } = usePermissions();
  const permissionsGranted = location === 'granted' && notifications === 'granted';

  // Status bar styling
  const statusBarStyle =
    status === 'idle'
      ? 'from-orange-50 to-white'
      : status === 'active'
        ? 'from-green-50 to-white'
        : status === 'sos_triggered'
          ? 'from-red-100 to-red-50'
          : status === 'awaiting_warning'
            ? 'from-red-50 to-white'
            : 'from-amber-50 to-white';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${statusBarStyle}`}>
      {/* Header */}
      <header className="sticky top-16 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-base font-bold text-gray-900">Safe Arrival</h1>
          {status !== 'idle' && (
            <div className="ml-auto">
              {status === 'active' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              )}
              {(status === 'awaiting_check' || status === 'awaiting_warning') && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Check-in
                </span>
              )}
              {status === 'sos_triggered' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                  SOS Sent
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="pb-10 pt-5 space-y-0">
        {status === 'idle' && (
          <IdleView
            onStart={startJourney}
            permissionsGranted={permissionsGranted}
            onRequestPermissions={requestPermissions}
          />
        )}

        {status === 'active' && journey && (
          <ActiveView
            timeRemaining={timeRemaining}
            arrivalTime={journey.arrivalTime}
            startedAt={journey.startedAt}
            durationMs={journey.durationMs}
            onCancel={cancelJourney}
          />
        )}

        {status === 'awaiting_check' && journey && (
          <AwaitingCheckView
            checkExpiry={journey.checkExpiry}
            onYes={confirmArrived}
            onNo={() => setShowExtendDialog(true)}
          />
        )}

        {status === 'awaiting_warning' && journey && (
          <AwaitingWarningView
            warningExpiry={journey.warningExpiry}
            onYes={confirmArrived}
            onNo={() => setShowExtendDialog(true)}
          />
        )}

        {status === 'sos_triggered' && (
          <SOSTriggeredView
            isSendingSOS={isSendingSOS}
            sosError={sosError}
            onDone={cancelJourney}
          />
        )}
      </main>

      {/* Extend dialog */}
      {showExtendDialog && (
        <ExtendDialog
          onExtend={extendJourney}
          onCancel={() => setShowExtendDialog(false)}
        />
      )}
    </div>
  );
}
