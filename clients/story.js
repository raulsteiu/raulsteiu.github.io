// Prophix Client Story — story.js v8.1
// Block-based multilingual architecture.
// Required globals (inline before this script):
//   GH_REPO, GH_FILE, GH_CLIENT_FOLDER
//   activeLangs, LANG_NAMES, LANG_LABELS, LANG_FULL_NAMES

var sessionToken = '';
var cachedSha = '';
var currentLang = 'en';

var EDITABLE_SELECTORS = [
  '.hero-tag', 'h1', '.hero-desc', '.hero-industry', '.hero-ind',
  '.sec-label', '.story-sec h2', '.story-sec p', '.story-sec li',
  '.clip-label', '.clip-quote',
  '.sidebar-card h3',
  '.result-item',
  '.stat-n', '.stat-l',
  '.krs-item-text',
  '.who-text', '.who-stat-n', '.who-stat-l',
  '.participant-name', '.participant-title',
  '.disclaimer-text'
];

var PROPHIX_PRODUCTS = ['Financial Consolidation','FPA+','Account Reconciliation','Cashflow Management'];

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

// ── Add / Remove language ─────────────────────────────────────────────────────
function addLanguage(code) {
  if (!code || activeLangs.indexOf(code) > -1) return;
  activeLangs.push(code);
  var enBlock = document.getElementById('block-en');
  var newBlock = enBlock.cloneNode(true);
  newBlock.id = 'block-' + code;
  newBlock.classList.remove('active');
  newBlock.querySelectorAll(EDITABLE_SELECTORS.join(',')).forEach(function(el) {
    el.removeAttribute('contenteditable');
    if (el.textContent.indexOf('[' + LANG_NAMES[code] + ']') === -1)
      el.textContent = '[' + LANG_NAMES[code] + '] ' + el.textContent;
  });
  var heroTag = newBlock.querySelector('.hero-tag');
  if (heroTag && LANG_LABELS[code]) heroTag.textContent = LANG_LABELS[code];
  document.getElementById('lang-blocks').appendChild(newBlock);

  var toggle = document.getElementById('lang-toggle');
  var addWrap = document.getElementById('lang-add-wrap');

  var btn = document.createElement('button');
  btn.className = 'lang-btn'; btn.setAttribute('data-lang', code); btn.textContent = LANG_NAMES[code];
  btn.addEventListener('click', function() { setLang(code); });
  toggle.insertBefore(btn, addWrap);

  var rb = document.createElement('button');
  rb.className = 'lang-btn remove-lang'; rb.setAttribute('data-remove-lang', code); rb.innerHTML = '&times;';
  rb.style.display = document.body.classList.contains('edit-mode') ? 'inline-flex' : 'none';
  rb.addEventListener('click', function() { removeLanguage(code); });
  toggle.insertBefore(rb, addWrap);

  var opt = document.querySelector('#lang-add-select option[value="' + code + '"]');
  if (opt) opt.remove();
  setLang(code);
  if (document.body.classList.contains('edit-mode')) makeBlockEditable(newBlock);
}

