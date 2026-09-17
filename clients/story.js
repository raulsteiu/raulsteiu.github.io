// Prophix Client Story — story.js v9.0
// Data-driven architecture: renders from data.json, saves back to data.json.
// Required globals in index.html shell:
//   GH_REPO, GH_FILE, GH_DATA_FILE, GH_CLIENT_FOLDER, STORY_META
//   STORY_META = { slug, name, hasLogo, langs }

'use strict';

var sessionToken = '';
var cachedDataSha = '';
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
    '.who-text{font-size:13px;color:#555;line-height:1.6;margin-bottom:10px}',
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
    '.sec-delete-btn:hover,.clip-remove-btn:hover{color:var(--red)}'
  ].join('');
}

// ── Render helpers ────────────────────────────────────────────────────────────
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function renderBody(text) {
  if (!text) return '';
  var lines = text.split('\n');
  var html = ''; var inList = false;
  lines.forEach(function(line) {
    var t = line.trim();
    if (/^[-\u2013]\s/.test(t)) {
      if (!inList) { html += '<ul>'; inList = true; }
      var content = t.replace(/^[-\u2013]\s+/,'');
      var ci = content.indexOf(':');
      if (ci > 0 && ci < 60) {
        html += '<li><strong>' + esc(content.substring(0,ci)) + ':</strong>' + esc(content.substring(ci+1)) + '</li>';
      } else { html += '<li>' + esc(content) + '</li>'; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (t) { html += '<p>' + esc(t) + '</p>'; }
      else { html += '<p>&nbsp;</p>'; }
    }
  });
  if (inList) html += '</ul>';
  return html || '<p>' + esc(text) + '</p>';
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
  toolbar.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><button id="save-btn" class="tb-save">Save</button><button id="cancel-btn" class="tb-cancel">Cancel</button><span id="save-status" class="save-status"></span></div>';
  body.appendChild(toolbar);

  // Page nav
  var nav = document.createElement('div');
  nav.className = 'page-nav';
  nav.innerHTML = '<a href="/clients/" class="portal-link">← All stories</a>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<span class="last-edited" style="font-size:11px;color:rgba(255,255,255,.45)"></span>' +
    '<button id="story-share-btn" class="share-page-btn">⧉ Share</button></div>' +
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

  // Wire lang buttons immediately — don't wait for wireEvents
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
  // For non-EN, use translated content if available, fall back to EN with prefix
  var tr = (!isEN && data.translations && data.translations[lc]) ? data.translations[lc] : null;
  var p = isEN ? '' : ('[' + (LANG_NAMES[lc]||lc) + '] ');
  var blockData = {
    name:       (tr && tr.name)    ? tr.name    : (p + (data.name||'')),
    desc:       (tr && tr.desc)    ? tr.desc    : (p + (data.desc||'')),
    ind:        data.ind,
    whoText:    (tr && tr.whoText) ? tr.whoText : (p + (data.whoText||'')),
    // Stats — prefix labels so user knows to translate
    stats:      (tr && tr.stats && tr.stats.length > 0) ? tr.stats
                : data.stats.map(function(s){ return isEN ? s : {v: p+s.v, l: p+s.l}; }),
    // KRS — preserve bold, prefix text
    krs:        (tr && tr.krs && tr.krs.length > 0) ? tr.krs
                : (isEN ? data.krs : data.krs.map(function(k){
                    return {bold: k.bold||'', text: p+(k.bold ? k.bold+': '+k.text.replace(k.bold+':','').trim() : k.text)};
                  })),
    krsHeading: (tr && tr.krsHeading) ? tr.krsHeading : (p + (data.krsHeading || 'Key Results Snapshot')),
    // Content — prefix all text fields in sections and clips
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
                        title: p + (item.data.title||''),
                        ts:    item.data.ts||'',
                        quote: p + (item.data.quote||''),
                        audio: item.data.audio||''
                      }};
                    }
                    return item;
                  }),
    // Who stats — prefix labels
    whoStats:   (tr && tr.whoStats && tr.whoStats.length > 0) ? tr.whoStats
                : data.whoStats.map(function(s){ return isEN ? s : {v: p+s.v, l: p+s.l}; }),
    products:     data.products,
    // Results — prefix each item
    results:    (tr && tr.results && tr.results.length > 0) ? tr.results
                : (isEN ? data.results : (data.results||[]).map(function(r){ return p+r; })),
    participants: data.participants
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
    logoHtml += '<div class="logo-pill-client" onclick="triggerLogoUpload()" title="Click in edit mode to replace logo">' +
      '<img class="hero-client-logo" src="logo.png" alt="' + esc(data.name) + ' logo"></div>';
  } else {
    logoHtml += '<div class="logo-pill-client edit-only" onclick="triggerLogoUpload()" title="Upload client logo">' +
      '<div class="hero-logo-ph">+ Upload logo</div></div>';
  }
  logoHtml += '</div>';

  var langLabel = data.langLabels && data.langLabels[lc] ? data.langLabels[lc] : (LANG_LABELS[lc] || 'Customer Story');
  hero.innerHTML = logoHtml +
    '<div class="hero-body">' +
    '<div class="hero-tag">' + esc(langLabel) + '</div>' +
    '<h1>' + esc(blockData.name) + '</h1>' +
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
      var txt = k.bold ? '<strong>' + esc(k.bold) + ':</strong> ' + esc((k.text||'').replace(k.bold+':','').trim()) : esc(k.text||'');
      li.innerHTML = '<span class="krs-check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#EF363D"/><polyline points="7 12 10.5 15.5 17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="krs-item-text">' + txt + '</span>';
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
      // Bug 3 fix: always render section, even if heading is empty
      sec.innerHTML = '<div class="sec-label">' + esc(s.label||'') + '</div>' +
        '<h2>' + esc(s.heading||'') + '</h2>' +
        renderBody(s.body||'');
      mainContent.appendChild(sec);
    } else if (item.type === 'clip') {
      var c = item.data;
      var card = document.createElement('div'); card.className = 'clip-card';
      card.innerHTML = '<div class="clip-label"><svg width="13" height="13" viewBox="0 0 24 24" fill="#EF363D"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
        '<span class="clip-title-text">' + esc((c.title||'').replace(/^[✕✗×\s]+|[✕✗×\s]+$/g,'')) + '</span>' +
        (c.ts ? '<span class="clip-ts"> · ' + esc(c.ts) + '</span>' : '') + '</div>' +
        '<div class="clip-quote">' + esc(c.quote||'') + '</div>' +
        '<div class="clip-player"><audio controls preload="metadata" style="width:100%;height:38px;border-radius:6px;accent-color:#EF363D">' +
        (c.audio ? '<source src="' + esc(c.audio) + '" type="audio/mpeg">' : '<source type="audio/mpeg">') +
        '</audio></div>';
      mainContent.appendChild(card);
    }
  });

  var addBar = document.createElement('div'); addBar.className = 'add-blocks-bar edit-only';
  addBar.innerHTML = '<button class="add-sec-btn" onclick="addSection(this)">+ Add section</button>' +
    '<button class="add-clip-btn" onclick="addClipInline(this)">+ Add clip</button>';
  mainCol.appendChild(mainContent);
  mainCol.appendChild(addBar);

  // Sidebar
  var sidebar = document.createElement('div'); sidebar.className = 'sidebar';

  // Who card
  var whoCard = document.createElement('div'); whoCard.className = 'sidebar-card';
  whoCard.innerHTML = '<h3>Who is ' + esc(data.name) + '?</h3><p class="who-text">' + esc(blockData.whoText||'') + '</p>';
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
    prodCard.innerHTML = '<h3>Applications deployed</h3>';
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

  // Results — always render card so Add result button works in edit mode
  var resCard = document.createElement('div'); resCard.className = 'sidebar-card'; resCard.setAttribute('data-section','results');
  resCard.innerHTML = '<h3>Results</h3>';
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

