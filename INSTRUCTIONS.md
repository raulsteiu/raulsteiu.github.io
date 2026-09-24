# Prophix Client Story App — Maintenance & Usage Guide

**Repository:** `raulsteiu/raulsteiu.github.io`  
**Last updated:** September 2026 — v3.2

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
- **`data.json`** — all the actual content (sections, clips, stats, products, languages, status, etc.)

When someone opens a story, `story.js` fetches `data.json` and builds the full page in the browser. When you edit and save, `story.js` writes the updated content back to `data.json`.

**`data.json` is the source of truth.** The rendered HTML is not.

---

## Story statuses

Every story has a status. This controls how it appears in the directory and how it opens.

| Status | Directory tile | Opening behaviour |
|---|---|---|
| **Published** | Normal white card | Opens normally — no token needed |
| **Draft** | Light blue card + `◑ Draft` badge | Token gate → opens straight in edit mode |
| **Approved** | Light green card + `✓ Approved` badge | Token gate → opens straight in edit mode |

To change status: open the story → enter token → use the **status dropdown** in the edit toolbar. Saves automatically — no separate save click needed.

**All stories are always visible in the directory regardless of status.**

---

## How to publish a new story

1. Go to `https://raulsteiu.github.io/new/`
2. Paste your access token → **Access Creator**
3. Choose how to create:
   - **✦ Generate with AI** — paste a transcript → AI fills all fields (see AI section below)
   - **✏ Fill manually** — fill the form field by field
4. Click **Publish client story →**
5. Story publishes immediately with status `published` and appears in `/clients/`

---

## How to edit an existing story

**Published story:**
1. Open `https://raulsteiu.github.io/clients/[slug]/`
2. Click **✏** (bottom-right) → enter token → edit mode opens

**Draft or approved story:**
1. Open the story URL from the directory
2. Token gate appears — enter your token
3. Story opens **directly in edit mode** — no extra steps

**Shortcut:** Add `?edit=1` to any published story URL to auto-open the token prompt.

### What you can edit

Hero label, heading, description, industry tag, section labels/headings/body, media block titles/quotes, stat values/labels, KRS heading + items, Who card text and stats, results/features, participants, products, logo.

**Formatting popup:** select any text while in edit mode and a small **Bold / Italic** toolbar floats above your selection. This now appears on *every* editable field — headings, labels, stat numbers, everything, not just the main body copy.
> One caveat: bold/italic only *saves* on fields that support rich text end-to-end — the main paragraph text, the "Who is..." description, the results/features list, and the hero description. On other fields (headings, labels, stat numbers) the formatting shows while editing but reverts to plain text on Save. Ask if you need it extended to a specific field.

### Section body editing

In edit mode the section body collapses to a single editable area:
- Press **Enter** for a new line
- Start a line with `- ` → red dot bullet
- Use `- Bold text: rest of line` → bold prefix bullet

### Edit toolbar

| Control | Action |
|---|---|
| **Save** | Saves all changes to data.json |
| **Cancel** | Discards changes |
| **Status dropdown** | Change Draft / Approved / Published — saves instantly |
| **⧉ Preview link** | Generate a client preview link (see below) |
| **🗑 Delete story** | Deletes this story permanently — same as deleting from the directory (see "Delete a story" below), just one click closer while you're already in the page |
| **↓ Export HTML** | Download a standalone HTML copy — see "Getting a story out" below |

The nav bar (top of the page, always visible) also has **↓ Brochure**, which downloads the PDF version — see below.

### Edit mode controls

