# ai-dev-resume-tldr-curator

**The Atlas Dossier** — Stewart Barteau’s application package for a TLDR AI content-writer role.

A single self-contained page: cover letter, sweep of 17 repositories, and a linked catalog of the 76-paper PhilArchive corpus.

## What’s in the box

- **The page** is one file: [`public/index.html`](public/index.html)  
  No build step, no framework, no external requests. All CSS and JS are inline. Fonts are system stacks.
- **Print / PDF:** the page includes a print stylesheet. Browser → Print → Save as PDF produces a clean cover-letter document.

## Structure

```
public/index.html     the entire site (HTML + inline CSS + inline JS)
wrangler.jsonc        assets-only Cloudflare Worker config (serves ./public)
package.json          wrangler scripts (dev, deploy)
```

## Develop

```bash
npm install
npm run dev          # wrangler dev — serves ./public locally
```

Or just open `public/index.html` in a browser. It needs nothing else.

## Deploy (Cloudflare Workers)

This is an **assets-only Worker**. `wrangler.jsonc` points at `./public` and declares no script, so `wrangler deploy` publishes the site with no server code.

- **GitHub Actions (the deploy path)**  
  Every push to `main` runs the Deploy Worker workflow (`.github/workflows/deploy.yml`), which validates the page and publishes it to the Cloudflare Worker `ai-dev-resume-tldr-curator` with `wrangler deploy`. It needs two repository secrets — `CLOUDFLARE_API_TOKEN` (with the "Workers Scripts — Edit" permission) and `CLOUDFLARE_ACCOUNT_ID`; until they're set, the workflow passes with a warning instead of deploying.

- **Manual deploy from your machine**

  ```bash
  npm install
  npm run deploy     # wrangler deploy
  ```

## Content note

Every repository figure on the page is drawn from that repository’s own documentation.  
Every paper description is drawn from its PhilArchive abstract.  

The paper catalog shows 34 of 76 records, each individually linked and verified. The complete, current index lives on the [PhilArchive profile](https://philarchive.org/s/Stewart%20Barteau).
