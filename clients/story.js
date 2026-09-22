// Prophix Client Story — story.js v9.9
// Data-driven architecture: renders from data.json, saves back to data.json.
// Required globals in index.html shell:
//   GH_REPO, GH_FILE, GH_DATA_FILE, GH_CLIENT_FOLDER, STORY_META
//   STORY_META = { slug, name, hasLogo, langs }
//
// Version history:
// v9.1  2026-09-21  KRS double-colon rendering fix (krsBodyText helper)
// v9.2  2026-09-21  Media blocks (audio/video/image); logo edit label; lightbox; Sortable preventOnFilter fix
// v9.3  2026-09-21  Results→Prophix Features; Delete Story in toolbar; directory tile cleanup (Open only, status capsules, logo left-aligned)
// v9.4  2026-09-21  Video blocks: YouTube/Vimeo URL embed (no file upload); URL strip bug fix (mt!==video guard); clip-card backwards compat restored
// v9.5  2026-09-21  PDF brochure generator (BROCHURE_THEME config; Auchan layout; logos + icons + shapes)
// v9.6  2026-09-22  Two-page PDF; language-aware brochure; shape-up.png page break; no content truncation; lang picker from directory
// v9.7  2026-09-22  Rich text (bold/italic); per-language stats+ind; language tab save fix
// v9.8  2026-09-22  Sidebar labels per-language; desc rich text; name/title split
// v9.9  2026-09-22  Audit: guardSingleLine; active-block editable; no [XX] pollution; getRichHTML consistent; _isDirty; cachedDataSha removed; renderBody HTML per-language (Applications/Features/Who is); desc rich text; name vs title split; comprehensive save audit (bold/italic) in section bodies and whoText; per-language stats+ind fix; language tab save fix (BROCHURE_THEME config object); ↓ Brochure button in nav; pixel-accurate Auchan-style layout; Prophix + client logos; product icons; decorative shapes

'use strict';

var sessionToken = '';
var _isDirty = false;  // true after any unsaved edit
var currentLang = 'en';
var storyData = null; // loaded from data.json

// ── Language registry ─────────────────────────────────────────────────────────
var LANG_NAMES = {en:'EN',fr:'FR',nl:'NL',de:'DE',it:'IT',es:'ES',pt:'PT',pl:'PL',sv:'SV',da:'DA',fi:'FI',no:'NO',ja:'JA',zh:'ZH',ko:'KO'};
var LANG_LABELS = {
  en:'Customer Story',fr:'En français',nl:'In het Nederlands',
  de:'Auf Deutsch',it:'In italiano',es:'En español',
  pt:'Em português',pl:'Po polsku',sv:'På svenska',
  da:'På dansk',fi:'Suomeksi',no:'På norsk',
  ja:'カスタマーストーリー',zh:'客户案例',ko:'고객 사례'
};
var LANG_FULL_NAMES = {
  fr:'French',nl:'Dutch',de:'German',it:'Italian',es:'Spanish',
  pt:'Portuguese',pl:'Polish',sv:'Swedish',da:'Danish',
  fi:'Finnish',no:'Norwegian',ja:'Japanese',zh:'Chinese',ko:'Korean'
};

// ── Product registry ──────────────────────────────────────────────────────────
var PROPHIX_PRODUCTS = [
  {name:'Financial Consolidation', icon:'/assets/icons/financial-consolidation.png'},
  {name:'Cash Management',         icon:'/assets/icons/cash-management.png'},
  {name:'Account Reconciliation',  icon:'/assets/icons/account-reconciliation.png'},
  {name:'FP&A',                    icon:'/assets/icons/fpanda.png'},
  {name:'FP&A Plus',               icon:'/assets/icons/fpanda-plus.png'},
  {name:'Intercompany Management', icon:'/assets/icons/intercompany-management.png'},
  {name:'Lease Accounting',        icon:'/assets/icons/lease-accounting.png'}
];

// ── CSS ───────────────────────────────────────────────────────────────────────
function getCSS() {
  return [
    ':root{--red:#EF363D;--dark:#1A1A2E;--mid:#2C2C4A;--light:#F4F4F8;--border:#E0DFF0;--muted:#888;--font:Arial,sans-serif}',
    '*{box-sizing:border-box;margin:0;padding:0}',
    'body{font-family:var(--font);background:var(--light);color:#333;line-height:1.6;font-size:15px}',
    '.page-nav{background:linear-gradient(135deg,#1A1A2E 0%,#2C2C4A 60%,#3B1A1A 100%);padding:10px 40px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;position:sticky;top:0;z-index:300}',
    '.portal-link{font-size:11px;font-weight:700;color:rgba(255,255,255,.5);text-decoration:none;border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:4px 12px;transition:all .15s;white-space:nowrap;flex-shrink:0}',
    '.portal-link:hover{color:#fff;border-color:rgba(255,255,255,.5)}',
    '.share-page-btn{display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:20px;padding:4px 13px;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;transition:all .15s}',
    '.share-page-btn:hover{background:rgba(255,255,255,.1)}',
    '.share-page-btn.share-copied{background:#2a7a2a;border-color:#2a7a2a}',
    '.pdf-dl-btn{display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:20px;padding:4px 13px;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;transition:all .15s}',
    '.pdf-dl-btn:hover{background:rgba(255,255,255,.1)}',
    '.pdf-dl-btn:disabled{opacity:.5;cursor:wait}',
    '.lang-toggle{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-left:auto}',
    '.lang-btn{background:transparent;border:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.6);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s}',
    '.lang-btn.active{background:#fff;color:var(--dark);border-color:#fff}',
    '.lang-btn.remove-lang{padding:2px 8px;border-color:rgba(255,255,255,.15);font-size:13px}',
    '.lang-btn.remove-lang:hover{background:rgba(239,54,61,.3);border-color:var(--red)}',
    '#lang-add-wrap select{background:#1A1A2E;border:1px dashed rgba(255,255,255,.3);color:rgba(255,255,255,.8);border-radius:20px;padding:4px 10px;font-size:11px;font-family:var(--font);cursor:pointer;outline:none}',
    '#lang-add-wrap select option{background:#fff;color:#1A1A2E}',
    '.lang-block{display:none}.lang-block.active{display:block}',
    '.hero{background:linear-gradient(135deg,#1A1A2E 0%,#2C2C4A 60%,#3B1A1A 100%);padding:26px 40px 48px}',
    '.logo-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}',
    '.logo-pill-hero{background:#fff;border-radius:8px;padding:10px 16px;display:inline-flex;align-items:center}',
    '.logo-pill-hero img{height:26px;display:block}',
    '.logo-pill-client{background:#fff;border-radius:8px;padding:9px 16px;display:inline-flex;align-items:center;cursor:pointer;transition:opacity .15s}',
    '.logo-pill-client img{max-height:30px;max-width:140px;object-fit:contain;display:block}',
    '.hero-logo-ph{background:rgba(255,255,255,.12);border:2px dashed rgba(255,255,255,.3);border-radius:8px;padding:8px 14px;font-size:11px;color:rgba(255,255,255,.5);cursor:pointer}',
    '.hero-body{max-width:700px}',
    '.hero-tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--red);margin-bottom:12px}',
    '.client-name-label{font-size:11px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,.55);text-transform:uppercase;margin-bottom:4px}',
    'h1{font-size:clamp(20px,3vw,32px);font-weight:900;line-height:1.2;color:#fff;margin-bottom:14px;max-width:680px}',
    '.hero-desc{font-size:15px;color:rgba(255,255,255,.82);line-height:1.65;max-width:640px;margin-bottom:14px}',
    '.hero-ind{display:inline-block;border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:4px 14px;font-size:12px;color:rgba(255,255,255,.6)}',
    '.content-area{background:var(--light)}',
    '.stats-row{display:flex;flex-wrap:wrap;background:#fff;border-bottom:1px solid var(--border);position:relative}',
    '.stat-tile{flex:1;min-width:120px;padding:20px 24px;text-align:center;border-right:1px solid var(--border);position:relative}',
    '.stat-tile:last-child{border-right:none}',
    '.stat-n{font-size:28px;font-weight:900;color:var(--red);line-height:1}',
    '.stat-l{font-size:12px;color:var(--muted);margin-top:5px}',
    '.krs-outer{max-width:1100px;margin:0 auto;padding:32px 24px 0;background:var(--light)}',
    '.krs-card{background:linear-gradient(135deg,#2C2C4A 0%,#1A1A2E 55%,#5A1A1A 100%);border-radius:14px;padding:30px 34px}',
    '.krs-heading{font-size:15px;font-weight:900;color:#fff;margin-bottom:18px}',
    '.krs-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:13px}',
    '.krs-item{display:flex;align-items:flex-start;gap:10px;position:relative}',
    '.krs-check{flex-shrink:0;margin-top:1px}',
    '.krs-item-text{font-size:14px;color:rgba(255,255,255,.88);line-height:1.55}',
    '.krs-bold{font-weight:900;color:#fff;cursor:text;outline:2px dashed rgba(255,255,255,.3);border-radius:2px}',
    '.krs-body{cursor:text}',
    '.krs-item-text strong{color:#fff}',
    '.body-layout{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 290px;gap:24px;padding:28px 24px}',
    '@media(max-width:820px){.body-layout{grid-template-columns:1fr;padding:18px 14px}}',
    '.main-content{display:flex;flex-direction:column;gap:0}',
    '.add-blocks-bar{display:none;gap:10px;margin-top:8px}',
    '.edit-mode .add-blocks-bar{display:flex}',
    '.add-sec-btn,.add-clip-btn{flex:1;background:transparent;border:2px dashed var(--border);color:var(--muted);border-radius:6px;padding:9px;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;transition:all .15s}',
    '.add-sec-btn:hover,.add-clip-btn:hover{border-color:var(--red);color:var(--red)}',
    '.story-sec{background:#fff;border:1px solid var(--border);border-radius:8px;padding:22px;margin-bottom:14px;position:relative;overflow:hidden}',
    '.sec-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px;color:var(--red);margin-bottom:8px}',
    '.story-sec h2{font-size:20px;font-weight:900;color:var(--dark);margin-bottom:12px;line-height:1.25}',
    '.story-sec p,.story-sec li{color:#444;line-height:1.75;font-size:15px;overflow-wrap:break-word;word-break:break-word}',
    '.story-sec ul{list-style:none;padding-left:0;margin:10px 0}',
    '.story-sec ul li{padding-left:18px;margin-bottom:8px;position:relative}',
    '.story-sec ul li::before{content:"";position:absolute;left:0;top:9px;width:7px;height:7px;border-radius:50%;background:var(--red)}',
    '.story-sec ul li b,.story-sec ul li strong{color:var(--dark)}',
    '.clip-card{background:#fff;border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;padding:18px 20px;margin-bottom:14px;position:relative}',
    '.clip-label{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--red);margin-bottom:9px}',
    '.clip-title-text{flex:1;min-width:0}',
    '.clip-quote{font-size:15px;font-style:italic;color:var(--dark);line-height:1.6;font-weight:500;margin-bottom:10px}',
    '.clip-quote::before{content:"\u201C"}.clip-quote::after{content:"\u201D"}',
    '.clip-player{display:flex;flex-direction:column;gap:5px}',
    '.upload-audio-btn{background:transparent;border:1px solid var(--border);border-radius:5px;padding:5px 11px;font-size:11px;font-weight:700;font-family:var(--font);cursor:pointer;color:var(--muted);transition:all .15s;align-self:flex-start}',
    '.upload-audio-btn:hover{border-color:var(--red);color:var(--red)}',
    '.audio-del-x{display:none;margin-left:auto;background:transparent;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0 4px;line-height:1;flex-shrink:0}',
    '.audio-del-x:hover{color:var(--red)}',
    '.edit-mode .audio-del-x{display:inline!important}',
    '.sidebar{display:flex;flex-direction:column;gap:16px}',
    '.sidebar-card{background:#fff;border:1px solid var(--border);border-radius:8px;padding:18px}',
    '.sidebar-card h3{font-size:13px;font-weight:900;color:var(--dark);text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid var(--red);padding-bottom:8px;margin-bottom:12px}',
    '.who-text{font-size:13px;color:#555;line-height:1.6;margin-bottom:10px;white-space:pre-wrap;word-break:break-word}',
    '.who-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}',
    '.who-stat-tile{background:var(--light);border-radius:6px;padding:10px;text-align:center;position:relative}',
    '.who-stat-n{font-size:18px;font-weight:900;color:var(--red)}',
    '.who-stat-l{font-size:11px;color:var(--muted);margin-top:3px}',
    '.apps-display{display:flex;flex-wrap:wrap;gap:5px;min-height:24px;border-radius:5px;padding:3px;transition:all .15s}',
    '.edit-mode .apps-display{border:2px dashed rgba(239,54,61,.35);cursor:pointer}',
    '.app-tag{display:inline-flex;align-items:center;gap:7px;background:var(--light);border:1px solid var(--border);border-radius:20px;padding:4px 12px 4px 8px;font-size:13px;font-weight:600;color:var(--dark);margin-bottom:4px}',
    '.app-icon{width:20px;height:20px;object-fit:contain;flex-shrink:0}',
    '.results-ul{list-style:none;padding:0}',
    '.result-item{font-size:13px;color:#555;padding:4px 0 4px 16px;border-bottom:1px solid var(--border);position:relative}',
    '.result-item::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:7px;height:7px;border-radius:50%;background:var(--red)}',
    '.page-footer{background:var(--dark);padding:24px 40px;text-align:center;margin-top:0}',
    '.disclaimer-text{font-size:11px;color:rgba(255,255,255,.4);line-height:1.6}',
    '.edit-fab{position:fixed;bottom:24px;right:24px;width:46px;height:46px;background:var(--dark);color:#fff;border:none;font-size:17px;border-radius:50%;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25);z-index:500;transition:background .15s}',
    '.edit-fab:hover{background:var(--mid)}.edit-fab.hidden{display:none}',
    '.edit-toolbar{display:none;position:fixed;top:0;left:0;right:0;z-index:400;background:rgba(26,26,46,.97);padding:9px 20px;align-items:center;gap:10px;backdrop-filter:blur(4px)}',
    '.edit-toolbar.visible{display:flex}',
    '.edit-mode .page-nav{top:46px}',
    '.tb-save{background:var(--red);color:#fff;border:none;border-radius:6px;padding:7px 16px;font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer}',
    '.tb-save:hover{background:#c0272d}.tb-cancel{background:transparent;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.7);border-radius:6px;padding:7px 14px;font-size:13px;font-family:var(--font);cursor:pointer}',
    '.tb-delete{background:transparent;border:1px solid rgba(239,54,61,.5);color:#ff8888;border-radius:6px;padding:7px 14px;font-size:13px;font-family:var(--font);cursor:pointer;margin-left:auto}',
    '.tb-delete:hover{background:rgba(239,54,61,.2);border-color:var(--red);color:#fff}',
    '.save-status{font-size:12px;color:rgba(255,255,255,.6);margin-left:8px}',
    '.modal-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;align-items:center;justify-content:center}',
    '.modal-ov.visible{display:flex}',
    '.modal-box{background:#fff;border-radius:12px;padding:32px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(0,0,0,.2)}',
    '.modal-box h3{font-size:17px;font-weight:900;color:var(--dark);margin-bottom:6px}',
    '.modal-box p{font-size:13px;color:var(--muted);margin-bottom:16px}',
    '.mf{margin-bottom:13px}.mf label{display:block;font-size:11px;font-weight:700;color:var(--dark);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}',
    '.mf input{width:100%;padding:9px 13px;border:1px solid var(--border);border-radius:6px;font-size:13px;font-family:var(--font);outline:none}',
    '.mf input:focus{border-color:var(--red)}.merr{font-size:12px;color:var(--red);min-height:16px;margin-bottom:8px}',
    '.mbtn-p{width:100%;background:var(--red);color:#fff;border:none;border-radius:6px;padding:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font)}',
    '.mbtn-p:hover{background:#c0272d}',
    '.mbtn-g{width:100%;background:transparent;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:10px;font-size:13px;cursor:pointer;font-family:var(--font);margin-top:8px}',
    '.edit-only{display:none!important}',
    '.edit-mode .edit-only{display:block!important}',
    '.edit-mode .clip-remove-btn,.edit-mode .sec-delete-btn{display:inline-block!important}',
    '.edit-mode .lang-btn.remove-lang{display:inline-flex!important}',
    '.edit-mode .logo-pill-client.edit-only{display:inline-flex!important}',
    '.edit-mode .add-blocks-bar.edit-only{display:flex!important}',
    '#lang-add-wrap{display:none!important;position:relative}.edit-mode #lang-add-wrap{display:inline-flex!important}',
    '[contenteditable]{outline:2px dashed rgba(239,54,61,.35);border-radius:3px}',
    '[contenteditable]:focus{outline:2px dashed rgba(239,54,61,.7)}',
    '.edit-mode .sec-body-edit{outline:2px dashed rgba(239,54,61,.35)!important;border-radius:4px;padding:4px 6px!important;min-height:32px}',
    '.edit-mode .sec-body-edit:focus{outline:2px dashed rgba(239,54,61,.7)!important}',
    '.inline-products-panel{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid var(--border);border-radius:8px;padding:8px;z-index:200;box-shadow:0 4px 16px rgba(0,0,0,.1);display:flex;flex-direction:column;gap:4px}',
    '.prod-toggle{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;border:1px solid var(--border);cursor:pointer;font-size:13px;font-weight:600;color:var(--dark);transition:all .15s;user-select:none}',
    '.prod-toggle img{width:22px;height:22px;object-fit:contain;flex-shrink:0}',
    '.prod-toggle.active{background:#fff5f5;border-color:var(--red);color:var(--red)}',
    '.prod-toggle:hover{border-color:var(--red)}',
    '.drag-handle{display:none;position:absolute;top:8px;right:36px;cursor:grab;color:#ccc;font-size:18px;line-height:1;user-select:none;padding:4px;border-radius:4px;z-index:10}',
    '.drag-handle:hover{color:#888;background:rgba(0,0,0,.04)}.drag-handle:active{cursor:grabbing}',
    '.edit-mode .drag-handle{display:block!important}',
    '.story-sec,.clip-card{position:relative}',
    '.drag-ghost{opacity:.4;background:#f0f0ff!important;border:2px dashed #aab!important}',
    '.drag-chosen{box-shadow:0 4px 20px rgba(0,0,0,.15)!important}',
    '.clips-section-title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid var(--border)}',
    '.stat-tile-del,.who-stat-del{position:absolute;top:4px;right:4px;background:transparent;border:none;cursor:pointer;color:#bbb;font-size:11px;padding:2px 4px}',
    '.stat-tile-del:hover,.who-stat-del:hover{color:var(--red)}',
    '.krs-item-del{position:absolute;top:4px;right:4px;background:transparent;border:none;cursor:pointer;color:rgba(255,255,255,.4);font-size:11px;padding:2px 4px}',
    '.krs-item-del:hover{color:#fff}',
    '.sec-delete-btn,.clip-remove-btn{position:absolute;top:8px;right:8px;background:transparent;border:none;cursor:pointer;color:#ccc;font-size:14px;padding:2px 5px;display:none}',
    '.sec-delete-btn:hover,.clip-remove-btn:hover{color:var(--red)}',
    // ── Media block (v9.2) ────────────────────────────────────────────────────
    '.media-card{background:#fff;border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;padding:18px 20px;margin-bottom:14px;position:relative}',
    '.media-label{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--red);margin-bottom:9px}',
    '.media-title-text{flex:1;min-width:0}',
    '.media-quote{font-size:15px;font-style:italic;color:var(--dark);line-height:1.6;font-weight:500;margin-bottom:10px}',
    '.media-quote::before{content:"\u201C"}.media-quote::after{content:"\u201D"}',
    '.media-caption{font-size:13px;color:var(--muted);line-height:1.5;margin-top:6px}',
    '.media-player{display:flex;flex-direction:column;gap:5px}',
    '.media-img-wrap{position:relative;cursor:zoom-in;border-radius:6px;overflow:hidden;background:#f0f0f0;margin-bottom:6px}',
    '.media-img-wrap img{width:100%;max-height:320px;object-fit:contain;display:block;border-radius:6px}',
    '.media-img-wrap:hover::after{content:"⛶";position:absolute;bottom:8px;right:10px;font-size:18px;color:#fff;background:rgba(0,0,0,.45);border-radius:4px;padding:2px 6px;pointer-events:none}',
    '.upload-media-btn{background:transparent;border:1px solid var(--border);border-radius:5px;padding:5px 11px;font-size:11px;font-weight:700;font-family:var(--font);cursor:pointer;color:var(--muted);transition:all .15s;align-self:flex-start}',
    '.upload-media-btn:hover{border-color:var(--red);color:var(--red)}',
    '.media-del-x{display:none;margin-left:auto;background:transparent;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0 4px;line-height:1;flex-shrink:0}',
    '.media-del-x:hover{color:var(--red)}',
    '.edit-mode .media-del-x{display:inline!important}',
    '.media-url-input{width:100%;padding:8px 11px;border:1px solid var(--border);border-radius:6px;font-size:13px;font-family:var(--font);outline:none;margin-bottom:5px;transition:border-color .15s}',
    '.media-url-input:focus{border-color:var(--red)}',
    '.media-url-hint{font-size:11px;color:var(--muted);margin-bottom:4px}',
    '.media-iframe-wrap{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:6px;background:#000;margin-bottom:6px;width:100%}',
    '.media-iframe-wrap iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:6px;display:block}',
    '.media-iframe-wrap iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:6px}',
    // Lightbox
    '.lightbox-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:2000;align-items:center;justify-content:center;cursor:zoom-out}',
    '.lightbox-ov.open{display:flex}',
    '.lightbox-ov img{max-width:92vw;max-height:92vh;object-fit:contain;border-radius:6px;box-shadow:0 8px 40px rgba(0,0,0,.5)}',
    '.lightbox-close{position:absolute;top:18px;right:22px;color:#fff;font-size:28px;cursor:pointer;line-height:1;opacity:.7}',
    '.lightbox-close:hover{opacity:1}',
    // Logo edit label (edit mode only)
    '.logo-edit-label{display:none;font-size:10px;font-weight:700;color:rgba(255,255,255,.6);text-align:center;margin-top:4px;letter-spacing:.5px;text-transform:uppercase;pointer-events:none}',
    '.edit-mode .logo-edit-label{display:block}'
  ].join('');
}

