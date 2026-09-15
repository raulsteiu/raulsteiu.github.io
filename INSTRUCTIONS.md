# Prophix Client Story App — Maintenance & Usage Guide

**Repository:** `raulsteiu/raulsteiu.github.io`  
**Hosted at:** `https://raulsteiu.github.io`  
**Last updated:** September 2026

---

## Overview

A self-contained publishing platform built on GitHub Pages. No servers, no CMS, no build pipeline — everything runs in the browser via the GitHub API.

| URL | File | Purpose |
|---|---|---|
| `/new/` | `new/index.html` | Creator app — form-based, publishes new stories |
| `/clients/` | `clients/index.html` | Directory of all published stories (static shell, never rewritten) |
| `/clients/stories.json` | `clients/stories.json` | Story index — only file updated on publish/delete |
| `/clients/story.js` | `clients/story.js` | Shared runtime loaded by every client page |
| `/clients/[slug]/` | `clients/[slug]/index.html` | Individual client story page |

**The Eaglestone page at the repo root (`/index.html`) is a legacy page. Never touch it.**

---

## Architecture

### Why stories.json

`clients/index.html` is a permanent static shell — it never gets rewritten. On load it fetches `clients/stories.json`, a simple JSON array. Only that file is updated when stories are added or deleted.

### Why story.js is shared

Every generated client page loads `/clients/story.js` via `<script src>`. Bug fixes and new features apply to all existing pages automatically — no need to re-publish stories just to get a story.js update.

### Authentication model

| App | Auth | Notes |
|---|---|---|
| Creator (`/new/`) | Access token only | Token verified live against GitHub API on entry |
| Client story edit mode | Access token only | Entered via modal when ✏ is clicked |
| Directory delete | Access token only | Modal appears on first delete action |

All three are **token-only** — no password anywhere. The token is never stored in any file; it lives only in browser session memory.

---

## File structure

```
raulsteiu.github.io/
├── index.html                        ← Eaglestone legacy page (DO NOT TOUCH)
├── prophix-logo-1000px.png           ← Shared Prophix logo
├── .nojekyll                         ← Skips Jekyll build, faster deploys (~15–30s)
├── new/
│   └── index.html                    ← Creator app
└── clients/
    ├── index.html                    ← Directory shell (never rewrite)
    ├── stories.json                  ← Story index (auto-updated)
    ├── story.js                      ← Shared runtime for all client pages
    ├── acme-corp/
    │   ├── index.html                ← Generated story page
    │   ├── logo.png                  ← Client logo (always PNG)
    │   └── clip1.mp3                 ← Audio clip (uploaded via edit mode)
    └── ...
```

---

## How to publish a new client story

1. Go to `https://raulsteiu.github.io/new/`
2. Paste your access token and click **Access Creator** — the form unlocks once verified
3. Fill in the form:

| Field | Notes |
|---|---|
| **Client name** | Generates the URL slug (e.g. "Acme Corp" → `/clients/acme-corp/`) |
| **Industry / HQ** | Small tag shown in the hero |
| **Short description** | 1–2 sentences under the hero heading |
| **Client logo** | PNG / JPG / SVG — always converted to PNG internally and saved as `logo.png` |
| **Stats** | Flexible — add as many value + label pairs as needed |
| **Key Results Snapshot** | Checkmark bullet list in a dark card. Each item has an optional bold prefix + full sentence. |
| **Story sections** | Label, heading, body text — add as many as needed |
| **Audio clips** | Title, timestamp, pull quote. MP3s are uploaded after publishing via edit mode. |
| **Results list** | Bullet points in the sidebar |
| **"Who is [Client]?" card** | Freetext description + flexible stat tiles in the sidebar |
| **Participants** | Names and titles in the sidebar |
| **Applications deployed** | Financial Consolidation, FPA+, Account Reconciliation, Cashflow Management |
| **Languages** | EN always on. Additional languages add empty placeholder blocks — translate via edit mode. |

4. Click **Publish client story →**
5. The creator uploads the logo (converted to PNG), generates and uploads the page, updates `stories.json`
6. A 3-second countdown then redirects to `/clients/`

**Re-publishing:** Same client name = same slug = overwrites the existing page and resets the `created` date. Use this to fix structural issues or update the layout after a `story.js` template change. Always re-publish after major template updates.

---

## How to edit an existing client story

1. Open the story at `https://raulsteiu.github.io/clients/[slug]/`
   - **Shortcut:** append `?edit=1` to the URL to auto-open the token modal on load (bookmarkable edit link)
