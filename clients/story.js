// Prophix Client Story — story.js v6
// Block-based multilingual architecture.
// Each language = one self-contained <div class="lang-block" id="block-XX">
//
// Required globals (set inline in the page before this script):
//   GH_REPO, GH_FILE, GH_CLIENT_FOLDER, EDIT_PASSWORD,
//   activeLangs, LANG_NAMES, LANG_LABELS, LANG_FULL_NAMES

var sessionToken = '';
var cachedSha = '';
var currentLang = 'en';

// Selectors inside a lang-block that become contenteditable in edit mode
var EDITABLE_SELECTORS = [
  '.hero-tag', 'h1', '.hero-desc',
  '.sec-label', '.story-sec h2', '.story-sec p', '.story-sec li',
  '.clip-label', '.clip-quote',
  '.sidebar-card h3', '.sidebar-card p',
  '.result-item',
  '.stat-n', '.stat-l',
  '.krs-number', '.krs-label', '.krs-desc',
  '.page-footer strong'
];

// ── Language toggle ───────────────────────────────────────────────────────────
function setLang(code) {
  currentLang = code;
  document.querySelectorAll('.lang-block').forEach(function(b) {
    b.classList.toggle('active', b.id === 'block-' + code);
  });
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-lang') === code);
  });
  if (document.body.classList.contains('edit-mode')) {
    document.getElementById('save-status').textContent = 'Editing: ' + code.toUpperCase();
  }
}

// ── Add language ──────────────────────────────────────────────────────────────
function addLanguage(code) {
  if (!code || activeLangs.indexOf(code) > -1) return;
  activeLangs.push(code);

  var enBlock = document.getElementById('block-en');
  var newBlock = enBlock.cloneNode(true);
  newBlock.id = 'block-' + code;
  newBlock.classList.remove('active');

  newBlock.querySelectorAll(EDITABLE_SELECTORS.join(',')).forEach(function(el) {
    el.removeAttribute('contenteditable');
    if (el.textContent.indexOf('[' + LANG_NAMES[code] + ']') === -1) {
      el.textContent = '[' + LANG_NAMES[code] + '] ' + el.textContent;
    }
  });

  var heroTag = newBlock.querySelector('.hero-tag');
  if (heroTag && LANG_LABELS[code]) heroTag.textContent = LANG_LABELS[code];

  document.getElementById('lang-blocks').appendChild(newBlock);

  var toggle = document.getElementById('lang-toggle');
  var addWrap = document.getElementById('lang-add-wrap');

  var btn = document.createElement('button');
  btn.className = 'lang-btn';
  btn.setAttribute('data-lang', code);
  btn.textContent = LANG_NAMES[code];
  btn.addEventListener('click', function() { setLang(code); });
  toggle.insertBefore(btn, addWrap);

  var rb = document.createElement('button');
  rb.className = 'lang-btn remove-lang';
  rb.setAttribute('data-remove-lang', code);
  rb.innerHTML = '&times;';
  rb.style.display = document.body.classList.contains('edit-mode') ? '' : 'none';
  rb.addEventListener('click', function() { removeLanguage(code); });
  toggle.insertBefore(rb, addWrap);

  var opt = document.querySelector('#lang-add-select option[value="' + code + '"]');
  if (opt) opt.remove();

  setLang(code);
  if (document.body.classList.contains('edit-mode')) makeBlockEditable(newBlock);
}

// ── Remove language ───────────────────────────────────────────────────────────
function removeLanguage(code) {
  if (code === 'en') return;
  if (!confirm('Remove ' + LANG_NAMES[code] + '? All content for this language will be lost.')) return;
  activeLangs = activeLangs.filter(function(l) { return l !== code; });
  var block = document.getElementById('block-' + code);
  if (block) block.remove();
  var btn = document.querySelector('.lang-btn[data-lang="' + code + '"]');
  if (btn) btn.remove();
  var rb = document.querySelector('.remove-lang[data-remove-lang="' + code + '"]');
  if (rb) rb.remove();
  if (LANG_FULL_NAMES[code]) {
    var sel = document.getElementById('lang-add-select');
    if (sel) {
      var opt = document.createElement('option');
      opt.value = code; opt.textContent = LANG_FULL_NAMES[code];
      sel.appendChild(opt);
    }
  }
  if (currentLang === code) setLang('en');
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function makeBlockEditable(block) {
  block.querySelectorAll(EDITABLE_SELECTORS.join(',')).forEach(function(el) {
    el.contentEditable = 'true';
  });
}

function enableEditMode() {
  document.body.classList.add('edit-mode');
  document.querySelectorAll('.lang-block').forEach(makeBlockEditable);
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  document.getElementById('save-status').textContent = 'Editing: ' + currentLang.toUpperCase();
  document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = ''; });
  // Show edit-only controls
  document.querySelectorAll('.edit-only').forEach(function(el) { el.style.display = ''; });
}