// ── Read DOM state back to data object (for saving) ───────────────────────────
function domToData() {
  var data = JSON.parse(JSON.stringify(storyData)); // start from current data
  var langs = data.langs || ['en'];

  langs.forEach(function(lc) {
    var block = document.getElementById('block-' + lc);
    if (!block) return;
    var isEN = lc === 'en';

    if (isEN) {
      // Core fields - only read from EN block
      var h1 = block.querySelector('h1'); if (h1) data.name = h1.textContent.trim();
      var desc = block.querySelector('.hero-desc'); if (desc) data.desc = desc.textContent.trim();
      var ind = block.querySelector('.hero-ind'); if (ind) data.ind = ind.textContent.trim();
      var whoText = block.querySelector('.who-text'); if (whoText) data.whoText = whoText.textContent.trim();

      // Stats
      data.stats = Array.from(block.querySelectorAll('.stat-tile')).map(function(t) {
        return { v: (t.querySelector('.stat-n')||{}).textContent||'', l: (t.querySelector('.stat-l')||{}).textContent||'' };
      });

      var krsHeading = block.querySelector('.krs-heading'); if (krsHeading) data.krsHeading = krsHeading.textContent.trim();

      // KRS
      data.krs = Array.from(block.querySelectorAll('.krs-item')).map(function(item) {
        var clone = item.querySelector('.krs-item-text') ? item.querySelector('.krs-item-text').cloneNode(true) : null;
        if (!clone) return null;
        clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
        var text = clone.textContent.trim();
        var strong = clone.querySelector('strong');
        var bold = strong ? strong.textContent.replace(/:$/, '').trim() : '';
        var body = bold ? text.replace(bold + ':', '').trim() : text;
        return { bold: bold, text: bold ? bold + ': ' + body : body };
      }).filter(Boolean);

      // Content (sections + clips in order)
      data.content = [];
      block.querySelectorAll('.main-content > .story-sec, .main-content > .clip-card').forEach(function(el) {
        if (el.classList.contains('story-sec')) {
          var bodyEdit = el.querySelector('.sec-body-edit');
          var bodyText = bodyEdit ? bodyEdit.textContent.replace(/\u00a0/g,'') : Array.from(el.querySelectorAll('p,li')).map(function(n){ return (n.tagName==='LI'?'- ':'')+n.textContent.replace(/\u00a0/g,''); }).join('\n');
          data.content.push({ type: 'section', data: {
            label: (el.querySelector('.sec-label')||{}).textContent||'',
            heading: (el.querySelector('h2')||{}).textContent||'',
            body: bodyText.trim()
          }});
        } else if (el.classList.contains('clip-card')) {
          var src = el.querySelector('audio source');
          var rawSrc = src ? (src.getAttribute('src') || src.src || '') : '';
          var audioFile = rawSrc ? rawSrc.split('?')[0].split('/').pop() : '';
          if (audioFile && audioFile.indexOf('://') > -1) audioFile = '';
          var clipTitleEl = el.querySelector('.clip-title-text') || el.querySelector('.clip-label');
          var clipLabelClone = clipTitleEl ? clipTitleEl.cloneNode(true) : null;
          if (clipLabelClone) clipLabelClone.querySelectorAll('button').forEach(function(b){ b.remove(); });
          data.content.push({ type: 'clip', data: {
            title: clipLabelClone ? clipLabelClone.textContent.trim() : '',
            ts: '',
            quote: (el.querySelector('.clip-quote')||{}).textContent||'',
            audio: audioFile || ''
          }});
        }
      });

      // Sidebar: products
      data.products = Array.from(block.querySelectorAll('.app-name')).map(function(s){ return s.textContent.trim(); });

      // Results
      data.results = Array.from(block.querySelectorAll('.result-item')).map(function(r){
        // Clone and remove any injected edit buttons before reading text
        var clone = r.cloneNode(true);
        clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
        return clone.textContent.trim();
      }).filter(function(r){ return r.length > 0; });

      // Participants
      data.participants = Array.from(block.querySelectorAll('[data-section="participants"] p')).map(function(p) {
        return { name: (p.querySelector('.participant-name')||{}).textContent||'', title: (p.querySelector('.participant-title')||{}).textContent||'' };
      });

      // Who stats
      data.whoStats = Array.from(block.querySelectorAll('.who-stat-tile')).map(function(t) {
        return { v: (t.querySelector('.who-stat-n')||{}).textContent||'', l: (t.querySelector('.who-stat-l')||{}).textContent||'' };
      });
    }

    // Per-language overrides (translations) - store non-EN text
    if (!isEN) {
      if (!data.translations) data.translations = {};
      if (!data.translations[lc]) data.translations[lc] = {};
      var t = data.translations[lc];
      var h1l = block.querySelector('h1'); if (h1l) t.name = h1l.textContent.trim();
      var descl = block.querySelector('.hero-desc'); if (descl) t.desc = descl.textContent.trim();

      var krsHeadingEl = block.querySelector('.krs-heading'); if (krsHeadingEl) t.krsHeading = krsHeadingEl.textContent.trim();

      // KRS — clone items to strip any injected buttons before reading
      t.krs = Array.from(block.querySelectorAll('.krs-item')).map(function(item) {
        var clone = item.querySelector('.krs-item-text') ? item.querySelector('.krs-item-text').cloneNode(true) : null;
        if (!clone) return null;
        clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
        var text = clone.textContent.trim();
        var strong = clone.querySelector('strong');
        var bold = strong ? strong.textContent.replace(/:$/, '').trim() : '';
        var body = bold ? text.replace(bold + ':', '').trim() : text;
        return { bold: bold, text: bold ? bold + ': ' + body : body };
      }).filter(Boolean);

      // Who text
      var whoTxtEl = block.querySelector('.who-text'); if (whoTxtEl) t.whoText = whoTxtEl.textContent.trim();

      // Who stats
      t.whoStats = Array.from(block.querySelectorAll('.who-stat-tile')).map(function(tile) {
        return { v: (tile.querySelector('.who-stat-n')||{}).textContent||'', l: (tile.querySelector('.who-stat-l')||{}).textContent||'' };
      });

      // Results
      t.results = Array.from(block.querySelectorAll('.result-item')).map(function(r) {
        var clone = r.cloneNode(true);
        clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
        return clone.textContent.trim();
      }).filter(function(r){ return r.length > 0; });

      // Participants
      t.participants = Array.from(block.querySelectorAll('[data-section="participants"] p')).map(function(p) {
        return { name: (p.querySelector('.participant-name')||{}).textContent||'', title: (p.querySelector('.participant-title')||{}).textContent||'' };
      });

      // Content (sections + clips)
      t.content = [];
      block.querySelectorAll('.main-content > .story-sec, .main-content > .clip-card').forEach(function(el) {
        if (el.classList.contains('story-sec')) {
          var bodyEdit = el.querySelector('.sec-body-edit');
          var bodyText = bodyEdit ? bodyEdit.textContent.replace(/\u00a0/g,'') : Array.from(el.querySelectorAll('p,li')).map(function(n){ return (n.tagName==='LI'?'- ':'')+n.textContent.replace(/\u00a0/g,''); }).join('\n');
          t.content.push({ type:'section', data:{ label:(el.querySelector('.sec-label')||{}).textContent||'', heading:(el.querySelector('h2')||{}).textContent||'', body:bodyText.trim() }});
        } else if (el.classList.contains('clip-card')) {
          var ctEl = el.querySelector('.clip-title-text') || el.querySelector('.clip-label');
          var ctClone = ctEl ? ctEl.cloneNode(true) : null;
          if (ctClone) ctClone.querySelectorAll('button').forEach(function(b){ b.remove(); });
          t.content.push({ type:'clip', data:{ title: ctClone ? ctClone.textContent.trim() : '', quote:(el.querySelector('.clip-quote')||{}).textContent||'' }});
        }
      });
    }
  });

  // Update langs list (may have changed if languages added/removed)
  data.langs = Array.from(document.querySelectorAll('.lang-block')).map(function(b){ return b.id.replace('block-',''); });

  return data;
}

