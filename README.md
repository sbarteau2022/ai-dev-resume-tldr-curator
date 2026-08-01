# ai-dev-resume-tldr-curator

**The Atlas Dossier** — Stewart Barteau's application package for a TLDR AI
content-writer role: a cover letter, a sweep of 17 repositories, and a linked
catalog of the 76-paper PhilArchive corpus, delivered as one self-contained,
responsive, theme-aware web page.

- **The page** is a single file, [`public/index.html`](public/index.html) —
  no build step, no framework, no external requests (all CSS/JS inline, fonts
  are system stacks).
- **Print / PDF:** the page ships a print stylesheet, so the browser's
  Print → Save as PDF produces a clean cover-letter document.

## Structure

```
public/index.html   the entire site (HTML + inline CSS + inline JS)
wrangler.jsonc      assets-only Cloudflare Worker config (serves ./public)
package.json        wrangler scripts (dev, deploy)
```

## Develop

```bash
npm install
npm run dev        # wrangler dev — serves ./public locally
```

Or just open `public/index.html` in a browser — it needs nothing else.

## Deploy (Cloudflare Workers)

This repo is an **assets-only Worker**: `wrangler.jsonc` declares `./public`
as the static-asset directory and no script, so `wrangler deploy` publishes the
site with no server code.

- **Git integration (Cloudflare Workers Builds).** The repo is connected to the
  Cloudflare `ai-dev-resume-tldr-curator` Worker; every push to the production
  branch runs `wrangler deploy` and publishes automatically.
- **Manual, from your machine:**

  ```bash
  npm install
  npm run deploy     # wrangler deploy
  ```

## Content note

Every repository figure on the page is drawn from that repository's own
documentation; every paper description is drawn from its PhilArchive abstract.
The paper catalog shows 34 of 76 records, each individually linked and
verified — the complete, current index lives on the
[PhilArchive profile](https://philarchive.org/s/Stewart%20Barteau).