// ── Render helpers ────────────────────────────────────────────────────────────
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Strip bold prefix from KRS text (fixes double-colon bug) ─────────────────
function krsBodyText(bold, text) {
  if (!bold) return esc(text||'');
  // Strip "Bold:" or "Bold: " from the start of text, case-insensitive
  var escaped = bold.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return esc((text||'').replace(new RegExp('^'+escaped+':\\s*','i'),'').trim());
}

// ── Media icon helper (v9.2) ──────────────────────────────────────────────────
function getMediaIcon(mediaType) {
  if (mediaType === 'video') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="#EF363D"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>';
  if (mediaType === 'image') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="#EF363D"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
  // audio (default)
  return '<svg width="13" height="13" viewBox="0 0 24 24" fill="#EF363D"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
}


// ── Video embed URL helper (v9.4) ────────────────────────────────────────────
// Converts YouTube/Vimeo watch URLs to embed URLs for iframe rendering
function getVideoEmbedUrl(url) {
  if (!url) return null;
  url = url.trim();
  // YouTube: youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
  var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1] + '?rel=0';
  // Vimeo: vimeo.com/ID or player.vimeo.com/video/ID
  var vmMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  if (vmMatch) return 'https://player.vimeo.com/video/' + vmMatch[1];
  // Already an embed URL or direct video file — use as-is
  return url;
}


// ── renderMediaCard (v9.2) ────────────────────────────────────────────────────
function renderMediaCard(c) {
  var mt = c.mediaType || 'audio'; // 'audio' | 'video' | 'image'
  var card = document.createElement('div'); card.className = 'media-card';
  card.setAttribute('data-media-type', mt);
  if (mt === 'video') card.setAttribute('data-media-url', c.media || c.url || '');

  // Label row
  var labelDiv = document.createElement('div'); labelDiv.className = 'media-label'; labelDiv.contentEditable = 'false';
  var iconSpan = document.createElement('span'); iconSpan.innerHTML = getMediaIcon(mt);
  labelDiv.appendChild(iconSpan);
  var titleSpanR = document.createElement('span'); titleSpanR.className = 'media-title-text';
  titleSpanR.textContent = (c.title||'').replace(/^[✕✗×\s]+|[✕✗×\s]+$/g,'');
  labelDiv.appendChild(titleSpanR);
  if (c.ts) { var tsSpan = document.createElement('span'); tsSpan.className = 'media-ts'; tsSpan.textContent = ' · ' + c.ts; labelDiv.appendChild(tsSpan); }
  card.appendChild(labelDiv);

  // Quote / caption
  if (mt === 'image') {
    // Image block: show image + optional caption, no quote
    var player = document.createElement('div'); player.className = 'media-player';
    if (c.media) {
      var wrap = document.createElement('div'); wrap.className = 'media-img-wrap';
      wrap.onclick = function(){ openLightbox(c.media); };
      var img = document.createElement('img');
      img.src = c.media; img.alt = c.title || '';
      img.onerror = function(){ wrap.style.display='none'; };
      wrap.appendChild(img); player.appendChild(wrap);
    }
    if (c.quote && c.quote.trim()) {
      var cap = document.createElement('div'); cap.className = 'media-caption'; cap.textContent = c.quote;
      player.appendChild(cap);
    }
    card.appendChild(player);
  } else {
    // Audio or video: show quote then player
    if (c.quote && c.quote.trim()) {
      var qt = document.createElement('div'); qt.className = 'media-quote'; qt.textContent = c.quote;
      card.appendChild(qt);
    }
    var player = document.createElement('div'); player.className = 'media-player';
    if (mt === 'video') {
var embedUrl = getVideoEmbedUrl(c.media || c.url || '');
      if (embedUrl) {
        var iframeWrap = document.createElement('div'); iframeWrap.className = 'media-iframe-wrap';
        var iframe = document.createElement('iframe');
        iframe.src = embedUrl; iframe.allowFullscreen = true; iframe.setAttribute('frameborder','0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframeWrap.appendChild(iframe); player.appendChild(iframeWrap);
      } else {
        var ph = document.createElement('div');
        ph.style.cssText = 'padding:32px;text-align:center;color:#aaa;font-size:13px;background:#f5f5f5;border-radius:6px;border:2px dashed #e0dff0';
        ph.innerHTML = '<div style="font-size:24px;margin-bottom:8px">🎬</div><div>Open in edit mode and paste a YouTube or Vimeo URL</div>';
        player.appendChild(ph);
      }
    } else {
      // audio
      var aud = document.createElement('audio');
      aud.controls = true; aud.preload = 'metadata';
      aud.style.cssText = 'width:100%;height:38px;border-radius:6px;accent-color:#EF363D';
      var src = document.createElement('source');
      src.type = 'audio/mpeg';
      if (c.media || c.audio) src.setAttribute('src', c.media || c.audio);
      aud.appendChild(src); player.appendChild(aud);
    }
    card.appendChild(player);
  }
  return card;
}

// ── Lightbox (v9.2) ───────────────────────────────────────────────────────────
function openLightbox(src) {
  var ov = document.getElementById('story-lightbox');
  if (!ov) {
    ov = document.createElement('div'); ov.id = 'story-lightbox'; ov.className = 'lightbox-ov';
    ov.innerHTML = '<span class="lightbox-close" title="Close (Esc)">&#x2715;</span><img src="" alt=""/>';
    ov.querySelector('.lightbox-close').onclick = closeLightbox;
    ov.onclick = function(e){ if(e.target === ov) closeLightbox(); };
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeLightbox(); });
    document.body.appendChild(ov);
  }
  ov.querySelector('img').src = src;
  ov.classList.add('open');
}
function closeLightbox() {
  var ov = document.getElementById('story-lightbox');
  if (ov) { ov.classList.remove('open'); ov.querySelector('img').src = ''; }
}


function renderBody(text) {
  if (!text) return '';
  // Detect HTML tags from getRichHTML (bold/italic)
  var hasHTML = /<(b|strong|i|em)\b/i.test(text);
  var rawLines = text.split(/\n|<br\s*\/?>/i);
  var html = ''; var inList = false;
  rawLines.forEach(function(line) {
    var t = line.trim();
    if (!t) { if (inList) { html += '</ul>'; inList = false; } html += '<p>&nbsp;</p>'; return; }
    if (/^[-\u2013]\s/.test(t)) {
      if (!inList) { html += '<ul>'; inList = true; }
      var cnt = t.replace(/^[-\u2013]\s+/, '');
      if (!hasHTML) {
        var ci = cnt.indexOf(':');
        if (ci > 0 && ci < 60) {
          html += '<li><strong>' + escRich(cnt.substring(0, ci)) + ':</strong>' + escRich(cnt.substring(ci + 1)) + '</li>';
        } else { html += '<li>' + escRich(cnt) + '</li>'; }
      } else { html += '<li>' + cnt + '</li>'; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p>' + (hasHTML ? t : escRich(t)) + '</p>';
    }
  });
  if (inList) html += '</ul>';
  return html || '<p>' + (hasHTML ? text : escRich(text)) + '</p>';
}

// ── Full page renderer ────────────────────────────────────────────────────────
function renderPage(data) {
  var meta = window.STORY_META;
  var langs = data.langs || ['en'];
  var addable = Object.keys(LANG_FULL_NAMES).filter(function(l){ return langs.indexOf(l) === -1; });

  // Inject CSS
  if (!document.getElementById('story-css')) {
    var style = document.createElement('style');
    style.id = 'story-css';
    style.textContent = getCSS();
    document.head.appendChild(style);
  }

  // Set page title
  document.title = esc(data.name) + ' — Prophix Customer Story';

  var body = document.body;
  body.innerHTML = '';

  // Edit FAB
  var fab = document.createElement('button');
  fab.id = 'edit-fab'; fab.className = 'edit-fab'; fab.title = 'Edit this page'; fab.textContent = '✏';
  body.appendChild(fab);

  // Edit toolbar
  var toolbar = document.createElement('div');
  toolbar.id = 'edit-toolbar'; toolbar.className = 'edit-toolbar';
  toolbar.innerHTML = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
    '<button id="save-btn" class="tb-save">Save</button>' +
    '<button id="cancel-btn" class="tb-cancel">Cancel</button>' +
    '<span id="save-status" class="save-status"></span>' +
    '<select id="status-select" onchange="changeStatus(this.value)" style="background:#2C2C4A;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.9);border-radius:6px;padding:6px 10px;font-size:12px;font-family:var(--font);cursor:pointer;outline:none">' +
    '<option value="draft" style="background:#fff;color:#1A1A2E">◑ Draft</option>' +
    '<option value="approved" style="background:#fff;color:#1A1A2E">✓ Approved</option>' +
    '<option value="published" style="background:#fff;color:#1A1A2E">● Published</option>' +
    '</select>' +
    '<button onclick="showPreviewLinkModal()" style="background:transparent;border:1px solid rgba(255,200,0,.4);color:#F5C842;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer">⧉ Preview link</button>' +
    '<button class="tb-delete" onclick="confirmDeleteStory()">🗑 Delete story</button>' +
    '</div>';
  body.appendChild(toolbar);

  // Page nav
  var nav = document.createElement('div');
  nav.className = 'page-nav';
  nav.innerHTML = '<a href="/clients/" class="portal-link">← All stories</a>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<span class="last-edited" style="font-size:11px;color:rgba(255,255,255,.45)"></span>' +
    '<button id="story-share-btn" class="share-page-btn">⧉ Share</button>' +
    '<button id="pdf-dl-btn" class="pdf-dl-btn" onclick="generateBrochure()">↓ Brochure</button></div>' +
    '<div id="lang-toggle" class="lang-toggle">' +
    langs.map(function(l) {
      return '<button class="lang-btn' + (l==='en'?' active':'') + '" data-lang="' + l + '">' + LANG_NAMES[l] + '</button>' +
        (l !== 'en' ? '<button class="lang-btn remove-lang edit-only" data-remove-lang="' + l + '">&times;</button>' : '');
    }).join('') +
    '<span id="lang-add-wrap" class="edit-only">' +
    '<button id="lang-add-btn" onclick="toggleLangPicker(this)" style="background:transparent;border:1px dashed rgba(255,255,255,.4);color:rgba(255,255,255,.7);border-radius:20px;padding:4px 12px;font-size:11px;font-family:var(--font);cursor:pointer">+ Add language</button>' +
    '<div id="lang-picker" style="display:none;position:absolute;top:100%;right:0;background:#fff;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.2);padding:6px;z-index:500;min-width:160px;margin-top:4px"></div>' +
    '</span>' +
    '</div>';
  body.appendChild(nav);

  // Wire lang buttons immediately
  nav.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    var code = btn.getAttribute('data-lang');
    btn.onclick = function(){ setLang(code); };
  });
  var langBlocks = document.createElement('div');
  langBlocks.id = 'lang-blocks';
  langs.forEach(function(lc) {
    langBlocks.appendChild(renderLangBlock(data, lc, lc === 'en', meta));
  });
  body.appendChild(langBlocks);

  // Token modal
  var modal = document.createElement('div');
  modal.id = 'token-modal'; modal.className = 'modal-ov';
  modal.innerHTML = '<div class="modal-box"><h3>Edit story</h3><p>Paste your access token to enable edit mode.</p>' +
    '<div class="mf"><label>Access Token</label><input type="password" id="token-input" placeholder="Paste your token"/></div>' +
    '<div id="token-error" class="merr"></div>' +
    '<button id="token-submit" class="mbtn-p">Unlock edit mode</button>' +
    '<button id="token-cancel" class="mbtn-g">Cancel</button></div>';
  body.appendChild(modal);
}

