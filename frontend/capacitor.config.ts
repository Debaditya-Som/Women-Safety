import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Unique reverse-domain app identifier
  appId: "com.sheild.womensafety",
  appName: "SHEild",
  // Points to the Next.js static export output directory
  webDir: "out",
  server: {
    // Serve app as https://localhost on Android so service workers function
    androidScheme: "https",
  },
  android: {
    // Allow loading local resources and mixed content during development
    allowMixedContent: true,
    // Use hardware-accelerated WebView
    webContentsDebuggingEnabled: false,
  },
};

export default config;