2. Click the **✏ pencil button** (bottom-right corner) — or use the `?edit=1` link
3. Paste your access token and click **Unlock edit mode**
4. The edit toolbar appears at the top: **Save**, **Cancel**, and status indicator

### What you can edit in edit mode

**Direct text editing** — click any of these to type directly:
- Hero tag, heading (`h1`), description, industry tag
- Section labels, headings, body text
- Clip titles and pull quotes
- "Quotes" section heading (above audio clips)
- Stat tile values and labels (both in the stats row and in the Who card)
- KRS item text
- "Who is [Client]?" description and who-stat tile values
- Results list items
- Participant names and titles
- Disclaimer text in the footer

**Structural controls** (appear automatically when edit mode is active):

| Control | How to use |
|---|---|
| **Add section** | Click **+ Add section** below existing sections |
| **Delete section** | 🗑 button on each section card |
| **Add stat tile** | **+** button at the right end of the stats row |
| **Delete stat tile** | **✕** on any stat tile |
| **Add KRS result** | **+ Add result** inside the dark KRS card |
| **Delete KRS result** | **✕** on any KRS item |
| **Add clip** | **+ Add clip** below the clips |
| **Delete clip** | 🗑 top-right of any clip card |
| **Upload MP3** | **Upload MP3** button under the audio player |
| **Delete MP3 from GitHub** | **✕** at the right end of the clip title row — removes the file from the repo and clears the player |
| **Add participant** | **+ Add participant** at the bottom of the Participants card |
| **Delete participant** | **✕** on any participant entry |
| **Add result** | **+ Add result** at the bottom of the Results card |
| **Delete result** | **✕** on any result item |
| **Add who-stat tile** | **+ Add stat** inside the Who card |
| **Delete who-stat tile** | **✕** on any who-stat tile |
| **Edit products** | Click the Applications Deployed section — inline panel with checkboxes |
| **Replace logo** | Click the logo image in the hero — file picker opens, always saves as `logo.png` |
| **Add language** | **+ Add language** dropdown in the language toggle bar |
| **Remove language** | **×** next to the language in the toggle bar |

5. Click **Save** — the page is pushed to GitHub, edit mode closes after 1.5s
6. **Conflict error:** click Save again — it re-fetches the SHA and retries

**Always click Save before navigating away. Cancel discards all unsaved changes.**

### Last edited timestamp

After every save, `stories.json` is silently updated with an `edited` timestamp for that story. The directory card shows "Edited [date]" once set.

---

## How to share a story

- From the **directory** (`/clients/`): click the **⧉** share button on a card — copies the story URL. Click the **✏** copy button to copy the `?edit=1` edit link.
- From the **story page** itself: click **⧉ Share** in the top nav bar — copies the clean URL.

---

## How to delete a client story

1. Go to `https://raulsteiu.github.io/clients/`
2. Hover over a card — the 🗑 trash icon appears on the right of the actions bar
3. Click it — token modal appears if not already authenticated
4. Confirm deletion
5. All files in `clients/[slug]/` are deleted and the entry is removed from `stories.json`

---

## How to add / remove a language

**Add:**
1. Enter edit mode on the story
2. Select a language from the **+ Add language** dropdown in the nav bar
3. A new block is created — full copy of English content with `[FR]` etc. prepended as placeholders
4. Click the new language button, edit all placeholder text with translations
5. Save

**Remove:**
1. Enter edit mode
2. Click **×** next to the language in the nav bar — confirms before removing
3. Save

---

## Managing the access token

The token is never stored anywhere in the app. It lives only in browser session memory and must be re-entered each session.

**Requirements:**
- Fine-grained personal access token (or classic with `repo` scope)
- Repository: `raulsteiu/raulsteiu.github.io`
- Permission: **Contents → Read and write**

**To generate:**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Set expiry (90 days recommended, or no expiry for a shared team token)
3. Repository access: `raulsteiu.github.io` only
4. Permissions: Contents → Read and write
5. Share via Teams DM — never email, never paste in chat

**When expired:** generate a new one with the same settings. Nothing else needs updating.

---

## Updating story.js (applying fixes to all pages)

Deploying a new `story.js` upgrades every published story automatically:

1. Upload the new `story.js` to `clients/story.js` in GitHub
2. Wait ~30 seconds for GitHub Pages to redeploy
3. All client pages now use the new version — no re-publishing needed

**Exception:** changes to the HTML template (layout, new sections, CSS) require re-publishing individual stories from the creator, because the template is baked into each page's HTML at publish time.

