// Hand-written interfaces for the Supabase tables/RPCs this app queries.
// There is no schema SQL checked into the repo, so these are reverse-
// engineered from how each query's result is actually used in the source.
//
// Each phase of the migration adds only the fields it actually touches, as
// a separate `interface X { ... }` block relying on TypeScript's interface
// declaration merging — later phases extend earlier ones without needing to
// revisit them.

// Used by src/helpers.ts (money/market-price comparison helpers).
export interface MarketPriceRow {
  product_name: string;
  price: number;
  unit: string;
}

// Used by src/helpers.ts (isBoosted).
export interface ProductRow {
  boosted_until?: string | null;
}
