// Prophix Client Story — shared runtime v3
// Loaded by all generated client pages via <script src="/clients/story.js">
// Required globals (set inline before this script):
//   GH_REPO, GH_FILE, GH_CLIENT_FOLDER, EDIT_PASSWORD,
//   activeLangs, LANG_NAMES, LANG_LABELS

var sessionToken = '';
var cachedSha = '';
var currentLang = 'en';

// All selectors that become editable in edit mode
var ES = [
  '.story-sec .sec-label', '.story-sec h2', '.story-sec p', '.story-sec li',
  '.clip-quote', '.clip-label span',
  '.sidebar-card p', '.sidebar-card h3',
  '.result-item',
  '.stat-n', '.stat-l',
  '.hero h1', '.hero-desc', '.hero-tag',
  '.page-footer',
  '#participants-list strong', '#participants-list span'
];

// ── Language toggle ───────────────────────────────────────────────────────────
function setLang(l) {
  currentLang = l;
  // Show/hide all data-lang elements
  document.querySelectorAll('[data-lang]').forEach(function(el) {
    el.style.display = el.getAttribute('data-lang') === l ? '' : 'none';
  });
  // Update active button
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-lang') === l);
  });
  // In edit mode, re-apply contenteditable to newly visible elements
  if (document.body.classList.contains('edit-mode')) {
    ES.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        el.contentEditable = 'true';
      });
    });
  }
}

function refreshRemoveBtns() {
  var inEdit = document.body.classList.contains('edit-mode');
  document.querySelectorAll('.remove-lang').forEach(function(b) {
    b.style.display = inEdit ? '' : 'none';
  });
}

// ── Add language ──────────────────────────────────────────────────────────────
function addLanguage(code) {
  if (!code || activeLangs.indexOf(code) > -1) return;
  activeLangs.push(code);

  var toggle = document.getElementById('lang-toggle');
  var addWrap = document.getElementById('lang-add-wrap');

  // Add toggle button
  var btn = document.createElement('button');
  btn.className = 'lang-btn';
  btn.setAttribute('data-lang', code);
  btn.textContent = LANG_NAMES[code];
  btn.addEventListener('click', function() { setLang(code); });
  toggle.insertBefore(btn, addWrap);

  // Add remove button (only visible in edit mode)
  var rb = document.createElement('button');
  rb.className = 'lang-btn remove-lang';
  rb.setAttribute('data-remove-lang', code);
  rb.innerHTML = '&times;';
  rb.style.display = '';
  rb.addEventListener('click', function() { removeLanguage(code); });
  toggle.insertBefore(rb, addWrap);

  // Add hero tag
  var ht = document.createElement('div');
  ht.className = 'hero-tag';
  ht.setAttribute('data-lang', code);
  ht.textContent = LANG_LABELS[code] || 'Customer Story';
  ht.style.display = 'none';
  var hero = document.querySelector('.hero');
  hero.insertBefore(ht, document.querySelector('.lang-toggle'));

  // Clone hero h1 and hero-desc from EN
  var enH1 = document.querySelector('h1[data-lang="en"]');
  if (enH1) {
    var newH1 = enH1.cloneNode(true);
    newH1.setAttribute('data-lang', code);
    newH1.style.display = 'none';
    newH1.removeAttribute('contenteditable');
    enH1.parentNode.insertBefore(newH1, enH1.nextSibling);
  }
  var enDesc = document.querySelector('.hero-desc[data-lang="en"]');
  if (enDesc) {
    var newDesc = enDesc.cloneNode(true);
    newDesc.setAttribute('data-lang', code);
    newDesc.style.display = 'none';
    newDesc.removeAttribute('contenteditable');
    enDesc.parentNode.insertBefore(newDesc, enDesc.nextSibling);
  }

  // Clone story sections from EN
  document.querySelectorAll('.story-sec[data-lang="en"]').forEach(function(sec) {
    var cl = sec.cloneNode(true);
    cl.setAttribute('data-lang', code);
    cl.style.display = 'none';
    cl.querySelectorAll('[contenteditable]').forEach(function(el) {
      el.removeAttribute('contenteditable');
    });
    sec.parentNode.insertBefore(cl, sec.nextSibling);
  });

  // Clone clip labels and quotes from EN
  document.querySelectorAll('.clip-card').forEach(function(card) {
    // Clone label span
    var enSpan = card.querySelector('.clip-label span[data-lang="en"]');
    if (enSpan) {
      var newSpan = enSpan.cloneNode(true);
      newSpan.setAttribute('data-lang', code);
      newSpan.style.display = 'none';
      newSpan.removeAttribute('contenteditable');
      enSpan.parentNode.insertBefore(newSpan, enSpan.nextSibling);
    }
    // Clone quote
    var enQuote = card.querySelector('.clip-quote[data-lang="en"]');
    if (enQuote) {
      var newQuote = enQuote.cloneNode(true);
      newQuote.setAttribute('data-lang', code);
      newQuote.style.display = 'none';
      newQuote.removeAttribute('contenteditable');
      enQuote.parentNode.insertBefore(newQuote, enQuote.nextSibling);
    }
  });

  // Clone sidebar elements from EN
  document.querySelectorAll('[data-lang="en"]').forEach(function(el) {
    // Only clone sidebar-card children (p, h3) not already handled
    if (el.closest('.sidebar-card') && (el.tagName === 'P' || el.tagName === 'H3')) {
      var existing = el.parentNode.querySelector('[data-lang="' + code + '"]');
      if (!existing) {
        var cl = el.cloneNode(true);
        cl.setAttribute('data-lang', code);
        cl.style.display = 'none';
        cl.removeAttribute('contenteditable');
        el.parentNode.insertBefore(cl, el.nextSibling);
      }
    }
  });

  // Clone result items from EN
  document.querySelectorAll('.result-item[data-lang="en"]').forEach(function(el) {
    var cl = el.cloneNode(true);
    cl.setAttribute('data-lang', code);
    cl.style.display = 'none';
    cl.removeAttribute('contenteditable');
    el.parentNode.insertBefore(cl, el.nextSibling);
  });

  // Remove from dropdown
  var opt = document.querySelector('#lang-add-select option[value="' + code + '"]');
  if (opt) opt.remove();

  refreshRemoveBtns();

  // If in edit mode, make new elements editable and switch to new lang
  if (document.body.classList.contains('edit-mode')) {
    setLang(code);
    ES.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        el.contentEditable = 'true';
      });
    });
  }
}

