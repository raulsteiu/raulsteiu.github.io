// Prophix Client Story — shared runtime v4
// Required globals set inline before this script loads:
//   GH_REPO, GH_FILE, GH_CLIENT_FOLDER, EDIT_PASSWORD,
//   activeLangs, LANG_NAMES, LANG_LABELS

var sessionToken = '';
var cachedSha = '';
var currentLang = 'en';

var EDITABLE = [
  '.story-sec .sec-label', '.story-sec h2', '.story-sec p', '.story-sec li',
  '.clip-quote', '.clip-label span',
  '.sidebar-card p', '.sidebar-card h3',
  '.result-item',
  '.stat-n', '.stat-l',
  '.hero h1', '.hero-desc', '.hero-tag',
  '.page-footer',
  '#participants-list strong', '#participants-list span'
];

var LANG_FULL = {
  fr:'French (FR)', nl:'Dutch (NL)', de:'German (DE)',
  it:'Italian (IT)', es:'Spanish (ES)', pt:'Portuguese (PT)'
};

// ── Language toggle ───────────────────────────────────────────────────────────
function setLang(l) {
  currentLang = l;
  document.querySelectorAll('[data-lang]').forEach(function(el) {
    el.style.display = el.getAttribute('data-lang') === l ? '' : 'none';
  });
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-lang') === l);
  });
  // Update status bar if in edit mode
  var statusEl = document.getElementById('save-status');
  if (statusEl && document.body.classList.contains('edit-mode')) {
    statusEl.textContent = 'Editing: ' + l.toUpperCase();
  }
}

// ── Add / Remove language ─────────────────────────────────────────────────────
function addLanguage(code) {
  if (!code || activeLangs.indexOf(code) > -1) return;
  activeLangs.push(code);

  var toggle = document.getElementById('lang-toggle');
  var addWrap = document.getElementById('lang-add-wrap');

  // 1. Add toggle button
  var btn = document.createElement('button');
  btn.className = 'lang-btn';
  btn.setAttribute('data-lang', code);
  btn.textContent = LANG_NAMES[code];
  btn.addEventListener('click', function() { setLang(code); });
  toggle.insertBefore(btn, addWrap);

  // 2. Add remove button (hidden unless in edit mode)
  var rb = document.createElement('button');
  rb.className = 'lang-btn remove-lang';
  rb.setAttribute('data-remove-lang', code);
  rb.innerHTML = '&times;';
  rb.style.display = document.body.classList.contains('edit-mode') ? '' : 'none';
  rb.addEventListener('click', function() { removeLanguage(code); });
  toggle.insertBefore(rb, addWrap);

  // 3. Clone all EN data-lang elements and create [code] versions
  // Hero tag
  _cloneForLang('.hero-tag[data-lang="en"]', code);
  // Hero h1
  _cloneForLang('h1[data-lang="en"]', code);
  // Hero desc
  _cloneForLang('.hero-desc[data-lang="en"]', code);
  // Story sections
  document.querySelectorAll('.story-sec[data-lang="en"]').forEach(function(el) {
    _cloneElement(el, code);
  });
  // Clip labels
  document.querySelectorAll('.clip-label span[data-lang="en"]').forEach(function(el) {
    _cloneElement(el, code);
  });
  // Clip quotes
  document.querySelectorAll('.clip-quote[data-lang="en"]').forEach(function(el) {
    _cloneElement(el, code);
  });
  // Sidebar h3 and p
  document.querySelectorAll('.sidebar-card h3[data-lang="en"], .sidebar-card p[data-lang="en"]').forEach(function(el) {
    _cloneElement(el, code);
  });
  // Result items
  document.querySelectorAll('.result-item[data-lang="en"]').forEach(function(el) {
    _cloneElement(el, code);
  });

  // 4. Remove from dropdown
  var opt = document.querySelector('#lang-add-select option[value="' + code + '"]');
  if (opt) opt.remove();

  // 5. Switch to new language and make editable if in edit mode
  setLang(code);
  if (document.body.classList.contains('edit-mode')) {
    _makeEditable();
  }
}

function _cloneForLang(selector, code) {
  var el = document.querySelector(selector);
  if (el) _cloneElement(el, code);
}

function _cloneElement(el, code) {
  // Don't clone if one already exists
  if (el.parentNode.querySelector('[data-lang="' + code + '"]')) return;
  var cl = el.cloneNode(true);
  cl.setAttribute('data-lang', code);
  cl.style.display = 'none';
  cl.removeAttribute('contenteditable');
  el.parentNode.insertBefore(cl, el.nextSibling);
}

function removeLanguage(code) {
  if (code === 'en') return; // never remove EN
  if (!confirm('Remove ' + LANG_NAMES[code] + '? All content for this language will be deleted.')) return;

  activeLangs = activeLangs.filter(function(l) { return l !== code; });

  // Remove all elements for this language
  document.querySelectorAll('[data-lang="' + code + '"]').forEach(function(el) { el.remove(); });
  document.querySelectorAll('[data-remove-lang="' + code + '"]').forEach(function(el) { el.remove(); });

  // Re-add to dropdown
  var sel = document.getElementById('lang-add-select');
  if (sel && LANG_FULL[code]) {
    var opt = document.createElement('option');
    opt.value = code;
    opt.textContent = LANG_FULL[code];
    sel.appendChild(opt);
  }

  if (currentLang === code) setLang('en');
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function _makeEditable() {
  EDITABLE.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.contentEditable = 'true';
    });
  });
}

