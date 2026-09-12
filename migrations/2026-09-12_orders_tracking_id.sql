-- ============================================================================
-- WeAgri: make sure orders.tracking_id exists (order QR auto-generation)
-- ============================================================================
-- The client code has read `orders.tracking_id` in several places for a
-- while (the seller/buyer "View QR" buttons, delivery tracking, the
-- wg_tracking_locations pings) but nothing ever WROTE it — so no order ever
-- actually had one, and those QR buttons never appeared. The app now
-- generates one client-side the moment every order/offer is created.
--
-- This is almost certainly already a column on your `orders` table (that's
-- the only way the existing QR-reading code made sense), but this is safe
-- to run either way.

alter table public.orders
  add column if not exists tracking_id text;

-- Optional but recommended: speeds up the "scan this QR" / tracking lookups
-- that filter by tracking_id (see wgTrackOrder / the ?scan= URL handler).
create index if not exists orders_tracking_id_idx on public.orders (tracking_id);
