# Prophix Client Story App — Maintenance & Usage Guide

**Repository:** `raulsteiu/raulsteiu.github.io`  
**Last updated:** September 2026 — v2.1

---

## Overview

A self-contained publishing platform on GitHub Pages. No servers, no CMS, no build pipeline.

| URL | Purpose |
|---|---|
| `/new/` | Creator — publish new stories |
| `/clients/` | Directory of all stories |
| `/clients/[slug]/` | Individual story page |
| `/clients/story.js` | Shared runtime — controls everything |

**The Eaglestone page at the repo root (`/index.html`) is a legacy page. Never touch it.**

---

## How a story page works

Each story is two files:

- **`index.html`** — an 8-line shell that loads `story.js`
- **`data.json`** — all the actual content (sections, clips, stats, products, languages, etc.)

When someone opens a story, `story.js` fetches `data.json` and builds the full page in the browser. When you edit and save, `story.js` writes the updated content back to `data.json`. The shell `index.html` almost never changes after first publish.

**`data.json` is the source of truth.** The rendered HTML is not.

---

## How to publish a new story

1. Go to `https://raulsteiu.github.io/new/`
2. Paste your access token → **Access Creator**
3. Fill in the form:

| Field | Notes |
|---|---|
| Client name | Generates the URL — `Acme Corp` → `/clients/acme-corp/` |
| Industry / HQ | Small tag in the hero section |
| Short description | 1–2 sentences under the heading |
| Client logo | PNG/JPG/SVG — always converted to PNG |
| Stats | Flexible value + label pairs (e.g. `~1 week` / `Closing cycle saved`) |
| Key Results Snapshot | Checkmark list. `Bold text: rest` syntax for bold prefix. |
| Story sections | Label + heading + body. Lines starting `- ` become red dot bullets. `- Bold: rest` = bold prefix. |
| Audio clips | Title, timestamp (e.g. 09:02), pull quote. Upload MP3s after publishing via edit mode. |
| Results | Sidebar bullet list |
| Who is [Client]? | Freetext description + optional stat tiles |
| Participants | Names and titles shown in sidebar |
| Applications deployed | Select from product list — icons load automatically |
| Languages | EN always included. Others add placeholder blocks for translation. |

4. Click **Publish client story →**
5. Creator saves `data.json` + shell `index.html` + updates directory → redirects to `/clients/`

---

## How to edit an existing story

1. Open the story at `https://raulsteiu.github.io/clients/[slug]/`
   - **Shortcut:** add `?edit=1` to the URL to auto-open the token prompt (great for bookmarking)
2. Click the **✏ pencil** (bottom-right)
3. Paste your access token → **Unlock edit mode**

### What you can edit (click any field to type)

Hero label, heading, description, industry tag, section labels/headings/body, clip titles/quotes, stat values/labels, KRS items, Who card text and stats, results, participant names/titles, footer disclaimer.

### Section body editing

In edit mode, the section body becomes a single text area. Type freely:
- Press **Enter** for a new line (stays as one block — no splitting)
- Start a line with `- ` to make a **red dot bullet point**
- Use `- Bold text: rest of line` for a **bold prefix**

Everything converts to proper HTML automatically when you click Save.

### Edit mode controls

| Control | How to use |
|---|---|
| **Add / delete section** | `+ Add section` button at bottom of main content · 🗑 on each section |
| **Add / delete clip** | `+ Add clip` button · 🗑 on each clip card |
| **Reorder sections and clips** | Drag the `⠿` handle (top-right of each card) — freely interleave sections and clips |
| **Upload MP3** | `Upload MP3` button inside the clip player |
| **Delete MP3 from GitHub** | `✕` at the right end of the clip title bar |
| **Add / delete stat** | `+` at the end of the stats row · `✕` on any tile |
| **Add / delete KRS item** | `+ Add result` in the KRS card · `✕` on any item |
| **Add / delete participant** | `+ Add participant` · `✕` on any entry |
| **Add / delete result** | `+ Add result` · `✕` on any item |
| **Change products** | Click the Applications Deployed card — inline checkbox panel appears |
| **Replace logo** | Click the client logo in the hero |
| **Add language** | Edit mode → language dropdown in top nav → select language |
| **Remove language** | Edit mode → `×` button next to the language tab |

