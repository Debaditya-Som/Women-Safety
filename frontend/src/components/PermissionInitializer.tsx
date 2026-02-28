'use client';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * Mounts silently in the root layout to initialize Capacitor notification
 * channels, register action types, and request permissions on first launch.
 * Renders nothing — side-effects only.
 */
export default function PermissionInitializer() {
  // The hook handles all initialization logic internally (on mount, once).
  usePermissions();
  return null;
}
