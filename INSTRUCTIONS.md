# Prophix Client Story App — Maintenance & Usage Guide

**Repository:** `raulsteiu/raulsteiu.github.io`  
**Hosted at:** `https://raulsteiu.github.io`  
**Last updated:** September 2026

---

## Overview

The Client Story app is a self-contained publishing platform built on GitHub Pages. It has three parts:

| URL | File | What it is |
|---|---|---|
| `/clients/` | `clients/index.html` | Directory of all published stories (static shell, never rewritten) |
| `/clients/stories.json` | `clients/stories.json` | List of all published stories — the only file that changes when stories are added/deleted |
| `/new/` | `new/index.html` | Creator app — fills in a form, publishes a new story |
| `/clients/[slug]/` | `clients/[slug]/index.html` | Individual client story page |
| `/clients/story.js` | `clients/story.js` | Shared runtime loaded by every client page |

**The Eaglestone page at the repo root (`/index.html`) is separate and unrelated. Never touch it.**

---

## Architecture principles

### Why stories.json (not rebuilding the directory HTML)

Previous versions rebulit the entire `clients/index.html` on every publish or delete. This caused the "only shows latest client" bug because the string-replace approach was fragile.

**Now:** `clients/index.html` is a permanent static shell that never changes. It fetches `clients/stories.json` at runtime to get the list of stories. Only `stories.json` is updated when stories are added or deleted. This means:

- No HTML surgery — just update a tiny JSON file
- The directory page always shows ALL clients correctly
- Easier to debug (just look at stories.json in GitHub)

### Why story.js is shared

Every client page loads `story.js` from `/clients/story.js`. This means:

- Bug fixes and new features in `story.js` apply to all existing client pages automatically
- Client pages themselves are static content — they only store the client's data (text, structure, language blocks)
- Updating `story.js` in the repo upgrades every client page instantly

---

## File structure in the repository

```
raulsteiu.github.io/
├── index.html                  ← Eaglestone (DO NOT TOUCH)
├── prophix-logo-1000px.png     ← Shared Prophix logo
├── new/
│   └── index.html              ← Creator app
└── clients/
    ├── index.html              ← Directory page (static, never rewrite)
    ├── stories.json            ← Stories index (only file that changes)
    ├── story.js                ← Shared runtime for all client pages
    ├── eaglestone-services-sa/
    │   ├── index.html
    │   └── logo.png            ← (if uploaded)
    ├── acme-corp/
    │   ├── index.html
    │   ├── logo.png
    │   └── clip1.mp3
    └── ...
```

---

## How to publish a new client story

1. Go to `https://raulsteiu.github.io/new/`
2. Enter your GitHub token
3. Fill in the form:
   - **Client name** — used as the page title and to generate the URL slug (e.g. "Acme Corp" → `/clients/acme-corp/`)
   - **Industry / HQ** — shown as a tag in the hero
   - **Short description** — one or two sentences, shown under the hero heading
   - **Client logo** — PNG/JPG/SVG, shown in the hero and on the directory card
   - **4 stat tiles** — value + label each (e.g. `~1 wk` / `Closing cycle saved`)
   - **Key Results Snapshot** — 3 highlighted outcomes with a number, label, and short description
   - **Story sections** — each has a label, heading, and body text. Add as many as needed.
   - **Audio clips** — title, timestamp, quote. MP3 files are uploaded separately after publishing (in edit mode).
   - **Results list** — bullet points shown in the sidebar
   - **Participants** — names and titles of interview subjects
   - **Applications deployed** — select from Financial Consolidation, FPA+, Account Reconciliation, Cashflow Management
   - **Languages** — EN is always on. Check others to add empty placeholder blocks (fill them in via edit mode after publishing)
4. Click **Publish client story**
5. The creator:
   - Uploads the logo (if provided) to `clients/[slug]/logo.png`
   - Generates and uploads `clients/[slug]/index.html`
   - Updates `clients/stories.json` to add the new entry
6. The story is live within ~30 seconds (GitHub Pages deploy time)

**Re-publishing:** If you publish a story with the same client name (same slug), it overwrites the existing page. The directory entry is also updated.

---

## How to edit an existing client story

1. Open the story at `https://raulsteiu.github.io/clients/[slug]/`
2. Click the **✏ pencil button** (bottom-right corner)
3. Enter password and GitHub token when prompted
4. Edit mode activates:
   - All text becomes directly editable (click and type)
   - The edit toolbar appears at the top with **Save** and **Cancel**
   - Additional controls appear: **Upload logo**, **Edit products**
5. What you can edit in edit mode:
   - **All text** — hero heading, description, section labels, headings, body text, clip titles, quotes, stats, KRS numbers, sidebar text
   - **Stat tiles** — click the number or label to edit
   - **Applications deployed** — click "Edit products" in the toolbar, check/uncheck products, click Apply
   - **Add a section** — click the "+ Add section" button that appears below the existing sections
   - **Delete a section** — a ✕ button appears on each section card
   - **Add a clip** — click the "+ Add clip" button
   - **Delete a clip** — a ✕ button appears on each clip card
   - **Upload MP3 audio** — an "Upload MP3" button appears under each clip player
   - **Upload/replace logo** — click "Upload logo" in the toolbar
   - **Add/remove languages** — the language toolbar shows + Add language and × remove buttons
6. Click **Save** — the page is pushed to GitHub and the toolbar closes
7. If you get a "Conflict" error, click Save again (this fetches the latest SHA)

