# ai-dev-resume-tldr-curator

**The Atlas Dossier** — Stewart Barteau's application package for a TLDR AI
content-writer role: a cover letter, a sweep of 17 repositories, and a linked
catalog of the 76-paper PhilArchive corpus, delivered as one self-contained,
responsive, theme-aware web page.

- **Live page:** the whole site is a single file, [`public/index.html`](public/index.html)
  — no build step, no framework, no external requests (all CSS/JS inline, fonts
  are system stacks).
- **Print / PDF:** the page ships a print stylesheet, so the browser's
  Print → Save as PDF produces a clean cover-letter document.

## Structure

```
public/index.html   the entire site (HTML + inline CSS + inline JS)
wrangler.jsonc      Cloudflare Pages config (name + output dir)
package.json        wrangler scripts (dev, deploy)
.github/workflows/  deploy.yml — deploys to Cloudflare Pages on push to main
```

## Develop

```bash
npm install
npm run dev        # wrangler pages dev — serves ./public locally
```

Or just open `public/index.html` in a browser — it needs nothing else.

## Deploy to Cloudflare Pages

Two ways:

1. **Dashboard (simplest).** In the Cloudflare dashboard: Workers & Pages →
   Create → Pages → Connect to Git → this repo. Set **build command** empty and
   **build output directory** to `public`. Every push to `main` publishes.

2. **GitHub Actions (included).** `.github/workflows/deploy.yml` runs
   `wrangler pages deploy` on every push to `main`. It's a no-op until you add
   two repository secrets — then it publishes to a Pages project named
   `ai-dev-resume-tldr-curator`:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

Manual one-off deploy from your machine:

```bash
npm install
npx wrangler pages deploy   # reads wrangler.jsonc
```

## Content note

Every repository figure on the page is drawn from that repository's own
documentation; every paper description is drawn from its PhilArchive abstract.
The paper catalog shows 34 of 76 records, each individually linked and
verified — the complete, current index lives on the
[PhilArchive profile](https://philarchive.org/s/Stewart%20Barteau).
