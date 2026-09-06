import express from 'express';
import path from 'node:path';

try {
  process.loadEnvFile();
} catch {
  // no .env file present (e.g. real env vars set by the host) — fine
}

// process.cwd() is the project root in both dev (tsx, run from repo root)
// and prod (node dist/server/index.js, also run from repo root via `npm start`).
const publicDir = path.join(process.cwd(), 'public');

const PORT = Number(process.env.PORT) || 3000;

const CFG = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SITE_URL: process.env.SITE_URL || '',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  BOOST: {
    TZS: Number(process.env.BOOST_TZS) || 50000,
    USD: Number(process.env.BOOST_USD) || 20,
  },
};

const app = express();

// Injected before the app bundle loads, so it can read window.CFG exactly
// like the original hardcoded window.CFG object.
app.get('/config.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.CFG = ${JSON.stringify(CFG)};`);
});

app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`WeAgri server listening on http://localhost:${PORT}`);
});