function disableEditMode() {
  document.body.classList.remove('edit-mode');
  document.querySelectorAll('[contenteditable]').forEach(function(el) { el.removeAttribute('contenteditable'); });
  document.getElementById('edit-fab').classList.remove('hidden');
  document.getElementById('edit-toolbar').classList.remove('visible');
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-btn').disabled = false;
  document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = 'none'; });
  document.querySelectorAll('.edit-only').forEach(function(el) { el.style.display = 'none'; });
}

function closeModal() {
  document.getElementById('pw-modal').classList.remove('visible');
  document.getElementById('pw-input').value = '';
  document.getElementById('token-input').value = '';
  document.getElementById('pw-error').textContent = '';
}

// ── Section management ────────────────────────────────────────────────────────
function addSection(btn) {
  // Find the lang-block this button lives in
  var block = btn.closest('.lang-block');
  var container = block.querySelector('.sections-container');

  var sec = document.createElement('div');
  sec.className = 'story-sec';
  sec.innerHTML =
    '<button class="sec-delete-btn edit-only" onclick="deleteSection(this)" title="Remove section">✕</button>' +
    '<div class="sec-label" contenteditable="true">Section label</div>' +
    '<h2 contenteditable="true">Section heading</h2>' +
    '<p contenteditable="true">Write your content here.</p>';

  container.insertBefore(sec, btn);
}

function deleteSection(btn) {
  var sec = btn.closest('.story-sec');
  if (!confirm('Delete this section?')) return;
  sec.remove();
}

// ── Clip management ───────────────────────────────────────────────────────────
function addClipInline(btn) {
  var card = buildClipCard(null, null, null);
  btn.parentNode.insertBefore(card, btn);
}

function buildClipCard(label, quote, audioSrc) {
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width','14'); svg.setAttribute('height','14');
  svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','#EF363D');
  var path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d','M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
  svg.appendChild(path);

  var card = document.createElement('div');
  card.className = 'clip-card';

  var rb = document.createElement('button');
  rb.className = 'clip-remove-btn edit-only';
  rb.innerHTML = '&times;';
  rb.title = 'Remove clip';
  rb.addEventListener('click', function() { if (confirm('Remove this clip?')) card.remove(); });

  var lbl = document.createElement('div');
  lbl.className = 'clip-label';
  lbl.appendChild(svg);
  lbl.appendChild(document.createTextNode(label || 'Clip title'));

  var qt = document.createElement('div');
  qt.className = 'clip-quote';
  qt.textContent = quote || '"Quote here."';

  var aud = document.createElement('audio');
  aud.controls = true; aud.preload = 'metadata';
  aud.style.cssText = 'width:100%;height:40px;border-radius:6px;accent-color:#EF363D;display:block';
  var src = document.createElement('source');
  src.type = 'audio/mpeg';
  if (audioSrc) src.src = audioSrc;
  aud.appendChild(src);

  var upBtn = document.createElement('button');
  upBtn.className = 'upload-audio-btn edit-only';
  upBtn.textContent = 'Upload MP3';
  upBtn.addEventListener('click', function() { uploadAudio(upBtn); });

  var pl = document.createElement('div');
  pl.className = 'clip-player';
  pl.appendChild(aud); pl.appendChild(upBtn);

  card.appendChild(rb); card.appendChild(lbl); card.appendChild(qt); card.appendChild(pl);
  return card;
}