| Control | How to use |
|---|---|
| Add / delete section | `+ Add section` at bottom · 🗑 on each section |
| Add / delete media block | `+ Add media` → choose **Audio clip / Video / Image / Quote block** · 🗑 on each block |
| Reorder | Drag `⠿` handle on any section or media block |
| Upload MP3 | `Upload MP3` inside an audio block's player |
| Add a video | Paste a **YouTube or Vimeo URL** directly into the field on a video block — it embeds automatically, no file upload |
| Upload image | `Upload image` inside an image block · click any uploaded image to view it full-size |
| Delete media file | `✕` at the right of the block's title bar |
| Add / delete stat | `+` at end of stats row · `✕` on tile |
| Add / delete KRS item | `+ Add result` in KRS card · `✕` on item |
| Add / delete participant | `+ Add participant` · `✕` on entry |
| Add / delete result/feature | `+ Add feature` · `✕` on item |
| Change products | Click Applications Deployed card |
| Replace logo | Click client logo in hero |
| Add language | Language dropdown in nav → select |
| Remove language | `×` next to language tab |

**Media block types, at a glance:**

| Type | What it needs |
|---|---|
| 🎵 Audio clip | Title, quote, MP3 upload |
| 🎬 Video | Title, quote, a pasted YouTube/Vimeo link |
| 🖼 Image | Title, optional caption, uploaded image |
| 💬 Quote block | Title, quote only — no player, just a pull quote |

---

## Getting a story out of the app

Every story can leave the app three ways — pick whichever fits what you're sending.

### 1. The live page itself
Just share the URL. Always current, always editable by whoever has the token.

### 2. PDF Brochure
Click **↓ Brochure** in the page's top nav (works from either edit mode or the normal view). Downloads a polished two-page PDF — Prophix + client logos, stats, Key Results, full story sections, Applications Deployed — in whichever language tab is currently open. Good for emailing or dropping into a deck.

### 3. HTML Export (two styles)
From **edit mode**, click **↓ Export HTML** in the toolbar. A menu opens listing every published language, split into two sections:

- **Internal style** — a plain static snapshot of the page exactly as it looks in this app. Good for a simple standalone copy or archiving.
- **prophix.com style** — rebuilt from scratch to match the look of a real prophix.com public customer story (hero photo behind a hexagon logo, red pull-quote sections, a "Prophix One™ enables X to:" results box, a "See it in action" call-to-action). Use this when the story needs to feel like it belongs on prophix.com itself.

Either one downloads a single self-contained `.html` file — open it in any browser, or attach it to an email. It doesn't need `story.js` or any live connection to work.

---

## Sending a story for client review (Preview link)

1. Open the story in edit mode
2. Click **⧉ Preview link** in the toolbar
3. Link and password are **generated and saved automatically**
4. Click **⧉ Copy link + password** — copies a ready-to-paste block:
   ```
   Story preview link: https://raulsteiu.github.io/clients/[slug]/?preview=...
   Password: blue-sky-42
   Expires: 24 Sep 2026
   ```
5. Paste into your email to the client
6. Click **Done → Stories** to return to the directory

**The client experience:**
- Opens the link → clean Prophix-branded password gate
- Enters password → sees the story in preview mode (read-only, no edit button, no access to other stories)
- Emails you feedback

**Preview links expire after 3 days.**

After the client responds by email:
- Open the story (token gate) → make changes → change status dropdown to `Approved` or `Published` as appropriate

---

## AI story generation

1. Go to `/new/` → unlock → choose **✦ Generate with AI**
2. Enter your **Gemini API key** (free from `aistudio.google.com` — separate from GitHub token)
3. Enter the **client name**
4. Paste the full **Gong/Teams/meeting transcript**
5. Click **✦ Generate story** — wait ~10 seconds
6. Review the pre-filled form → edit anything needed
7. Click **Publish client story →**

**Gemini API key:** Free personal key. Get it at `aistudio.google.com` → Get API key. Entered once per session, never stored. Free tier allows 500 story generations per day.

---

## Languages

**Available:** EN, FR, NL, DE, IT, ES, PT, PL, SV, DA, FI, NO, JA, ZH, KO

**To add:** Edit mode → `+ Add language` → select. All fields get `[XX]` prefixes marking content to translate.