function renderLangBlock(data, lc, isActive, meta) {
  var isEN = lc === 'en';
  var tr = (!isEN && data.translations && data.translations[lc]) ? data.translations[lc] : null;
  var p = isEN ? '' : ('[' + (LANG_NAMES[lc]||lc) + '] ');
  var blockData = {
    name:       (tr && tr.name)    ? tr.name    : (p + (data.name||'')),
    title:      (tr && tr.title)   ? tr.title   : (data.title ? (p + data.title) : (p + (data.name||''))),
    desc:       (tr && tr.desc)    ? tr.desc    : (p + (data.desc||'')),
    ind:        (tr && tr.ind) ? tr.ind : data.ind,
    whoText:    (tr && tr.whoText) ? tr.whoText : (p + (data.whoText||'')),
    stats:      (tr && tr.stats && tr.stats.length > 0) ? tr.stats
                : data.stats,  // non-EN shows EN values until translated
    krs:        (tr && tr.krs && tr.krs.length > 0) ? tr.krs
                : (isEN ? data.krs : data.krs.map(function(k){
                    return {bold: k.bold||'', text: p+(k.bold ? k.bold+': '+k.text.replace(k.bold+':','').trim() : k.text)};
                  })),
    krsHeading: (tr && tr.krsHeading) ? tr.krsHeading : (p + (data.krsHeading || 'Key Results Snapshot')),
    content:    (tr && tr.content && tr.content.length > 0) ? tr.content
                : data.content.map(function(item){
                    if (item.type === 'section') {
                      return {type:'section', data:{
                        label:   p + item.data.label,
                        heading: p + item.data.heading,
                        body:    p + item.data.body
                      }};
                    }
                    if (item.type === 'clip') {
                      return {type:'clip', data:{
                        title:     p + (item.data.title||''),
                        ts:        item.data.ts||'',
                        quote:     p + (item.data.quote||''),
                        audio:     item.data.audio||'',
                        mediaType: item.data.mediaType||'audio',
                        media:     item.data.media||item.data.audio||''
                      }};
                    }
                    return item;
                  }),
    whoStats:   (tr && tr.whoStats && tr.whoStats.length > 0) ? tr.whoStats
                : data.whoStats,  // non-EN shows EN values until translated
    products:     data.products,
    results:    (tr && tr.results && tr.results.length > 0) ? tr.results
                : (data.results||[]),  // non-EN shows EN results until translated
    participants: data.participants,
    sidebarLabels: (tr && tr.sidebarLabels) ? tr.sidebarLabels : (data.sidebarLabels || {})
  };
  var block = document.createElement('div');
  block.className = 'lang-block' + (isActive ? ' active' : '');
  block.id = 'block-' + lc;

  // Hero
  var hero = document.createElement('div');
  hero.className = 'hero';
  var logoHtml = '<div class="logo-row">' +
    '<div class="logo-pill-hero"><img src="/prophix-logo-1000px.png" alt="Prophix"></div>';
  if (meta.hasLogo) {
    logoHtml += '<div style="text-align:center">' +
      '<div class="logo-pill-client" onclick="triggerLogoUpload()" title="Click in edit mode to replace logo">' +
      '<img class="hero-client-logo" src="logo.png" alt="' + esc(data.name) + ' logo"></div>' +
      '<div class="logo-edit-label">✎ Edit logo</div></div>';
  } else {
    logoHtml += '<div style="text-align:center">' +
      '<div class="logo-pill-client edit-only" onclick="triggerLogoUpload()" title="Upload client logo">' +
      '<div class="hero-logo-ph">+ Upload logo</div></div>' +
      '<div class="logo-edit-label">✎ Add logo</div></div>';
  }
  logoHtml += '</div>';

  var langLabel = data.langLabels && data.langLabels[lc] ? data.langLabels[lc] : (LANG_LABELS[lc] || 'Customer Story');
  hero.innerHTML = logoHtml +
    '<div class="hero-body">' +
    '<div class="hero-tag">' + esc(langLabel) + '</div>' +
    '<div class="client-name-label" style="font-size:11px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:4px">' + esc(data.name) + '</div>' +
    '<h1 class="story-headline">' + esc(blockData.title || blockData.name) + '</h1>' +
    '<div class="hero-desc">' + esc(blockData.desc) + '</div>' +
    (blockData.ind ? '<div class="hero-ind">' + esc(blockData.ind) + '</div>' : '') +
    '</div>';
  block.appendChild(hero);

  // Content area
  var contentArea = document.createElement('div');
  contentArea.className = 'content-area';

  // Stats
  if (blockData.stats && blockData.stats.length > 0) {
    var statsRow = document.createElement('div');
    statsRow.className = 'stats-row';
    blockData.stats.forEach(function(s) {
      var tile = document.createElement('div');
      tile.className = 'stat-tile';
      tile.innerHTML = '<div class="stat-n">' + esc(s.v) + '</div><div class="stat-l">' + esc(s.l) + '</div>';
      statsRow.appendChild(tile);
    });
    contentArea.appendChild(statsRow);
  }

  // KRS
  if (blockData.krs && blockData.krs.length > 0) {
    var krsOuter = document.createElement('div'); krsOuter.className = 'krs-outer';
    var krsCard = document.createElement('div'); krsCard.className = 'krs-card';
    krsCard.innerHTML = '<div class="krs-heading">' + esc(blockData.krsHeading || 'Key Results Snapshot') + '</div>';
    var krsList = document.createElement('ul'); krsList.className = 'krs-list';
    blockData.krs.forEach(function(k) {
      var li = document.createElement('li'); li.className = 'krs-item';
      // v9.1 fix: use krsBodyText() to strip bold prefix from text before rendering
      var krsBody = krsBodyText(k.bold, k.text);
      var boldHtml = k.bold ? '<span class="krs-bold" contenteditable="false">' + esc(k.bold) + ': </span>' : '';
      li.innerHTML = '<span class="krs-check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#EF363D"/><polyline points="7 12 10.5 15.5 17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="krs-item-text">' + boldHtml + '<span class="krs-body">' + esc(krsBody) + '</span></span>';
      krsList.appendChild(li);
    });
    krsCard.appendChild(krsList);
    krsOuter.appendChild(krsCard);
    contentArea.appendChild(krsOuter);
  }

  // Body layout
  var bodyLayout = document.createElement('div'); bodyLayout.className = 'body-layout';
  var mainCol = document.createElement('div'); mainCol.className = 'main-col';
  var mainContent = document.createElement('div'); mainContent.className = 'main-content';

  // Sections + clips
  var content = blockData.content || [];
  if (content.length === 0) {
    (data.sections||[]).forEach(function(s){ content.push({type:'section', data:s}); });
    (data.clips||[]).forEach(function(c){ content.push({type:'clip', data:c}); });
  }
  content.forEach(function(item) {
    if (item.type === 'section') {
      var s = item.data;
      var sec = document.createElement('div'); sec.className = 'story-sec';
      sec.innerHTML = '<div class="sec-label">' + esc(s.label||'') + '</div>' +
        '<h2>' + esc(s.heading||'') + '</h2>' +
        renderBody(s.body||'');
      mainContent.appendChild(sec);
    } else if (item.type === 'clip') {
      mainContent.appendChild(renderMediaCard(item.data));
    }
  });

  var addBar = document.createElement('div'); addBar.className = 'add-blocks-bar edit-only';
  addBar.innerHTML = '<button class="add-sec-btn" onclick="addSection(this)">+ Add section</button>' +
    '<button class="add-clip-btn" onclick="showAddMediaMenu(this)">+ Add media</button>';
  mainCol.appendChild(mainContent);
  mainCol.appendChild(addBar);

  // Sidebar
  var sidebar = document.createElement('div'); sidebar.className = 'sidebar';

  // Who card
  var whoCard = document.createElement('div'); whoCard.className = 'sidebar-card';
  var whoLabel = (blockData.sidebarLabels && blockData.sidebarLabels.who) || ('Who is ' + esc(data.name) + '?');
  whoCard.innerHTML = '<h3>' + whoLabel + '</h3>';
  var whoTextEl = document.createElement('div');
  whoTextEl.className = 'who-text';
  whoTextEl.style.cssText = 'white-space:pre-wrap;word-break:break-word';
  whoTextEl.innerHTML = (blockData.whoText || '').replace(/\n/g,'<br>');
  whoCard.appendChild(whoTextEl);
  if (blockData.whoStats && blockData.whoStats.length > 0) {
    var wsg = document.createElement('div'); wsg.className = 'who-stats-grid';
    blockData.whoStats.forEach(function(ws) {
      wsg.innerHTML += '<div class="who-stat-tile"><div class="who-stat-n">' + esc(ws.v) + '</div><div class="who-stat-l">' + esc(ws.l) + '</div></div>';
    });
    whoCard.appendChild(wsg);
  }
  sidebar.appendChild(whoCard);

  // Products
  if (blockData.products && blockData.products.length > 0) {
    var prodCard = document.createElement('div'); prodCard.className = 'sidebar-card';
    var appsLabel = (blockData.sidebarLabels && blockData.sidebarLabels.applications) || 'Applications deployed';
    prodCard.innerHTML = '<h3>' + esc(appsLabel) + '</h3>';
    var appsDisplay = document.createElement('div'); appsDisplay.className = 'apps-display';
    appsDisplay.title = 'Click in edit mode to change';
    appsDisplay.setAttribute('onclick', "if(document.body.classList.contains('edit-mode'))toggleProductsPanel(this)");
    blockData.products.forEach(function(pr) {
      var prod = PROPHIX_PRODUCTS.find(function(p){ return p.name === pr; });
      var iconHtml = prod ? '<img class="app-icon" src="' + prod.icon + '" alt="' + esc(pr) + '">' : '<span class="app-dot"></span>';
      appsDisplay.innerHTML += '<div class="app-tag">' + iconHtml + '<span class="app-name">' + esc(pr) + '</span></div>';
    });
    prodCard.appendChild(appsDisplay);
    sidebar.appendChild(prodCard);
  }

  // Results
  var resCard = document.createElement('div'); resCard.className = 'sidebar-card'; resCard.setAttribute('data-section','features');
  var featLabel = (blockData.sidebarLabels && blockData.sidebarLabels.features) || 'Prophix Features';
  resCard.innerHTML = '<h3>' + esc(featLabel) + '</h3>';
  var ul = document.createElement('ul'); ul.className = 'results-ul';
  if (blockData.results && blockData.results.length > 0) {
    blockData.results.forEach(function(r) { ul.innerHTML += '<li class="result-item">' + esc(r.replace(/^[✕✗×\s]+|[✕✗×\s]+$/g,'')) + '</li>'; });
  }
  resCard.appendChild(ul);
  sidebar.appendChild(resCard);

  // Participants
  if (blockData.participants && blockData.participants.length > 0) {
    var partCard = document.createElement('div'); partCard.className = 'sidebar-card'; partCard.setAttribute('data-section','participants');
    partCard.innerHTML = '<h3>Participants</h3>';
    blockData.participants.forEach(function(pt) {
      partCard.innerHTML += '<p style="margin-top:10px"><strong class="participant-name">' + esc(pt.name) + '</strong><br>' +
        '<span class="participant-title" style="font-size:12px;color:#888">' + esc(pt.title||'') + '</span></p>';
    });
    sidebar.appendChild(partCard);
  }

  bodyLayout.appendChild(mainCol);
  bodyLayout.appendChild(sidebar);
  contentArea.appendChild(bodyLayout);

  // Footer
  var footer = document.createElement('div'); footer.className = 'page-footer';
  footer.innerHTML = '<p class="disclaimer-text"><strong>Prophix Software Inc.</strong> Copyright &copy; ' + new Date().getFullYear() + '. May only be reproduced with Prophix\'s prior consent.</p>' +
    '<p class="disclaimer-text">Audio extracts from the original customer interview. Used with permission.</p>';
  contentArea.appendChild(footer);

  block.appendChild(contentArea);
  return block;
}

// ── Rich text helpers ────────────────────────────────────────────────────────
// Escape HTML but preserve <b><strong><i><em> tags
function escRich(s) {
  if (!s) return '';
  return s
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/&lt;(\/?(?:b|strong|i|em))&gt;/gi,'<$1>');
}

// Read rich innerHTML from a contentEditable element — keep <b>/<i>, strip rest
function getRichHTML(el) {
  if (!el) return '';
  var clone = el.cloneNode(true);
  clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
  var h = clone.innerHTML;
  // Block elements to newlines
  h = h.replace(/<div>/gi,'\n').replace(/<\/div>/gi,'');
  h = h.replace(/<p>/gi,'').replace(/<\/p>/gi,'\n');
  h = h.replace(/<br\s*\/?>/gi,'\n');
  // Strip all tags except b/strong/i/em
  h = h.replace(/<(?!\/?(?:b|strong|i|em)\b)[^>]+>/gi,'');
  // Decode entities
  h = h.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"');
  return h.trim();
}

// ── Read DOM state back to data object (for saving) ───────────────────────────
function domToData() {
  var data = JSON.parse(JSON.stringify(storyData));
  var langs = data.langs || ['en'];

  langs.forEach(function(lc) {
    var block = document.getElementById('block-' + lc);
    if (!block) return;
    var isEN = lc === 'en';

    if (isEN) {
      // Client company name — separate from story headline
      var clientNameEl = block.querySelector('.client-name-label');
      if (clientNameEl) data.name = clientNameEl.textContent.trim();
      // Story headline (h1)
      var h1 = block.querySelector('h1'); if (h1) data.title = h1.textContent.trim();
      // Save hero-tag (lang label) per language
      var heroTag = block.querySelector('.hero-tag');
      if (heroTag) {
        if (!data.langLabels) data.langLabels = {};
        data.langLabels['en'] = heroTag.textContent.trim();
      }
      var desc = block.querySelector('.hero-desc'); if (desc) data.desc = getRichHTML(desc);
      var ind = block.querySelector('.hero-ind'); if (ind) data.ind = ind.textContent.trim();
      var whoText = block.querySelector('.who-text'); if (whoText) data.whoText = getRichHTML(whoText);

      data.stats = Array.from(block.querySelectorAll('.stat-tile')).map(function(t) {
        return { v: (t.querySelector('.stat-n')||{}).textContent||'', l: (t.querySelector('.stat-l')||{}).textContent||'' };
      });

      var krsHeading = block.querySelector('.krs-heading'); if (krsHeading) data.krsHeading = krsHeading.textContent.trim();

      data.krs = Array.from(block.querySelectorAll('.krs-item')).map(function(item) {
        var boldEl = item.querySelector('.krs-bold');
        var bodyEl = item.querySelector('.krs-body');
        if (!bodyEl && !boldEl) {
          // Legacy fallback: read from .krs-item-text
          var el = item.querySelector('.krs-item-text');
          if (!el) return null;
          var clone = el.cloneNode(true);
          clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
          return { bold: '', text: clone.textContent.trim() };
        }
        var bold = boldEl ? boldEl.textContent.replace(/:\s*$/, '').trim() : '';
        var body = bodyEl ? bodyEl.textContent.trim() : '';
        return { bold: bold, text: bold ? bold + ': ' + body : body };
      }).filter(Boolean);

      data.content = [];
      block.querySelectorAll('.main-content > .story-sec, .main-content > .clip-card, .main-content > .media-card').forEach(function(el) {
        if (el.classList.contains('story-sec')) {
          var bodyEdit = el.querySelector('.sec-body-edit');
          var bodyText = bodyEdit ? getRichHTML(bodyEdit) : Array.from(el.querySelectorAll('p,li')).map(function(n){ return (n.tagName==='LI'?'- ':'')+n.textContent.replace(/\u00a0/g,'').replace(/^\[[A-Z]{2}\]\s*/,''); }).join('\n');
          data.content.push({ type: 'section', data: {
            label: (el.querySelector('.sec-label')||{}).textContent.replace(/^\[[A-Z]{2}\]\s*/,'')||'',
            heading: (el.querySelector('h2')||{}).textContent.replace(/^\[[A-Z]{2}\]\s*/,'')||'',
            body: bodyText.trim()
          }});
        } else if (el.classList.contains('media-card')) {
          var titleEl = el.querySelector('.media-title-text'); var titleClone = titleEl ? titleEl.cloneNode(true) : null;
          if (titleClone) titleClone.querySelectorAll('button').forEach(function(b){ b.remove(); });
          var mt = el.getAttribute('data-media-type') || (el.querySelector('iframe') ? 'video' : (el.querySelector('.media-img-wrap img') ? 'image' : 'audio'));
          var mediaSrc = '';
          if (mt === 'video') { var vurlEl = el.querySelector('[data-video-url]'); mediaSrc = (vurlEl ? (vurlEl.value.trim() || vurlEl.getAttribute('data-url') || '') : '') || el.getAttribute('data-media-url') || ''; }
          else if (mt === 'image') { var img = el.querySelector('.media-img-wrap img'); mediaSrc = img ? (img.getAttribute('src')||'').split('?')[0].split('/').pop() : ''; }
          else { var asrc = el.querySelector('audio source'); mediaSrc = asrc ? (asrc.getAttribute('src')||'') : ''; }
          if (mt !== 'video' && mediaSrc && mediaSrc.indexOf('://') > -1) mediaSrc = mediaSrc.split('/').pop();
          var quoteEl = el.querySelector('.media-quote') || el.querySelector('.media-caption');
          data.content.push({ type: 'clip', data: {
            title: titleClone ? titleClone.textContent.trim() : '',
            ts: (el.querySelector('.media-ts')||{textContent:''}).textContent.replace(/^\s*·\s*/,'').trim()||'',
            quote: quoteEl ? quoteEl.textContent.trim() : '',
            mediaType: mt,
            media: mediaSrc,
            audio: mt === 'audio' ? mediaSrc : ''
          }});
        }
      });

      data.products = Array.from(block.querySelectorAll('.app-name')).map(function(s){ return s.textContent.trim(); });

      // Sidebar heading labels (translatable)
      if (!data.sidebarLabels) data.sidebarLabels = {};
      block.querySelectorAll('.sidebar-card').forEach(function(card) {
        var h3 = card.querySelector('h3'); if (!h3) return;
        var txt = h3.textContent.trim();
        if (card.querySelector('.apps-display')) data.sidebarLabels.applications = txt;
        else if (card.getAttribute('data-section') === 'features') data.sidebarLabels.features = txt;
        else if (card.querySelector('.who-text')) data.sidebarLabels.who = txt;
      });

      data.results = Array.from(block.querySelectorAll('[data-section="features"] .result-item, [data-section="results"] .result-item')).map(function(r){
        return getRichHTML(r);
      }).filter(function(r){ return r.length > 0; });

      data.participants = Array.from(block.querySelectorAll('[data-section="participants"] p')).map(function(p) {
        return { name: (p.querySelector('.participant-name')||{}).textContent||'', title: (p.querySelector('.participant-title')||{}).textContent||'' };
      });

      data.whoStats = Array.from(block.querySelectorAll('.who-stat-tile')).map(function(t) {
        return { v: (t.querySelector('.who-stat-n')||{}).textContent||'', l: (t.querySelector('.who-stat-l')||{}).textContent||'' };
      });
    }

    if (!isEN) {
      if (!data.translations) data.translations = {};
      if (!data.translations[lc]) data.translations[lc] = {};
      var t = data.translations[lc];
      var clientNameElL = block.querySelector('.client-name-label');
      if (clientNameElL) t.name = clientNameElL.textContent.trim();
      var h1l = block.querySelector('h1'); if (h1l) t.title = h1l.textContent.trim();
      // Save hero-tag (lang label) for this language
      var heroTagL = block.querySelector('.hero-tag');
      if (heroTagL) {
        if (!data.langLabels) data.langLabels = {};
        data.langLabels[lc] = heroTagL.textContent.trim();
      }
      var descl = block.querySelector('.hero-desc'); if (descl) t.desc = getRichHTML(descl);
      var indl = block.querySelector('.hero-ind'); if (indl) t.ind = indl.textContent.trim();

      var krsHeadingEl = block.querySelector('.krs-heading'); if (krsHeadingEl) t.krsHeading = krsHeadingEl.textContent.trim();

      t.krs = Array.from(block.querySelectorAll('.krs-item')).map(function(item) {
        var boldEl = item.querySelector('.krs-bold');
        var bodyEl = item.querySelector('.krs-body');
        if (!bodyEl && !boldEl) {
          var el = item.querySelector('.krs-item-text');
          if (!el) return null;
          var clone = el.cloneNode(true);
          clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
          return { bold: '', text: clone.textContent.trim() };
        }
        var bold = boldEl ? boldEl.textContent.replace(/:\s*$/, '').trim() : '';
        var body = bodyEl ? bodyEl.textContent.trim() : '';
        return { bold: bold, text: bold ? bold + ': ' + body : body };
      }).filter(Boolean);

      var whoTxtEl = block.querySelector('.who-text'); if (whoTxtEl) t.whoText = getRichHTML(whoTxtEl);

      t.whoStats = Array.from(block.querySelectorAll('.who-stat-tile')).map(function(tile) {
        return { v: (tile.querySelector('.who-stat-n')||{}).textContent||'', l: (tile.querySelector('.who-stat-l')||{}).textContent||'' };
      });

      // Hero stats — save per-language so each tab is fully independent
      t.stats = Array.from(block.querySelectorAll('.stat-tile')).map(function(tile) {
        var clone = tile.cloneNode(true);
        clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
        return { v: (clone.querySelector('.stat-n')||{}).textContent||'', l: (clone.querySelector('.stat-l')||{}).textContent||'' };
      });

      // Non-EN sidebar heading labels
      if (!data.translations[lc].sidebarLabels) data.translations[lc].sidebarLabels = {};
      var tsl = data.translations[lc].sidebarLabels;
      block.querySelectorAll('.sidebar-card').forEach(function(card) {
        var h3 = card.querySelector('h3'); if (!h3) return;
        var txt = h3.textContent.trim();
        if (card.querySelector('.apps-display')) tsl.applications = txt;
        else if (card.getAttribute('data-section') === 'features') tsl.features = txt;
        else if (card.querySelector('.who-text')) tsl.who = txt;
      });

      t.results = Array.from(block.querySelectorAll('[data-section="features"] .result-item, [data-section="results"] .result-item')).map(function(r) {
        return getRichHTML(r);
      }).filter(function(r){ return r.length > 0; });

      t.participants = Array.from(block.querySelectorAll('[data-section="participants"] p')).map(function(p) {
        return { name: (p.querySelector('.participant-name')||{}).textContent||'', title: (p.querySelector('.participant-title')||{}).textContent||'' };
      });

      t.content = [];
      var lcPfxGm = new RegExp('^\\[' + (LANG_NAMES[lc]||lc.toUpperCase()) + '\\]\\s*', 'gm');
      var lcPfx   = new RegExp('^\\[' + (LANG_NAMES[lc]||lc.toUpperCase()) + '\\]\\s*');
      block.querySelectorAll('.main-content > .story-sec, .main-content > .clip-card, .main-content > .media-card').forEach(function(el) {
        if (el.classList.contains('story-sec')) {
          var bodyEdit = el.querySelector('.sec-body-edit');
          var bodyText = bodyEdit ? getRichHTML(bodyEdit) : Array.from(el.querySelectorAll('p,li')).map(function(n){ return (n.tagName==='LI'?'- ':'')+n.textContent.replace(/\u00a0/g,'').replace(lcPfx,''); }).join('\n');
          t.content.push({ type:'section', data:{ label:(el.querySelector('.sec-label')||{}).textContent.replace(lcPfx,'').trim()||'', heading:(el.querySelector('h2')||{}).textContent.replace(lcPfx,'').trim()||'', body:bodyText.trim() }});
        } else if (el.classList.contains('media-card')) {
          var ctEl2 = el.querySelector('.media-title-text'); var ctClone2 = ctEl2 ? ctEl2.cloneNode(true) : null;
          if (ctClone2) ctClone2.querySelectorAll('button').forEach(function(b){ b.remove(); });
          var mt2 = el.getAttribute('data-media-type') || (el.querySelector('iframe') ? 'video' : (el.querySelector('.media-img-wrap img') ? 'image' : 'audio'));
          var mSrc2 = '';
          if (mt2 === 'video') { var vurlEl2 = el.querySelector('[data-video-url]'); mSrc2 = (vurlEl2 ? (vurlEl2.value.trim() || vurlEl2.getAttribute('data-url') || '') : '') || el.getAttribute('data-media-url') || ''; }
          else if (mt2 === 'image') { var im2 = el.querySelector('.media-img-wrap img'); mSrc2 = im2 ? (im2.getAttribute('src')||'').split('?')[0].split('/').pop() : ''; }
          else { var as2 = el.querySelector('audio source'); mSrc2 = as2 ? (as2.getAttribute('src')||'') : ''; }
          if (mt2 !== 'video' && mSrc2 && mSrc2.indexOf('://') > -1) mSrc2 = mSrc2.split('/').pop();
          var qEl2 = el.querySelector('.media-quote') || el.querySelector('.media-caption');
          t.content.push({ type:'clip', data:{ title: ctClone2 ? ctClone2.textContent.trim() : '', quote: qEl2 ? qEl2.textContent.trim() : '', mediaType: mt2, media: mSrc2, audio: mt2==='audio' ? mSrc2 : '' }});
        }
      });
    }
  });

  data.langs = Array.from(document.querySelectorAll('.lang-block')).map(function(b){ return b.id.replace('block-',''); });

  return data;
}