// ── Language functions ────────────────────────────────────────────────────────
function toggleLangPicker(btn) {
  var picker = document.getElementById('lang-picker');
  if (!picker) return;
  if (picker.style.display !== 'none') { picker.style.display = 'none'; return; }
  // Populate picker with available languages
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
  // Close on outside click
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
    // Re-apply edit mode to newly visible block if we're in edit mode
    if (document.body.classList.contains('edit-mode')) {
      makeBlockEditable(block);
    }
  }
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-lang') === code);
  });
}

function addLanguage(code) {
  if (!code || storyData.langs.indexOf(code) > -1) return;
  // Clone EN block, prefix content
  var enBlock = document.getElementById('block-en');
  stripEditControls();
  var newBlock = enBlock.cloneNode(true);
  addEditControlsToExisting();
  newBlock.id = 'block-' + code;
  newBlock.classList.remove('active');
  // Prefix editable text
  var pfx = '[' + (LANG_NAMES[code]||code) + '] ';
  EDITABLE_SELECTORS.forEach(function(sel) {
    newBlock.querySelectorAll(sel).forEach(function(el) {
      if (el.textContent.indexOf('[') === -1) el.textContent = pfx + el.textContent;
    });
  });
  var heroTag = newBlock.querySelector('.hero-tag');
  if (heroTag && LANG_LABELS[code]) heroTag.textContent = LANG_LABELS[code];
  document.getElementById('lang-blocks').appendChild(newBlock);

  // Add toggle button
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

  // Remove from dropdown
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
  // Picker repopulates dynamically from LANG_FULL_NAMES on open — nothing to update here
  if (currentLang === code) setLang('en');
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
var EDITABLE_SELECTORS = [
  '.hero-tag', 'h1', '.hero-desc', '.hero-industry', '.hero-ind',
  '.sec-label', '.story-sec h2', '.story-sec p', '.story-sec li',
  '.clip-title-text', '.clip-quote', '.clips-section-title',
  '.sidebar-card h3', '.result-item', '.krs-heading',
  '.stat-n', '.stat-l', '.krs-item-text',
  '.who-text', '.who-stat-n', '.who-stat-l',
  '.participant-name', '.participant-title',
  '.disclaimer-text'
];

function makeBlockEditable(block) {
  EDITABLE_SELECTORS.forEach(function(sel) {
    block.querySelectorAll(sel).forEach(function(el) {
      if ((el.tagName === 'P' || el.tagName === 'LI') && el.closest('.story-sec')) return;
      el.contentEditable = 'true';
    });
  });
  block.querySelectorAll('.story-sec').forEach(function(sec) { wrapSectionBody(sec); });
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
      node.querySelectorAll('li').forEach(function(li) { lines.push('- ' + li.textContent); });
    } else if (node.tagName === 'P') {
      // Normalize &nbsp; blank paragraphs to empty lines
      var txt = node.textContent.replace(/\u00a0/g, '').trim();
      lines.push(txt);
    }
  });
  var wrap = document.createElement('div');
  wrap.className = 'sec-body-edit';
  wrap.contentEditable = 'true';
  wrap.style.cssText = 'white-space:pre-wrap;word-break:break-word;outline:none;min-height:24px;font-size:15px;color:#444;line-height:1.75;font-family:Arial,sans-serif;padding:2px 0';
  wrap.textContent = lines.join('\n');
  wrap.addEventListener('keydown', function(e) {
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
    // Normalize innerHTML: replace <br> and </div><div> with \n, then get textContent
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
        filter: '[contenteditable]', preventOnFilter: false
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
  document.querySelectorAll('.lang-block').forEach(makeBlockEditable);
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  document.getElementById('save-status').textContent = 'Editing: ' + currentLang.toUpperCase();
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
  ['.sec-delete-btn','.drag-handle','.clip-remove-btn','.upload-audio-btn','.audio-del-x',
   '.delete-audio-btn','.stat-add-btn','.stat-tile-del','.krs-add-btn','.krs-item-del',
   '.who-stat-add-btn','.who-stat-del','.part-add-btn','.part-del-btn',
   '.result-add-btn','.result-del-btn','#inline-products-panel']
  .forEach(function(sel){ document.querySelectorAll(sel).forEach(function(el){ el.remove(); }); });
}

function addEditControlsToExisting() {
  // Clips
  document.querySelectorAll('.clip-card').forEach(function(card) {
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

  // Sections
  document.querySelectorAll('.story-sec').forEach(function(sec) {
    var handle = document.createElement('div');
    handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.title = 'Drag';
    handle.style.right = '36px'; sec.insertBefore(handle, sec.firstChild);
    var btn = document.createElement('button');
    btn.className = 'sec-delete-btn edit-only'; btn.innerHTML = '🗑'; btn.title = 'Delete section';
    btn.addEventListener('click', function(){ if(confirm('Delete this section?')) sec.remove(); });
    sec.insertBefore(btn, handle);
  });

  // Stats
  document.querySelectorAll('.stats-row').forEach(function(row) {
    row.querySelectorAll('.stat-tile').forEach(addStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'stat-add-btn edit-only'; addBtn.textContent = '+'; addBtn.title = 'Add stat';
    addBtn.addEventListener('click', function(){ addStatTile(row, addBtn); }); row.appendChild(addBtn);
  });

  // Who stats
  document.querySelectorAll('.who-stats-grid').forEach(function(grid) {
    grid.querySelectorAll('.who-stat-tile').forEach(addWhoStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'who-stat-add-btn edit-only'; addBtn.textContent = '+ Add stat';
    addBtn.addEventListener('click', function(){ addWhoStat(grid, addBtn); }); grid.appendChild(addBtn);
  });

  // KRS
  document.querySelectorAll('.krs-item').forEach(function(item) {
    var btn = document.createElement('button');
    btn.className = 'krs-item-del edit-only'; btn.innerHTML = '✕'; btn.title = 'Delete';
    btn.addEventListener('click', function(){ item.remove(); }); item.appendChild(btn);
  });
  document.querySelectorAll('.krs-list').forEach(function(krsList) {
    var krsAdd = document.createElement('button');
    krsAdd.className = 'krs-add-btn edit-only'; krsAdd.textContent = '+ Add result';
    krsAdd.addEventListener('click', function(){ addKrsItem(krsList, krsAdd); }); krsList.appendChild(krsAdd);
  });

  // Participants
  document.querySelectorAll('.sidebar-card[data-section="participants"],.sidebar-card:has(.participant-name)').forEach(function(card) {
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
  document.querySelectorAll('.sidebar-card[data-section="results"],.sidebar-card:has(.result-item)').forEach(function(card) {
    card.querySelectorAll('.result-item').forEach(function(item) {
      var del = document.createElement('button');
      del.className = 'result-del-btn edit-only'; del.innerHTML = '✕';
      del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:11px;float:right;padding:0 2px';
      del.addEventListener('click', function(){ item.remove(); }); item.insertBefore(del, item.firstChild);
    });
    var addBtn = document.createElement('button');
    addBtn.className = 'result-add-btn edit-only'; addBtn.textContent = '+ Add result';
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

function addClipInline(btn) {
  var block = btn.closest('.lang-block') || document.querySelector('.lang-block.active');
  var container = block ? block.querySelector('.main-content') : btn.parentNode;
  var card = document.createElement('div'); card.className = 'clip-card';
  var rb = document.createElement('button');
  rb.className = 'clip-remove-btn edit-only'; rb.innerHTML = '🗑';
  rb.addEventListener('click', function(){ if(confirm('Delete clip?')) card.remove(); });
  var handle = document.createElement('div');
  handle.className = 'drag-handle edit-only'; handle.textContent = '⠿'; handle.style.right = '36px';
  var lbl = document.createElement('div'); lbl.className = 'clip-label'; lbl.contentEditable = 'true'; lbl.textContent = 'Clip title';
  var xBtn = document.createElement('button');
  xBtn.className = 'audio-del-x edit-only'; xBtn.title = 'Delete audio'; xBtn.textContent = '✕';
  var aud = document.createElement('audio'); aud.controls = true; aud.preload = 'metadata';
  aud.style.cssText = 'width:100%;height:38px;border-radius:6px;accent-color:#EF363D';
  var src = document.createElement('source'); src.type = 'audio/mpeg'; aud.appendChild(src);
  var qt = document.createElement('div'); qt.className = 'clip-quote'; qt.contentEditable = 'true'; qt.textContent = 'Pull quote';
  var pl = document.createElement('div'); pl.className = 'clip-player';
  var upBtn = document.createElement('button');
  upBtn.className = 'upload-audio-btn edit-only'; upBtn.textContent = 'Upload MP3';
  upBtn.addEventListener('click', function(){ uploadAudio(upBtn); });
  lbl.appendChild(xBtn);
  xBtn.addEventListener('click', async function(e){ e.stopPropagation(); await deleteAudioFile(pl, xBtn); });
  pl.appendChild(aud); pl.appendChild(upBtn);
  card.appendChild(rb); card.appendChild(handle); card.appendChild(lbl); card.appendChild(qt); card.appendChild(pl);
  if (container) container.appendChild(card); else btn.parentNode.insertBefore(card, btn);
}

function addKrsItem(list, addBtn) {
  var li = document.createElement('li'); li.className = 'krs-item';
  li.innerHTML = '<span class="krs-check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#EF363D"/><polyline points="7 12 10.5 15.5 17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="krs-item-text" contenteditable="true">New result</span>';
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
  var li = document.createElement('li'); li.className = 'result-item'; li.contentEditable = 'true'; li.textContent = 'New result';
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
      // Update storyData and meta
      storyData.hasLogo = true; STORY_META.hasLogo = true;
      // Re-render the logo area cleanly instead of fighting inline styles
      var logoRow = document.querySelector('.logo-row');
      if (logoRow) {
        var clientPill = logoRow.querySelector('.logo-pill-client');
        if (clientPill) {
          // Replace placeholder with real logo
          clientPill.classList.remove('edit-only');
          clientPill.innerHTML = '<img class="hero-client-logo" src="logo.png?v=' + Date.now() + '" alt="logo" style="max-height:30px;max-width:140px;object-fit:contain;display:block">';
        }
      }
      // Save hasLogo to data.json so it persists
      storyData.hasLogo = true;
      var dataEnc = btoa(unescape(encodeURIComponent(JSON.stringify(storyData, null, 2))));
      var dataShaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
      var dataBody = {message:'Update hasLogo', content:dataEnc};
      if (dataShaRes.ok) { var dd = await dataShaRes.json(); if (dd.sha) dataBody.sha = dd.sha; }
      await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(dataBody) });
      // Update stories.json logo flag so directory shows logo
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

// ── Save to GitHub (data.json — NOT outerHTML) ────────────────────────────────
async function saveToGitHub() {
  var saveBtn = document.getElementById('save-btn');
  var statusEl = document.getElementById('save-status');
  saveBtn.disabled = true; statusEl.textContent = 'Saving…';

  try {
    // 1. Read current DOM state into data object
    unwrapSectionBodies();
    var newData = domToData();

    // 2. Save stripEditControls state
    disableDragDrop();
    document.querySelectorAll('[contenteditable]').forEach(function(el){ el.removeAttribute('contenteditable'); });

    // 3. Write data.json
    var dataJson = JSON.stringify(newData, null, 2);
    var enc = btoa(unescape(encodeURIComponent(dataJson)));

    // Get current SHA
    var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'} });
    var body = {message:'Update story data: '+newData.name, content:enc};
    if (shaRes.ok) { var d = await shaRes.json(); if (d.sha) body.sha = d.sha; }

    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_DATA_FILE, { method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'}, body:JSON.stringify(body) });

    if (!r.ok) { var err = await r.json(); throw new Error(err.message || 'Save failed'); }

    // 4. Update local storyData
    storyData = newData;

    // 5. Update last-edited timestamp in stories.json (background)
    _updateEditedTimestamp();

    statusEl.textContent = 'Saved ✓';

    // 6. Re-render the page from fresh data (ensures DOM matches data.json)
    setTimeout(function() {
      renderPage(storyData);
      wireEvents();
      disableEditMode();
    }, 1200);

  } catch(err) {
    saveBtn.disabled = false;
    statusEl.textContent = 'Error: ' + err.message;
    // Re-enable editing
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
  // Lang toggle — wire directly on elements, not via innerHTML string
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    var code = btn.getAttribute('data-lang');
    btn.onclick = function(){ setLang(code); };
  });
  document.querySelectorAll('.remove-lang').forEach(function(btn) {
    var code = btn.getAttribute('data-remove-lang');
    btn.onclick = function(){ removeLanguage(code); };
  });

  // Lang add dropdown — handled by toggleLangPicker() directly
  // (custom button picker, no native select needed)

  setLang('en');

  // Edit FAB
  document.getElementById('edit-fab').addEventListener('click', function() {
    document.getElementById('token-modal').classList.add('visible');
    setTimeout(function(){ document.getElementById('token-input').focus(); }, 50);
  });

  // Token submit
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

  // Share button
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

  // ?edit=1 auto-open
  if (new URLSearchParams(window.location.search).get('edit') === '1') {
    setTimeout(function(){
      document.getElementById('token-modal').classList.add('visible');
      setTimeout(function(){ document.getElementById('token-input').focus(); }, 80);
    }, 300);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  // Detect old v8 pages (they have activeLangs but not GH_DATA_URL)
  if (typeof GH_DATA_URL === 'undefined') {
    document.body.innerHTML = '<div style="padding:40px;font-family:Arial,sans-serif;background:#fff5f5;border:2px solid #EF363D;border-radius:12px;margin:40px;color:#c0272d">' +
      '<h2 style="margin-bottom:12px">⚠ This story needs to be re-published</h2>' +
      '<p style="line-height:1.6;color:#555">This story was created with an older version of the platform. Please re-publish it from the <a href="/new/" style="color:#EF363D">story creator</a> to upgrade it to the current architecture.</p></div>';
    return;
  }

  // Fetch data.json
  try {
    var r = await fetch(GH_DATA_URL + '?v=' + Date.now());
    if (!r.ok) throw new Error('Could not load story data (HTTP ' + r.status + ')');
    storyData = await r.json();
    // Only use STORY_META.hasLogo as fallback if data.json doesn't have it
    if (typeof storyData.hasLogo === 'undefined') {
      storyData.hasLogo = STORY_META.hasLogo;
    }
    // Sync STORY_META with data.json truth
    STORY_META.hasLogo = storyData.hasLogo;
  } catch(err) {
    document.body.innerHTML = '<div style="padding:40px;font-family:Arial;color:#c0272d"><h2>Could not load story</h2><p>' + err.message + '</p></div>';
    return;
  }

  renderPage(storyData);
  wireEvents();
});