**To remove:** Edit mode → `×` next to language tab → Save.

**EN cannot be removed.**

Every field is independent per language — including the "Who is [Client]?" and "Applications deployed" sidebar headings. Translate a heading once on that language's tab and it sticks; it also carries through correctly into the PDF brochure and both HTML export styles for that language.

---

## Delete a story

Two ways to do this — same result either way:

**From the directory:**
1. Go to `/clients/`
2. Hover a card → 🗑 appears
3. Click → enter token → confirm

**From inside the story, while editing:**
1. Open the story → enter token → edit mode
2. Click **🗑 Delete story** in the edit toolbar → confirm

Both permanently remove all files from the repository. There's no undo — only do this if you're sure.

---

## Access token

Never stored anywhere. Enter fresh each session.

**Requirements:**
- Fine-grained personal access token
- Repository: `raulsteiu/raulsteiu.github.io`
- Permission: Contents → Read and write

**To generate:** GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens

**Distribution:** Teams DM only. Never email. Never paste in chat.

---

## Updating story.js — applies to all stories instantly

1. Upload new `story.js` to `clients/story.js` in GitHub
2. Wait ~30 seconds for Pages to deploy
3. Every story page uses the new version — no re-publishing needed

**If a fix doesn't seem to show up** even after confirming the commit went through and you've hard-refreshed: wait a minute and try again before assuming something's broken. GitHub Pages serves through a CDN that can take a short window to fully roll a new file out everywhere — two page loads close together can genuinely hit different versions during that window.

---

## When to re-publish from the creator

Only when:
- **Renaming a story** — changes the slug/URL
- **Starting over** with completely fresh content
- The shell `index.html` is missing or corrupted

---

## Adding a new Prophix product

1. Upload icon PNG to `/assets/icons/[product-name].png`
2. Add to `PROPHIX_PRODUCTS` in `story.js`
3. Add checkbox in `new/index.html`
4. Deploy both files

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Directory shows no stories | Check `clients/stories.json` is valid JSON |
| Story shows "Could not load story" | Check `data.json` exists in story folder |
| Logo not showing | Hard refresh after upload |
| Save fails with SHA error | Try again — SHA race on GitHub's side |
| Token rejected (401) | Expired or wrong permissions — regenerate |
| Preview link says "Invalid" | Link expired (3 days) — generate a new one |
| Story status badge not showing | Open story in edit mode and save once to sync stories.json |
| Page looks wrong after deploy | Hard refresh: Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac); if still wrong, wait a minute and retry — see CDN note above |
| Story page 404 | Wait up to 2 minutes after first publish |
| "3 cancelled checks" on commit | Normal — multiple files, last build wins |
| AI generation fails | Check Gemini API key is correct; try again if 503 (server busy) |
| "Who is the client?" / generic filename in PDF or export, on an older story | That story's client-name field is blank (predates an early schema change). Open it in edit mode, retype the client name in the top field, Save once — fixes it everywhere (page, PDF, both exports) |
| Bold/italic disappears after Save | Only some fields support saved formatting (main body text, "Who is..." description, results/features, hero description) — expected on other fields for now |

---

## File structure per story

```
clients/[slug]/
├── index.html   ← 8-line shell (set on publish, almost never changes)
├── data.json    ← all content + status + preview token (source of truth)
├── logo.png     ← client logo (optional)
└── *.mp3        ← audio clips (optional)
```

---

## stories.json — directory index

```json
[
  {
    "slug": "acme-corp",
    "name": "Acme Corp",
    "ind": "Manufacturing, Brussels",
    "langs": ["en", "fr"],
    "status": "published",
    "created": "2026-09-16T10:00:00.000Z",
    "edited": "2026-09-16T14:30:00.000Z",
    "logo": true
  }
]
```

Synced automatically on every save. Status, languages and industry tag always stay up to date.