// ── Language functions ────────────────────────────────────────────────────────
function toggleLangPicker(btn) {
  var picker = document.getElementById('lang-picker');
  if (!picker) return;
  if (picker.style.display !== 'none') { picker.style.display = 'none'; return; }
  picker.innerHTML = '';
  Object.keys(LANG_FULL_NAMES).forEach(function(code) {
    if ((storyData.langs||['en']).indexOf(code) === -1) {
      var item = document.createElement('button');
      item.textContent = LANG_NAMES[code] + ' — ' + LANG_FULL_NAMES[code];
      item.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:transparent;cursor:pointer;font-size:13px;color:#1A1A2E;border-radius:5px;font-family:Arial,sans-serif';
      item.onmouseover = function(){ this.style.background='#f5f5f5'; };
      item.onmouseout = function(){ this.style.background='transparent'; };
      item.onclick = function(){ picker.style.display='none'; addLanguage(code); };
      picker.appendChild(item);
    }
  });
  if (!picker.children.length) {
    picker.innerHTML = '<div style="padding:8px 12px;font-size:12px;color:#888">All languages added</div>';
  }
  picker.style.display = 'block';
  setTimeout(function() {
    document.addEventListener('click', function closePicker(e) {
      if (!picker.contains(e.target) && e.target !== btn) {
        picker.style.display = 'none';
        document.removeEventListener('click', closePicker);
      }
    });
  }, 10);
}

function setLang(code) {
  currentLang = code;
  document.querySelectorAll('.lang-block').forEach(function(b){ b.classList.remove('active'); });
  var block = document.getElementById('block-' + code);
  if (block) {
    block.classList.add('active');
    if (document.body.classList.contains('edit-mode')) {
      makeBlockEditable(block);
    }
  }
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-lang') === code);
  });
  // Update toolbar indicator to show active language
  var statusEl = document.getElementById('save-status');
  if (statusEl && document.body.classList.contains('edit-mode')) {
    statusEl.textContent = 'Editing: ' + code.toUpperCase();
  }
}

function addLanguage(code) {
  if (!code || storyData.langs.indexOf(code) > -1) return;
  var enBlock = document.getElementById('block-en');
  stripEditControls();
  var newBlock = enBlock.cloneNode(true);
  addEditControlsToExisting();
  newBlock.id = 'block-' + code;
  newBlock.classList.remove('active');
  var pfx = '[' + (LANG_NAMES[code]||code) + '] ';
  EDITABLE_SELECTORS.forEach(function(sel) {
    newBlock.querySelectorAll(sel).forEach(function(el) {
      if (el.textContent.indexOf('[') === -1) el.textContent = pfx + el.textContent;
    });
  });
  var heroTag = newBlock.querySelector('.hero-tag');
  if (heroTag && LANG_LABELS[code]) heroTag.textContent = LANG_LABELS[code];
  document.getElementById('lang-blocks').appendChild(newBlock);

  var toggle = document.getElementById('lang-toggle');
  var addWrap = document.getElementById('lang-add-wrap');
  var btn = document.createElement('button');
  btn.className = 'lang-btn'; btn.setAttribute('data-lang', code); btn.textContent = LANG_NAMES[code]||code;
  btn.addEventListener('click', function(){ setLang(code); });
  toggle.insertBefore(btn, addWrap);
  var rb = document.createElement('button');
  rb.className = 'lang-btn remove-lang edit-only'; rb.setAttribute('data-remove-lang', code); rb.innerHTML = '&times;';
  rb.addEventListener('click', function(){ removeLanguage(code); });
  toggle.insertBefore(rb, addWrap);

  var opt = document.querySelector('#lang-add-select option[value="' + code + '"]');
  if (opt) opt.remove();

  storyData.langs.push(code);
  setLang(code);
  if (document.body.classList.contains('edit-mode')) makeBlockEditable(newBlock);
}

function removeLanguage(code) {
  if (code === 'en') return;
  if (!confirm('Remove ' + (LANG_NAMES[code]||code) + '? All content for this language will be lost.')) return;
  storyData.langs = storyData.langs.filter(function(l){ return l !== code; });
  var block = document.getElementById('block-' + code); if (block) block.remove();
  var btn = document.querySelector('.lang-btn[data-lang="' + code + '"]'); if (btn) btn.remove();
  var rb = document.querySelector('.remove-lang[data-remove-lang="' + code + '"]'); if (rb) rb.remove();
  if (currentLang === code) setLang('en');
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
var EDITABLE_SELECTORS = [
  '.hero-tag', '.client-name-label', 'h1', '.story-headline', '.hero-desc', '.hero-industry', '.hero-ind',
  '.sec-label', '.story-sec h2', '.story-sec p', '.story-sec li',
  '.clip-title-text', '.clip-quote', '.clips-section-title',
  '.media-title-text', '.media-quote', '.media-caption',
  '.sidebar-card h3', '.result-item', '.krs-heading',
  '.stat-n', '.stat-l', '.krs-bold', '.krs-body',
  '.who-text', '.who-stat-n', '.who-stat-l',
  '.participant-name', '.participant-title',
  '.disclaimer-text'
];

// Single-line contentEditable guard — prevents Enter/paste injecting block elements
function guardSingleLine(el) {
  if (el._guardedSL) return;
  el._guardedSL = true;
  el.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); }
  });
  el.addEventListener('paste', function(e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain')
               .replace(/[\r\n]+/g, ' ');
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    sel.deleteFromDocument();
    sel.getRangeAt(0).insertNode(document.createTextNode(text));
    sel.collapseToEnd();
  });
}

function makeBlockEditable(block) {
  EDITABLE_SELECTORS.forEach(function(sel) {
    block.querySelectorAll(sel).forEach(function(el) {
      if ((el.tagName === 'P' || el.tagName === 'LI') && el.closest('.story-sec')) return;
      el.contentEditable = 'true';
      // Single-line fields: prevent Enter/paste block injection
      var _sl = ['.stat-n','.stat-l','.who-stat-n','.who-stat-l',
        '.participant-name','.participant-title','.sec-label','.story-sec h2',
        '.krs-heading','.hero-tag','.hero-ind','.client-name-label','.krs-bold','.krs-body'];
      if (_sl.some(function(s){ try{return el.matches(s);}catch(e){return false;} })) guardSingleLine(el);
      // For whoText: intercept Enter to insert newline instead of block element
      if (el.classList.contains('who-text')) {
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            var sel2 = window.getSelection(); var range = sel2.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode('\n'));
            range.collapse(false); sel2.removeAllRanges(); sel2.addRange(range);
          }
        });
      }
    });
  });
  block.querySelectorAll('.story-sec').forEach(function(sec) { wrapSectionBody(sec); });
  if (!block._dirtyWired) {
    block._dirtyWired = true;
    block.addEventListener('input', function(){ _isDirty = true; });
  }
}

function wrapSectionBody(sec) {
  if (sec.querySelector('.sec-body-edit')) return;
  var bodyNodes = Array.from(sec.childNodes).filter(function(n) {
    if (n.nodeType !== 1) return false;
    var tag = n.tagName; var cls = n.className || '';
    return tag !== 'H2' && !cls.includes('sec-label') && !cls.includes('sec-delete') &&
           !cls.includes('drag-handle') && !cls.includes('add-') && tag !== 'BUTTON' && tag !== 'DIV';
  });
  var lines = [];
  bodyNodes.forEach(function(node) {
    if (node.tagName === 'UL') {
      node.querySelectorAll('li').forEach(function(li) {
        var liH = li.innerHTML.replace(/<br\s*\/?>/gi,'').replace(/&nbsp;/g,' ').trim();
        lines.push('- ' + liH);
      });
    } else if (node.tagName === 'P') {
      var pH = node.innerHTML.replace(/\u00a0/g,' ').replace(/&nbsp;/g,' ').trim();
      lines.push(pH || '');
    }
  });

  var wrap = document.createElement('div');
  wrap.className = 'sec-body-edit';
  wrap.contentEditable = 'true';
  wrap.style.cssText = 'white-space:pre-wrap;word-break:break-word;outline:none;min-height:24px;font-size:15px;color:#444;line-height:1.75;font-family:Arial,sans-serif;padding:2px 0';
  wrap.innerHTML = lines.join('<br>');  wrap.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var sel = window.getSelection(); var range = sel.getRangeAt(0);
      range.deleteContents(); range.insertNode(document.createTextNode('\n'));
      range.collapse(false); sel.removeAllRanges(); sel.addRange(range);
    }
  });
  bodyNodes.forEach(function(n) { n.remove(); });
  var h2 = sec.querySelector('h2');
  if (h2 && h2.nextSibling) { sec.insertBefore(wrap, h2.nextSibling); }
  else { sec.appendChild(wrap); }
}

function unwrapSectionBodies() {
  document.querySelectorAll('.sec-body-edit').forEach(function(wrap) {
    var sec = wrap.closest('.story-sec'); if (!sec) return;
    var temp = wrap.cloneNode(true);
    temp.querySelectorAll('br').forEach(function(br){ br.replaceWith('\n'); });
    temp.querySelectorAll('div').forEach(function(d){ d.insertAdjacentText('beforebegin', '\n'); d.replaceWith(d.textContent); });
    var text = temp.textContent || '';
    var lines = text.split('\n');
    var fragment = document.createDocumentFragment(); var currentUl = null;
    lines.forEach(function(line) {
      var t = line.trim();
      if (/^[-\u2013]\s/.test(t)) {
        if (!currentUl) { currentUl = document.createElement('ul'); fragment.appendChild(currentUl); }
        var li = document.createElement('li');
        var content = t.replace(/^[-\u2013]\s+/,'');
        var ci = content.indexOf(':');
        if (ci > 0 && ci < 60) {
          var strong = document.createElement('strong'); strong.textContent = content.substring(0,ci) + ':';
          li.appendChild(strong); li.appendChild(document.createTextNode(content.substring(ci+1)));
        } else { li.textContent = content; }
        currentUl.appendChild(li);
      } else {
        currentUl = null;
        var clean = t.replace(/\u00a0/g, '').trim();
        if (clean) { var p = document.createElement('p'); p.textContent = clean; fragment.appendChild(p); }
        else { var bp = document.createElement('p'); bp.innerHTML = '&nbsp;'; fragment.appendChild(bp); }
      }
    });
    wrap.parentNode.insertBefore(fragment, wrap); wrap.remove();
  });
}

var _sortableInstances = [];

