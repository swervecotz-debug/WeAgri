import type { Session } from '@supabase/supabase-js';

// Extended in later phases (declaration merging) as more screens are
// ported and touch more ad-hoc `S.*`/`A.*` fields than the original's
// loosely-typed state objects carried.

export interface Profile {
  id: string;
  role: 'buyer' | 'seller' | 'doctor' | 'admin';
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  region?: string | null;
  country?: string | null;
  rating?: number | null;
  seller_type?: string | null;
  avatar_url?: string | null;
  qr_code?: string | null;
}

export interface AppState {
  lang: string;
  country: string;
  session: Session | null;
  profile: Profile | null;
  view: 'lang' | 'country' | 'auth' | 'dash';
  tab: string;
  signupRole: string;
  _busy: boolean;
}

// closeSheet() (widgets/sheet.ts) stops any active QR-scanner instance when
// a sheet closes. The scanner itself is set up in the buyer scanner screen
// (a later phase), but render()'s closeSheet() call needs this field typed
// from Phase 1 on.
export interface AppState {
  _scanner?: { stop(): Promise<void> } | null;
}

export interface AnimalEntry {
  name: string;
  count: number;
}

export interface AuthWizardState {
  mode: 'login' | 'signup';
  step: number;
  role: 'buyer' | 'seller' | 'doctor';
  sellerType: string;
  crops: string[];
  animals: AnimalEntry[];
  items: string[];
  farmSize: string;
  phone?: string;
  name?: string;
  email?: string;
  region?: string;
  pw?: string;
}