---

## When to re-publish a story

Re-publish (from the creator) when:
- The page layout looks wrong (e.g. background colour issue from an old template)
- A language block is blank or broken
- You want to apply a new CSS/template change to an existing story
- You want to add/change the logo or initial content in bulk

Re-publishing overwrites the HTML but **keeps all audio files** (MP3s are not touched).

---

## Troubleshooting

**Directory shows no stories**
- Check `clients/stories.json` in GitHub — must be valid JSON array
- Correct format: `[{"slug":"acme-corp","name":"Acme Corp","created":"2026-09-15T00:00:00.000Z","logo":true}]`
- `edited` field is optional: `"edited":"2026-09-15T12:00:00.000Z"`

**Logo not showing on directory card or story page**
- Always use PNG. The app converts any format to PNG on upload and saves as `logo.png`
- If an old story has `logo.jpg` or `logo.svg`, re-publish it from the creator with a PNG file

**"sha wasn't supplied" error on publish**
- The creator now fetches the SHA before every upload — this should not occur
- If it does, try again; it's a race condition on GitHub's side

**"Conflict" error when saving**
- SHA changed since edit mode opened (concurrent edit or partial save)
- Click Save again — it re-fetches the current SHA

**Story page 404**
- Check `clients/[slug]/index.html` exists in the repo
- GitHub Pages can take up to 2 minutes on first publish

**Audio not playing after upload**
- The MP3 must be in `clients/[slug]/` — the Upload MP3 button in edit mode handles this automatically
- If manually uploaded, the filename must match what the `<source src>` attribute expects

**Audio delete does nothing / shows error**
- Confirm you're in edit mode (token entered)
- The ✕ on the clip title only appears in edit mode
- If the error says "File not found", the MP3 may have been deleted from GitHub already — the ✕ will still clear the player locally; just save the page afterward

**Token rejected (401)**
- Token expired — generate a new one
- Token missing **Contents → Read and write** permission
- Token scoped to wrong repository

**Edit mode shows no editable outlines**
- `story.js` may not have loaded — check browser console for errors
- Confirm `clients/story.js` exists in the repo

**Language page is blank**
- The story was published with an old template. Re-publish from the creator to regenerate with the current template.

**Add section / delete section intermittent**
- This was fixed in the current `story.js` by moving edit-mode visibility to CSS (`.edit-mode .edit-only`) instead of inline styles. If you still see this on an old page, re-publish it.

---

## Repo maintenance rules

- **`stories.json` is the single source of truth.** Manually adding a folder in GitHub won't make it appear in the directory — you must also add an entry to `stories.json`.
- **Never delete `clients/story.js`** — every story page depends on it.
- **Never delete `clients/index.html`** — it's the directory shell.
- **Never rename the `clients/` folder** — all paths are hardcoded.
- **`new/index.html` and `clients/index.html` can be updated freely** — they have no story data in them.

---

## Component reference

| Component | Path | Updated by | When to redeploy |
|---|---|---|---|
| Creator | `new/index.html` | Manual deploy | New form fields, template changes, UI fixes |
| Directory shell | `clients/index.html` | Manual deploy | UI changes to directory page |
| Stories index | `clients/stories.json` | Auto (creator + delete) | Manual repair only |
| Shared runtime | `clients/story.js` | Manual deploy | Bug fixes, new edit-mode features |
| Client story page | `clients/[slug]/index.html` | Creator or edit mode | Edit mode for content; re-publish for structural/template changes |
| Client logo | `clients/[slug]/logo.png` | Creator or edit mode | Always PNG — app converts automatically on upload |
| Audio clips | `clients/[slug]/*.mp3` | Edit mode only | Upload/delete via the Upload MP3 / ✕ controls in edit mode |

---

## stories.json format reference

```json
[
  {
    "slug": "acme-corp",
    "name": "Acme Corp",
    "created": "2026-09-15T10:00:00.000Z",
    "edited": "2026-09-15T14:30:00.000Z",
    "logo": true
  }
]
```

| Field | Type | Set by | Notes |
|---|---|---|---|
| `slug` | string | Creator | URL-safe name, e.g. `acme-corp` |
| `name` | string | Creator | Display name on directory card |
| `created` | ISO string | Creator | Set on every publish (including re-publish) |
| `edited` | ISO string | story.js | Set silently after every edit-mode save |
| `logo` | boolean | Creator | `true` if `logo.png` exists in the folder |
