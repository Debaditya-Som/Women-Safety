import { registerPlugin } from "@capacitor/core";

type PermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";

export interface NativeCallPlugin {
  checkPermissions(): Promise<{ call: PermissionState }>;
  requestPermissions(): Promise<{ call: PermissionState }>;
  callNumber(options: { phoneNumber: string }): Promise<{ called: boolean }>;
}

export const NativeCall = registerPlugin<NativeCallPlugin>("NativeCall");

