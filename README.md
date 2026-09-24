# Prophix Client Story Platform

**Live URL:** https://raulsteiu.github.io
**Repository:** `raulsteiu/raulsteiu.github.io`
**Hosted via:** GitHub Pages (branch: `main`, root: `/`)
**Platform version:** 3.2 — 2026-09-24
**Maintained by:** Raul Steiu, Data Integration Engineer, Prophix

---

## What this is

A self-serve internal publishing platform that lets the Prophix sales team create, edit, and publish multilingual customer success story pages — without any technical involvement after initial setup.

Three core components:

| Path               | What it does                                                                |
| ------------------ | ---------------------------------------------------------------------------- |
| `/new/`            | Creator app — manual form or AI-assisted generation from a call transcript  |
| `/clients/`        | Story directory — lists all published stories with search, sort, and status |
| `/clients/[slug]/` | Individual published story page — fully editable in-browser                 |

**Each story can be taken out of the app three ways:** the live page itself, a two-page PDF brochure, or a standalone HTML export in either of two visual styles (a plain "internal" style, or one rebuilt to match prophix.com's real public customer-story template). See `Client_Story.md` for the details.

---

## Repository structure

```
raulsteiu.github.io/
│
├── README.md                       ← You are here
├── .nojekyll                       ← Disables Jekyll; keeps deploy time ~15–30s
├── prophix-logo-1000px.png         ← Shared Prophix logo used across all pages
├── index.html                      ← Root redirect to /clients/ — DO NOT TOUCH
├── INSTRUCTIONS.md                 ← End-user guide for sales team
├── Client_Story.md                 ← Full technical reference (for Claude sessions)
├── PROJECT_INSTRUCTIONS.md         ← General build standards for this Claude project
│
├── assets/
│   ├── icons/                      ← Product icon PNGs (one per Prophix product)
│   ├── shape-left.png, shape-up.png ← PDF brochure decorative shapes
│   └── image-3_W991_Q100.png       ← Hero background photo used by the prophix.com-style export
│
├── new/
│   └── index.html                  ← Creator app (v1.5)
│
└── clients/
    ├── index.html                  ← Story directory shell (v2.1) — NEVER REGENERATE
    ├── stories.json                ← Directory index — only metadata, no content
    ├── story.js                    ← Shared runtime (v9.24) — fetched by every story page
    │
    └── [slug]/                     ← One folder per client story
        ├── index.html              ← 8-line shell (globals + script src only)
        ├── data.json               ← ALL story content — this is the source of truth
        ├── logo.png                ← Client logo, always PNG
        └── *.mp3 / images          ← Media clip files (uploaded via edit mode)
```

---

## Architecture — data-driven (v9)

**The rendered HTML is never the source of truth. The JSON is.**

Each story page is an 8-line shell that loads `story.js`. At runtime, `story.js` fetches `data.json` and builds the entire page DOM. Saving in edit mode writes back to `data.json` — never to the HTML.

This means:

- Fixing a bug in `story.js` propagates to **all** story pages instantly on next load *(once GitHub Pages' CDN has finished propagating the new file — see note below)*
- No story ever needs to be re-published after a runtime fix
- Re-publishing from `/new/` is only needed if a story needs to be **renamed** (changes its slug/URL)

### How a story page works

```
Browser loads /clients/eaglestone/
  └── index.html (8 lines: sets globals, loads story.js)
        └── story.js fetches /clients/eaglestone/data.json
              └── renderPage(data) builds the full DOM
                    └── wireEvents() attaches all event listeners
```

### stories.json — directory index only

`stories.json` holds metadata only (slug, name, ind, langs, status, logo, created, edited).
It is the **only** file that changes when a story is added or deleted.
It is updated automatically in the background on every save via `_updateEditedTimestamp()`.

---

## Files you can safely edit

| File                 | How to deploy                                   |
| --------------------- | ----------------------------------------------- |
| `clients/story.js`   | Drag-and-drop in GitHub web editor (large file) |
| `clients/index.html` | Paste or drag-and-drop in GitHub web editor     |
| `new/index.html`     | Paste or drag-and-drop in GitHub web editor     |
| `README.md`          | Edit directly in GitHub web editor              |
| `INSTRUCTIONS.md`    | Edit directly in GitHub web editor              |
| `assets/icons/*.png` | Drag-and-drop upload                            |

## Files you must never touch

| File                     | Reason                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| `index.html` (root)      | Root redirect — breaking this breaks the site entry point                    |
| `clients/story.js`       | Shared runtime — a syntax error here breaks every story page                 |
| `clients/` (folder name) | Hard-coded in every story shell and in stories.json                          |
| `clients/index.html`     | Permanent shell — regenerating it would reset all JS and break the directory |
| Any `data.json` directly | Source of truth — always edit via the browser edit mode, never by hand       |

---

## Story status system

| Status      | Directory card                  | Direct URL behaviour                       |
| ----------- | -------------------------------- | ------------------------------------------- |
| `published` | White card, no badge            | Opens normally                             |
| `draft`     | Blue tint + `◑ Draft` badge     | Token gate → opens straight into edit mode |
| `approved`  | Green tint + `✓ Approved` badge | Token gate → opens straight into edit mode |

Stories always move through status via the dropdown in the edit toolbar — never by hand-editing JSON.

**Preview links:** Password-protected shareable URLs for client review. Generated from the edit toolbar (`⧉ Preview link`). Expire after 3 days. Password + URL + expiry are copied as a single block for pasting into email.

---

## Authentication

All write operations (save, delete, logo upload, media upload) require a **fine-grained GitHub personal access token** with `Contents: read+write` permission on this repository.

- Token is entered at runtime in the browser — never stored in code or files
- GitHub's secret scanning revokes any token exposed in a commit within seconds
- Token is sanitised with `.replace(/[^\x20-\x7E]/g,'')` before use

---

## AI story generation

The creator at `/new/` offers two paths after token unlock:

- **✦ Generate with AI** — paste a Gong/Teams transcript → Gemini API extracts the full story → pre-fills the form
- **✏ Fill manually** — standard step-by-step form

**Gemini config:** model `gemini-3.1-flash-lite`, free tier (15 RPM / 500 RPD), API key entered at runtime, auto-retry 3× on 503, prompt editable via Advanced panel before generation.

---

## Language system

Supported: EN, FR, NL, DE, IT, ES, PT, PL, SV, DA, FI, NO, JA, ZH, KO

Each language gets its own self-contained block. Non-EN content is stored under `data.translations[lc]` — including per-language sidebar headings ("Who is X?", "Applications deployed"), so translations are fully independent per field. Adding a language in edit mode clones the EN block with a `[FR]` prefix so translators know exactly what to update.

---

## Continuing development with Claude

This platform is actively developed using Claude (Prophix internal Claude project).

**To resume work in a new session:**

1. Open the Prophix Claude project
2. Say: *"I want to continue work on the Client Story app. Please read `Client_Story.md` for full context."*
3. Claude fetches current source files directly from GitHub raw URLs — no uploads needed

**Raw URLs Claude uses:**

```
https://raw.githubusercontent.com/raulsteiu/raulsteiu.github.io/main/clients/story.js
https://raw.githubusercontent.com/raulsteiu/raulsteiu.github.io/main/clients/index.html
https://raw.githubusercontent.com/raulsteiu/raulsteiu.github.io/main/new/index.html
```

**Output files always land at:**

```
/mnt/user-data/outputs/clients/story.js
/mnt/user-data/outputs/clients/index.html
/mnt/user-data/outputs/new/index.html
```

---

## Version history

| Version | Date       | Summary                                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-09-15 | Initial platform — manual creator, story pages, directory                                          |
| 1.1     | 2026-09-16 | Drag-drop reordering, bullet parser, product icons, overflow fix                                   |
| 1.2     | 2026-09-16 | Dynamic language picker, single-unit section body editing                                          |
| 2.0     | 2026-09-16 | **Data-driven architecture** — content in data.json, shell is 8 lines, story.js renders at runtime |
| 2.1     | 2026-09-16 | Language add/remove in edit mode, 15-language support                                              |
| 2.2     | 2026-09-21 | AI generation via Gemini API — transcript → pre-filled form                                        |
| 3.0     | 2026-09-21 | Status system (draft/approved/published), client preview links, token gate for drafts              |
| 3.1     | 2026-09-21 | KRS double-colon fix, improved Gemini prompt, prompt editor panel, version headers on all files    |
| 3.2     | 2026-09-24 | **Dual-style HTML export** — plain internal style plus a prophix.com-matching style (hexagon hero, red pull-quotes, results box, CTA). PDF brochure language-merge bugfixes (per-key sidebar-label translation, robust client-name fallback). Universal rich-text (Bold/Italic) toolbar across all editable fields. Export-menu positioning fix. story.js v9.9 → v9.24. |

---

## Key constraints and gotchas

- **SHA required for all GitHub API writes** — always fetch current SHA before PUT or you'll get a 409
- **story.js changes propagate instantly** — no re-publish needed for any story after a runtime fix, **but allow a short window for GitHub Pages' CDN to actually finish propagating the new file** before concluding a fix "didn't work". Two near-simultaneous tests on identical code can genuinely show different behavior during that window.
- **GitHub Pages build cancellations are normal** — multiple rapid commits cancel earlier builds; last one wins
- **Deploy story.js via drag-and-drop** — it's too large for the GitHub web editor text paste
- **data.json is the only source of truth** — the rendered DOM is disposable and rebuilt fresh every load
- **A blank `data.name` on older stories** (predating the name/title split) can surface as generic "Who is the client?" text or generic filenames — fixed by re-saving the client name field once in edit mode
- **Never merge translated nested objects whole** — merge per key/field, or an already-translated field can be silently discarded alongside an untranslated sibling
- **Don't share a CSS class between very differently-sized elements** — unrelated styling can leak through and distort the smaller one

## About

This is a client story repository.