function _makeReadonly() {
  EDITABLE.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.removeAttribute('contenteditable');
    });
  });
}

function _showRemoveBtns(show) {
  document.querySelectorAll('.remove-lang').forEach(function(b) {
    b.style.display = show ? '' : 'none';
  });
}

function enableEditMode() {
  document.body.classList.add('edit-mode');
  _makeEditable();
  _showRemoveBtns(true);
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  document.getElementById('save-status').textContent = 'Editing: ' + currentLang.toUpperCase();
}

function disableEditMode() {
  document.body.classList.remove('edit-mode');
  _makeReadonly();
  _showRemoveBtns(false);
  document.getElementById('edit-fab').classList.remove('hidden');
  document.getElementById('edit-toolbar').classList.remove('visible');
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-btn').disabled = false;
}

function closeModal() {
  document.getElementById('pw-modal').classList.remove('visible');
  document.getElementById('pw-input').value = '';
  document.getElementById('token-input').value = '';
  document.getElementById('pw-error').textContent = '';
}

// ── Audio clips ───────────────────────────────────────────────────────────────
function addClipInline(btn) {
  var card = document.createElement('div');
  card.className = 'clip-card';

  // Remove button
  var rb = document.createElement('button');
  rb.className = 'clip-remove-btn';
  rb.innerHTML = '&times;';
  rb.addEventListener('click', function() { card.remove(); });

  // SVG icon
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width','14'); svg.setAttribute('height','14');
  svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','#EF363D');
  var path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d','M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
  svg.appendChild(path);

  // Label with one span per active lang
  var lbl = document.createElement('div');
  lbl.className = 'clip-label';
  lbl.appendChild(svg);
  activeLangs.forEach(function(l) {
    var sp = document.createElement('span');
    sp.setAttribute('data-lang', l);
    sp.contentEditable = 'true';
    sp.textContent = 'Clip Title';
    sp.style.display = l === currentLang ? '' : 'none';
    lbl.appendChild(sp);
  });

  // Quote div per active lang
  activeLangs.forEach(function(l) {
    var qt = document.createElement('div');
    qt.className = 'clip-quote';
    qt.setAttribute('data-lang', l);
    qt.contentEditable = 'true';
    qt.textContent = '"Quote here."';
    qt.style.display = l === currentLang ? '' : 'none';
    card.appendChild(qt);  // will be after lbl once we append lbl
  });

  // Audio player
  var aud = document.createElement('audio');
  aud.controls = true; aud.preload = 'metadata';
  aud.style.cssText = 'width:100%;height:40px;border-radius:6px;accent-color:#EF363D;display:block';
  var src = document.createElement('source'); src.type = 'audio/mpeg';
  aud.appendChild(src);
  var upBtn = document.createElement('button');
  upBtn.className = 'upload-audio-btn';
  upBtn.textContent = 'Upload MP3';
  upBtn.addEventListener('click', function() { uploadAudio(upBtn); });
  var pl = document.createElement('div');
  pl.className = 'clip-player';
  pl.appendChild(aud); pl.appendChild(upBtn);

  // Assemble: rb, lbl, quotes (already appended above), pl
  card.insertBefore(rb, card.firstChild);
  card.insertBefore(lbl, card.firstChild.nextSibling);
  card.appendChild(pl);
  btn.parentNode.insertBefore(card, btn);
}

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
          btn.closest('.clip-player').querySelector('audio source').src = file.name;
          btn.closest('.clip-player').querySelector('audio').load();
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
      if (!r.ok) throw new Error('Auth failed — check your token');
      sha = (await r.json()).sha;
    }

    // Prepare DOM for clean capture:
    // - remove contenteditable attrs
    // - hide toolbar/fab
    // - hide remove-lang buttons
    // NOTE: do NOT call disableEditMode() — that fires side effects
    // Do it manually and restore manually
    _makeReadonly();
    _showRemoveBtns(false);
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-fab').classList.remove('hidden');
    document.getElementById('edit-toolbar').classList.remove('visible');

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Restore edit state
    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
    _makeEditable();
    _showRemoveBtns(true);
    statusEl.textContent = 'Saving...';
    saveBtn.disabled = true;

    // Push to GitHub
    var enc = btoa(unescape(encodeURIComponent(html)));
    var pr = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_FILE, {
      method: 'PUT',
      headers: {'Authorization':'Bearer '+sessionToken, 'Accept':'application/vnd.github+json', 'Content-Type':'application/json'},
      body: JSON.stringify({message: 'Live edit', content: enc, sha: sha})
    });

    if (pr.ok) {
      var pd = await pr.json();
      cachedSha = pd.content.sha;
      statusEl.textContent = 'Saved!';
      setTimeout(function() { disableEditMode(); }, 1500);
    } else {
      var err = await pr.json();
      if (err.message && err.message.indexOf('conflict') > -1) {
        cachedSha = '';
        statusEl.textContent = 'Conflict — try again';
      } else {
        statusEl.textContent = 'Error: ' + (err.message || 'Failed');
      }
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

  // Wire remove-lang buttons (for langs created at build time)
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

  // Start on EN
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

  ['pw-input', 'token-input'].forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('pw-submit').click();
      if (e.key === 'Escape') closeModal();
    });
  });

  document.getElementById('save-btn').addEventListener('click', saveToGitHub);
  document.getElementById('cancel-btn').addEventListener('click', disableEditMode);
});
