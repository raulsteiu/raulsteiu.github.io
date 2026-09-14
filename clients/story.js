// Prophix Client Story — story.js v5 (block-based language architecture)
// Each language is one self-contained <div class="lang-block" id="block-XX">
// Toggle = show one block, hide others. Simple, robust, saves perfectly.
//
// Required globals (set inline before this script):
//   GH_REPO, GH_FILE, GH_CLIENT_FOLDER, EDIT_PASSWORD,
//   activeLangs, LANG_NAMES, LANG_LABELS, LANG_FULL_NAMES

var sessionToken = '';
var cachedSha = '';
var currentLang = 'en';

// Elements inside a lang-block that become editable in edit mode
var EDITABLE_SELECTORS = [
  '.hero-tag', 'h1', '.hero-desc',
  '.sec-label', '.story-sec h2', '.story-sec p',
  '.clip-label', '.clip-quote',
  '.sidebar-card h3', '.sidebar-card p',
  '.result-item', '.stat-n', '.stat-l',
  '.page-footer strong'
];

// ── Language toggle ───────────────────────────────────────────────────────────
function setLang(code) {
  currentLang = code;

  // Show only the active block
  document.querySelectorAll('.lang-block').forEach(function(block) {
    block.classList.toggle('active', block.id === 'block-' + code);
  });

  // Update toggle buttons
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === code);
  });

  // Update status if in edit mode
  if (document.body.classList.contains('edit-mode')) {
    document.getElementById('save-status').textContent = 'Editing: ' + code.toUpperCase();
  }
}

// ── Add language ──────────────────────────────────────────────────────────────
function addLanguage(code) {
  if (!code || activeLangs.indexOf(code) > -1) return;
  activeLangs.push(code);

  // 1. Clone the EN block entirely
  var enBlock = document.getElementById('block-en');
  var newBlock = enBlock.cloneNode(true);
  newBlock.id = 'block-' + code;
  newBlock.classList.remove('active');

  // 2. Prefix all text content in the new block with [XX]
  newBlock.querySelectorAll(EDITABLE_SELECTORS.join(',')).forEach(function(el) {
    el.removeAttribute('contenteditable');
    // Only prefix if not already prefixed
    if (el.textContent.indexOf('[' + LANG_NAMES[code] + ']') === -1) {
      el.textContent = '[' + LANG_NAMES[code] + '] ' + el.textContent;
    }
  });

  // Update hero-lang subtitle
  var heroTag = newBlock.querySelector('.hero-tag');
  if (heroTag && LANG_LABELS[code]) heroTag.textContent = LANG_LABELS[code];

  // Insert after last lang-block
  var blocksContainer = document.getElementById('lang-blocks');
  blocksContainer.appendChild(newBlock);

  // 3. Add toggle button + remove button to lang-toggle
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

  // 4. Remove from dropdown
  var opt = document.querySelector('#lang-add-select option[value="' + code + '"]');
  if (opt) opt.remove();

  // 5. Switch to the new language
  setLang(code);

  // 6. If in edit mode, make the new block editable
  if (document.body.classList.contains('edit-mode')) {
    makeBlockEditable(newBlock);
  }
}

// ── Remove language ───────────────────────────────────────────────────────────
function removeLanguage(code) {
  if (code === 'en') return;
  if (!confirm('Remove ' + LANG_NAMES[code] + '? All content for this language will be deleted.')) return;

  activeLangs = activeLangs.filter(function(l) { return l !== code; });

  // Remove block
  var block = document.getElementById('block-' + code);
  if (block) block.remove();

  // Remove toggle buttons
  var btn = document.querySelector('.lang-btn[data-lang="' + code + '"]');
  if (btn) btn.remove();
  var rb = document.querySelector('.remove-lang[data-remove-lang="' + code + '"]');
  if (rb) rb.remove();

  // Re-add to dropdown
  if (LANG_FULL_NAMES[code]) {
    var sel = document.getElementById('lang-add-select');
    if (sel) {
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = LANG_FULL_NAMES[code];
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

function makeBlockReadonly(block) {
  block.querySelectorAll('[contenteditable]').forEach(function(el) {
    el.removeAttribute('contenteditable');
  });
}

function enableEditMode() {
  document.body.classList.add('edit-mode');
  // Make ALL lang blocks editable (so content is preserved when switching langs)
  document.querySelectorAll('.lang-block').forEach(function(block) {
    makeBlockEditable(block);
  });
  // Also make stats editable
  document.querySelectorAll('.stat-n, .stat-l').forEach(function(el) {
    el.contentEditable = 'true';
  });
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  document.getElementById('save-status').textContent = 'Editing: ' + currentLang.toUpperCase();
  // Show remove-lang buttons
  document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = ''; });
}

function disableEditMode() {
  document.body.classList.remove('edit-mode');
  document.querySelectorAll('[contenteditable]').forEach(function(el) {
    el.removeAttribute('contenteditable');
  });
  document.getElementById('edit-fab').classList.remove('hidden');
  document.getElementById('edit-toolbar').classList.remove('visible');
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-btn').disabled = false;
  // Hide remove-lang buttons
  document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = 'none'; });
}

function closeModal() {
  document.getElementById('pw-modal').classList.remove('visible');
  document.getElementById('pw-input').value = '';
  document.getElementById('token-input').value = '';
  document.getElementById('pw-error').textContent = '';
}