function loadSortable(cb) {
  if (window.Sortable) { cb(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js';
  s.onload = cb; document.head.appendChild(s);
}

function enableDragDrop() {
  loadSortable(function() {
    document.querySelectorAll('.main-content').forEach(function(container) {
      _sortableInstances.push(Sortable.create(container, {
        animation: 150, handle: '.drag-handle',
        ghostClass: 'drag-ghost', chosenClass: 'drag-chosen',
        filter: '[contenteditable]', preventOnFilter: true
      }));
    });
  });
}

function disableDragDrop() {
  _sortableInstances.forEach(function(inst) { try { inst.destroy(); } catch(e) {} });
  _sortableInstances = [];
}

function enableEditMode() {
  document.body.classList.add('edit-mode');
  // Only make active block editable — others processed on lang switch
  var _ab = document.querySelector('.lang-block.active');
  if (_ab) makeBlockEditable(_ab);
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  _isDirty = false;
  document.getElementById('save-status').textContent = 'Editing: ' + currentLang.toUpperCase();
  var statusSel = document.getElementById('status-select');
  if (statusSel) statusSel.value = storyData.status || 'published';
  addEditControlsToExisting();
  enableDragDrop();
}

function disableEditMode() {
  unwrapSectionBodies();
  document.body.classList.remove('edit-mode');
  document.querySelectorAll('[contenteditable]').forEach(function(el){ el.removeAttribute('contenteditable'); });
  document.getElementById('edit-fab').classList.remove('hidden');
  document.getElementById('edit-toolbar').classList.remove('visible');
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-btn').disabled = false;
  var panel = document.getElementById('inline-products-panel'); if (panel) panel.remove();
  disableDragDrop();
  stripEditControls();
}

// ── Edit controls injection ───────────────────────────────────────────────────
function stripEditControls() {
  ['.sec-delete-btn','.drag-handle','.clip-remove-btn','.upload-audio-btn','.audio-del-x','.upload-media-btn','.media-del-x','.media-url-hint','.media-url-input.edit-only',
   '.delete-audio-btn','.stat-add-btn','.stat-tile-del','.krs-add-btn','.krs-item-del',
   '.who-stat-add-btn','.who-stat-del','.part-add-btn','.part-del-btn',
   '.result-add-btn','.result-del-btn','#inline-products-panel']
  .forEach(function(sel){ document.querySelectorAll(sel).forEach(function(el){ el.remove(); }); });
}

function addEditControlsToExisting() {
  var _scope = document.querySelector('.lang-block.active') || document;
  // Legacy clip-cards (audio only — backwards compat with pre-v9.2 stories)
  _scope.querySelectorAll('.clip-card').forEach(function(card) {
    var rb = document.createElement('button');
    rb.className = 'clip-remove-btn edit-only'; rb.innerHTML = '🗑'; rb.title = 'Delete clip';
    rb.addEventListener('click', function(){ if(confirm('Delete this clip?')) card.remove(); });
    card.insertBefore(rb, card.firstChild);
    var handle = document.createElement('div');
    handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.title = 'Drag';
    handle.style.right = '36px'; card.insertBefore(handle, rb);
    var player = card.querySelector('.clip-player');
    if (player) {
      var upBtn = document.createElement('button');
      upBtn.className = 'upload-audio-btn edit-only'; upBtn.textContent = 'Upload MP3';
      upBtn.addEventListener('click', function(){ uploadAudio(upBtn); }); player.appendChild(upBtn);
    }
    var clipLabel = card.querySelector('.clip-label');
    if (clipLabel) {
      var xBtn = document.createElement('button');
      xBtn.className = 'audio-del-x edit-only'; xBtn.title = 'Delete audio'; xBtn.textContent = '✕';
      xBtn.addEventListener('click', async function(e){ e.stopPropagation(); await deleteAudioFile(player, xBtn); });
      clipLabel.appendChild(xBtn);
    }
  });

  // Media cards (audio / video / image)
  _scope.querySelectorAll('.media-card').forEach(function(card) {
    var rb = document.createElement('button');
    rb.className = 'clip-remove-btn edit-only'; rb.innerHTML = '🗑'; rb.title = 'Delete';
    rb.addEventListener('click', function(){ if(confirm('Delete this media block?')) card.remove(); });
    card.insertBefore(rb, card.firstChild);
    var handle = document.createElement('div');
    handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.title = 'Drag';
    handle.style.right = '36px'; card.insertBefore(handle, rb);
    var player = card.querySelector('.media-player');
    var mt_up = card.getAttribute('data-media-type');
    if (player && mt_up !== 'video') {
      var upBtn = document.createElement('button');
      upBtn.className = 'upload-media-btn edit-only'; upBtn.textContent = mt_up === 'image' ? 'Upload image' : 'Upload MP3';
      upBtn.addEventListener('click', function(){ uploadMedia(upBtn, card); }); player.appendChild(upBtn);
    }
    var mediaLabel = card.querySelector('.media-label');
    if (mediaLabel) {
      var xBtn = document.createElement('button');
      xBtn.className = 'media-del-x edit-only'; xBtn.title = 'Delete media'; xBtn.textContent = '✕';
      xBtn.addEventListener('click', async function(e){ e.stopPropagation(); await deleteMediaFile(card, xBtn); });
      mediaLabel.appendChild(xBtn);
    }
    // For video cards rendered from saved data, inject URL input in edit mode
    var mt_c = card.getAttribute('data-media-type');
    if (mt_c === 'video' && !card.querySelector('[data-video-url]')) {
      var pl_c = card.querySelector('.media-player');
      if (pl_c) {
        var existingIframe = pl_c.querySelector('iframe');
        var currentUrl = card.getAttribute('data-media-url') || '';
        var hint_c = document.createElement('div'); hint_c.className = 'media-url-hint edit-only'; hint_c.textContent = 'YouTube or Vimeo URL:';
        var inp_c = document.createElement('input'); inp_c.type = 'text'; inp_c.className = 'media-url-input edit-only';
        inp_c.placeholder = 'https://www.youtube.com/watch?v=... or https://vimeo.com/...';
        inp_c.setAttribute('data-video-url', 'true');
        inp_c.value = currentUrl;
        function applyVideoUrlEdit() {
          var url = inp_c.value.trim();
          inp_c.setAttribute('data-url', url);
          card.setAttribute('data-media-url', url);
          card.setAttribute('data-media-type', 'video');
          var embedUrl = getVideoEmbedUrl(url);
          var wrap = pl_c.querySelector('.media-iframe-wrap');
          if (!wrap) { wrap = document.createElement('div'); wrap.className = 'media-iframe-wrap'; pl_c.insertBefore(wrap, hint_c); }
          if (embedUrl) { wrap.innerHTML = '<iframe src="' + embedUrl + '" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" frameborder="0"></iframe>'; wrap.style.display = 'block'; }
        }
        inp_c.addEventListener('input', applyVideoUrlEdit);
        inp_c.addEventListener('paste', function(){ setTimeout(applyVideoUrlEdit, 50); });
        inp_c.addEventListener('blur', applyVideoUrlEdit);
        pl_c.insertBefore(inp_c, pl_c.firstChild);
        pl_c.insertBefore(hint_c, inp_c);
      }
    }
  });

  // Sections
  _scope.querySelectorAll('.story-sec').forEach(function(sec) {
    var handle = document.createElement('div');
    handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.title = 'Drag';
    handle.style.right = '36px'; sec.insertBefore(handle, sec.firstChild);
    var btn = document.createElement('button');
    btn.className = 'sec-delete-btn edit-only'; btn.innerHTML = '🗑'; btn.title = 'Delete section';
    btn.addEventListener('click', function(){ if(confirm('Delete this section?')) sec.remove(); });
    sec.insertBefore(btn, handle);
  });

  // Stats
  _scope.querySelectorAll('.stats-row').forEach(function(row) {
    row.querySelectorAll('.stat-tile').forEach(addStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'stat-add-btn edit-only'; addBtn.textContent = '+'; addBtn.title = 'Add stat';
    addBtn.addEventListener('click', function(){ addStatTile(row, addBtn); }); row.appendChild(addBtn);
  });

  // Who stats
  _scope.querySelectorAll('.who-stats-grid').forEach(function(grid) {
    grid.querySelectorAll('.who-stat-tile').forEach(addWhoStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'who-stat-add-btn edit-only'; addBtn.textContent = '+ Add stat';
    addBtn.addEventListener('click', function(){ addWhoStat(grid, addBtn); }); grid.appendChild(addBtn);
  });

  // KRS
  _scope.querySelectorAll('.krs-item').forEach(function(item) {
    var btn = document.createElement('button');
    btn.className = 'krs-item-del edit-only'; btn.innerHTML = '✕'; btn.title = 'Delete';
    btn.addEventListener('click', function(){ item.remove(); }); item.appendChild(btn);
  });
  _scope.querySelectorAll('.krs-list').forEach(function(krsList) {
    var krsAdd = document.createElement('button');
    krsAdd.className = 'krs-add-btn edit-only'; krsAdd.textContent = '+ Add result';
    krsAdd.addEventListener('click', function(){ addKrsItem(krsList, krsAdd); }); krsList.appendChild(krsAdd);
  });

  // Participants
  _scope.querySelectorAll('.sidebar-card[data-section="participants"],.sidebar-card:has(.participant-name)').forEach(function(card) {
    card.querySelectorAll('p').forEach(function(p) {
      var del = document.createElement('button');
      del.className = 'part-del-btn edit-only'; del.innerHTML = '✕';
      del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:13px;float:right;padding:0 2px';
      del.addEventListener('click', function(){ p.remove(); }); p.insertBefore(del, p.firstChild);
    });
    var addBtn = document.createElement('button');
    addBtn.className = 'part-add-btn edit-only'; addBtn.textContent = '+ Add participant';
    addBtn.style.cssText = 'width:100%;background:transparent;border:1px dashed var(--border,#E0DFF0);border-radius:5px;padding:6px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer;color:#888;margin-top:8px';
    addBtn.addEventListener('click', function(){ addParticipantInline(card, addBtn); }); card.appendChild(addBtn);
  });

  // Results
  _scope.querySelectorAll('.sidebar-card[data-section="features"],.sidebar-card[data-section="results"],.sidebar-card:has(.result-item)').forEach(function(card) {
    card.querySelectorAll('.result-item').forEach(function(item) {
      var del = document.createElement('button');
      del.className = 'result-del-btn edit-only'; del.innerHTML = '✕';
      del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:11px;float:right;padding:0 2px';
      del.addEventListener('click', function(){ item.remove(); }); item.insertBefore(del, item.firstChild);
    });
    var addBtn = document.createElement('button');
    addBtn.className = 'result-add-btn edit-only'; addBtn.textContent = '+ Add feature';
    addBtn.style.cssText = 'width:100%;background:transparent;border:1px dashed var(--border,#E0DFF0);border-radius:5px;padding:6px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer;color:#888;margin-top:8px';
    addBtn.addEventListener('click', function(){ addResultInline(card, addBtn); }); card.appendChild(addBtn);
  });
}

function addStatDeleteBtn(tile) {
  var del = document.createElement('button');
  del.className = 'stat-tile-del edit-only'; del.innerHTML = '✕'; del.title = 'Remove stat';
  del.addEventListener('click', function(){ tile.remove(); }); tile.appendChild(del);
}
function addWhoStatDeleteBtn(tile) {
  var del = document.createElement('button');
  del.className = 'who-stat-del edit-only'; del.innerHTML = '✕';
  del.addEventListener('click', function(){ tile.remove(); }); tile.appendChild(del);
}

// ── Inline add functions ──────────────────────────────────────────────────────
function addSection(btn) {
  var block = btn.closest('.lang-block') || document.querySelector('.lang-block.active');
  if (!block) return;
  var container = block.querySelector('.main-content'); if (!container) return;
  var sec = document.createElement('div'); sec.className = 'story-sec';
  var handle = document.createElement('div');
  handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.style.right = '36px';
  var delBtn = document.createElement('button');
  delBtn.className = 'sec-delete-btn edit-only'; delBtn.innerHTML = '🗑';
  delBtn.addEventListener('click', function(){ if(confirm('Delete?')) sec.remove(); });
  var label = document.createElement('div'); label.className = 'sec-label'; label.contentEditable = 'true'; label.textContent = 'Section label';
  var h2 = document.createElement('h2'); h2.contentEditable = 'true'; h2.textContent = 'Section heading';
  var wrap = document.createElement('div'); wrap.className = 'sec-body-edit'; wrap.contentEditable = 'true';
  wrap.style.cssText = 'white-space:pre-wrap;word-break:break-word;outline:none;min-height:24px;font-size:15px;color:#444;line-height:1.75;font-family:Arial,sans-serif;padding:2px 0';
  wrap.textContent = 'Write your content here.';
  wrap.addEventListener('keydown', function(e){
    if(e.key==='Enter'){e.preventDefault();var sel=window.getSelection();var range=sel.getRangeAt(0);range.deleteContents();range.insertNode(document.createTextNode('\n'));range.collapse(false);sel.removeAllRanges();sel.addRange(range);}
  });
  sec.appendChild(delBtn); sec.appendChild(handle); sec.appendChild(label); sec.appendChild(h2); sec.appendChild(wrap);
  container.appendChild(sec);
}

function addClipInline(btn) { addMediaInline(btn, 'audio'); }

function addMediaInline(btn, mediaType) {
  mediaType = mediaType || 'audio';
  var block = btn.closest('.lang-block') || document.querySelector('.lang-block.active');
  var container = block ? block.querySelector('.main-content') : btn.parentNode;
  var card = document.createElement('div'); card.className = 'media-card';
  card.setAttribute('data-media-type', mediaType);

  var rb = document.createElement('button');
  rb.className = 'clip-remove-btn edit-only'; rb.innerHTML = '🗑';
  rb.addEventListener('click', function(){ if(confirm('Delete this media block?')) card.remove(); });
  var handle = document.createElement('div');
  handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.style.right = '36px';

  var lbl = document.createElement('div'); lbl.className = 'media-label';
  lbl.innerHTML = getMediaIcon(mediaType);
  var titleSpan = document.createElement('span'); titleSpan.className = 'media-title-text';
  titleSpan.contentEditable = 'true'; titleSpan.textContent = '';
  var xBtn = document.createElement('button');
  xBtn.className = 'media-del-x edit-only'; xBtn.title = 'Delete media'; xBtn.textContent = '✕';
  lbl.appendChild(titleSpan); lbl.appendChild(xBtn);

  var pl = document.createElement('div'); pl.className = 'media-player';
  var upBtn = document.createElement('button');
  upBtn.className = 'upload-media-btn edit-only'; upBtn.textContent = 'Upload media';
  upBtn.addEventListener('click', function(){ uploadMedia(upBtn, card); });

  if (mediaType === 'image') {
    var wrap = document.createElement('div'); wrap.className = 'media-img-wrap';
    wrap.innerHTML = '<div style="padding:20px;text-align:center;color:#aaa;border:2px dashed #ddd;border-radius:6px;font-size:13px">Click "Upload image" below to add an image</div>';
    var cap = document.createElement('div'); cap.className = 'media-caption'; cap.contentEditable = 'true'; cap.textContent = '';
    upBtn.textContent = 'Upload image';  // relabel button for image type
    pl.appendChild(wrap); pl.appendChild(cap); pl.appendChild(upBtn);
  } else if (mediaType === 'video') {
    var qt = document.createElement('div'); qt.className = 'media-quote'; qt.contentEditable = 'true'; qt.textContent = '';
    var urlHint = document.createElement('div'); urlHint.className = 'media-url-hint'; urlHint.textContent = 'YouTube or Vimeo URL:';
    var urlInput = document.createElement('input'); urlInput.type = 'text'; urlInput.className = 'media-url-input';
    urlInput.placeholder = 'https://www.youtube.com/watch?v=... or https://vimeo.com/...';
    urlInput.setAttribute('data-video-url', 'true');
    function applyVideoUrlInline() {
      var url = urlInput.value.trim();
urlInput.setAttribute('data-url', url);
      card.setAttribute('data-media-url', url);
      card.setAttribute('data-media-type', 'video');
      var embedUrl = getVideoEmbedUrl(url);
      var wrap = pl.querySelector('.media-iframe-wrap');
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'media-iframe-wrap'; pl.insertBefore(wrap, urlHint); }
      if (embedUrl) { wrap.innerHTML = '<iframe src="' + embedUrl + '" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" frameborder="0"></iframe>'; wrap.style.display = 'block'; }
    }
    urlInput.addEventListener('input', applyVideoUrlInline);
    urlInput.addEventListener('paste', function(){ setTimeout(applyVideoUrlInline, 50); });
    urlInput.addEventListener('blur', applyVideoUrlInline);
    pl.appendChild(qt); pl.appendChild(urlHint); pl.appendChild(urlInput);
  } else {
    var qt2 = document.createElement('div'); qt2.className = 'media-quote'; qt2.contentEditable = 'true'; qt2.textContent = '';
    var aud = document.createElement('audio'); aud.controls = true; aud.preload = 'metadata';
    aud.style.cssText = 'width:100%;height:38px;border-radius:6px;accent-color:#EF363D';
    aud.appendChild(document.createElement('source'));
    pl.appendChild(qt2); pl.appendChild(aud);
    pl.appendChild(upBtn);
  }
  xBtn.addEventListener('click', async function(e){ e.stopPropagation(); await deleteMediaFile(card, xBtn); });
  card.appendChild(rb); card.appendChild(handle); card.appendChild(lbl); card.appendChild(pl);
  if (container) container.appendChild(card); else btn.parentNode.insertBefore(card, btn);
}

// ── Add media menu (v9.2) ─────────────────────────────────────────────────────
function showAddMediaMenu(btn) {
  var existing = document.getElementById('add-media-menu');
  if (existing) { existing.remove(); return; }
  var menu = document.createElement('div'); menu.id = 'add-media-menu';
  menu.style.cssText = 'position:absolute;background:#fff;border:1px solid var(--border,#E0DFF0);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);padding:6px;z-index:300;min-width:160px;margin-top:4px';
  var types = [['audio','🎵  Audio clip (MP3)'],['video','🎬  Video (MP4)'],['image','🖼  Image (JPG/PNG)']];
  types.forEach(function(t) {
    var item = document.createElement('button');
    item.textContent = t[1];
    item.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:transparent;cursor:pointer;font-size:13px;font-family:Arial,sans-serif;border-radius:5px;color:#1A1A2E';
    item.onmouseover = function(){ this.style.background='#f5f5f5'; };
    item.onmouseout = function(){ this.style.background='transparent'; };
    item.onclick = function(){ menu.remove(); addMediaInline(btn, t[0]); };
    menu.appendChild(item);
  });
  btn.parentNode.style.position = 'relative';
  btn.parentNode.appendChild(menu);
  setTimeout(function() {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', closeMenu); }
    });
  }, 10);
}

// ── Upload media (audio/video/image) (v9.2) ────────────────────────────────────
function uploadMedia(btn, card) {
  var mt = card.getAttribute('data-media-type') || 'audio';
  if (mt === 'video') { alert('For video, paste a YouTube or Vimeo URL into the URL field above the video block.'); return; }
  var accept = mt === 'audio' ? 'audio/mpeg,.mp3' : 'image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp';
  var input = document.createElement('input'); input.type = 'file'; input.accept = accept;
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(e) {
      var b64 = e.target.result.split(',')[1];
      btn.textContent = 'Uploading…'; btn.disabled = true;
      try {
        var path = GH_CLIENT_FOLDER + file.name;
        var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
        var body = {message:'Media: '+file.name, content:b64};
        if (shaRes.ok) { var ex = await shaRes.json(); if (ex.sha) body.sha = ex.sha; }
        var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(body) });
        var d = await r.json();
        if (r.ok && d.content) {
          if (mt === 'audio') {
            card.setAttribute('data-media-type', 'audio');
            var srcEl = card.querySelector('audio source'); if (srcEl) { srcEl.setAttribute('src', file.name); srcEl.parentNode.load(); }
          } else if (mt === 'video') {
            var vsrc = card.querySelector('video source') || document.createElement('source');
            vsrc.setAttribute('src', file.name); vsrc.type = 'video/mp4';
            var vid = card.querySelector('video'); if (vid) { if (!vid.querySelector('source')) vid.appendChild(vsrc); vid.load(); }
          } else if (mt === 'image') {
            card.setAttribute('data-media-type', 'image');
            var wrap = card.querySelector('.media-img-wrap');
            if (wrap) { wrap.innerHTML = ''; var img = document.createElement('img'); img.src = file.name + '?v=' + Date.now(); img.alt = ''; img.onclick = function(){ openLightbox(file.name); }; wrap.appendChild(img); }
          }
          btn.textContent = '✓ ' + file.name;
        } else { btn.textContent = 'Upload media'; alert('Upload failed: '+(d.message||'Unknown')); }
      } catch(err) { btn.textContent = 'Upload media'; alert('Upload error: '+err.message); }
      btn.disabled = false;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── Delete media file (v9.2) ──────────────────────────────────────────────────
async function deleteMediaFile(card, xBtn) {
  var mt = card.getAttribute('data-media-type') || 'audio';
  var filename = '';
  if (mt === 'video') { alert('Video blocks use external URLs — nothing to delete from the repo.'); return; }
  if (mt === 'audio') { var src = card.querySelector('audio source'); filename = src ? (src.getAttribute('src')||'').split('/').pop() : ''; }
  else if (mt === 'image') { var img = card.querySelector('.media-img-wrap img'); filename = img ? (img.getAttribute('src')||'').split('?')[0].split('/').pop() : ''; }
  if (!filename) { alert('No media file on this block yet.'); return; }
  if (!confirm('Delete "' + filename + '" from GitHub?\nThis cannot be undone.')) return;
  var orig = xBtn.textContent; xBtn.textContent = '…'; xBtn.disabled = true;
  var path = (GH_CLIENT_FOLDER + filename).replace(/\/\//g, '/');
  try {
    var getRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    if (!getRes.ok) throw new Error('File not found');
    var fd = await getRes.json();
    var delRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { method:'DELETE', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify({message:'Delete media: '+filename, sha:fd.sha}) });
    if (!delRes.ok) throw new Error('Delete failed');
    // Clear the media from the card
    if (mt === 'image') { var w = card.querySelector('.media-img-wrap'); if (w) w.innerHTML = '<div style="padding:20px;text-align:center;color:#aaa;font-size:13px">Image removed</div>'; }
    else if (mt === 'audio') { var as = card.querySelector('audio source'); if (as) as.removeAttribute('src'); var av = card.querySelector('audio'); if (av) av.load(); }
    else if (mt === 'video') { var vs2 = card.querySelector('video source'); if (vs2) vs2.removeAttribute('src'); var vv = card.querySelector('video'); if (vv) vv.load(); }
    var upB = card.querySelector('.upload-media-btn'); if (upB) upB.textContent = 'Upload media';
    xBtn.style.display = 'none';
  } catch(err) { xBtn.textContent = orig; xBtn.disabled = false; alert('Delete failed: ' + err.message); }
}


function addKrsItem(list, addBtn) {
  var li = document.createElement('li'); li.className = 'krs-item';
  li.innerHTML = '<span class="krs-check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#EF363D"/><polyline points="7 12 10.5 15.5 17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="krs-item-text"><span class="krs-bold" contenteditable="true"></span><span class="krs-body" contenteditable="true">New result</span></span>';
  var del = document.createElement('button');
  del.className = 'krs-item-del edit-only'; del.innerHTML = '✕';
  del.addEventListener('click', function(){ li.remove(); }); li.appendChild(del);
  list.insertBefore(li, addBtn);
}

function addStatTile(row, addBtn) {
  var tile = document.createElement('div'); tile.className = 'stat-tile';
  tile.innerHTML = '<div class="stat-n" contenteditable="true">0</div><div class="stat-l" contenteditable="true">Label</div>';
  addStatDeleteBtn(tile); row.insertBefore(tile, addBtn);
}

function addWhoStat(grid, addBtn) {
  var tile = document.createElement('div'); tile.className = 'who-stat-tile';
  tile.innerHTML = '<div class="who-stat-n" contenteditable="true">0</div><div class="who-stat-l" contenteditable="true">Label</div>';
  addWhoStatDeleteBtn(tile); grid.insertBefore(tile, addBtn);
}

function addParticipantInline(card, addBtn) {
  var p = document.createElement('p'); p.style.marginTop = '10px';
  var del = document.createElement('button');
  del.className = 'part-del-btn edit-only'; del.innerHTML = '✕';
  del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:13px;float:right;padding:0 2px';
  del.addEventListener('click', function(){ p.remove(); });
  var strong = document.createElement('strong'); strong.className = 'participant-name'; strong.contentEditable = 'true'; strong.textContent = 'Full name';
  var br = document.createElement('br');
  var span = document.createElement('span'); span.className = 'participant-title'; span.contentEditable = 'true';
  span.style.cssText = 'font-size:12px;color:#888'; span.textContent = 'Title, Company';
  p.appendChild(del); p.appendChild(strong); p.appendChild(br); p.appendChild(span);
  card.insertBefore(p, addBtn);
}

function addResultInline(card, addBtn) {
  var ul = card.querySelector('.results-ul');
  if (!ul) { ul = document.createElement('ul'); ul.className = 'results-ul'; card.insertBefore(ul, addBtn); }
  var li = document.createElement('li'); li.className = 'result-item'; li.contentEditable = 'true'; li.textContent = 'New feature';
  var del = document.createElement('button');
  del.className = 'result-del-btn edit-only'; del.innerHTML = '✕';
  del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:11px;float:right;padding:0 2px';
  del.addEventListener('click', function(){ li.remove(); }); li.insertBefore(del, li.firstChild);
  ul.appendChild(li);
}

// ── Products panel ────────────────────────────────────────────────────────────
function toggleProductsPanel(triggerEl) {
  var existing = document.getElementById('inline-products-panel');
  if (existing) { existing.remove(); return; }
  var panel = document.createElement('div'); panel.id = 'inline-products-panel'; panel.className = 'inline-products-panel';
  var currentApps = [];
  document.querySelectorAll('.app-name').forEach(function(s){ currentApps.push(s.textContent.trim()); });
  PROPHIX_PRODUCTS.forEach(function(prod) {
    var lbl = document.createElement('label');
    lbl.className = 'prod-toggle' + (currentApps.indexOf(prod.name) > -1 ? ' active' : '');
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = prod.name; cb.checked = currentApps.indexOf(prod.name) > -1; cb.style.display = 'none';
    var img = document.createElement('img'); img.src = prod.icon; img.style.cssText = 'width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:6px';
    lbl.appendChild(cb); lbl.appendChild(img); lbl.appendChild(document.createTextNode(prod.name));
    lbl.addEventListener('click', function(e) {
      e.preventDefault(); cb.checked = !cb.checked; lbl.classList.toggle('active', cb.checked);
      var sel = []; panel.querySelectorAll('input:checked').forEach(function(c){ var p = PROPHIX_PRODUCTS.find(function(x){ return x.name===c.value; }); if(p) sel.push(p); });
      document.querySelectorAll('.apps-display').forEach(function(d){
        d.innerHTML = sel.map(function(p){ return '<div class="app-tag"><img class="app-icon" src="'+p.icon+'" alt="'+p.name+'"><span class="app-name">'+p.name+'</span></div>'; }).join('');
      });
    });
    panel.appendChild(lbl);
  });
  triggerEl.parentNode.style.position = 'relative';
  triggerEl.parentNode.appendChild(panel);
}

// ── Logo upload ───────────────────────────────────────────────────────────────
function triggerLogoUpload() {
  if (!document.body.classList.contains('edit-mode')) return;
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var img2 = document.querySelector('.hero-client-logo');
    if (img2) img2.style.opacity = '0.4';
    var objectUrl = URL.createObjectURL(file);
    var tempImg = new Image();
    tempImg.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = tempImg.naturalWidth || 400; canvas.height = tempImg.naturalHeight || 200;
      canvas.getContext('2d').drawImage(tempImg, 0, 0);
      URL.revokeObjectURL(objectUrl);
      uploadLogoB64(canvas.toDataURL('image/png').split(',')[1], img2);
    };
    tempImg.onerror = function() {
      URL.revokeObjectURL(objectUrl);
      var fr = new FileReader(); fr.onload = function(e){ uploadLogoB64(e.target.result.split(',')[1], img2); }; fr.readAsDataURL(file);
    };
    tempImg.src = objectUrl;
  };
  input.click();
}

