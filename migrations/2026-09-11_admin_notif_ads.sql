-- ============================================================================
-- WeAgri: Admin ad moderation + Notification/Updates center
-- Run this once against your Supabase project (SQL Editor), in order.
-- Every ALTER below is written defensively (IF NOT EXISTS / dynamic
-- constraint lookup) so it's safe to re-run.
-- ============================================================================

-- 1) notifications: two new nullable columns used by the admin broadcast
--    (Notification Center) and Updates features. The app already degrades
--    gracefully if these are missing (it retries the insert/select with a
--    reduced column list), but you'll get the intended richer UI (video
--    playback, "sent to: sellers" summaries) only once these exist.
alter table public.notifications
  add column if not exists video_url text,
  add column if not exists target_summary text;

-- 2) campaigns.status: allow a new 'stopped' value (set by the admin from
--    the Ad Center's live-ads review screen) alongside whatever your
--    current CHECK constraint already allows. This finds ANY check
--    constraint on campaigns that mentions the status column and replaces
--    it, rather than assuming a fixed constraint name.
do $$
declare
  cname text;
begin
  select con.conname into cname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'campaigns'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%status%'
  limit 1;

  if cname is not null then
    execute format('alter table public.campaigns drop constraint %I', cname);
  end if;

  alter table public.campaigns
    add constraint campaigns_status_check
    check (status in (
      'draft', 'pending_payment', 'submitted', 'processing', 'in_review',
      'approved', 'rejected', 'live', 'paused', 'stopped', 'completed', 'cancelled'
    ));
end $$;

-- 3) campaigns.stopped_at: timestamp of when an admin stopped the ad
--    (cleared back to null on resume). Nullable, purely informational.
alter table public.campaigns
  add column if not exists stopped_at timestamptz;

-- 4) Confirm the admin can update any organization's campaigns.status.
--    Your existing "admin approve/reject" flow already updated campaigns.status
--    directly as the signed-in admin, so an RLS policy permitting that
--    (keyed off the same wg_is_ad_admin() check the Ad Center already uses
--    for gating the review screen) should already exist. If it does NOT —
--    i.e. if stopping/resuming an ad from the Ad Center fails with a
--    row-level-security error — create it explicitly:
--
-- create policy "Admins can moderate any campaign"
--   on public.campaigns for update
--   using (wg_is_ad_admin())
--   with check (wg_is_ad_admin());
--
-- (Left commented out because it will error with "policy already exists"
-- if one covering this was already created earlier in the project.)

-- ============================================================================
-- Notes
-- ============================================================================
-- * No new table was needed for admin notifications/updates: they are
--   delivered by inserting one row per recipient into the EXISTING
--   `notifications` table (type = 'wg_broadcast' or 'wg_update'), reusing
--   all existing badge/read/archive/delete logic and RLS.
-- * Support chat (buyer/seller -> admin, "WeAgri Service Provider" button)
--   reuses the existing `messages` table as-is — no schema change needed.
-- * `video_url` on `notifications` reuses the existing public `ad-videos`
--   storage bucket (uploads go to `updates/{admin_id}/{timestamp}.{ext}`) —
--   no new bucket or storage policy needed.