// ── Add clip inline ───────────────────────────────────────────────────────────
function addClipInline(btn) {
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
  rb.className = 'clip-remove-btn';
  rb.innerHTML = '&times;';
  rb.addEventListener('click', function() { card.remove(); });

  var lbl = document.createElement('div');
  lbl.className = 'clip-label';
  lbl.contentEditable = 'true';
  lbl.appendChild(svg);
  lbl.appendChild(document.createTextNode('Clip Title'));

  var qt = document.createElement('div');
  qt.className = 'clip-quote';
  qt.contentEditable = 'true';
  qt.textContent = '"Quote here."';

  var aud = document.createElement('audio');
  aud.controls = true; aud.preload = 'metadata';
  aud.style.cssText = 'width:100%;height:40px;border-radius:6px;accent-color:#EF363D;display:block';
  var src = document.createElement('source'); src.type = 'audio/mpeg';
  aud.appendChild(src);

  var upBtn = document.createElement('button');
  upBtn.className = 'upload-audio-btn';
  upBtn.style.display = 'inline-block';
  upBtn.textContent = 'Upload MP3';
  upBtn.addEventListener('click', function() { uploadAudio(upBtn); });

  var pl = document.createElement('div');
  pl.className = 'clip-player';
  pl.appendChild(aud); pl.appendChild(upBtn);

  card.appendChild(rb); card.appendChild(lbl); card.appendChild(qt); card.appendChild(pl);
  btn.parentNode.insertBefore(card, btn);
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
      btn.textContent = 'Uploading...';
      fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_CLIENT_FOLDER + file.name, {
        method: 'PUT',
        headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
        body: JSON.stringify({message:'Audio: '+file.name, content:b64})
      }).then(function(r){return r.json();}).then(function(d){
        if (d.content) {
          var audioEl = btn.closest('.clip-player').querySelector('audio source');
          if (audioEl) { audioEl.src = file.name; audioEl.parentNode.load(); }
          btn.textContent = 'Done: ' + file.name;
        } else { btn.textContent = 'Failed'; }
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── Save to GitHub ────────────────────────────────────────────────────────────
async function saveToGitHub() {
  var statusEl = document.getElementById('save-status');
  var saveBtn = document.getElementById('save-btn');
  statusEl.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    // Get SHA
    var sha = cachedSha;
    if (!sha) {
      var r = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_FILE, {
        headers: {'Authorization':'Bearer '+sessionToken, 'Accept':'application/vnd.github+json'}
      });
      if (!r.ok) throw new Error('Auth failed');
      sha = (await r.json()).sha;
    }

    // Clean DOM for capture (manual, no helper calls to avoid side effects)
    document.querySelectorAll('[contenteditable]').forEach(function(el) { el.removeAttribute('contenteditable'); });
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-fab').classList.remove('hidden');
    document.getElementById('edit-toolbar').classList.remove('visible');
    document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = 'none'; });

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Restore edit state
    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
    document.querySelectorAll('.lang-block').forEach(function(block) { makeBlockEditable(block); });
    document.querySelectorAll('.stat-n, .stat-l').forEach(function(el) { el.contentEditable = 'true'; });
    document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = ''; });
    statusEl.textContent = 'Saving...';
    saveBtn.disabled = true;

    // Push
    var enc = btoa(unescape(encodeURIComponent(html)));
    var pr = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_FILE, {
      method: 'PUT',
      headers: {'Authorization':'Bearer '+sessionToken, 'Accept':'application/vnd.github+json', 'Content-Type':'application/json'},
      body: JSON.stringify({message:'Live edit', content:enc, sha:sha})
    });

    if (pr.ok) {
      var pd = await pr.json();
      cachedSha = pd.content.sha;
      statusEl.textContent = 'Saved!';
      setTimeout(function() { disableEditMode(); }, 1500);
    } else {
      var err = await pr.json();
      if (err.message && err.message.indexOf('conflict') > -1) { cachedSha = ''; statusEl.textContent = 'Conflict — try again'; }
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
  // Wire lang buttons
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.getAttribute('data-lang')); });
  });

  // Wire remove buttons (for build-time langs)
  document.querySelectorAll('.remove-lang').forEach(function(btn) {
    var code = btn.getAttribute('data-remove-lang');
    btn.addEventListener('click', function() { removeLanguage(code); });
  });

  // Lang add dropdown
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
    setTimeout(function() { document.getElementById('pw-input').focus(); }, 50);
  });

  // Auth
  document.getElementById('pw-submit').addEventListener('click', function() {
    var pw = document.getElementById('pw-input').value;
    var token = document.getElementById('token-input').value.trim().replace(/[^\x20-\x7E]/g, '');
    document.getElementById('pw-error').textContent = '';
    if (pw !== EDIT_PASSWORD) { document.getElementById('pw-error').textContent = 'Incorrect password.'; return; }
    if (!token) { document.getElementById('pw-error').textContent = 'Please paste your GitHub token.'; return; }
    sessionToken = token;
    closeModal();
    enableEditMode();
  });
  document.getElementById('pw-cancel').addEventListener('click', closeModal);
  ['pw-input','token-input'].forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('pw-submit').click();
      if (e.key === 'Escape') closeModal();
    });
  });
  document.getElementById('save-btn').addEventListener('click', saveToGitHub);
  document.getElementById('cancel-btn').addEventListener('click', disableEditMode);
});