function removeLanguage(code) {
  if (!confirm('Remove ' + LANG_NAMES[code] + ' language? All content for this language will be deleted.')) return;
  activeLangs = activeLangs.filter(function(l) { return l !== code; });
  document.querySelectorAll('[data-lang="' + code + '"]').forEach(function(el) { el.remove(); });
  document.querySelectorAll('[data-remove-lang="' + code + '"]').forEach(function(el) { el.remove(); });
  // Re-add to dropdown
  var sel = document.getElementById('lang-add-select');
  if (sel) {
    var opt = document.createElement('option');
    opt.value = code;
    opt.textContent = LANG_NAMES[code];
    sel.appendChild(opt);
  }
  if (currentLang === code) setLang('en');
}

// ── Audio clips ───────────────────────────────────────────────────────────────
function addClipInline(btn) {
  var card = document.createElement('div');
  card.className = 'clip-card';

  var rb = document.createElement('button');
  rb.className = 'clip-remove-btn';
  rb.innerHTML = '&times;';
  rb.addEventListener('click', function() { card.remove(); });

  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width','14');svg.setAttribute('height','14');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','#EF363D');
  var path = document.createElementNS(svgNS,'path');
  path.setAttribute('d','M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
  svg.appendChild(path);

  var lbl = document.createElement('div');
  lbl.className = 'clip-label';
  lbl.appendChild(svg);

  // Create span for each active language
  activeLangs.forEach(function(l) {
    var sp = document.createElement('span');
    sp.setAttribute('data-lang', l);
    sp.contentEditable = 'true';
    sp.textContent = 'Clip Title';
    sp.style.display = l === currentLang ? '' : 'none';
    lbl.appendChild(sp);
  });

  // Create quote for each active language
  var quoteContainer = document.createElement('div');
  activeLangs.forEach(function(l) {
    var qt = document.createElement('div');
    qt.className = 'clip-quote';
    qt.setAttribute('data-lang', l);
    qt.contentEditable = 'true';
    qt.textContent = '"Quote here."';
    qt.style.display = l === currentLang ? '' : 'none';
    quoteContainer.appendChild(qt);
  });

  var aud = document.createElement('audio');
  aud.controls = true;
  aud.preload = 'metadata';
  aud.style.cssText = 'width:100%;height:40px;border-radius:6px;accent-color:#EF363D;display:block';
  var src = document.createElement('source');
  src.type = 'audio/mpeg';
  aud.appendChild(src);

  var upBtn = document.createElement('button');
  upBtn.className = 'upload-audio-btn';
  upBtn.textContent = 'Upload MP3';
  upBtn.style.display = '';
  upBtn.addEventListener('click', function() { uploadAudio(upBtn); });

  var pl = document.createElement('div');
  pl.className = 'clip-player';
  pl.appendChild(aud);
  pl.appendChild(upBtn);

  card.appendChild(rb);
  card.appendChild(lbl);
  card.appendChild(quoteContainer);
  card.appendChild(pl);
  btn.parentNode.insertBefore(card, btn);
}