function removeLanguage(code) {
  if (code === 'en') return;
  if (!confirm('Remove ' + LANG_NAMES[code] + '? All content for this language will be lost.')) return;
  activeLangs = activeLangs.filter(function(l) { return l !== code; });
  var block = document.getElementById('block-' + code); if (block) block.remove();
  var btn = document.querySelector('.lang-btn[data-lang="' + code + '"]'); if (btn) btn.remove();
  var rb = document.querySelector('.remove-lang[data-remove-lang="' + code + '"]'); if (rb) rb.remove();
  if (LANG_FULL_NAMES[code]) {
    var sel = document.getElementById('lang-add-select');
    if (sel) { var opt = document.createElement('option'); opt.value = code; opt.textContent = LANG_FULL_NAMES[code]; sel.appendChild(opt); }
  }
  if (currentLang === code) setLang('en');
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function makeBlockEditable(block) {
  block.querySelectorAll(EDITABLE_SELECTORS.join(',')).forEach(function(el) { el.contentEditable = 'true'; });
}

function enableEditMode() {
  document.body.classList.add('edit-mode');
  document.querySelectorAll('.lang-block').forEach(makeBlockEditable);
  document.getElementById('edit-fab').classList.add('hidden');
  document.getElementById('edit-toolbar').classList.add('visible');
  document.getElementById('save-btn').disabled = false;
  document.getElementById('save-status').textContent = 'Editing: EN';
  document.querySelectorAll('.remove-lang').forEach(function(b) { b.style.display = 'inline-flex'; });
  document.querySelectorAll('.edit-only').forEach(function(el) { el.style.display = ''; });
  addEditControlsToExisting();
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
  var panel = document.getElementById('inline-products-panel'); if (panel) panel.remove();
}

function closeModal() {
  document.getElementById('token-modal').classList.remove('visible');
  document.getElementById('token-input').value = '';
  document.getElementById('token-error').textContent = '';
}

// ── Add edit controls to existing elements ────────────────────────────────────
function addEditControlsToExisting() {
  // Clips: delete clip button + upload btn + DELETE AUDIO button
  document.querySelectorAll('.clip-card').forEach(function(card) {
    if (!card.querySelector('.clip-remove-btn')) {
      var rb = document.createElement('button');
      rb.className = 'clip-remove-btn edit-only';
      rb.innerHTML = '🗑'; rb.title = 'Delete this clip';
      rb.addEventListener('click', function() { if (confirm('Delete this clip?')) card.remove(); });
      card.insertBefore(rb, card.firstChild);
    }
    var player = card.querySelector('.clip-player');
    if (player && !player.querySelector('.upload-audio-btn')) {
      var upBtn = document.createElement('button');
      upBtn.className = 'upload-audio-btn edit-only';
      upBtn.textContent = 'Upload MP3';
      upBtn.addEventListener('click', function() { uploadAudio(upBtn); });
      player.appendChild(upBtn);
    }
    if (player && !player.querySelector('.delete-audio-btn')) {
      var delBtn = document.createElement('button');
      delBtn.className = 'delete-audio-btn edit-only';
      delBtn.innerHTML = '🗑 Delete audio';
      delBtn.title = 'Delete MP3 from GitHub and clear this clip';
      delBtn.addEventListener('click', function() {
        var srcEl = player.querySelector('audio source');
        // Try attribute first (HTML-set), then property (JS-set after upload)
        var rawSrc = srcEl ? (srcEl.getAttribute('src') || '') : '';
        if (!rawSrc && srcEl) {
          // src was set via property — srcEl.src gives full absolute URL
          var propSrc = srcEl.src || '';
          // Only use if it's not just the page base URL
          if (propSrc && propSrc !== window.location.href && propSrc.indexOf('.mp3') > -1) {
            rawSrc = propSrc;
          }
        }
        var filename = rawSrc ? rawSrc.split('?')[0].split('/').pop() : '';
        if (!filename || filename.length < 2 || filename === 'undefined') {
          alert('No audio file found on this clip.\n\nTip: the file must be uploaded via the Upload MP3 button first.'); return;
        }
        if (!confirm('Delete "' + filename + '" from the repository? This cannot be undone.')) return;
        var origText = delBtn.innerHTML;
        delBtn.textContent = 'Deleting…';
        delBtn.disabled = true;
        fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_CLIENT_FOLDER + filename, {
          headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
        }).then(function(r) {
          if (!r.ok) throw new Error('File "' + filename + '" not found in repository. It may have already been deleted.');
          return r.json();
        }).then(function(d) {
          return fetch('https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_CLIENT_FOLDER + filename, {
            method: 'DELETE',
            headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
            body: JSON.stringify({message: 'Delete audio: ' + filename, sha: d.sha})
          });
        }).then(function(r) {
          if (!r.ok) throw new Error('Delete request failed');
          if (srcEl) { srcEl.removeAttribute('src'); }
          var aud = player.querySelector('audio');
          if (aud) aud.load();
          var upBtn2 = player.querySelector('.upload-audio-btn');
          if (upBtn2) upBtn2.textContent = 'Upload MP3';
          delBtn.textContent = '✓ Deleted';
        }).catch(function(err) {
          delBtn.innerHTML = origText;
          delBtn.disabled = false;
          alert('Could not delete audio:\n' + err.message);
        });
      });
      player.appendChild(delBtn);
    }
  });

  // Sections: add delete btn
  document.querySelectorAll('.story-sec').forEach(function(sec) {
    if (!sec.querySelector('.sec-delete-btn')) {
      var btn = document.createElement('button');
      btn.className = 'sec-delete-btn edit-only';
      btn.innerHTML = '🗑'; btn.title = 'Delete section';
      btn.addEventListener('click', function() { if (confirm('Delete this section?')) sec.remove(); });
      sec.insertBefore(btn, sec.firstChild);
    }
  });

  // Stats: add +/- controls
  document.querySelectorAll('.stats-row').forEach(function(row) {
    if (row.querySelector('.stat-add-btn')) return;
    row.querySelectorAll('.stat-tile').forEach(addStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'stat-add-btn edit-only';
    addBtn.textContent = '+';
    addBtn.title = 'Add stat';
    addBtn.addEventListener('click', function() { addStatTile(row, addBtn); });
    row.appendChild(addBtn);
  });

  // Who stats: add +/- controls
  document.querySelectorAll('.who-stats-grid').forEach(function(grid) {
    if (grid.querySelector('.who-stat-add-btn')) return;
    grid.querySelectorAll('.who-stat-tile').forEach(addWhoStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'who-stat-add-btn edit-only';
    addBtn.textContent = '+ Add stat';
    addBtn.addEventListener('click', function() { addWhoStat(grid, addBtn); });
    grid.appendChild(addBtn);
  });

  // KRS items: add delete btns
  document.querySelectorAll('.krs-item').forEach(function(item) {
    if (!item.querySelector('.krs-item-del')) {
      var btn = document.createElement('button');
      btn.className = 'krs-item-del edit-only';
      btn.innerHTML = '✕'; btn.title = 'Delete result';
      btn.addEventListener('click', function() { item.remove(); });
      item.appendChild(btn);
    }
  });

  // KRS: add "Add result" button
  var krsList = document.querySelector('.krs-list');
  if (krsList && !krsList.querySelector('.krs-add-btn')) {
    var krsAdd = document.createElement('button');
    krsAdd.className = 'krs-add-btn edit-only';
    krsAdd.textContent = '+ Add result';
    krsAdd.addEventListener('click', function() { addKrsItem(krsList, krsAdd); });
    krsList.appendChild(krsAdd);
  }

  // Participants: add delete btns + "Add participant" button
  document.querySelectorAll('.sidebar-card').forEach(function(card) {
    if (!card.querySelector('h3')) return;
    if (card.querySelector('h3').textContent.toLowerCase().indexOf('participant') === -1) return;
    // Delete buttons on existing participants
    card.querySelectorAll('p').forEach(function(p) {
      if (!p.querySelector('.part-del-btn')) {
        var del = document.createElement('button');
        del.className = 'part-del-btn edit-only';
        del.innerHTML = '✕'; del.title = 'Remove participant';
        del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:13px;float:right;padding:0 2px;line-height:1';
        del.addEventListener('click', function() { p.remove(); });
        p.insertBefore(del, p.firstChild);
        // Make name and title editable
        var strong = p.querySelector('strong'); if (strong) strong.contentEditable = 'true';
        var span = p.querySelector('span'); if (span) span.contentEditable = 'true';
      }
    });
    // "Add participant" button
    if (!card.querySelector('.part-add-btn')) {
      var addBtn = document.createElement('button');
      addBtn.className = 'part-add-btn edit-only';
      addBtn.textContent = '+ Add participant';
      addBtn.style.cssText = 'width:100%;background:transparent;border:1px dashed var(--border,#E0DFF0);border-radius:5px;padding:6px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer;color:#888;margin-top:8px;transition:all .15s';
      addBtn.addEventListener('click', function() { addParticipantInline(card, addBtn); });
      card.appendChild(addBtn);
    }
  });

  // Results sidebar: add delete btns + "Add result" button
  document.querySelectorAll('.sidebar-card').forEach(function(card) {
    if (!card.querySelector('h3')) return;
    var h3text = card.querySelector('h3').textContent.toLowerCase();
    if (h3text.indexOf('result') === -1) return;
    card.querySelectorAll('.result-item').forEach(function(item) {
      if (!item.querySelector('.result-del-btn')) {
        var del = document.createElement('button');
        del.className = 'result-del-btn edit-only';
        del.innerHTML = '✕'; del.title = 'Remove result';
        del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:11px;float:right;padding:0 2px;line-height:1.5';
        del.addEventListener('click', function() { item.remove(); });
        item.insertBefore(del, item.firstChild);
      }
    });
    if (!card.querySelector('.result-add-btn')) {
      var addBtn = document.createElement('button');
      addBtn.className = 'result-add-btn edit-only';
      addBtn.textContent = '+ Add result';
      addBtn.style.cssText = 'width:100%;background:transparent;border:1px dashed var(--border,#E0DFF0);border-radius:5px;padding:6px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer;color:#888;margin-top:8px;transition:all .15s';
      addBtn.addEventListener('click', function() { addResultInline(card, addBtn); });
      card.appendChild(addBtn);
    }
  });
}

// ── Section management ────────────────────────────────────────────────────────
function addSection(btn) {
  var block = btn.closest('.lang-block');
  if (!block) return;
  var container = block.querySelector('.sections-container');
  if (!container) return;
  var sec = document.createElement('div');
  sec.className = 'story-sec';
  var delBtn = document.createElement('button');
  delBtn.className = 'sec-delete-btn edit-only'; delBtn.innerHTML = '🗑'; delBtn.title = 'Delete section';
  delBtn.addEventListener('click', function() { if (confirm('Delete this section?')) sec.remove(); });
  sec.appendChild(delBtn);
  // Use innerHTML += after appending delBtn to avoid losing the event listener
  var label = document.createElement('div');
  label.className = 'sec-label'; label.contentEditable = 'true'; label.textContent = 'Section label';
  var h2 = document.createElement('h2');
  h2.contentEditable = 'true'; h2.textContent = 'Section heading';
  var p = document.createElement('p');
  p.contentEditable = 'true'; p.textContent = 'Write your content here.';
  sec.appendChild(label); sec.appendChild(h2); sec.appendChild(p);
  container.appendChild(sec); // append to end of container, not before the button (which is outside container)
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function addStatDeleteBtn(tile) {
  if (tile.querySelector('.stat-tile-del')) return;
  var del = document.createElement('button');
  del.className = 'stat-tile-del edit-only'; del.innerHTML = '✕'; del.title = 'Remove stat';
  del.addEventListener('click', function() { tile.remove(); });
  tile.appendChild(del);
}

function addStatTile(row, addBtn) {
  var tile = document.createElement('div');
  tile.className = 'stat-tile';
  tile.innerHTML = '<div class="stat-n" contenteditable="true">—</div><div class="stat-l" contenteditable="true">Label</div>';
  addStatDeleteBtn(tile);
  row.insertBefore(tile, addBtn);
}

// ── KRS items ─────────────────────────────────────────────────────────────────
function addKrsItem(list, addBtn) {
  var li = document.createElement('li');
  li.className = 'krs-item';
  li.innerHTML = '<span class="krs-check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#EF363D"/><polyline points="7 12 10.5 15.5 17 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
    '<span class="krs-item-text" contenteditable="true">New result</span>';
  var delBtn = document.createElement('button');
  delBtn.className = 'krs-item-del edit-only'; delBtn.innerHTML = '✕';
  delBtn.addEventListener('click', function() { li.remove(); });
  li.appendChild(delBtn);
  list.insertBefore(li, addBtn);
}

// ── Clips ─────────────────────────────────────────────────────────────────────
function addClipInline(btn) {
  var card = document.createElement('div');
  card.className = 'clip-card';

  var rb = document.createElement('button');
  rb.className = 'clip-remove-btn edit-only'; rb.innerHTML = '🗑'; rb.title = 'Delete clip';
  rb.addEventListener('click', function() { if (confirm('Delete this clip?')) card.remove(); });

  var lbl = document.createElement('div');
  lbl.className = 'clip-label'; lbl.contentEditable = 'true';
  lbl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#EF363D"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg> Clip title';

  var qt = document.createElement('div');
  qt.className = 'clip-quote'; qt.contentEditable = 'true'; qt.textContent = '"Quote here."';

  var aud = document.createElement('audio');
  aud.controls = true; aud.preload = 'metadata';
  aud.style.cssText = 'width:100%;height:40px;border-radius:6px;accent-color:#EF363D';
  var src = document.createElement('source'); src.type = 'audio/mpeg';
  aud.appendChild(src);

  var upBtn = document.createElement('button');
  upBtn.className = 'upload-audio-btn edit-only'; upBtn.textContent = 'Upload MP3';
  upBtn.addEventListener('click', function() { uploadAudio(upBtn); });

  var delAudioBtn = document.createElement('button');
  delAudioBtn.className = 'delete-audio-btn edit-only'; delAudioBtn.innerHTML = '🗑 Delete audio';
  delAudioBtn.addEventListener('click', function() {
    var rawSrc = src.getAttribute('src') || '';
    if (!rawSrc) {
      var propSrc = src.src || '';
      if (propSrc && propSrc !== window.location.href && propSrc.indexOf('.mp3') > -1) rawSrc = propSrc;
    }
    var filename = rawSrc ? rawSrc.split('?')[0].split('/').pop() : '';
    if (!filename || filename.length < 2) { alert('No audio attached. Upload an MP3 first.'); return; }
    if (!confirm('Delete "' + filename + '" from the repository?')) return;
    var origText = delAudioBtn.innerHTML;
    delAudioBtn.textContent = 'Deleting…'; delAudioBtn.disabled = true;
    fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_CLIENT_FOLDER+filename,{headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}})
      .then(function(r){if(!r.ok)throw new Error('Not found in repo');return r.json();})
      .then(function(d){return fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_CLIENT_FOLDER+filename,{method:'DELETE',headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({message:'Delete audio: '+filename,sha:d.sha})});})
      .then(function(r){if(!r.ok)throw new Error('Delete failed');src.removeAttribute('src');aud.load();upBtn.textContent='Upload MP3';delAudioBtn.textContent='✓ Deleted';})
      .catch(function(e){delAudioBtn.innerHTML=origText;delAudioBtn.disabled=false;alert('Error: '+e.message);});
  });

  var pl = document.createElement('div');
  pl.className = 'clip-player';
  pl.appendChild(aud); pl.appendChild(upBtn); pl.appendChild(delAudioBtn);

  card.appendChild(rb); card.appendChild(lbl); card.appendChild(qt); card.appendChild(pl);
  btn.parentNode.insertBefore(card, btn);
}

