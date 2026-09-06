import { CFG } from './config';
import { CATEGORIES, type Category } from './categories';
import { COUNTRIES } from './regions';
import type { MarketPriceRow, ProductRow } from './types/supabase';

export function currencyFor(code: string): string {
  return (COUNTRIES.find((c) => c.code === code) || {}).currency || 'TZS';
}

export function money(amount: number | string | null | undefined, country: string): string {
  const cur = currencyFor(country);
  return cur + ' ' + Number(amount || 0).toLocaleString();
}

export const qrPrefix = 'weagri://seller/';

export function makeQrPayload(id: string): string {
  return qrPrefix + id;
}

export function parseQrPayload(text: unknown): string | null {
  if (typeof text !== 'string') return null;
  if (text.startsWith(qrPrefix)) return text.slice(qrPrefix.length);
  if (text.startsWith('shambalink://farm/')) return text.slice('shambalink://farm/'.length);
  return null;
}

export interface BoostPrice {
  amount: number;
  currency: string;
  label: string;
}

export function boostPriceFor(country: string): BoostPrice {
  const cur = currencyFor(country);
  if (cur === 'TZS') {
    return { amount: CFG.BOOST.TZS, currency: 'TZS', label: 'TZS ' + CFG.BOOST.TZS.toLocaleString() };
  }
  return { amount: CFG.BOOST.USD, currency: 'USD', label: '$' + CFG.BOOST.USD };
}

export interface MarketCompareResult {
  status: 'high' | 'low' | 'fair' | null;
  ref?: number;
  pct?: number;
  unit?: string;
  name?: string;
}

// compare a seller price to the latest market price row
export function marketCompare(price: number | string, row: MarketPriceRow | null | undefined): MarketCompareResult {
  const p = Number(price);
  if (!row || !p || p <= 0) return { status: null };
  const ref = Number(row.price);
  if (!ref) return { status: null };
  const pct = Math.round(((p - ref) / ref) * 100);
  let status: 'high' | 'low' | 'fair' = 'fair';
  if (pct > 15) status = 'high';
  else if (pct < -15) status = 'low';
  return { status, ref, pct, unit: row.unit, name: row.product_name };
}

const FALLBACK_MARKET_CATEGORY: Record<string, string> = {
  grains: 'Maize',
  vegetables: 'Tomatoes',
  fruits: 'Mangoes',
  meat: 'Beef',
  milk: 'Milk',
  eggs: 'Eggs',
  poultry: 'Eggs',
};

export function findMarketRow(
  rows: MarketPriceRow[] | null | undefined,
  title: string | null | undefined,
  category: string | null | undefined
): MarketPriceRow | null {
  if (!rows || !rows.length) return null;
  const tt = (title || '').trim().toLowerCase();
  if (tt) {
    const exact = rows.find((r) => r.product_name.toLowerCase() === tt);
    if (exact) return exact;
    const part = rows.find(
      (r) => tt.includes(r.product_name.toLowerCase()) || r.product_name.toLowerCase().includes(tt)
    );
    if (part) return part;
  }
  const fb = category ? FALLBACK_MARKET_CATEGORY[category] : undefined;
  if (fb) return rows.find((r) => r.product_name.toLowerCase() === fb.toLowerCase()) || null;
  return null;
}

export function isBoosted(p: ProductRow | null | undefined): boolean {
  return !!(p && p.boosted_until && new Date(p.boosted_until) > new Date());
}

const SELLER_TYPE_LABEL: Record<string, string> = {
  farmer: 'farmer',
  livestock: 'livestock',
  seed: 'seedSeller',
  fertilizer: 'fertilizerSeller',
  doctor_plants: 'plantDoctor',
  doctor_animals: 'animalDoctor',
};

export function sellerTypeLabel(type: string | null | undefined): string {
  return (type && SELLER_TYPE_LABEL[type]) || 'seller';
}

export function cat(key: string): Category | null {
  return CATEGORIES.find((c) => c.key === key) || null;
}

// normalize a TZ phone to 255XXXXXXXXX so signup & login always match.
// Shared by auth (email-from-phone) and the seller/buyer mobile-money flows.
export function normPhone(p: string | null | undefined): string {
  const d = (p || '').replace(/\D/g, '');
  if (d.indexOf('255') === 0) return d;
  if (d.charAt(0) === '0') return '255' + d.slice(1);
  if (d.length === 9) return '255' + d;
  return d;
}

// mobile-money network from the phone prefix (TZ)
export function methodForPhone(p: string | null | undefined): string | null {
  const d = normPhone(p);
  const local = d.indexOf('255') === 0 ? '0' + d.slice(3) : d;
  const pre = local.slice(0, 3);
  if (pre === '071' || pre === '065') return 'Tigo Pesa';
  if (pre === '078' || pre === '068') return 'Airtel Money';
  if (pre === '075' || pre === '076') return 'M-Pesa';
  return null;
}