function uploadAudio(btn) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/mpeg,.mp3';
  input.onchange = function() {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var b64 = e.target.result.split(',')[1];
      btn.textContent = 'Uploading...';
      fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_CLIENT_FOLDER + file.name, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + sessionToken, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Audio: ' + file.name, content: b64 })
      }).then(function(r) { return r.json(); }).then(function(d) {
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

// ── Edit mode ─────────────────────────────────────────────────────────────────
function enableEditMode() {
  document.body.classList.add('edit-mode');
  // Make all visible elements editable
  ES.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.contentEditable = 'true';
    });
  });
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  document.getElementById('save-status').textContent = 'Edit mode — lang: ' + currentLang.toUpperCase();
  refreshRemoveBtns();
}

function disableEditMode() {
  document.body.classList.remove('edit-mode');
  ES.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) { el.removeAttribute('contenteditable'); });
  });
  document.getElementById('edit-fab').classList.remove('hidden');
  document.getElementById('edit-toolbar').classList.remove('visible');
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-btn').disabled = false;
  refreshRemoveBtns();
}

function closeModal() {
  document.getElementById('pw-modal').classList.remove('visible');
  document.getElementById('pw-input').value = '';
  document.getElementById('token-input').value = '';
  document.getElementById('pw-error').textContent = '';
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
        headers: { 'Authorization': 'Bearer ' + sessionToken, 'Accept': 'application/vnd.github+json' }
      });
      if (!r.ok) throw new Error('Auth failed — check your token');
      sha = (await r.json()).sha;
    }

    // Clean DOM before capture
    ES.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) { el.removeAttribute('contenteditable'); });
    });
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-fab').classList.remove('hidden');
    document.getElementById('edit-toolbar').classList.remove('visible');
    document.querySelectorAll('.remove-lang').forEach(function(el) { el.style.display = 'none'; });

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Restore edit mode
    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
    ES.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) { el.contentEditable = 'true'; });
    });
    refreshRemoveBtns();

    var enc = btoa(unescape(encodeURIComponent(html)));
    var pr = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_FILE, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + sessionToken, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Live edit', content: enc, sha: sha })
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

  // Wire up lang buttons
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.getAttribute('data-lang')); });
  });

  // Wire up remove lang buttons (for langs set at creation time)
  document.querySelectorAll('.remove-lang').forEach(function(btn) {
    var code = btn.getAttribute('data-remove-lang');
    btn.addEventListener('click', function() { removeLanguage(code); });
  });

  // Language add dropdown
  var langSel = document.getElementById('lang-add-select');
  if (langSel) {
    langSel.addEventListener('change', function() {
      if (this.value) { addLanguage(this.value); this.value = ''; }
    });
  }

  // Set initial language
  setLang('en');

  // Edit FAB
  document.getElementById('edit-fab').addEventListener('click', function() {
    document.getElementById('pw-modal').classList.add('visible');
    setTimeout(function() { document.getElementById('pw-input').focus(); }, 50);
  });

  // Auth submit
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