// ── Who sidebar stats ─────────────────────────────────────────────────────────
function addWhoStatDeleteBtn(tile) {
  if (tile.querySelector('.who-stat-del')) return;
  var del = document.createElement('button');
  del.className = 'who-stat-del edit-only'; del.innerHTML = '✕';
  del.addEventListener('click', function() { tile.remove(); });
  tile.appendChild(del);
}

function addWhoStat(grid, addBtn) {
  var tile = document.createElement('div');
  tile.className = 'who-stat-tile';
  tile.innerHTML = '<div class="who-stat-n" contenteditable="true">—</div><div class="who-stat-l" contenteditable="true">Label</div>';
  addWhoStatDeleteBtn(tile);
  grid.insertBefore(tile, addBtn);
}

// ── Participant inline add ────────────────────────────────────────────────────
function addParticipantInline(card, addBtn) {
  var p = document.createElement('p');
  p.style.marginTop = '10px';
  var del = document.createElement('button');
  del.className = 'part-del-btn edit-only';
  del.innerHTML = '✕';
  del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:13px;float:right;padding:0 2px;line-height:1';
  del.addEventListener('click', function() { p.remove(); });
  var strong = document.createElement('strong');
  strong.className = 'participant-name'; strong.contentEditable = 'true'; strong.textContent = 'Full name';
  var br = document.createElement('br');
  var span = document.createElement('span');
  span.className = 'participant-title'; span.contentEditable = 'true';
  span.style.cssText = 'font-size:12px;color:#888'; span.textContent = 'Title, Company';
  p.appendChild(del); p.appendChild(strong); p.appendChild(br); p.appendChild(span);
  card.insertBefore(p, addBtn);
}

