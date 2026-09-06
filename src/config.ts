import type { AppConfig } from './types/config';

// Injected by the Express server (see server/index.ts's /config.js route,
// loaded via a <script> tag before this bundle) — replaces the hardcoded
// window.CFG object the original single-file app shipped with.
declare global {
  interface Window {
    CFG: AppConfig;
  }
}

export const CFG: AppConfig = window.CFG;
