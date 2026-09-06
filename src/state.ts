import type { AppState, AuthWizardState } from './types/state';

export const S: AppState = {
  lang: 'sw',
  country: 'TZ',
  session: null,
  profile: null,
  view: 'lang',
  tab: 'home',
  signupRole: 'seller', // used while routing a freshly-created account
  _busy: false,
};

export const A: AuthWizardState = {
  mode: 'signup',
  step: 0,
  role: 'seller',
  sellerType: 'farmer',
  crops: [],
  animals: [],
  items: [],
  farmSize: '',
};

// The real render() dispatch is defined in main.ts (it needs to import
// every screen module — see the plan's note on breaking the render/screens
// circular import). Everything else imports { render } from here and calls
// render(), which always calls through to whatever main.ts last assigned.
export let render: () => void = () => {};

export function setRender(fn: () => void): void {
  render = fn;
}

declare global {
  interface Window {
    WeAgri: { S: AppState; render: () => void };
  }
}

// Exposed for debugging in console, exactly like the original.
window.WeAgri = { S, render: () => render() };
