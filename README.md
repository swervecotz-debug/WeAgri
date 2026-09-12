# WeAgri

WeAgri is an agricultural marketplace web app for Tanzania / East Africa. It
connects **buyers**, **sellers** (farmers, livestock keepers, seed sellers,
fertilizer sellers) and plant/animal **doctors**, and includes an **Admin
Portal** and a **WeAgri Ad Center** for organizations that want to run
pay-per-click ad campaigns to buyers and sellers inside the app.

The app is bilingual (English / Swahili).

## How it's built

The entire application is one static file: [`index_3.html`](index_3.html).
There is no build step — open it directly in a browser, or serve it from
any static file host. It talks straight to [Supabase](https://supabase.com)
(Postgres, Auth, Storage) from the browser using the public anon key, with
row-level security (RLS) on the Postgres side enforcing who can read/write
what.

A second, self-contained document — the **WeAgri Ad Center** — is embedded
inside `index_3.html` as a base64 string (`window.AD_CENTER_HTML`) and
opened in an `<iframe>` via `openAdCenter()`. It has its own login, its own
organization/campaign screens, and its own admin moderation view, but
shares the same Supabase project as the main app.

```
index_3.html      the entire app: HTML + CSS + JS, all in one file
  ├── window.CFG               Supabase URL/anon key + a few constants
  ├── window.DICT               English/Swahili translation dictionary
  ├── (main app <script>)       buyer/seller/doctor/admin screens & logic
  └── window.AD_CENTER_HTML     base64-encoded Ad Center document (iframe)
```

### Why one file?

The project started this way and has stayed this way deliberately — it
keeps deployment down to "upload one file," which matters for a small team
shipping fast. If the project ever outgrows this, the natural next step is
splitting it into ES modules with a bundler (esbuild/Vite), but that is a
separate, larger effort and not something this file assumes.

## Running it

Nothing to install for the app itself:

1. Open `index_3.html` in a browser, **or**
2. Serve the folder with any static file server, e.g.:
   ```bash
   npx serve .
   ```

The Supabase URL and anon key are already set in `window.CFG` at the top of
`index_3.html` (an anon key is meant to be public — see **Security** below).
If you want to point the app at a different Supabase project, change
`SUPABASE_URL` / `SUPABASE_ANON_KEY` there.

## Deploying (Netlify)

This repo is set up to deploy straight from GitHub with **no build step**:

1. In Netlify: **Add new site → Import an existing project** → pick this
   GitHub repo.
2. Leave the build command empty and the publish directory as `.` (repo
   root) — [`netlify.toml`](netlify.toml) already pins both of these, so
   Netlify won't try to guess a build command from `package.json` (there
   isn't one — an earlier, abandoned Node/Express rewrite used to leave one
   here, which is exactly what caused a 404 at `/` before: Netlify was
   trying to publish a different, empty scaffold folder instead of the
   real app).
3. Deploy. `netlify.toml` redirects `/` (and any other path) to
   `/index_3.html` with a 200 rewrite, so the app loads at the site's root
   URL while the browser's address bar stays clean.
4. To get the `weagri.netlify.app` address specifically: **Site
   configuration → General → Site details → Change site name** → set it to
   `weagri`. (Site names are first-come-first-served across all of
   Netlify, not per-account — if it's taken, Netlify will tell you.)

No Render, no server process, no environment variables to configure on
Netlify's side — the Supabase URL/anon key are already in `window.CFG`
inside `index_3.html` (see **Running it** above for why that's fine to
commit).

### Database

This repo does not check in a full schema — the database lives in
Supabase. Any new column/table a feature needs is shipped as a plain
`.sql` file under [`migrations/`](migrations/) for you to run once, in
filename order, in the Supabase SQL editor (Dashboard → your project →
SQL Editor → New query → paste → Run). Each file is written to be safe to
re-run (`if not exists`, dynamic constraint lookup, etc.). The app is also
written to degrade gracefully when a newer column doesn't exist yet (it
retries with a smaller column set) rather than hard-failing, but running
the migrations gets you the full feature (e.g. update videos, richer
notification history).

## Key features

- **Buyers**: discover products, place orders, make offers, track
  deliveries by QR code, rate sellers, wallet.
