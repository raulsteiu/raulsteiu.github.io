# Prophix Client Story App — Maintenance & Usage Guide

**Repository:** `raulsteiu/raulsteiu.github.io`  
**Live URL:** `https://raulsteiu.github.io`  
**Last updated:** September 2026

---

## Overview

A self-contained publishing platform on GitHub Pages. No servers, no CMS, no build pipeline — everything runs in the browser via the GitHub API.

| URL | File | Purpose |
|---|---|---|
| `/new/` | `new/index.html` | Creator — form-based, publishes new stories |
| `/clients/` | `clients/index.html` | Directory of all published stories |
| `/clients/stories.json` | auto-updated | Story index |
| `/clients/story.js` | `clients/story.js` | Shared runtime for every client page |
| `/clients/[slug]/` | `clients/[slug]/index.html` | Individual client story page |

**The Eaglestone page at the repo root (`/index.html`) is a legacy page. Never touch it.**

---

## How to publish a new client story

1. Go to `https://raulsteiu.github.io/new/`
2. Paste your access token → click **Access Creator**
3. Fill the form:

| Field | Notes |
|---|---|
| Client name | Generates the URL slug — `Acme Corp` → `/clients/acme-corp/` |
| Industry / HQ | Small tag in the hero |
| Short description | 1–2 sentences under the heading |
| Client logo | PNG / JPG / SVG — always converted to PNG internally |
| Stats | Flexible value + label pairs |
| Key Results Snapshot | Checkmark list in dark card. Bold prefix supported: `Bold part: rest of sentence` |
| Story sections | Label, heading, body text. Lines starting `- ` become red dot bullet points. `- Bold text: rest` makes bold prefix. |
| Audio clips | Title, timestamp, pull quote. MP3s uploaded after publishing via edit mode. |
| Results list | Sidebar bullet list |
| Who is [Client]? | Freetext + flexible stat tiles |
| Participants | Names and titles in sidebar |
| Applications deployed | Select from: Financial Consolidation, Cash Management, Account Reconciliation, FP&A Plus, Intercompany Management, Lease Accounting |
| Languages | EN always on. Additional languages add placeholder blocks for manual translation. |

4. Click **Publish client story →**
5. 3-second countdown → redirects to `/clients/`

**Re-publishing** overwrites the page and resets the `created` date. Use it to apply template updates to existing stories.

---

## How to edit an existing story

1. Open `https://raulsteiu.github.io/clients/[slug]/`
   - **Shortcut:** add `?edit=1` to the URL to auto-open the token modal (bookmarkable)
2. Click the **✏ pencil button** (bottom-right)
3. Paste your access token → **Unlock edit mode**

### What you can edit directly (click to type)

Hero tag, heading, description, industry tag, section labels/headings/body text, clip titles and quotes, "Quotes" heading, stat values and labels, KRS items, Who card text and stats, results, participant names and titles, footer disclaimer.

### Structural controls (appear in edit mode)

| Control | How |
|---|---|
| **Add / delete section** | `+ Add section` button below sections · 🗑 on each section card |
| **Reorder sections and clips** | Drag the `⠿` handle — sections and clips are freely interleaved |
| **Add / delete clip** | `+ Add clip` button · 🗑 on each clip card |
| **Upload MP3** | **Upload MP3** button in the clip player |
| **Delete MP3 from GitHub** | **✕** at the right end of the clip title row |
| **Add / delete stat** | **+** at right end of stats row · **✕** on any tile |
| **Add / delete KRS result** | **+ Add result** in KRS card · **✕** on any item |
| **Add / delete participant** | **+ Add participant** in Participants card · **✕** on any entry |
| **Add / delete result** | **+ Add result** in Results card · **✕** on any item |
| **Edit applications** | Click the Applications card — inline checkbox panel |
| **Replace logo** | Click the logo in the hero |
| **Add / remove language** | Language dropdown in top nav · **×** on a language button |

4. Click **Save** — page pushed to GitHub, edit mode closes after 1.5s

**Always save before navigating away. Cancel discards all unsaved changes.**

---

## Drag and drop reordering

In edit mode, every story section and audio clip has a `⠿` drag handle on its left edge. You can freely drag sections and clips into any order — a clip can sit between two story sections, after all sections, or anywhere that makes narrative sense. The order is saved when you click Save.

---

## How to share a story

- **Directory:** ⧉ button on a card copies the story URL. ✏ copies the `?edit=1` edit link.
- **Story page:** **⧉ Share** button in the top nav bar copies the clean URL.

---

## How to delete a story

1. Go to `/clients/`
2. Hover a card → 🗑 appears
3. Click → token modal if not authenticated → confirm
4. All files in `clients/[slug]/` deleted and removed from `stories.json`

---

## Managing languages

**Add:** Edit mode → select language in dropdown → block created with `[FR]` placeholders → translate → Save.

**Remove:** Edit mode → click **×** next to the language button → Save.

EN cannot be removed.

---

## Access token

Never stored anywhere. Must be re-entered each session.

**Requirements:**
- Fine-grained personal access token
- Repository: `raulsteiu/raulsteiu.github.io`
- Permission: Contents → Read and write

**To generate:** GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → set expiry + repo + Contents permission.

**Share:** Teams DM only. Never email. Never paste in chat.

---

## Updating story.js (applies to all pages instantly)

1. Upload new `story.js` to `clients/story.js` in GitHub
2. Wait ~30s for GitHub Pages to redeploy
3. All client pages updated — no re-publishing needed

**Exception:** HTML template changes (new sections, layout) require re-publishing individual stories.

---

## When to re-publish a story

Re-publish from `/new/` when:
- Page layout looks wrong (old template)
- Language block is blank or broken
- You want to apply new CSS/template to an existing story

Re-publishing overwrites HTML but **keeps all MP3 files**.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Directory shows no stories | Check `clients/stories.json` is valid JSON array |
| Logo not showing | Always use PNG — app converts automatically. Re-publish if old page had jpg/svg. |
| "sha wasn't supplied" on publish | Try again — race condition on GitHub's side |
| "Conflict" error when saving | SHA changed since edit opened. Click Save again. |
| Story page 404 | Wait up to 2 minutes on first publish |
| Audio ✕ shows error | Check token has write permission. If "File not found" — already deleted, just save. |
| Add/remove section not working | Deploy latest `story.js` — this was a known bug fixed in v1.1 |
| Language page blank | Re-publish from creator to regenerate with current template |
| Token rejected (401) | Expired or wrong permissions — generate a new one |

---

## Repo maintenance rules

- `stories.json` is the single source of truth — manually adding a folder won't show in the directory
- Never delete `clients/story.js`
- Never delete `clients/index.html`
- Never rename the `clients/` folder

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
