import { registerPlugin } from "@capacitor/core";

type PermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";

export interface NativeSmsPlugin {
  checkPermissions(): Promise<{ sms: PermissionState }>;
  requestPermissions(): Promise<{ sms: PermissionState }>;
  sendSMS(options: { to: string; message: string }): Promise<{ sent: boolean }>;
}

export const NativeSms = registerPlugin<NativeSmsPlugin>("NativeSms");