// On edit mode enable, add delete buttons to existing clips
function addDeleteButtonsToExistingClips() {
  document.querySelectorAll('.clip-card').forEach(function(card) {
    if (!card.querySelector('.clip-remove-btn')) {
      var rb = document.createElement('button');
      rb.className = 'clip-remove-btn edit-only';
      rb.innerHTML = '&times;';
      rb.title = 'Remove clip';
      rb.addEventListener('click', function() { if (confirm('Remove this clip?')) card.remove(); });
      card.insertBefore(rb, card.firstChild);
    }
    // Also show upload button
    var upBtn = card.querySelector('.upload-audio-btn');
    if (!upBtn) {
      upBtn = document.createElement('button');
      upBtn.className = 'upload-audio-btn edit-only';
      upBtn.textContent = 'Upload MP3';
      upBtn.addEventListener('click', function() { uploadAudio(upBtn); });
      var player = card.querySelector('.clip-player');
      if (player) player.appendChild(upBtn);
    }
  });
}

// ── Products management ───────────────────────────────────────────────────────
var PROPHIX_PRODUCTS = [
  'Financial Consolidation',
  'FPA+',
  'Account Reconciliation',
  'Cashflow Management'
];

function openProductsEditor() {
  var panel = document.getElementById('products-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; return; }

  // Build the panel once
  panel = document.createElement('div');
  panel.id = 'products-panel';
  panel.style.cssText = 'position:absolute;background:#fff;border:1px solid #E0DFF0;border-radius:8px;padding:14px 16px;z-index:200;min-width:220px;box-shadow:0 4px 16px rgba(0,0,0,.12);';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#1A1A2E;margin-bottom:10px';
  title.textContent = 'Applications deployed';
  panel.appendChild(title);

  var appsDisplay = document.querySelector('.apps-display');
  var currentApps = [];
  if (appsDisplay) {
    appsDisplay.querySelectorAll('.app-tag span:last-child').forEach(function(s) {
      currentApps.push(s.textContent.trim());
    });
  }

  PROPHIX_PRODUCTS.forEach(function(p) {
    var row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 0;cursor:pointer';
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = p;
    cb.checked = currentApps.indexOf(p) > -1;
    row.appendChild(cb);
    row.appendChild(document.createTextNode(p));
    panel.appendChild(row);
  });

  var applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply';
  applyBtn.style.cssText = 'margin-top:10px;width:100%;background:#EF363D;color:#fff;border:none;border-radius:5px;padding:7px;font-size:13px;font-weight:700;cursor:pointer;font-family:Arial,sans-serif';
  applyBtn.addEventListener('click', function() {
    var selected = [];
    panel.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb) { selected.push(cb.value); });
    updateAppsDisplay(selected);
    panel.style.display = 'none';
  });
  panel.appendChild(applyBtn);

  var editBtn = document.getElementById('edit-products-btn');
  editBtn.parentNode.style.position = 'relative';
  editBtn.parentNode.appendChild(panel);
}

function updateAppsDisplay(products) {
  var display = document.querySelector('.apps-display');
  if (!display) return;
  display.innerHTML = products.map(function(p) {
    return '<div class="app-tag"><span class="app-dot"></span><span>' + p + '</span></div>';
  }).join('');
}

// ── Logo upload ───────────────────────────────────────────────────────────────
function uploadLogo(btn) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var b64 = e.target.result.split(',')[1];
      btn.textContent = 'Uploading…';
      var ext = file.name.split('.').pop().toLowerCase();
      var filename = 'logo.' + ext;
      fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_CLIENT_FOLDER + filename, {
        method: 'PUT',
        headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
        body: JSON.stringify({message:'Logo: '+filename, content:b64})
      }).then(function(r) { return r.json(); }).then(function(d) {
        if (d.content) {
          var img = document.querySelector('.hero-client-logo');
          if (img) { img.src = filename + '?v=' + Date.now(); img.style.display = 'block'; }
          btn.textContent = 'Logo updated ✓';
        } else { btn.textContent = 'Upload failed'; }
      }).catch(function() { btn.textContent = 'Upload failed'; });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── Audio upload ──────────────────────────────────────────────────────────────
function uploadAudio(btn) {
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'audio/mpeg,.mp3';
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var b64 = e.target.result.split(',')[1];
      btn.textContent = 'Uploading…';
      fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_CLIENT_FOLDER + file.name, {
        method: 'PUT',
        headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
        body: JSON.stringify({message:'Audio: '+file.name, content:b64})
      }).then(function(r) { return r.json(); }).then(function(d) {
        if (d.content) {
          var audioEl = btn.closest('.clip-player').querySelector('audio source');
          if (audioEl) { audioEl.src = file.name; audioEl.parentNode.load(); }
          btn.textContent = '✓ ' + file.name;
        } else { btn.textContent = 'Failed'; }
      }).catch(function() { btn.textContent = 'Failed'; });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── Save to GitHub ────────────────────────────────────────────────────────────