4. Click **Save** — `data.json` updated on GitHub, page re-renders cleanly from fresh data

---

## Drag and drop

In edit mode, every section and audio clip has a `⠿` drag handle at the top-right. Drag to reorder — sections and clips are interleaved in a single list so a clip can sit immediately after the section it relates to. Order is saved when you click Save.

---

## Languages

**Available:** English (EN), French (FR), Dutch (NL), German (DE), Italian (IT), Spanish (ES), Portuguese (PT), Polish (PL), Swedish (SV), Danish (DA), Finnish (FI), Norwegian (NO), Japanese (JA), Chinese (ZH), Korean (KO).

**To add:** Edit mode → language dropdown in nav → select. A new block is created with `[XX]` placeholder prefixes on all text. Translate the placeholders, then Save.

**To remove:** Edit mode → click `×` next to the language tab → Save. All content for that language is removed.

**EN cannot be removed.**

**Note:** You can add and remove languages on any existing story at any time — language management is always available in edit mode, it is not locked to the original publish.

---

## Share a story

- **From the directory:** ⧉ button on a card copies the story URL. ✏ copies the `?edit=1` edit link.
- **From the story page:** **⧉ Share** button in the top nav copies the clean URL.

---

## Delete a story

1. Go to `/clients/`
2. Hover a story card → 🗑 appears
3. Click → confirm → story removed from directory, all files deleted from GitHub

---

## Access token

Never stored anywhere. Must be entered fresh each session.

**Requirements:**
- Fine-grained personal access token
- Repository: `raulsteiu/raulsteiu.github.io`
- Permission: Contents → Read and write

**To generate:** GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → set repo + Contents permission.

**Distribution:** Teams DM only. Never email. Never paste in chat.

---

## Updating story.js — applies to all stories instantly

1. Upload new `story.js` to `clients/story.js` in GitHub (drag-and-drop for large files)
2. Wait ~30 seconds for GitHub Pages to redeploy
3. Every story page immediately uses the new version — no re-publishing needed

This is the core advantage of the v2.0 architecture. `story.js` controls all layout, CSS, edit behaviour, and rendering. One deploy updates everything.

---

## When to re-publish from the creator

Re-publishing regenerates both `data.json` and the shell `index.html`.

Use re-publish only when:
- **Renaming a story** — changes the slug/URL
- **Starting over** with completely fresh content
- The shell `index.html` is missing or corrupted

Re-publishing **does not delete** audio MP3 files.

---

## Adding a new Prophix product to the list

1. Upload the product icon PNG to `/assets/icons/[product-name].png` in GitHub
2. In `story.js`, add to `PROPHIX_PRODUCTS`:
   ```js
   {name:'New Product', icon:'/assets/icons/new-product.png'}
   ```
3. In `new/index.html`, add a checkbox in the Applications Deployed section
4. Deploy both files

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Directory shows no stories | Check `clients/stories.json` is a valid JSON array |
| Story page shows "Could not load story" | Check `data.json` exists in the story folder |
| Logo not showing after upload | Re-publish — logo converts to PNG automatically |
| Save fails with "sha wasn't supplied" | Try again — SHA race on GitHub's side |
| Token rejected (401) | Expired or wrong permissions — generate a new one |
| "3 cancelled checks" on GitHub commit | Normal — multiple files committed in sequence, last build won |
| Page looks wrong after deploy | Hard refresh: Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac) |
| Colleague sees old version | Browser cache — hard refresh or open in incognito |
| Story page 404 | Wait up to 2 minutes after first publish |
| Language add/remove not visible | Make sure you're in edit mode — the controls only appear after unlocking |
| Can't edit a language block | Switch to that language tab first, then click Save — edit mode re-applies on switch |

---

## File structure per story

```
clients/[slug]/
├── index.html   ← 8-line shell (set on publish, almost never changes)
├── data.json    ← all content (updated every save — this is the source of truth)
├── logo.png     ← client logo (optional)
└── *.mp3        ← audio clips (optional)
```

---

## stories.json — directory index only

```json
[
  {
    "slug": "acme-corp",
    "name": "Acme Corp",
    "created": "2026-09-16T10:00:00.000Z",
    "edited": "2026-09-16T14:30:00.000Z",
    "logo": true
  }
]
```

This file only tracks who exists. All story content is in `data.json`.