async function uploadLogoB64(b64, img2) {
  var path = GH_CLIENT_FOLDER + 'logo.png';
  try {
    var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    var body = {message:'Logo: logo.png', content:b64};
    if (shaRes.ok) { var ex = await shaRes.json(); if (ex.sha) body.sha = ex.sha; }
    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(body) });
    var d = await r.json();
    if (r.ok && d.content) {
      storyData.hasLogo = true; STORY_META.hasLogo = true;
      var logoRow = document.querySelector('.logo-row');
      if (logoRow) {
        var clientPill = logoRow.querySelector('.logo-pill-client');
        if (clientPill) {
          clientPill.classList.remove('edit-only');
          clientPill.innerHTML = '<img class="hero-client-logo" src="logo.png?v=' + Date.now() + '" alt="logo" style="max-height:30px;max-width:140px;object-fit:contain;display:block">';
        }
      }
      storyData.hasLogo = true;
      var dataEnc = btoa(unescape(encodeURIComponent(JSON.stringify(storyData, null, 2))));
      var dataShaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
      var dataBody = {message:'Update hasLogo', content:dataEnc};
      if (dataShaRes.ok) { var dd = await dataShaRes.json(); if (dd.sha) dataBody.sha = dd.sha; }
      await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(dataBody) });
      _updateLogoFlag();
    } else { if (img2) img2.style.opacity='1'; alert('Logo upload failed: '+(d.message||'Unknown error')); }
  } catch(err) { if (img2) img2.style.opacity='1'; alert('Logo upload error: '+err.message); }
}

// ── Audio upload / delete ─────────────────────────────────────────────────────
function uploadAudio(btn) {
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'audio/mpeg,.mp3';
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(e) {
      var b64 = e.target.result.split(',')[1];
      btn.textContent = 'Uploading…'; btn.disabled = true;
      try {
        var path = GH_CLIENT_FOLDER + file.name;
        var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
        var body = {message:'Audio: '+file.name, content:b64};
        if (shaRes.ok) { var ex = await shaRes.json(); if (ex.sha) body.sha = ex.sha; }
        var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(body) });
        var d = await r.json();
        if (r.ok && d.content) {
          var srcEl = btn.closest('.clip-player').querySelector('audio source');
          if (srcEl) { srcEl.setAttribute('src', file.name); srcEl.parentNode.load(); }
          btn.textContent = '✓ '+file.name;
        } else { btn.textContent = 'Upload MP3'; alert('Upload failed: '+(d.message||'Unknown')+'\nCheck token permissions.'); }
      } catch(err) { btn.textContent = 'Upload MP3'; alert('Upload error: '+err.message); }
      btn.disabled = false;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

async function deleteAudioFile(player, xBtn) {
  if (!player) return;
  var srcEl = player.querySelector('audio source');
  var rawSrc = srcEl ? (srcEl.getAttribute('src') || '') : '';
  if (!rawSrc && srcEl && srcEl.src && srcEl.src.indexOf('.mp3') > -1) rawSrc = srcEl.src;
  if (!rawSrc) { alert('No audio file on this clip yet.'); return; }
  var filename = rawSrc.split('?')[0].split('/').pop();
  if (!filename || !filename.includes('.')) { alert('Could not determine filename.'); return; }
  if (!confirm('Delete "' + filename + '" from GitHub?\nThis cannot be undone.')) return;
  var orig = xBtn.textContent; xBtn.textContent = '…'; xBtn.disabled = true;
  var path = (GH_CLIENT_FOLDER + filename).replace(/\/\//g, '/');
  try {
    var getRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    if (!getRes.ok) { var e=await getRes.json().catch(function(){return{};}); throw new Error('File not found ('+getRes.status+'): '+(e.message||path)); }
    var fileData = await getRes.json();
    var delRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, { method:'DELETE', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify({message:'Delete audio: '+filename, sha:fileData.sha}) });
    if (!delRes.ok) { var e2=await delRes.json().catch(function(){return{};}); throw new Error('Delete failed ('+delRes.status+'): '+(e2.message||'unknown')); }
    if (srcEl) srcEl.removeAttribute('src');
    var aud = player.querySelector('audio'); if (aud) aud.load();
    var upBtn = player.querySelector('.upload-audio-btn'); if (upBtn) upBtn.textContent = 'Upload MP3';
    xBtn.style.display = 'none';
  } catch(err) { xBtn.textContent = orig; xBtn.disabled = false; alert('Delete audio failed:\n\n' + err.message + '\n\nPath: ' + path); }
}

// ── Save to GitHub ────────────────────────────────────────────────────────────
async function saveToGitHub() {
  var saveBtn = document.getElementById('save-btn');
  var statusEl = document.getElementById('save-status');
  _isDirty = false;
  saveBtn.disabled = true; statusEl.textContent = 'Saving…';

  try {
    unwrapSectionBodies();
    var newData = domToData();

    disableDragDrop();
    document.querySelectorAll('[contenteditable]').forEach(function(el){ el.removeAttribute('contenteditable'); });

    var dataJson = JSON.stringify(newData, null, 2);
    var enc = btoa(unescape(encodeURIComponent(dataJson)));

    var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    var body = {message:'Update story data: '+newData.name, content:enc};
    if (shaRes.ok) { var d = await shaRes.json(); if (d.sha) body.sha = d.sha; }

    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(body) });

    if (!r.ok) { var err = await r.json(); throw new Error(err.message || 'Save failed'); }

    storyData = newData;
    _updateEditedTimestamp();
    statusEl.textContent = 'Saved ✓';

    var savedLang = currentLang;
    setTimeout(function() {
      renderPage(storyData);
      wireEvents();
      disableEditMode();
      if (savedLang && savedLang !== 'en') setLang(savedLang);
    }, 1200);

  } catch(err) {
    saveBtn.disabled = false;
    statusEl.textContent = 'Error: ' + err.message;
    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
    document.querySelectorAll('.lang-block').forEach(makeBlockEditable);
    addEditControlsToExisting();
    enableDragDrop();
  }
}

async function _updateLogoFlag() {
  try {
    var slug = STORY_META.slug;
    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    if (!r.ok) return;
    var d = await r.json();
    var stories; try { stories = JSON.parse(atob(d.content.replace(/\n/g,''))); } catch(e){ return; }
    var entry = stories.find(function(s){ return s.slug === slug; });
    if (!entry) return;
    entry.logo = true;
    var enc = btoa(unescape(encodeURIComponent(JSON.stringify(stories, null, 2))));
    await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify({message:'Update logo flag: '+slug, content:enc, sha:d.sha}) });
  } catch(e) { /* silent */ }
}

async function _updateEditedTimestamp() {
  try {
    var slug = STORY_META.slug;
    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    if (!r.ok) return;
    var d = await r.json();
    var stories; try { stories = JSON.parse(atob(d.content.replace(/\n/g,''))); } catch(e){ return; }
    var entry = stories.find(function(s){ return s.slug === slug; });
    if (!entry) return;
    entry.edited = new Date().toISOString();
    if (storyData.ind) entry.ind = storyData.ind;
    entry.langs = storyData.langs || ['en'];
    entry.logo = storyData.hasLogo || entry.logo || false;
    entry.status = storyData.status || 'published';
    var enc = btoa(unescape(encodeURIComponent(JSON.stringify(stories, null, 2))));
    await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify({message:'Update edited: '+slug, content:enc, sha:d.sha}) });
  } catch(e) { /* silent */ }
}

function closeModal() {
  document.getElementById('token-modal').classList.remove('visible');
  document.getElementById('token-input').value = '';
  document.getElementById('token-error').textContent = '';
}

// ── Wire all events ───────────────────────────────────────────────────────────
function wireEvents() {
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    var code = btn.getAttribute('data-lang');
    btn.onclick = function(){ setLang(code); };
  });
  document.querySelectorAll('.remove-lang').forEach(function(btn) {
    var code = btn.getAttribute('data-remove-lang');
    btn.onclick = function(){ removeLanguage(code); };
  });

  setLang(currentLang || 'en');  // restore active lang, not always EN

  document.getElementById('edit-fab').addEventListener('click', function() {
    document.getElementById('token-modal').classList.add('visible');
    setTimeout(function(){ document.getElementById('token-input').focus(); }, 50);
  });

  document.getElementById('token-submit').addEventListener('click', function() {
    var token = document.getElementById('token-input').value.trim().replace(/[^\x20-\x7E]/g,'');
    document.getElementById('token-error').textContent = '';
    if (!token) { document.getElementById('token-error').textContent = 'Please paste your access token.'; return; }
    sessionToken = token;
    closeModal();
    enableEditMode();
  });
  document.getElementById('token-cancel').addEventListener('click', closeModal);
  document.getElementById('token-input').addEventListener('keydown', function(e){
    if (e.key==='Enter') document.getElementById('token-submit').click();
    if (e.key==='Escape') closeModal();
  });
  document.getElementById('save-btn').addEventListener('click', saveToGitHub);
  document.getElementById('cancel-btn').addEventListener('click', disableEditMode);

  var shareBtn = document.getElementById('story-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      var url = window.location.href.split('?')[0];
      navigator.clipboard.writeText(url).then(function() {
        var orig = shareBtn.textContent; shareBtn.textContent = '✓ Copied!'; shareBtn.classList.add('share-copied');
        setTimeout(function(){ shareBtn.textContent = orig; shareBtn.classList.remove('share-copied'); }, 2000);
      }).catch(function(){ prompt('Copy this link:', url); });
    });
  }

  if (new URLSearchParams(window.location.search).get('edit') === '1') {
    setTimeout(function(){
      document.getElementById('token-modal').classList.add('visible');
      setTimeout(function(){ document.getElementById('token-input').focus(); }, 80);
    }, 300);
  }
}