**Note:** Always click Save before navigating away. Cancel discards all unsaved changes.

---

## How to delete a client story

1. Go to `https://raulsteiu.github.io/clients/`
2. Hover over the story card — a 🗑 trash icon appears on the right of the card
3. Click the trash icon
4. If not already authenticated, enter your GitHub token
5. Confirm the deletion
6. The app deletes all files in `clients/[slug]/` and removes the entry from `stories.json`

---

## How to add a language to an existing story

1. Open the story and enter edit mode
2. In the language toggle bar, a **"+ Add language"** dropdown appears
3. Select a language (FR, NL, DE, IT, ES)
4. A new language block is created — a full copy of the English content prefixed with `[FR]` etc. as placeholders
5. Click the new language button (e.g. FR) in the toggle bar to switch to it
6. Edit all the placeholder text with the translated content
7. Click **Save**

---

## How to remove a language

1. Enter edit mode
2. The language toggle bar shows **× remove** buttons next to each non-English language
3. Click × to remove that language (confirms before deleting)
4. Click Save

---

## Managing the GitHub token

The GitHub token is never stored in the HTML files. It's entered at runtime through the auth modal and lives only in the browser's memory for the session.

**Token requirements:**
- Fine-grained personal access token (or classic token)
- Scope: `repo` (full repository access) — needed to read/write files via the GitHub API
- For the repo: `raulsteiu/raulsteiu.github.io`

**To generate a new token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Set expiry (e.g. 90 days or no expiry for shared use)
3. Repository access: select `raulsteiu.github.io`
4. Permissions: **Contents** → Read and write
5. Copy the token and share it privately (Teams DM, never email or paste in chat)

**When the token expires:** generate a new one using the steps above. The password (`prophix2026`) never changes unless you edit it in the HTML files.

---

REMOVED_PW_SECTION
REMOVED_PW_SECTION
REMOVED_PW_SECTION
REMOVED_PW_SECTION
REMOVED_PW_SECTION
REMOVED_PW_SECTION
| `new/index.html` | Search for `var EDIT_PASSWORD = 'prophix2026'` |
| `clients/index.html` | Same |
| Every client page | In the inline `<script>` block at the top of the page |

For client pages, you'd need to re-publish each one from the creator, or do a bulk find-replace in GitHub (Settings → Code → Search and replace — or use the API).

**Tip:** The password is low-security by design — it just gates casual access. Security is mainly via the GitHub token, which is never stored and has scoped repository permissions.

---

## Updating story.js (applying fixes or new features)

Because all client pages load story.js from `/clients/story.js`, updating the file in GitHub automatically upgrades all client pages:

1. Edit `story.js` directly in GitHub (pencil icon) or via a commit
2. GitHub Pages redeploys in ~30–60 seconds
3. All client pages now use the new version — no need to re-publish individual pages

---

## Troubleshooting

**Directory shows no stories / wrong stories**
- Check `clients/stories.json` directly in GitHub. It should be a JSON array of story objects.
- If the file is empty or malformed, you can manually edit it in GitHub. Format: `[{"slug":"acme-corp","name":"Acme Corp","created":"2026-09-15T00:00:00.000Z","logo":true}]`

**"Conflict" error when saving**
- The file's SHA has changed since you opened edit mode (someone else saved, or a previous save partially succeeded). Click Save again — the app will re-fetch the SHA.

**Story page not loading (404)**
- Check that `clients/[slug]/index.html` exists in the repo
- GitHub Pages can take up to 2 minutes to publish a new file

**Audio not playing**
- The MP3 must be uploaded to the same folder as the story (`clients/[slug]/`)
- The `<source>` src must be just the filename (e.g. `clip1.mp3`), not a full path
- GitHub Pages serves files with the correct MIME type for .mp3 by default

**Logo not showing on directory card**
- The story entry in `stories.json` must have `"logo": true`
- The file must be at `clients/[slug]/logo.png` (the directory page always looks for `logo.png` — if you uploaded a JPG, the path won't match)
- Re-publish from the creator with a PNG file to ensure consistent naming

**GitHub token error / 401**
- Token may have expired — generate a new one (see Managing the GitHub token above)
- Token may not have write access to the repo — check the token's permissions in GitHub

---

## Repo maintenance tips

- **stories.json is the single source of truth** for the directory. If you manually add a folder in GitHub without going through the creator, it won't appear in the directory unless you also add an entry to stories.json.
- **Never delete `clients/story.js`** — all client pages depend on it. If it's missing, every story page will break.
- **Never delete `clients/index.html`** — it's the directory shell. It never needs to be regenerated.
- **Never rename the `clients/` folder** — all story paths are hardcoded.
- The `new/index.html` creator can be updated without affecting any published stories.

---

## App components — quick reference

| Component | URL | Purpose | When to update |
|---|---|---|---|
| Creator | `/new/index.html` | Create new stories | When adding new fields or products |
| Directory shell | `/clients/index.html` | UI for the story list | Rarely — only for design changes |
| Stories index | `/clients/stories.json` | List of published stories | Auto-updated by creator and delete |
| Shared runtime | `/clients/story.js` | Edit mode, language switching, save logic | When fixing bugs or adding edit features |
| Client page | `/clients/[slug]/index.html` | The actual story page | Auto-generated; editable via edit mode |
| Client logo | `/clients/[slug]/logo.png` | Logo shown in hero + directory | Uploaded via creator or edit mode |
| Audio files | `/clients/[slug]/*.mp3` | Podcast clips | Uploaded via edit mode |