async function saveToGitHub() {
  var statusEl = document.getElementById('save-status');
  var saveBtn = document.getElementById('save-btn');
  statusEl.textContent = 'Saving…';
  saveBtn.disabled = true;

  try {
    var sha = cachedSha;
    if (!sha) {
      var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_FILE, {
        headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
      });
      if (!r.ok) throw new Error('Auth failed');
      sha = (await r.json()).sha;
    }

    // Snapshot clean DOM
    document.querySelectorAll('[contenteditable]').forEach(function(el){ el.removeAttribute('contenteditable'); });
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-fab').classList.remove('hidden');
    document.getElementById('edit-toolbar').classList.remove('visible');
    document.querySelectorAll('.remove-lang').forEach(function(b){ b.style.display='none'; });
    document.querySelectorAll('.edit-only').forEach(function(el){ el.style.display='none'; });
    var productsPanel = document.getElementById('products-panel');
    if (productsPanel) productsPanel.style.display = 'none';

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Restore edit state
    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
    document.querySelectorAll('.lang-block').forEach(makeBlockEditable);
    document.querySelectorAll('.remove-lang').forEach(function(b){ b.style.display=''; });
    document.querySelectorAll('.edit-only').forEach(function(el){ el.style.display=''; });
    statusEl.textContent = 'Saving…';
    saveBtn.disabled = true;

    var enc = btoa(unescape(encodeURIComponent(html)));
    var pr = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_FILE, {
      method: 'PUT',
      headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body: JSON.stringify({message:'Live edit', content:enc, sha:sha})
    });

    if (pr.ok) {
      var pd = await pr.json();
      cachedSha = pd.content.sha;
      statusEl.textContent = 'Saved ✓';
      setTimeout(disableEditMode, 1500);
    } else {
      var err = await pr.json();
      if (err.message && err.message.indexOf('conflict') > -1) { cachedSha = ''; statusEl.textContent = 'Conflict — retry'; }
      else statusEl.textContent = 'Error: ' + (err.message || 'Failed');
      saveBtn.disabled = false;
    }
  } catch(e) {
    statusEl.textContent = 'Error: ' + e.message;
    saveBtn.disabled = false;
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Lang buttons
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.getAttribute('data-lang')); });
  });
  document.querySelectorAll('.remove-lang').forEach(function(btn) {
    var code = btn.getAttribute('data-remove-lang');
    btn.addEventListener('click', function() { removeLanguage(code); });
  });

  var langSel = document.getElementById('lang-add-select');
  if (langSel) {
    langSel.addEventListener('change', function() {
      if (this.value) { addLanguage(this.value); this.value = ''; }
    });
  }

  setLang('en');

  // Edit FAB
  document.getElementById('edit-fab').addEventListener('click', function() {
    document.getElementById('pw-modal').classList.add('visible');
    setTimeout(function(){ document.getElementById('pw-input').focus(); }, 50);
  });

  // Auth
  document.getElementById('pw-submit').addEventListener('click', function() {
    var pw = document.getElementById('pw-input').value;
    var token = document.getElementById('token-input').value.trim().replace(/[^\x20-\x7E]/g,'');
    document.getElementById('pw-error').textContent = '';
    if (pw !== EDIT_PASSWORD) { document.getElementById('pw-error').textContent = 'Incorrect password.'; return; }
    if (!token) { document.getElementById('pw-error').textContent = 'Please paste your GitHub token.'; return; }
    sessionToken = token;
    closeModal();
    addDeleteButtonsToExistingClips();
    enableEditMode();
  });
  document.getElementById('pw-cancel').addEventListener('click', closeModal);
  ['pw-input','token-input'].forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
      if (e.key==='Enter') document.getElementById('pw-submit').click();
      if (e.key==='Escape') closeModal();
    });
  });

  document.getElementById('save-btn').addEventListener('click', saveToGitHub);
  document.getElementById('cancel-btn').addEventListener('click', disableEditMode);

  // Logo upload button
  var logoBtn = document.getElementById('upload-logo-btn');
  if (logoBtn) logoBtn.addEventListener('click', function() { uploadLogo(logoBtn); });

  // Products edit button
  var prodBtn = document.getElementById('edit-products-btn');
  if (prodBtn) prodBtn.addEventListener('click', openProductsEditor);
});