// ── Result inline add ─────────────────────────────────────────────────────────
function addResultInline(card, addBtn) {
  var item = document.createElement('li');
  item.className = 'result-item'; item.contentEditable = 'true'; item.textContent = 'New result';
  var del = document.createElement('button');
  del.className = 'result-del-btn edit-only'; del.innerHTML = '✕';
  del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:11px;float:right;padding:0 2px;line-height:1.5';
  del.addEventListener('click', function() { item.remove(); });
  item.insertBefore(del, item.firstChild);
  // Find or create the ul
  var ul = card.querySelector('.results-ul');
  if (!ul) { ul = document.createElement('ul'); ul.className = 'results-ul'; card.insertBefore(ul, addBtn); }
  ul.insertBefore(item, addBtn.parentNode === ul ? addBtn : null);
}

// ── Products inline panel ─────────────────────────────────────────────────────
function toggleProductsPanel(triggerEl) {
  var existing = document.getElementById('inline-products-panel');
  if (existing) { existing.remove(); return; }
  var panel = document.createElement('div');
  panel.id = 'inline-products-panel';
  panel.className = 'inline-products-panel';
  var currentApps = [];
  document.querySelectorAll('.app-tag span:last-child').forEach(function(s) { currentApps.push(s.textContent.trim()); });
  PROPHIX_PRODUCTS.forEach(function(p) {
    var lbl = document.createElement('label');
    lbl.className = 'prod-toggle' + (currentApps.indexOf(p) > -1 ? ' active' : '');
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = p; cb.checked = currentApps.indexOf(p) > -1; cb.style.display = 'none';
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(p));
    lbl.addEventListener('click', function(e) {
      e.preventDefault(); cb.checked = !cb.checked; lbl.classList.toggle('active', cb.checked);
      var sel = []; panel.querySelectorAll('input:checked').forEach(function(c) { sel.push(c.value); });
      document.querySelectorAll('.apps-display').forEach(function(d) {
        d.innerHTML = sel.map(function(x) { return '<div class="app-tag"><span class="app-dot"></span><span>'+x+'</span></div>'; }).join('');
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
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var img2 = document.querySelector('.hero-client-logo');
    if (img2) img2.style.opacity = '0.4';

    // Convert any format to PNG via canvas so we always save logo.png
    var objectUrl = URL.createObjectURL(file);
    var tempImg = new Image();
    tempImg.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = tempImg.naturalWidth || 400;
      canvas.height = tempImg.naturalHeight || 200;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(tempImg, 0, 0);
      URL.revokeObjectURL(objectUrl);
      var b64 = canvas.toDataURL('image/png').split(',')[1];
      uploadLogoB64(b64, img2);
    };
    tempImg.onerror = function() {
      // Canvas failed (e.g. SVG with external resources) — fall back to raw file read
      URL.revokeObjectURL(objectUrl);
      var reader = new FileReader();
      reader.onload = function(e) { uploadLogoB64(e.target.result.split(',')[1], img2); };
      reader.readAsDataURL(file);
    };
    tempImg.src = objectUrl;
  };
  input.click();
}

async function uploadLogoB64(b64, img2) {
  var path = GH_CLIENT_FOLDER + 'logo.png'; // always logo.png
  try {
    var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, {
      headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
    });
    var body = {message:'Logo: logo.png', content:b64};
    if (shaRes.ok) { var existing = await shaRes.json(); if (existing.sha) body.sha = existing.sha; }

    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, {
      method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    var d = await r.json();
    if (r.ok && d.content) {
      if (img2) { img2.src='logo.png?v='+Date.now(); img2.style.display='block'; img2.style.opacity='1'; }
      var pill = document.querySelector('.logo-pill-client');
      if (pill) { pill.style.display=''; pill.style.visibility='visible'; }
      var ph = document.querySelector('.hero-logo-ph'); if (ph) ph.style.display='none';
    } else {
      if (img2) img2.style.opacity='1';
      alert('Logo upload failed: '+(d.message||'Unknown error')+'\n\nCheck your access token has write permission.');
    }
  } catch(err) {
    if (img2) img2.style.opacity='1';
    alert('Logo upload error: '+err.message);
  }
}

// ── Audio upload ──────────────────────────────────────────────────────────────
function uploadAudio(btn) {
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'audio/mpeg,.mp3';
  input.onchange = function() {
    var file = input.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(e) {
      var b64 = e.target.result.split(',')[1];
      btn.textContent = 'Uploading…';
      btn.disabled = true;
      try {
        var path = GH_CLIENT_FOLDER + file.name;
        // Fetch existing SHA in case file already exists
        var shaRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, {
          headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
        });
        var body = {message:'Audio: '+file.name, content:b64};
        if (shaRes.ok) { var existing = await shaRes.json(); if (existing.sha) body.sha = existing.sha; }

        var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, {
          method:'PUT',
          headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
          body:JSON.stringify(body)
        });
        var d = await r.json();
        if (r.ok && d.content) {
          var srcEl2 = btn.closest('.clip-player').querySelector('audio source');
          if (srcEl2) {
            srcEl2.setAttribute('src', file.name); // set as attribute so delete can find it
            srcEl2.parentNode.load();
          }
          btn.textContent = '✓ '+file.name;
        } else {
          btn.textContent = 'Upload MP3';
          alert('Upload failed: ' + (d.message || 'Unknown error') + '\n\nCheck your access token has write permission.');
        }
      } catch(err) {
        btn.textContent = 'Upload MP3';
        alert('Upload error: ' + err.message);
      }
      btn.disabled = false;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveToGitHub() {
  var statusEl = document.getElementById('save-status');
  var saveBtn = document.getElementById('save-btn');
  statusEl.textContent = 'Saving…'; saveBtn.disabled = true;
  try {
    var sha = cachedSha;
    if (!sha) {
      var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_FILE, {
        headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
      });
      if (!r.ok) throw new Error('Token invalid or expired');
      sha = (await r.json()).sha;
    }
    document.querySelectorAll('[contenteditable]').forEach(function(el){ el.removeAttribute('contenteditable'); });
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-fab').classList.remove('hidden');
    document.getElementById('edit-toolbar').classList.remove('visible');
    document.querySelectorAll('.remove-lang').forEach(function(b){ b.style.display='none'; });
    document.querySelectorAll('.edit-only').forEach(function(el){ el.style.display='none'; });
    var panel = document.getElementById('inline-products-panel'); if (panel) panel.remove();

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
    document.querySelectorAll('.lang-block').forEach(makeBlockEditable);
    document.querySelectorAll('.remove-lang').forEach(function(b){ b.style.display='inline-flex'; });
    document.querySelectorAll('.edit-only').forEach(function(el){ el.style.display=''; });
    statusEl.textContent = 'Saving…'; saveBtn.disabled = true;

    var enc = btoa(unescape(encodeURIComponent(html)));
    var pr = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+GH_FILE, {
      method:'PUT', headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify({message:'Live edit', content:enc, sha:sha})
    });
    if (pr.ok) {
      cachedSha = (await pr.json()).content.sha;
      // Update last-edited timestamp on page
      document.querySelectorAll('.last-edited').forEach(function(el) {
        el.textContent = 'Last edited ' + new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      });
      statusEl.textContent = 'Saved ✓';
      setTimeout(disableEditMode, 1500);
      // Update edited timestamp in stories.json quietly in background
      _updateEditedTimestamp();
    } else {
      var err = await pr.json();
      if ((err.message||'').indexOf('conflict')>-1) { cachedSha=''; statusEl.textContent='Conflict — retry'; }
      else statusEl.textContent = 'Error: '+(err.message||'Failed');
      saveBtn.disabled = false;
    }
  } catch(e) { statusEl.textContent='Error: '+e.message; saveBtn.disabled=false; }
}

// ── Update edited timestamp in stories.json (background, best-effort) ────────
async function _updateEditedTimestamp() {
  try {
    var slug = GH_FILE.split('/')[1]; // clients/<slug>/index.html → slug
    var r = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', {
      headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
    });
    if (!r.ok) return;
    var d = await r.json();
    var stories;
    try { stories = JSON.parse(atob(d.content.replace(/\n/g,''))); } catch(e) { return; }
    var entry = stories.find(function(s) { return s.slug === slug; });
    if (!entry) return;
    entry.edited = new Date().toISOString();
    var enc = btoa(unescape(encodeURIComponent(JSON.stringify(stories, null, 2))));
    await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/clients/stories.json', {
      method: 'PUT',
      headers: {'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body: JSON.stringify({message: 'Update edited: '+slug, content: enc, sha: d.sha})
    });
  } catch(e) { /* silent — non-critical */ }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.lang-btn:not(.remove-lang)').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.getAttribute('data-lang')); });
  });
  document.querySelectorAll('.remove-lang').forEach(function(btn) {
    var code = btn.getAttribute('data-remove-lang');
    btn.addEventListener('click', function() { removeLanguage(code); });
  });
  var langSel = document.getElementById('lang-add-select');
  if (langSel) langSel.addEventListener('change', function() { if (this.value) { addLanguage(this.value); this.value=''; } });

  setLang('en');

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
  document.getElementById('token-input').addEventListener('keydown', function(e) {
    if (e.key==='Enter') document.getElementById('token-submit').click();
    if (e.key==='Escape') closeModal();
  });
  document.getElementById('save-btn').addEventListener('click', saveToGitHub);
  document.getElementById('cancel-btn').addEventListener('click', disableEditMode);

  // ── UX #1: ?edit=1 param — auto-open token modal on load ─────────────────
  if (new URLSearchParams(window.location.search).get('edit') === '1') {
    setTimeout(function() {
      document.getElementById('token-modal').classList.add('visible');
      setTimeout(function(){ document.getElementById('token-input').focus(); }, 80);
    }, 300);
  }

  // ── UX #2: Share button on story page — copy current URL to clipboard ─────
  var shareBtn = document.getElementById('story-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      var url = window.location.href.split('?')[0];
      navigator.clipboard.writeText(url).then(function() {
        var orig = shareBtn.textContent;
        shareBtn.textContent = '✓ Copied!';
        shareBtn.classList.add('share-copied');
        setTimeout(function() {
          shareBtn.textContent = orig;
          shareBtn.classList.remove('share-copied');
        }, 2000);
      }).catch(function() { prompt('Copy this link:', url); });
    });
  }
});
