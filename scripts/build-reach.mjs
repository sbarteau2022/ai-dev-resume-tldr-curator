#!/usr/bin/env node
// ============================================================
// BUILD THE REACH SECTION from the canonical readership geography.
//
// This site is a single static page, so until now the reader-city list,
// the confirmed-institution roster, and the headline figures beside them
// were all typed into the HTML by hand — which is exactly how a page ends
// up quoting "45+ countries" over a map drawing cities in 73 of them, or a
// "21+" institutions stat sitting next to an actual 21-row roster while a
// sibling page's hero claimed 17. data/reader-cities.json and
// data/reader-institutions.json are now the two sources, and this script
// writes five generated regions from them:
//
//   <!--REACH:SPAN-->         the "N cities across N countries…" phrase
//   <!--REACH:STATS-->        the country and city stat tiles
//   /*REACH:CITIES*/          the [name, lat, lng, tier] array the canvas draws
//   <!--REACH:INST_STAT-->    the confirmed-institutions stat tile
//   <!--REACH:INSTITUTIONS--> the institution roster cards
//
// Every count is DERIVED — city count, distinct countries/territories,
// distinct continents, and institution count are all computed from the
// arrays, never typed. Adding, removing, or renaming an entry moves every
// stated number and every rendered card with it.
//
// Usage:
//   node scripts/build-reach.mjs           rewrite public/index.html
//   node scripts/build-reach.mjs --check   verify it is already in sync,
//                                          exit 1 with a diff summary if not
//
// `npm run build` does the former; `npm run check` does the latter, so CI
// fails on a page that has drifted from the data rather than shipping a
// number the data doesn't support.
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';

const CHECK = process.argv.includes('--check');
const HTML_FILE = 'public/index.html';
const CITIES_FILE = 'data/reader-cities.json';
const INSTITUTIONS_FILE = 'data/reader-institutions.json';

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const { cities } = JSON.parse(readFileSync(CITIES_FILE, 'utf8'));
if (!Array.isArray(cities) || cities.length === 0) {
  console.error(`${CITIES_FILE}: no cities`);
  process.exit(1);
}
for (const c of cities) {
  for (const k of ['name', 'country', 'continent', 'lat', 'lon', 'tier']) {
    if (c[k] === undefined) {
      console.error(`${CITIES_FILE}: city ${JSON.stringify(c.name ?? c)} is missing "${k}"`);
      process.exit(1);
    }
  }
}

const { institutions } = JSON.parse(readFileSync(INSTITUTIONS_FILE, 'utf8'));
if (!Array.isArray(institutions) || institutions.length === 0) {
  console.error(`${INSTITUTIONS_FILE}: no institutions`);
  process.exit(1);
}
for (const u of institutions) {
  for (const k of ['name', 'loc']) {
    if (u[k] === undefined) {
      console.error(`${INSTITUTIONS_FILE}: institution ${JSON.stringify(u.name ?? u)} is missing "${k}"`);
      process.exit(1);
    }
  }
}

// ── the derived figures ───────────────────────────────────────
const cityCount = cities.length;
const countryCount = new Set(cities.map((c) => c.country)).size;
const continentCount = new Set(cities.map((c) => c.continent)).size;
const institutionCount = institutions.length;

// ── the generated regions ─────────────────────────────────────
const span =
  `${cityCount} cities across ${countryCount} countries and territories, ` +
  `on all ${continentCount} inhabited continents`;

const stats =
  `        <div class="stat"><div class="n mono">${countryCount}</div>` +
  `<div class="l">countries and territories in the readership log</div></div>\n` +
  `        <div class="stat"><div class="n mono">${cityCount}</div>` +
  `<div class="l">reader cities, ${continentCount} continents</div></div>`;

// [name, lat, lng, tier] — the shape the canvas already reads, four per line
const rows = [];
for (let i = 0; i < cities.length; i += 4) {
  rows.push(
    '      ' +
      cities
        .slice(i, i + 4)
        .map((c) => `[${JSON.stringify(c.name)},${c.lat},${c.lon},${c.tier}]`)
        .join(',')
  );
}
const citiesJs =
  '    // [name, lat, lng, weight] — generated from data/reader-cities.json by\n' +
  '    // scripts/build-reach.mjs; every one appears in the readership log.\n' +
  '    var cities = [\n' +
  rows.join(',\n') +
  '\n    ];';

const instStat =
  `<div class="stat"><div class="n mono">${institutionCount}+</div>` +
  `<div class="l">confirmed reader institutions (PhilPeople-verified)</div></div>`;

const instRoll = institutions
  .map((u) => {
    const loc = escapeHtml(u.loc) + (u.unconfirmed ? ' · unconfirmed' : '');
    const doc = escapeHtml(u.paper ?? 'general corpus readership');
    return (
      `<div class="uni"><div class="u-name">${escapeHtml(u.name)}</div>` +
      `<div class="u-loc">${loc}</div><div class="u-doc">${doc}</div></div>`
    );
  })
  .join('\n        ');

// ── splice them in ────────────────────────────────────────────
function replaceRegion(html, open, close, body, label) {
  const a = html.indexOf(open);
  const b = html.indexOf(close);
  if (a === -1 || b === -1 || b < a) {
    console.error(`${HTML_FILE}: ${label} markers missing or out of order`);
    process.exit(1);
  }
  return html.slice(0, a + open.length) + body + html.slice(b);
}

const original = readFileSync(HTML_FILE, 'utf8');
let out = original;
out = replaceRegion(out, '<!--REACH:SPAN-->', '<!--/REACH:SPAN-->', span, 'REACH:SPAN');
out = replaceRegion(out, '<!--REACH:STATS-->', '        <!--/REACH:STATS-->', `\n${stats}\n`, 'REACH:STATS');
out = replaceRegion(out, '/*REACH:CITIES*/', '    /*\\/REACH:CITIES*/', `\n${citiesJs}\n`, 'REACH:CITIES');
out = replaceRegion(out, '<!--REACH:INST_STAT-->', '<!--/REACH:INST_STAT-->', instStat, 'REACH:INST_STAT');
out = replaceRegion(out, '<!--REACH:INSTITUTIONS-->', '<!--/REACH:INSTITUTIONS-->', instRoll, 'REACH:INSTITUTIONS');

const summary =
  `${cityCount} cities · ${countryCount} countries and territories · ${continentCount} continents · ` +
  `${institutionCount} institutions`;

if (CHECK) {
  if (out !== original) {
    console.error(`${HTML_FILE} is out of sync with its data files.`);
    console.error(`Expected: ${summary}`);
    console.error('Run `npm run build` and commit the result.');
    process.exit(1);
  }
  console.log(`reach section in sync — ${summary}`);
} else {
  if (out === original) {
    console.log(`reach section already current — ${summary}`);
  } else {
    writeFileSync(HTML_FILE, out);
    console.log(`reach section rebuilt — ${summary}`);
  }
}
