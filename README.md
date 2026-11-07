# Mezon Aroos — مزون عروس

Wedding-dress virtual fitting for boutiques (Persian, RTL). The bride's full-body photo is kept — face, hair and body size locked — and the dress is fitted on her real body with KIE (Nano Banana Pro). Cloudflare Worker + D1 + KV, Telegram/Bale bot for the boutique owner.

- `worker/` — Worker (API, customer page, admin, bot)
- `drizzle/` — D1 migrations · `scripts/` — catalog generator · `public/catalog/dress/` — sample dresses
- `npm test` — test suite · `node dev.mjs` — local dev server
- Deploy: `.github/workflows/deploy.yml` on every push to `main` (Worker `mezon-aroos`).
- Sample dress photos: run the "Generate Mezon dress photos" workflow by hand.

Required repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `KIE_API_KEY`, `SESSION_SECRET`, `JOB_TOKEN`, `OWNER_*` (as in the Ayneh project), and the bot: `MEZON_TELEGRAM_BOT_TOKEN`, `MEZON_TELEGRAM_WEBHOOK_SECRET`, `MEZON_TELEGRAM_BOT_USERNAME`.
