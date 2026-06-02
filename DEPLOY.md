# Deploy — mashen.dev multi-project setup

Free, Cloudflare-managed. DNS already lives on Cloudflare, so subdomains + TLS are automatic.

## Repo layout

```
site/                       → the hub landing page          → mashen.dev
projects/<slug>/index.html  → one prototype each            → <slug>.mashen.dev
projects/<slug>/public/     → static assets for that project
_archive/                   → superseded scaffolds (not deployed)
README.md · chats/ · DEPLOY.md   → repo internals (NOT deployed)
```

Each prototype is **its own Cloudflare Pages project** pointing at its subfolder, so
they deploy and break independently. Repo internals (README, chat transcripts) are
never served because each Pages project only deploys its own root directory.

## One-time: publish a project

In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**,
pick this repo, then:

| Setting | Hub (`mashen.dev`) | A prototype (`mashen-hero`) |
|---|---|---|
| Production branch | `main` | `main` |
| Build command | *(empty)* | *(empty)* |
| Build output directory | `site` | `projects/mashen-hero` |
| Root directory | *(default)* | *(default)* |

After the first deploy lands on `*.pages.dev`, open the project →
**Custom domains** → add:

- Hub → `mashen.dev` (and optionally `www.mashen.dev`)
- Prototype → `mashen-hero.mashen.dev`

DNS is on Cloudflare, so the CNAME + certificate are created automatically.

CLI alternative (no dashboard): `npx wrangler pages deploy projects/mashen-hero --project-name=mashen-hero`

## Add a new prototype later

1. Create `projects/<slug>/index.html` (+ assets).
2. Add one entry to the `PROJECTS` array in `site/index.html`
   (set `status: "live"` once deployed).
3. New Pages project → output dir `projects/<slug>` → custom domain `<slug>.mashen.dev`.
4. Push to `main`; Cloudflare auto-deploys on every push.

## When a prototype needs a backend (occasional ML)

Stay free, route by subdomain:
- **Light/API/proxy** → Cloudflare Workers or Pages Functions (JS/WASM, generous free tier).
- **Real ML demo** (Gradio/Streamlit/Docker) → Hugging Face Spaces free CPU; point `<slug>.mashen.dev` at it.
- **Always-on server** → Oracle Cloud Always Free VPS + Caddy (automatic HTTPS), still €0.

## Notes

- `projects/mashen-hero` is a pure static site (React + Babel from CDN, no build step).
- The in-app **Tweaks panel only opens inside the Claude Design host** (`__activate_edit_mode`
  message), so in production it stays hidden and the defaults in `TWEAK_DEFAULTS`
  (matrix green, EN, intensity 65) are used. To let visitors change language/accent
  live, a small visitor-facing control would need to be added.