// ── PDF Brochure Generator v3.5 ────────────────────────────────────────────────
// v9.5  2026-09-21  Initial PDF generator
// v9.6  2026-09-22  Two-page layout; language-aware; shape-up.png page break;
//                   no content truncation; lang picker from directory tile

var BROCHURE_THEME = {
  red:          [239, 54, 61],
  krsBlue:      [30, 115, 190],
  krsCard:      [232, 236, 244],
  bodyText:     [30, 30, 30],
  muted:        [130, 130, 130],
  white:        [255, 255, 255],

  marginL:  14,
  marginR:  14,
  colSplit: 132,
  pageW:    210,
  pageH:    297,

  prophixLogoUrl: '/prophix-logo-1000px.png',
  shapeLeftUrl:   'https://raulsteiu.github.io/assets/shape-left.png',
  shapeUpUrl:     'https://raulsteiu.github.io/assets/shape-up.png',
  iconBasePath:   '/assets/icons/',
  iconMap: {
    'Financial Consolidation': 'financial-consolidation.png',
    'Cash Management':         'cash-management.png',
    'Account Reconciliation':  'account-reconciliation.png',
    'FP&A':                    'fpanda.png',
    'FP&A Plus':               'fpanda-plus.png',
    'Intercompany Management': 'intercompany-management.png',
    'Lease Accounting':        'lease-accounting.png'
  }
};

// ── jsPDF loader ──────────────────────────────────────────────────────────────
function loadJsPDF(cb) {
  if (window.jspdf) { cb(window.jspdf.jsPDF); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload = function() { cb(window.jspdf.jsPDF); };
  s.onerror = function() { alert('Could not load PDF library.'); };
  document.head.appendChild(s);
}

// ── Entry point from story page — language-aware ──────────────────────────────
function generateBrochure() {
  var btn = document.getElementById('pdf-dl-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }
  loadJsPDF(function(jsPDF) {
    // Use currentLang to pick the right translation data
    var langData = _getBrochureData(storyData, currentLang);
    langData._lang = currentLang || 'en';
    _loadBrochureAssets(storyData, function(assets) {
      try { window._buildBrochurePDF(jsPDF, langData, assets); }
      catch(e) { console.error(e); alert('PDF error: ' + e.message); }
      finally { if (btn) { btn.disabled = false; btn.textContent = '↓ Brochure'; } }
    });
  });
}

// ── Get data for a specific language ─────────────────────────────────────────
window._getBrochureData = function _getBrochureData(data, lc) {
  if (!lc || lc === 'en') { data._lang = 'en'; return data; }
  var tr = data.translations && data.translations[lc];
  if (!tr) { data._lang = lc; return data; } // fall back to EN if no translation
  // Merge: translation overrides EN fields where available
  var merged = {
    slug:         data.slug,
    name:         tr.name        || data.name,
    desc:         tr.desc        || data.desc,
    ind:          data.ind,
    hasLogo:      data.hasLogo,
    status:       data.status,
    stats:        (tr.stats  && tr.stats.length)  ? tr.stats  : data.stats,
    krs:          (tr.krs    && tr.krs.length)    ? tr.krs    : data.krs,
    krsHeading:   tr.krsHeading  || data.krsHeading,
    content:      (tr.content && tr.content.length) ? tr.content : data.content,
    whoText:      tr.whoText     || data.whoText,
    whoStats:     (tr.whoStats && tr.whoStats.length) ? tr.whoStats : data.whoStats,
    products:     data.products,
    results:      (tr.results && tr.results.length) ? tr.results : data.results,
    participants: tr.participants || data.participants
  };
  merged._lang = lc || 'en';
  return merged;
}

// ── Asset loader (fetch + FileReader — avoids CORS canvas taint) ──────────────
window._loadBrochureAssets = function _loadBrochureAssets(data, cb) {
  var T = BROCHURE_THEME;
  var assets = { prophixLogo: null, clientLogo: null, icons: {}, shapeLeft: null, shapeUp: null };
  var toLoad = [];

  function queue(url, key, sub) { toLoad.push({ url: url, key: key, sub: sub }); }

  queue(T.prophixLogoUrl, 'prophixLogo', null);
  queue(T.shapeLeftUrl,   'shapeLeft',   null);
  queue(T.shapeUpUrl,     'shapeUp',     null);

  var slug = window.STORY_META ? STORY_META.slug : (data ? data.slug : '');
  if (data && data.hasLogo && slug) {
    queue('/clients/' + slug + '/logo.png', 'clientLogo', null);
  }

  (data && data.products ? data.products : []).forEach(function(pr) {
    var f = T.iconMap[pr];
    if (f) queue(T.iconBasePath + f, 'icons', pr);
  });

  if (!toLoad.length) { cb(assets); return; }
  var rem = toLoad.length;

  function fetchB64(url, done) {
    fetch(url + '?v=' + Date.now())
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
      .then(function(blob) {
        var fr = new FileReader();
        fr.onloadend = function() { done(fr.result); };
        fr.onerror   = function() { done(null); };
        fr.readAsDataURL(blob);
      })
      .catch(function() { done(null); });
  }

  toLoad.forEach(function(item) {
    fetchB64(item.url, function(dataUrl) {
      if (dataUrl) {
        if (item.sub) assets[item.key][item.sub] = dataUrl;
        else          assets[item.key] = dataUrl;
      }
      if (--rem === 0) cb(assets);
    });
  });
};

// ── Main builder ──────────────────────────────────────────────────────────────
window._buildBrochurePDF = function(jsPDF, data, assets) {
  var T = BROCHURE_THEME;
  var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  var W = T.pageW, H = T.pageH;
  var mL = T.marginL, mR = T.marginR;
  var sideX = T.colSplit;
  var mainW = sideX - mL - 6;      // page 1 left column width
  var fullW = W - mL - mR;         // page 2 full text width
  var sideW = W - sideX - mR;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function fc(r) { doc.setFillColor(r[0], r[1], r[2]); }
  function tc(r) { doc.setTextColor(r[0], r[1], r[2]); }
  function dc(r) { doc.setDrawColor(r[0], r[1], r[2]); }
  function lw(w) { doc.setLineWidth(w); }
  function font(style, size) { doc.setFont('helvetica', style); doc.setFontSize(size); }
  function boldText(text, x, y) { doc.text(text, x, y); doc.text(text, x + 0.15, y); }

  function printWrap(text, x, y, maxW, lineH, maxL) {
    var lines = doc.splitTextToSize(String(text || ''), maxW);
    if (maxL) lines = lines.slice(0, maxL);
    lines.forEach(function(l) { doc.text(l, x, y); y += lineH; });
    return y;
  }

  function getImgDims(b64) {
    try {
      var raw = b64.replace(/^data:image\/[a-z]+;base64,/, '');
      var bytes = atob(raw.substring(0, 40));
      var pw = (bytes.charCodeAt(16)<<24)|(bytes.charCodeAt(17)<<16)|(bytes.charCodeAt(18)<<8)|bytes.charCodeAt(19);
      var ph = (bytes.charCodeAt(20)<<24)|(bytes.charCodeAt(21)<<16)|(bytes.charCodeAt(22)<<8)|bytes.charCodeAt(23);
      return (pw > 0 && ph > 0) ? { w: pw, h: ph } : null;
    } catch(e) { return null; }
  }

  function addImgFit(b64, x, y, maxW, maxH) {
    if (!b64) return;
    try {
      var dims = getImgDims(b64);
      var aspect = dims ? dims.w / dims.h : 2;
      var dh = maxH, dw = dh * aspect;
      if (dw > maxW) { dw = maxW; dh = dw / aspect; }
      doc.addImage(b64, 'PNG', x, y + (maxH - dh) / 2, dw, dh, undefined, 'FAST');
    } catch(e) {}
  }

  // ── PAGE 1: Header ──────────────────────────────────────────────────────────
  var logoH = 12, logoY = mR;

  if (assets.prophixLogo) {
    try { addImgFit(assets.prophixLogo, mL, logoY, 42, logoH); } catch(e) {}
  } else {
    font('bold', 14); tc(T.red); doc.text('Prophix®', mL, logoY + 8);
  }

  if (assets.clientLogo) {
    try {
      var dims = getImgDims(assets.clientLogo);
      var aspect = dims ? dims.w / dims.h : 2;
      var clH = logoH, clW = clH * aspect;
      if (clW > 44) { clW = 44; clH = clW / aspect; }
      doc.addImage(assets.clientLogo, 'PNG', W - mR - clW, logoY + (logoH - clH)/2, clW, clH, undefined, 'FAST');
    } catch(e) { font('bold', 11); tc(T.red); doc.text(data.name || '', W - mR, logoY + 8, { align: 'right' }); }
  } else {
    font('bold', 11); tc(T.red); doc.text(data.name || '', W - mR, logoY + 8, { align: 'right' });
  }

  var y = logoY + logoH + 14;
  font('bold', 7.5); tc(T.muted);
  doc.text('CUSTOMER STORY', mL, y);
  y += 10;

  // Title
  var title = '';
  if (data.content) {
    var fs = data.content.find(function(c) { return c.type === 'section' && c.data && c.data.heading; });
    if (fs) title = fs.data.heading;
  }
  if (!title && data.title) title = data.title;
  if (!title) title = 'How ' + (data.name || 'our client') + ' transformed with Prophix';
  font('bold', 24); tc(T.red);
  doc.splitTextToSize(title, W - mL - mR).slice(0, 3).forEach(function(l) { boldText(l, mL, y); y += 11; });
  y += 5;

  // ── PAGE 1: Two-column layout ───────────────────────────────────────────────
  var mainY = y;
  var sideY = y;

  // RIGHT SIDEBAR
  font('bold', 10); tc(T.red);
  doc.text('Who is ' + (data.name || 'the client') + '?', sideX, sideY);
  sideY += 2.5;
  dc(T.red); lw(0.6);
  doc.line(sideX, sideY, sideX + sideW, sideY);
  sideY += 5;

  var SIDE_MAX = H - 32;  // sidebar must not exceed this y on page 1

  font('normal', 8); tc(T.bodyText);
  // Wrap whoText with line-by-line guard against page overflow
  var whoLines = doc.splitTextToSize(data.whoText || data.desc || '', sideW);
  whoLines.forEach(function(l) {
    if (sideY < SIDE_MAX) { doc.text(l, sideX, sideY); sideY += 4.2; }
  });
  sideY += 3;

  (data.whoStats || []).slice(0, 4).forEach(function(ws) {
    if (sideY >= SIDE_MAX) return;
    font('bold', 13); tc(T.red);
    doc.text(ws.v || '', sideX, sideY); sideY += 4.5;
    if (sideY >= SIDE_MAX) return;
    font('normal', 7); tc(T.muted);
    sideY = printWrap(ws.l || '', sideX, sideY, sideW, 3.5, 2);
    sideY += 1;
  });
  sideY += 3;

  if (sideY < SIDE_MAX - 10) {
    dc(T.red); lw(0.8);
    doc.line(sideX, sideY, sideX + 18, sideY);
    sideY += 7;

    font('bold', 10); tc(T.red);
    doc.text('Applications deployed', sideX, sideY);
    sideY += 8;

    (data.products || []).forEach(function(pr) {
      if (sideY >= SIDE_MAX) return;
      var icon = assets.icons[pr];
      if (icon) {
        try { doc.addImage(icon, 'PNG', sideX, sideY - 4.5, 5.5, 5.5, undefined, 'FAST'); }
        catch(e) { fc(T.red); doc.circle(sideX + 2.5, sideY - 2, 2.5, 'F'); }
      } else { fc(T.red); doc.circle(sideX + 2.5, sideY - 2, 2.5, 'F'); }
      font('normal', 8.5); tc(T.red);
      doc.text(pr, sideX + 8, sideY);
      sideY += 7;
    });
  }

  // KRS CARD
  var krs = data.krs || [];
  if (krs.length > 0) {
    var krsLineH = 5;
    var krsCardH = 12;
    krs.forEach(function(k) {
      var txt = k.bold ? k.bold + ': ' + (k.text || '').replace(new RegExp('^' + (k.bold||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ':?\\s*','i'),'').trim() : (k.text || '');
      krsCardH += Math.min(doc.splitTextToSize(txt, mainW - 14).length, 3) * krsLineH + 2;
    });
    krsCardH += 6;
    fc(T.krsCard); doc.roundedRect(mL, mainY, mainW, krsCardH, 4, 4, 'F');
    font('bold', 10); tc([30, 115, 190]);
    doc.text(data.krsHeading || 'Key results snapshot', mL + 5, mainY + 8);
    var krsY = mainY + 15;
    krs.forEach(function(k) {
      if (krsY > mainY + krsCardH - 5) return;
      var txt = k.bold ? k.bold + ': ' + (k.text || '').replace(new RegExp('^' + (k.bold||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ':?\\s*','i'),'').trim() : (k.text || '');
      dc([30, 115, 190]); lw(0.5);
      doc.line(mL + 4, krsY - 1.5, mL + 5.5, krsY);
      doc.line(mL + 5.5, krsY, mL + 8, krsY - 3);
      font('normal', 8); tc([30, 115, 190]);
      doc.splitTextToSize(txt, mainW - 14).slice(0, 3).forEach(function(l) { doc.text(l, mL + 11, krsY); krsY += krsLineH; });
      krsY += 1;
    });
    mainY += krsCardH + 5;
  }

  // STATS — dynamic row height to prevent overlap
  var stats = data.stats || [];
  if (stats.length > 0) {
    var statCount = Math.min(stats.length, 4);
    var sw = mainW / statCount;
    // Calculate row height based on tallest label
    var maxLabelLines = 1;
    stats.slice(0, statCount).forEach(function(s) {
      font('normal', 7); tc(T.muted);
      var ll = doc.splitTextToSize(s.l || '', sw - 3).length;
      if (ll > maxLabelLines) maxLabelLines = ll;
    });
    var statRowH = 9 + maxLabelLines * 3.5 + 3; // value(9) + label lines + gap
    stats.slice(0, statCount).forEach(function(s, i) {
      var sx = mL + i * sw;
      font('bold', 14); tc(T.red); boldText(s.v || '', sx, mainY + 7);
      font('normal', 7); tc(T.muted);
      printWrap(s.l || '', sx, mainY + 11, sw - 3, 3.5);
    });
    mainY += statRowH;
    dc([210, 210, 220]); lw(0.3);
    doc.line(mL, mainY, mL + mainW, mainY);
    mainY += 5;
  }

  // ── Content sections — two pages ───────────────────────────────────────────
  var PAGE1_SHAPE_H = 30;   // reserved at bottom of page 1 for right shape
  var PAGE1_MAX = H - PAGE1_SHAPE_H - 16;
  var PAGE2_SHAPE_H = 20;   // shape-up at top of page 2
  var PAGE2_CONTENT_TOP = PAGE2_SHAPE_H + 10;  // content starts below shape-up
  var PAGE2_FOOTER_TOP = H - 42; // stop content above footer zone (shape+logo+text)
  var onPage2 = false;
  var textW = mainW;  // current text width (switches to fullW on page 2)

  function checkPageBreak() {
    if (!onPage2 && mainY > PAGE1_MAX) {
      doc.addPage();
      onPage2 = true;
      textW = fullW;  // page 2: full width, no sidebar

      // shape-up.png: LEFT-aligned at top of page 2 — same height as all shapes (20mm)
      if (assets.shapeUp) {
        try {
          fc([255,255,255]); doc.rect(0, 0, 44, 20, 'F');
          doc.addImage(assets.shapeUp, 'PNG', 0, 0, 42, 20, undefined, 'FAST');
        } catch(e) {}
      }
      mainY = PAGE2_CONTENT_TOP;
    }
  }

  var sections = (data.content || []).filter(function(c) { return c.type === 'section'; });
  sections.forEach(function(item) {
    if (!item.data) return;
    var s = item.data;
    checkPageBreak();

    if (s.label) {
      if (onPage2 && mainY > PAGE2_FOOTER_TOP - 20) return;
      font('bold', 7.5); tc(T.red);
      doc.text(s.label.toUpperCase(), mL, mainY);
      mainY += 5;
    }

    if (s.heading) {
      checkPageBreak();
      if (onPage2 && mainY > PAGE2_FOOTER_TOP - 15) return;
      font('bold', 11); tc(T.red);
      doc.splitTextToSize(s.heading, textW).slice(0, 2).forEach(function(l) {
        boldText(l, mL, mainY); mainY += 5.5;
      });
      mainY += 1;
    }

    if (s.body) {
      s.body.split('\n').forEach(function(line) {
        checkPageBreak();
        if (onPage2 && mainY > PAGE2_FOOTER_TOP - 6) return;
        var t = line.trim();
        if (!t) { mainY += 2; return; }
        if (/^[-\u2013]\s/.test(t)) {
          fc(T.bodyText); doc.circle(mL + 1.5, mainY - 1.2, 0.8, 'F');
          font('normal', 8.5); tc(T.bodyText);
          doc.splitTextToSize(t.replace(/^[-\u2013]\s+/, ''), textW - 6).forEach(function(l) {
            checkPageBreak();
            if (onPage2 && mainY > PAGE2_FOOTER_TOP - 6) return;
            doc.text(l, mL + 5, mainY); mainY += 4;
          });
        } else {
          font('normal', 8.5); tc(T.bodyText);
          doc.splitTextToSize(t, textW).forEach(function(l) {
            checkPageBreak();
            if (onPage2 && mainY > PAGE2_FOOTER_TOP - 6) return;
            doc.text(l, mL, mainY); mainY += 4;
          });
        }
      });
      mainY += 4;
    }
  });

  // ── Ensure we're on page 2 for footer ──────────────────────────────────────
  if (!onPage2) {
    doc.addPage();
    onPage2 = true;
    if (assets.shapeUp) {
      try {
        fc([255,255,255]); doc.rect(0, 0, 44, 20, 'F');
        doc.addImage(assets.shapeUp, 'PNG', 0, 0, 42, 20, undefined, 'FAST');
      } catch(e) {}
    }
  }

  // ── Page 1: right shape at bottom-right ────────────────────────────────────
  // Draw on correct pages using setPage
  var currentPage = doc.internal.getCurrentPageInfo().pageNumber;

  // Page 1: right shape bottom-right — use shapeLeft placed at right edge
  doc.setPage(1);
  if (assets.shapeLeft) {
    try {
      fc([255,255,255]); doc.rect(W - 44, H - 20, 44, 20, 'F');
      doc.addImage(assets.shapeLeft, 'PNG', W - 42, H - 20, 42, 20, undefined, 'FAST');
    } catch(e) {}
  }

  // Page 2 bottom-left shape
  doc.setPage(currentPage);
  if (assets.shapeLeft) {
    try {
      fc([255,255,255]); doc.rect(0, H - 20, 44, 20, 'F');
      doc.addImage(assets.shapeLeft, 'PNG', 0, H - 20, 42, 20, undefined, 'FAST');
    } catch(e) {}
  }

  // ── Footer on page 2 ──────────────────────────────────────────────────────
  // Fixed to bottom of page — logo then copyright just above the 20mm shape zone
  var footerLogoH = 9;
  var footerLogoW = 30;
  var footerLogoX = W - mR - footerLogoW;
  var footerTextY = H - 21;           // copyright text just above the 20mm shape
  var footerLogoY = footerTextY - footerLogoH - 2;  // logo 2mm above copyright

  if (assets.prophixLogo) {
    try { addImgFit(assets.prophixLogo, footerLogoX, footerLogoY, footerLogoW, footerLogoH); } catch(e) {}
  }
  font('normal', 7); tc(T.muted);
  doc.text(
    'Copyright \u00a9 ' + new Date().getFullYear() + ' Prophix Software Inc. All rights reserved. May only be reproduced with Prophix\u2019s prior consent.',
    W - mR, footerTextY, { align: 'right' }
  );

  // ── Save ────────────────────────────────────────────────────────────────────
  var lang = (data._lang || 'EN').toUpperCase();
  var filename = (data.name || 'Client').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + '_Customer_Story_' + lang + '.pdf';
  doc.save(filename);
};



// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  if (typeof GH_DATA_URL === 'undefined') {
    document.body.innerHTML = '<div style="padding:40px;font-family:Arial,sans-serif;background:#fff5f5;border:2px solid #EF363D;border-radius:12px;margin:40px;color:#c0272d">' +
      '<h2 style="margin-bottom:12px">⚠ This story needs to be re-published</h2>' +
      '<p style="line-height:1.6;color:#555">This story was created with an older version of the platform. Please re-publish it from the <a href="/new/" style="color:#EF363D">story creator</a> to upgrade it to the current architecture.</p></div>';
    return;
  }

  try {
    var r = await fetch(GH_DATA_URL + '?v=' + Date.now());
    if (!r.ok) throw new Error('Could not load story data (HTTP ' + r.status + ')');
    storyData = await r.json();
    if (typeof storyData.hasLogo === 'undefined') {
      storyData.hasLogo = STORY_META.hasLogo;
    }
    STORY_META.hasLogo = storyData.hasLogo;
  } catch(err) {
    document.body.innerHTML = '<div style="padding:40px;font-family:Arial;color:#c0272d"><h2>Could not load story</h2><p>' + err.message + '</p></div>';
    return;
  }

  renderPage(storyData);
  if (!checkPreviewMode(storyData)) return;
  wireEvents();
});

// ── Client Preview & Approval System ─────────────────────────────────────────

function _genToken(len) {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var out = '';
  for (var i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function _genPassword() {
  var adj = ['blue','red','swift','bright','calm','gold','iron','bold','clear','deep'];
  var noun = ['sky','wave','rock','star','leaf','fire','tide','dawn','peak','mist'];
  var num = Math.floor(Math.random() * 90) + 10;
  return adj[Math.floor(Math.random()*adj.length)] + '-' + noun[Math.floor(Math.random()*noun.length)] + '-' + num;
}

function checkPreviewMode(data) {
  var params = new URLSearchParams(window.location.search);
  var previewToken = params.get('preview');
  var status = data.status || 'published';

  if (previewToken) {
    var preview = data.preview || {};
    if (preview.token !== previewToken) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;background:#F4F4F8"><div style="text-align:center;padding:40px"><div style="font-size:48px;margin-bottom:16px">&#x274C;</div><h2 style="color:#1A1A2E;margin-bottom:8px">Invalid preview link</h2><p style="color:#888;font-size:14px">This link is invalid or has expired.</p></div></div>';
      return false;
    }
    if (preview.expiresAt && new Date() > new Date(preview.expiresAt)) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;background:#F4F4F8"><div style="text-align:center;padding:40px"><div style="font-size:48px;margin-bottom:16px">&#x23F0;</div><h2 style="color:#1A1A2E;margin-bottom:8px">Preview link expired</h2><p style="color:#888;font-size:14px">This preview link has expired (3 days). Please request a new one.</p></div></div>';
      return false;
    }
    showPasswordGate(data, preview);
    return false;
  }

  if (status === 'draft' || status === 'approved') {
    showDraftGate(data, status);
    return false;
  }

  return true;
}

function showDraftGate(data, status) {
  var label = status === 'approved' ? 'Approved — awaiting publish' : 'Draft story';
  var sub = status === 'approved'
    ? 'This story has been approved. Enter your token to open in edit mode and publish.'
    : 'This story is a draft. Enter your token to open in edit mode.';
  var badge = status === 'approved'
    ? '<div style="display:inline-block;background:#E8F5E9;color:#2a7a2a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:14px">✓ Approved</div>'
    : '<div style="display:inline-block;background:#E8E8F0;color:#555;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:14px">◑ Draft</div>';

  document.body.style.cssText = 'font-family:Arial,sans-serif;background:#1A1A2E;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px';
  document.body.innerHTML =
    '<div style="background:#fff;border-radius:14px;padding:40px;width:100%;max-width:420px">' +
    '<div style="text-align:center;margin-bottom:24px">' +
    '<img src="/prophix-logo-1000px.png" style="height:26px;margin-bottom:16px" alt="Prophix">' + badge +
    '<h2 style="font-size:19px;font-weight:900;color:#1A1A2E;margin-bottom:8px">' + esc(data.name) + '</h2>' +
    '<p style="font-size:13px;color:#888;line-height:1.5">' + sub + '</p></div>' +
    '<div style="margin-bottom:10px"><label style="display:block;font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Access token</label>' +
    '<input type="password" id="draft-token" style="width:100%;padding:10px 13px;border:1px solid #E0DFF0;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;outline:none" placeholder="Paste your token"/></div>' +
    '<div id="draft-err" style="font-size:12px;color:#EF363D;min-height:16px;margin-bottom:10px"></div>' +
    '<button id="draft-unlock" style="width:100%;background:#EF363D;color:#fff;border:none;border-radius:6px;padding:12px;font-size:14px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer">Open in edit mode &#x2192;</button>' +
    '<a href="/clients/" style="display:block;text-align:center;margin-top:12px;font-size:12px;color:#aaa;text-decoration:none">&#x2190; Back to stories</a></div>';

  function tryUnlock() {
    var token = document.getElementById('draft-token').value.trim().replace(/[^\x20-\x7E]/g,'');
    var err = document.getElementById('draft-err');
    if (!token) { err.textContent = 'Please paste your access token.'; return; }
    var btn = document.getElementById('draft-unlock');
    btn.disabled = true; btn.textContent = 'Verifying…';
    fetch('https://api.github.com/repos/' + GH_REPO + '/contents/clients/stories.json', {
      headers: {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json'}
    }).then(function(r) {
      if (!r.ok) { err.textContent = 'Invalid token — check it and try again.'; btn.disabled = false; btn.textContent = 'Open in edit mode →'; return; }
      sessionToken = token;
      var style = document.createElement('style');
      style.textContent = getCSS();
      document.head.appendChild(style);
      document.body.innerHTML = '';
      document.body.style.cssText = '';
      renderPage(data);
      wireEvents();
      enableEditMode();
    }).catch(function() { err.textContent = 'Could not verify token.'; btn.disabled = false; btn.textContent = 'Open in edit mode →'; });
  }

  document.getElementById('draft-unlock').onclick = tryUnlock;
  document.getElementById('draft-token').addEventListener('keydown', function(e){ if(e.key==='Enter') tryUnlock(); });
  setTimeout(function(){ document.getElementById('draft-token').focus(); }, 100);
}

function showPasswordGate(data, preview) {
  function tryUnlock() {
    var pw = document.getElementById('preview-pw').value.trim();
    var err = document.getElementById('preview-err');
    if (!pw) { err.textContent = 'Enter the preview password.'; return; }
    if (pw !== preview.password) { err.textContent = 'Incorrect password. Please try again.'; return; }
    var style = document.createElement('style');
    style.textContent = getCSS();
    document.head.appendChild(style);
    document.body.innerHTML = '';
    document.body.style.cssText = '';
    renderPage(data);
    var fab = document.getElementById('edit-fab'); if (fab) fab.remove();
    var nav = document.querySelector('.page-nav');
    if (nav) {
      var portal = nav.querySelector('.portal-link'); if (portal) portal.remove();
      var badge = document.createElement('div');
      badge.style.cssText = 'font-size:11px;font-weight:700;color:#F5C842;letter-spacing:1px;padding:3px 10px;border:1px solid rgba(245,200,66,.4);border-radius:20px;flex-shrink:0';
      badge.textContent = 'Preview';
      nav.insertBefore(badge, nav.firstChild);
    }
  }
  document.body.style.cssText = 'font-family:Arial,sans-serif;background:#1A1A2E;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px';
  document.body.innerHTML =
    '<div style="background:#fff;border-radius:14px;padding:40px;width:100%;max-width:420px">' +
    '<div style="text-align:center;margin-bottom:24px">' +
    '<img src="/prophix-logo-1000px.png" style="height:26px;margin-bottom:14px" alt="Prophix">' +
    '<h2 style="font-size:19px;font-weight:900;color:#1A1A2E;margin-bottom:6px">Story preview</h2>' +
    '<p style="font-size:13px;color:#888;line-height:1.5">Enter the password shared with you to view this draft story.</p></div>' +
    '<div style="margin-bottom:10px"><label style="display:block;font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Preview password</label>' +
    '<input type="password" id="preview-pw" style="width:100%;padding:10px 13px;border:1px solid #E0DFF0;border-radius:6px;font-size:14px;font-family:Arial,sans-serif;outline:none" placeholder="Enter password"/></div>' +
    '<div id="preview-err" style="font-size:12px;color:#EF363D;min-height:16px;margin-bottom:10px"></div>' +
    '<button id="preview-unlock" style="width:100%;background:#EF363D;color:#fff;border:none;border-radius:6px;padding:12px;font-size:14px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer">View story &#x2192;</button></div>';
  document.getElementById('preview-unlock').onclick = tryUnlock;
  document.getElementById('preview-pw').addEventListener('keydown', function(e){ if(e.key==='Enter') tryUnlock(); });
  setTimeout(function(){ document.getElementById('preview-pw').focus(); }, 100);
}

function showPreviewLinkModal() {
  var pw = _genPassword();
  var token = _genToken(10);
  var expiry = new Date(Date.now() + 3*24*60*60*1000);
  var expiryStr = expiry.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  var url = 'https://raulsteiu.github.io/clients/' + STORY_META.slug + '/?preview=' + token;
  var modal = document.createElement('div');
  modal.id = 'preview-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML =
    '<div style="background:#fff;border-radius:12px;padding:32px;width:100%;max-width:460px">' +
    '<h3 style="font-size:17px;font-weight:900;color:#1A1A2E;margin-bottom:6px">Preview link</h3>' +
    '<p style="font-size:13px;color:#888;margin-bottom:16px;line-height:1.5">Saving to server…</p>' +
    '<div id="prev-loading" style="text-align:center;padding:16px;color:#888;font-size:13px">&#x23F3; Saving…</div>' +
    '<div id="prev-content" style="display:none">' +
    '<div style="background:#F4F4F8;border-radius:8px;padding:16px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Preview link</div>' +
    '<div style="font-size:12px;color:#1A1A2E;word-break:break-all;line-height:1.6;margin-bottom:10px" id="prev-url-text"></div>' +
    '<div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Password</div>' +
    '<div style="font-size:20px;font-weight:700;color:#1A1A2E;letter-spacing:2px;margin-bottom:6px" id="prev-pw-text"></div>' +
    '<div style="font-size:11px;color:#aaa">Expires: <span id="prev-exp"></span></div></div>' +
    '<div id="prev-err" style="font-size:12px;color:#EF363D;min-height:14px;margin-bottom:10px"></div>' +
    '<div style="display:flex;gap:10px">' +
    '<button id="prev-copy" style="flex:1;background:#1A1A2E;color:#fff;border:none;border-radius:6px;padding:10px;font-size:13px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer">&#x29C9; Copy link + password</button>' +
    '<button id="prev-done" style="flex:1;background:#EF363D;color:#fff;border:none;border-radius:6px;padding:10px;font-size:13px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer">Done &#x2192; Stories</button>' +
    '</div></div></div>';
  document.body.appendChild(modal);
  (async function() {
    try {
      storyData.preview = {token:token, password:pw, expiresAt:expiry.toISOString(), createdAt:new Date().toISOString()};
      if (storyData.status === 'published') storyData.status = 'draft';
      var enc = btoa(unescape(encodeURIComponent(JSON.stringify(storyData, null, 2))));
      var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, {headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}});
      var body = {message:'Preview link: '+storyData.name, content:enc};
      if (shaRes.ok) { var d = await shaRes.json(); if (d.sha) body.sha = d.sha; }
      var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, {method:'PUT',headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify(body)});
      if (!r.ok) throw new Error('Could not save to server');
      _updateEditedTimestamp();
      document.getElementById('prev-loading').style.display = 'none';
      document.getElementById('prev-content').style.display = 'block';
      document.getElementById('prev-url-text').textContent = url;
      document.getElementById('prev-pw-text').textContent = pw;
      document.getElementById('prev-exp').textContent = expiryStr;
      document.getElementById('prev-copy').onclick = function() {
        var txt = 'Story preview link:\n' + url + '\n\nPassword: ' + pw + '\nExpires: ' + expiryStr;
        navigator.clipboard.writeText(txt).then(function(){
          document.getElementById('prev-copy').textContent = '✓ Copied!';
          document.getElementById('prev-copy').style.background = '#2a7a2a';
          setTimeout(function(){ document.getElementById('prev-copy').textContent = '⧉ Copy link + password'; document.getElementById('prev-copy').style.background = '#1A1A2E'; }, 2000);
        }).catch(function(){ alert('Link: ' + url + '\nPassword: ' + pw); });
      };
      document.getElementById('prev-done').onclick = function() { window.location.href = '/clients/'; };
    } catch(e) {
      document.getElementById('prev-loading').style.display = 'none';
      document.getElementById('prev-content').style.display = 'block';
      document.getElementById('prev-err').textContent = 'Error saving: ' + e.message;
    }
  })();
}