- **Sellers**: post products/harvests, manage orders, boost listings,
  wallet & withdrawals, seller groups, verification (KYC) badge.
- **Doctors**: plant/animal health consultations.
- **Messaging**: buyer ↔ seller chat (text, voice notes, images).
- **Notifications**: order updates, offers, and — new — admin
  broadcasts/updates (see below).
- **Admin Portal**: revenue/usage analytics, user management, and:
  - **Ad moderation** — every live ad/banner an organization runs through
    the Ad Center shows up for the admin with its objective and its
    video/banner creative, with a **Stop** button. A stopped ad shows as
    "Stopped" to the organization that owns it; the admin can **Resume**
    it later.
  - **Notification Center** — send a one-off notification (title +
    message) targeted at a specific audience: all users, buyers, sellers,
    or a specific seller type (farmers / livestock keepers / seed sellers
    / fertilizer sellers), or every organization running ads.
  - **Updates** — announce an in-app change with a title, a short
    description and a short video showing how it works, targeted at
    buyers, sellers, or advertiser organizations. Recipients can open the
    video and minimize/maximize it while browsing.
  - **Support inbox** — buyers and sellers can reach the admin directly
    via a **"WeAgri Service Provider"** button on the Chat tab; every
    message they send lands in the admin's own Support tab, and the admin
    replies from there using the same chat UI as everyone else.
- **WeAgri Ad Center**: organization signup, campaign creation
  (objective → budget & pricing → creative → launch), real ad delivery to
  buyers/sellers with impression/click tracking and automatic budget-based
  pausing, per-campaign analytics, and a wallet for funding campaigns.

### Notification branding

Admin notifications and updates are deliberately **not** shown as "X
notifies you." Every broadcast/update is presented with the WeAgri mark
(icon-only, no wordmark) instead of the admin's name or initials, followed
by the title and the admin's own message — the same way it would look if
it came from "WeAgri" as a brand rather than from a person.

## Security notes

- **No SQL injection surface**: the app never builds or sends raw SQL. All
  database access goes through the Supabase JS client's query builder
  (`sb.from(table).select/insert/update/eq/...`), which parameterizes every
  value — there is nowhere in the client code that concatenates
  user-supplied text into a query string.
- **XSS**: any user-supplied text that gets placed into `innerHTML`
  (names, messages, notification titles/bodies, campaign objectives, etc.)
  is passed through an `esc()` helper that HTML-escapes it first. Plain
  text values assigned to `.value`/`.textContent`, or used only as query
  parameters, don't need this and don't get it.
- **Auth & authorization**: every table is expected to be protected by
  Postgres row-level security in Supabase, not by anything in the client —
  the client is untrusted by design. Admin-only actions (ad moderation,
  broadcast sends) additionally check `wg_is_ad_admin()` / the caller's
  `profiles.role` before showing the relevant UI, but the real
  enforcement has to live in RLS policies / `SECURITY DEFINER` RPCs on the
  database side, since a browser client can always be tampered with.
- **The Supabase anon key in `window.CFG` is meant to be public.** It only
  grants what your RLS policies allow an anonymous/authenticated client to
  do — it is not a secret, the same way a public API key for a
  client-side SDK generally isn't. Never put a Supabase **service-role**
  key in this file.
- **Honest limitations**: there is no server-side rate limiting on this
  static-file setup (e.g. against brute-forcing login, or spamming
  messages/broadcasts) — that has to be handled with Supabase Auth rate
  limits and RLS-side checks, or by putting the app behind a reverse proxy
  that can rate-limit. File uploads (avatars, product photos, ad
  creatives, update videos) rely on Supabase Storage bucket policies to
  restrict size/type/access — double check those match what you intend to
  allow.

## Project layout

```
index_3.html     the app (see above)
netlify.toml     Netlify build/publish + redirect config (see Deploying)
favicon.png      icon-only WeAgri mark — browser tab icon, no build step needed
og-image.png     social-share preview image (link unfurls on WhatsApp/etc.)
robots.txt       allows crawling, points at sitemap.xml
sitemap.xml      single-entry sitemap for the site root
migrations/      SQL migrations to run once in the Supabase SQL editor
*.png            a few other image assets referenced by index_3.html
```

Everything else needed to run WeAgri lives in Supabase (database, auth,
storage) rather than in this repo.