// ── Delete story from within edit mode (v9.3) ─────────────────────────────────
async function confirmDeleteStory() {
  if (!confirm('Permanently delete this story and all its files?\n\nThis cannot be undone.')) return;
  var statusEl = document.getElementById('save-status');
  var delBtn = document.querySelector('.tb-delete');
  if (delBtn) { delBtn.disabled = true; delBtn.textContent = 'Deleting…'; }
  if (statusEl) statusEl.textContent = 'Deleting…';
  try {
    var slug = STORY_META.slug;
    var folder = 'clients/' + slug + '/';
    // List all files in the story folder
    var listRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+folder, {
      headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
    });
    if (!listRes.ok) throw new Error('Could not list story files');
    var files = await listRes.json();
    for (var i = 0; i < files.length; i++) {
      if (statusEl) statusEl.textContent = 'Removing ' + (i+1) + '/' + files.length + '…';
      await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+files[i].path, {
        method:'DELETE',
        headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
        body:JSON.stringify({message:'Delete story: '+slug, sha:files[i].sha})
      });
    }
    // Remove from stories.json
    if (statusEl) statusEl.textContent = 'Updating directory…';
    var sRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', {
      headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
    });
    if (sRes.ok) {
      var sData = await sRes.json();
      var stories = JSON.parse(atob(sData.content.replace(/\n/g,'')));
      stories = stories.filter(function(s){ return s.slug !== slug; });
      var enc = btoa(unescape(encodeURIComponent(JSON.stringify(stories, null, 2))));
      await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', {
        method:'PUT',
        headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
        body:JSON.stringify({message:'Remove story: '+slug, content:enc, sha:sData.sha})
      });
    }
    // Redirect to directory
    window.location.href = '/clients/';
  } catch(err) {
    if (delBtn) { delBtn.disabled = false; delBtn.textContent = '🗑 Delete story'; }
    if (statusEl) statusEl.textContent = 'Delete failed: ' + err.message;
    alert('Delete failed: ' + err.message);
  }
}


async function changeStatus(newStatus) {
  storyData.status = newStatus;
  var statusEl = document.getElementById('save-status');
  if (statusEl) statusEl.textContent = 'Saving status…';
  try {
    var enc = btoa(unescape(encodeURIComponent(JSON.stringify(storyData, null, 2))));
    var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, {headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}});
    var body = {message:'Status: '+newStatus+' — '+storyData.name, content:enc};
    if (shaRes.ok) { var d = await shaRes.json(); if (d.sha) body.sha = d.sha; }
    await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, {method:'PUT',headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify(body)});
    _updateEditedTimestamp();
    if (statusEl) { statusEl.textContent = 'Status: ' + newStatus + ' ✓'; setTimeout(function(){ statusEl.textContent = 'Editing: ' + currentLang.toUpperCase(); }, 2000); }
  } catch(e) {
    if (statusEl) statusEl.textContent = 'Status save failed';
  }
}
