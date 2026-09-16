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
  '.clip-label', '.clip-quote', '.clips-section-title',
  '.sidebar-card h3',
  '.result-item',
  '.stat-n', '.stat-l',
  '.krs-item-text',
  '.who-text', '.who-stat-n', '.who-stat-l',
  '.participant-name', '.participant-title',
  '.disclaimer-text'
];

var PROPHIX_PRODUCTS = [
  {name:'Financial Consolidation', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJsSURBVHgBpZU/iBNBFMa/iSuJiEs8TKEEXb1CSKNgc4VgQDkEERRS2BkEbe+28rjC7FmIhZizFiRiY3HggdpYnaCQRmNjutOAQQ8CGiJoAnrje28za7K3m1y4DybZ+fN++d6byazCCJUdL43N7hwUioBqQ+tVJPDYbdxtxMWouIn7zuKc0toDdDo01aCoJYJWtgUsOwt5aJToMY/RInDistu48yESSCAHWpXJ0SVMIo0KlWHJlCHBH5wewWoTw3xLRYJ+Lh9eKEmXnJVowBsVk8kdlGbUaf5Aq/4NvU43BFeuRbDiKFjh6XVkZ45Fzj2/8QTrr+r/B6j2Fn05UYuTdkocsJvao7fSZ/U6v2Fnp+TbjA0Q07vOp097YdjsvQKOXzyBv70/2Kh9wdT0AezN2NT2SfvV+ilAK7m7X4J2EGuFYTPzZ5ErnEJ95R2lehSvb7+U8TO3LpCjPfKcyR0K3DWrnyR1U88hoJ3dT8BzkiY/V5ffSyCDOYA3wnfkz7PC9bXC7ljsjl0y5Nqbm5KeX3wtLhnGY636BmXwYmi3rUF3DGnVv2J6NicLk3aSQB8FEt4AHmtW17ccnQDIEHO+TKHZcaf5PXBlZNYNbsYWIC/gAvMBXrnyMKiN2QAO5jR9R1qOUpQsuZbo/DCM02VxEDc7mw76DOU+u2WH0VJt/utV6AevxqwQkDkuJt04KYUKOUzNQ3WPEDQftci4HSeCrWmk3MHrq9i/Bx1MpqELN+qC9frgcZ7aUPoBZbjsNrxguyNfAXLZAl5cbZVSqxrajXq3xL5TfPDiSejNZ+iXwa+TpLeGnYgd912P1T90CR2NibOEsgAAAABJRU5ErkJggg=='},
  {name:'Cash Management', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAYAAADAQbwGAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAK/SURBVHgBlZVNaBNREMfnZdva0kYLpWBrUleqFVuFYluonnITQbAe/AIPQonYU1vEHk3Wo6JpbkJEPHgQFcxBkXoxFdRgVYQ0FVpKliRqUMSY9CMmJs+ZlyYku9skHUg2772d3878Z3bCoIJ9GZblbDbrAA4jYoOBV5Ik5YBfVTfzYUabIZvcuraWG+c5PoF3tOqcGHP2vQ8rNQGDQ9aLHMCBP2WobCo6K31zkfuGwMCwbGOUHoANtmT8syTVnSrIYKKv+aEuF8JelcLazo1C64nTNQBZP+ocmh+yusQqOGhxcNSk9Ja286Owc9IBme/RMtc0ruPPHouPYayMKQzJIdDo1djTB9abHlj96BdrqWW7uDZ0WvCsF1KLQQhPXYLMt4iWGScg1+7Kdx4h7B2klhbEdfcNj4ju18N7ApiPPgLLF47rojRpN0i35sPDxXT3e99SKmAy7wArgindyJRdZNFun9QB67QbVIzVT37huOvaLfi3koCv16+UpUdR04ce/LNahJQS3Uz2w4OFQ0F6vG9Q07uwDaMqGMnRPHAEqqZMJpnzRaC0l0aOgjp2FnLJP7D3wYsiJJtMGLnqgRRd477eYvpm2zHhnHj9Mu+wUXECpxYXdECdhvHnT4R2BMrEogJKWq1jq8RuK5CcnSkWjrTVmmHbdGNq9R1WiLkUURyCphGe9M2IypIkVGX18hkjYNdvVL5sopADtQilRTquY2oFzeisCQsXvmoXDV5OY6o01mluwnFkK93n6b8idYJR/zV04Bsid4s3pb6tHaO3wIp/FtLqchkP+9Utpk1gwDLNTGwcajDSjx5UaK0SnPvgXHSiOL7y0zn3FA/6YWvm45wrhz5EfbQwHrCM4djnckUM6sUQtOmA1Vpg0OJkBNaT4pzn3C0tddN7fGpcdwoVjGTIZLNOE7CT+R1e9U/qPwWPL/KFHhi3AAAAAElFTkSuQmCC'},
  {name:'Account Reconciliation', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJnSURBVHgBrZW/UxNREMd3L5cYRDCOM6GxiM5YqoUNWDGjzughY2wstCD+BYiVFk6SGQs7SUsDNrQGFVJoQacUNuBo4Y+ksJBCk0mCkcvdrbvvuMtPAki+M5nMe2/3s7vfN/MOoYfoRTxSDZvTRJBAwggCZANaMD1wPVvYLQd3O6jkjCQ4eJ+xkbaEgo2UOW7kZvcFrORujCM589xVDHpIwA5AenhiZaErsJaLxyyqzwPROBxACLjQbIPmdmUkLcfMHxQmIqCE5CqLpIDrFaSgP0pryDcI/dO07pmP+iCQtQXa8BkInrqsTq2f78H+vdGSIXEYPAZUr6r4NkV0P5CDjlx4AMCBdvk7hM7ehWAsDvX8Emx/nlMgOddHRv1s68db2P401wLWm/Ha0GmoF5a4q4+w9eY2aAMjDL6jwNK1dO9wMQ8i8PDFx1Bbe9hg+GROEJh2NMpJ39SeU9uEv+vPGrA/vP7wRNkgYPPLom9DB1BEVpVHfAktXXOXAhOZXxdVEbeBKzteuXZ1AO1fG6BHL/kJHiw8+tTtljvSo2Nqz4PJP4ajLTlYWTbIW4TPz6hurM13XHWQE66qcdSoa4+ULYGT53gU5LHX2cMxZYkU6wr0qoZiN13PuLLcpNy0d5OyL0WCHGeX8+x7tjldgBPF9hflECqxh5SBPkneS80yQ7NE9BwOK8TVuhma8Z+v8rKR0BCSe72DXboqkKPdG5p8vbqzblXllZHCAEztDcYSOJQZmlxJtRXoVDF3LRawMYWIU11ZDmQsK5Q6cStb6igDPSRgnQKNV5x9AhvT3nj/rSJ//eS3n9h/SJwWkc1vV48AAAAASUVORK5CYII='},
  {name:'FP&A Plus', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJsSURBVHgBlZXPaxNBFMffzO4GbJOY4KFaK0ShNodGAyroRdIgQhFpeqggJehVL61/QRLw0pu9eLQRWz3GKlW8aCp4q1DqD1IPNuAPPBibJrE/srudzpskNLvd3SRfCNl9M/PZ976z+4ZACw0+eRkhEhnBa6az+c/x61mn+cRuIPzsdUDT9Rl+GTEsICQtUZpavjmcbwsYzmR82qZrguyySUbAB7apkKRM6WMz2AAcnFtAUNIRZFyc5+DUp/FraQMQfeIDCTCV10peRYGSqgqwJElDmC0JPX0RY7s0Ax1q5FQf3L90FsZevYfcerkWZGyIcliiVRZWKqsaTH38ug9D8Sop/wvbwaInjsKHG1ch6PcY4se7D0Hu3wbM5tbMSyLUDhb0e+FXZRMernyDAf9hAWnofM8RqFQ1iPb1HFgnmwPoDSq3XoLV+g/l4aW/iUXh7Y8/otQ7oX64e+a00UMualVmPBgQIMzS66p5WOa7Of/9J/z+v2WY73G5nDOcWFwS2VzgZT26chGmlr7A7GpejGH5rWTpIWazn4HCS+sX5Tay7QiIHk5fPmeIHevugl6+KW5F7hyIO4g+2gkfiN62DXQSlo9fx/jASUdg1mqgXFUPxCpN3uKXYqGs1DsWX2SMxfiNr/Hy4jtY2K4K6EqhCIWtHRFDSHNsrVThr9cG/OVzCYOiLEvDottgM9V1PelWlFueNnbSXElF09JSV/Xe8uho0dAP6+B3DCDQJi/LO0yq+ViwPAJCcwu3+cSEHdiqsToCRbYz/CiQ5cl6461N5j4xYNOyW3uA5dk8zFnCBk0NA5V83KfndqCG9gCf1v1ZXKqgQAAAAABJRU5ErkJggg=='},
  {name:'Intercompany Management', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJcSURBVHgBnVXPSxRhGH5mHYIVzaVAUBcayouRpITYqexgedzoVJfM/gCnQ8fSJejSofHQpUPurUtQ1/LQ5imsqDASosMc3AKjbVZlp6TJnvdzd5nZvhnXHhjm/b73/Z7v/TXvGNgFby177A8wJnIKKAy7jptkbyQQWSSaoTjZpCqQOB9HbGiIMnxNk8zmOwM9PJI6JM0nEr627Bw37lK00BpcPvkTrlOIEC5Z9pBJou1arvYKkhT5XJE0GELWBjxHfHgtg2k6YzIX82Gynulz6J46jWDdx/dHS9iXPYD00T4VSvVjCf5KiTYTynbtwQt8nXvaIKRjMyYNh+obBy+MoMeeUIYwDCV/ungPm9cfKn1m/BgO379K/SJ+b/jopX6rVObFr5ReUpYKu9xxsh/es2XlVVCpwqdHnaNHGnrxdGu1TO+raB/oxebLz+gY7Y+EHSGU2zpJWllYVmRC8Kv0o6EXWV3GdJRr6aiufIkQmuGFhNI1PohDdy6ptYQiB+sQWTzL3jyv1uJhWC8w3lj2NprQdXZQeSEHdJDUtO1Po8L0NCOlOyBEUm1B99QpHH9/Wz31PSmeXKiDqdsUY2/hA7I3cqqFwlUN+A7Wf8Z6r/VQ8I2tI8Sqqhs7VZUOSA/0YfXW47hj8YSCRlUrvspXO6seF2od0tjFuG9YV9W1+cVYMvVNt/ItSz8KpDcTICNtWE0bGaYBMMvFZfwHItMmrNjrPKTtOzpybcR1iqG9f8Fmn8TO+LdiuDyOqjyJHM0lesSlgQWcY85nGZ4HvdfJqP2sciIz6U92++v9BeuFBZm4sc7RAAAAAElFTkSuQmCC'},
  {name:'Lease Accounting', icon:'data:image/png;base64,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'}
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

// ── Add / Remove language ─────────────────────────────────────────────────────
function addLanguage(code) {
  if (!code || activeLangs.indexOf(code) > -1) return;
  activeLangs.push(code);
  var enBlock = document.getElementById('block-en');
  // Strip injected controls from EN before cloning — they carry no listeners in the clone
  stripEditControls();
  var newBlock = enBlock.cloneNode(true);
  // Re-inject controls back into EN block since we stripped them
  addEditControlsToExisting();
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

var _sortableInstances = [];

// ── Load Sortable.js from CDN (once) ──────────────────────────────────────────
function loadSortable(cb) {
  if (window.Sortable) { cb(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js';
  s.onload = cb;
  document.head.appendChild(s);
}

// ── Enable drag-drop on all main-content containers ───────────────────────────
function enableDragDrop() {
  loadSortable(function() {
    document.querySelectorAll('.main-content').forEach(function(container) {
      var inst = Sortable.create(container, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'drag-ghost',
        chosenClass: 'drag-chosen',
        filter: '[contenteditable]', // don't start drag when clicking editable text
        preventOnFilter: false
      });
      _sortableInstances.push(inst);
    });
  });
}

// ── Destroy all drag-drop instances ──────────────────────────────────────────
function disableDragDrop() {
  _sortableInstances.forEach(function(inst) { try { inst.destroy(); } catch(e) {} });
  _sortableInstances = [];
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
  document.getElementById('save-status').textContent = 'Editing: ' + currentLang.toUpperCase();
  addEditControlsToExisting();
  enableDragDrop();
}

function disableEditMode() {
  document.body.classList.remove('edit-mode');
  document.querySelectorAll('[contenteditable]').forEach(function(el) { el.removeAttribute('contenteditable'); });
  document.getElementById('edit-fab').classList.remove('hidden');
  document.getElementById('edit-toolbar').classList.remove('visible');
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-btn').disabled = false;
  var panel = document.getElementById('inline-products-panel'); if (panel) panel.remove();
  disableDragDrop();
  stripEditControls();
}

function closeModal() {
  document.getElementById('token-modal').classList.remove('visible');
  document.getElementById('token-input').value = '';
  document.getElementById('token-error').textContent = '';
}

// ── Add edit controls to existing elements ────────────────────────────────────
// Called every time edit mode opens. stripEditControls() runs before every save
// so the page is always clean on load — no guards needed, just inject directly.
function addEditControlsToExisting() {

  // ── Clips + drag handle ────────────────────────────────────────────────────
  document.querySelectorAll('.clip-card').forEach(function(card) {
    // Drag handle
    var handle = document.createElement('div');
    handle.className = 'drag-handle edit-only'; handle.title = 'Drag to reorder'; handle.textContent = '⠿';
    card.insertBefore(handle, card.firstChild);
    // 🗑 delete entire clip
    var rb = document.createElement('button');
    rb.className = 'clip-remove-btn edit-only';
    rb.innerHTML = '🗑'; rb.title = 'Delete this clip';
    rb.addEventListener('click', function() { if (confirm('Delete this clip?')) card.remove(); });
    card.insertBefore(rb, handle);

    var player = card.querySelector('.clip-player');

    // Upload MP3 button
    if (player) {
      var upBtn = document.createElement('button');
      upBtn.className = 'upload-audio-btn edit-only';
      upBtn.textContent = 'Upload MP3';
      upBtn.addEventListener('click', function() { uploadAudio(upBtn); });
      player.appendChild(upBtn);
    }

    // ✕ on clip label — deletes uploaded audio file from GitHub
    var clipLabel = card.querySelector('.clip-label');
    if (clipLabel) {
      var xBtn = document.createElement('button');
      xBtn.className = 'audio-del-x edit-only';
      xBtn.title = 'Delete uploaded audio'; xBtn.textContent = '✕';
      xBtn.addEventListener('click', async function(e) {
        e.stopPropagation();
        await deleteAudioFile(player, xBtn);
      });
      clipLabel.appendChild(xBtn);
    }
  });

  // ── Sections + drag handle ─────────────────────────────────────────────────
  document.querySelectorAll('.story-sec').forEach(function(sec) {
    var handle = document.createElement('div');
    handle.className = 'drag-handle edit-only'; handle.title = 'Drag to reorder'; handle.textContent = '⠿';
    sec.insertBefore(handle, sec.firstChild);
    var btn = document.createElement('button');
    btn.className = 'sec-delete-btn edit-only';
    btn.innerHTML = '🗑'; btn.title = 'Delete section';
    btn.addEventListener('click', function() { if (confirm('Delete this section?')) sec.remove(); });
    sec.insertBefore(btn, handle);
  });

  // ── Stats row ──────────────────────────────────────────────────────────────
  document.querySelectorAll('.stats-row').forEach(function(row) {
    row.querySelectorAll('.stat-tile').forEach(addStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'stat-add-btn edit-only';
    addBtn.textContent = '+'; addBtn.title = 'Add stat';
    addBtn.addEventListener('click', function() { addStatTile(row, addBtn); });
    row.appendChild(addBtn);
  });

  // ── Who stats ──────────────────────────────────────────────────────────────
  document.querySelectorAll('.who-stats-grid').forEach(function(grid) {
    grid.querySelectorAll('.who-stat-tile').forEach(addWhoStatDeleteBtn);
    var addBtn = document.createElement('button');
    addBtn.className = 'who-stat-add-btn edit-only';
    addBtn.textContent = '+ Add stat';
    addBtn.addEventListener('click', function() { addWhoStat(grid, addBtn); });
    grid.appendChild(addBtn);
  });

  // ── KRS items ──────────────────────────────────────────────────────────────
  document.querySelectorAll('.krs-item').forEach(function(item) {
    var btn = document.createElement('button');
    btn.className = 'krs-item-del edit-only';
    btn.innerHTML = '✕'; btn.title = 'Delete result';
    btn.addEventListener('click', function() { item.remove(); });
    item.appendChild(btn);
  });
  var krsList = document.querySelector('.krs-list');
  if (krsList) {
    var krsAdd = document.createElement('button');
    krsAdd.className = 'krs-add-btn edit-only';
    krsAdd.textContent = '+ Add result';
    krsAdd.addEventListener('click', function() { addKrsItem(krsList, krsAdd); });
    krsList.appendChild(krsAdd);
  }

  // ── Participants ───────────────────────────────────────────────────────────
  document.querySelectorAll('.sidebar-card[data-section="participants"], .sidebar-card:has(.participant-name)').forEach(function(card) {
    card.querySelectorAll('p').forEach(function(p) {
      var del = document.createElement('button');
      del.className = 'part-del-btn edit-only';
      del.innerHTML = '✕'; del.title = 'Remove participant';
      del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:13px;float:right;padding:0 2px;line-height:1';
      del.addEventListener('click', function() { p.remove(); });
      p.insertBefore(del, p.firstChild);
    });
    var addBtn = document.createElement('button');
    addBtn.className = 'part-add-btn edit-only';
    addBtn.textContent = '+ Add participant';
    addBtn.style.cssText = 'width:100%;background:transparent;border:1px dashed var(--border,#E0DFF0);border-radius:5px;padding:6px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer;color:#888;margin-top:8px;transition:all .15s';
    addBtn.addEventListener('click', function() { addParticipantInline(card, addBtn); });
    card.appendChild(addBtn);
  });

  // ── Results ────────────────────────────────────────────────────────────────
  document.querySelectorAll('.sidebar-card[data-section="results"], .sidebar-card:has(.result-item)').forEach(function(card) {
    card.querySelectorAll('.result-item').forEach(function(item) {
      var del = document.createElement('button');
      del.className = 'result-del-btn edit-only';
      del.innerHTML = '✕'; del.title = 'Remove result';
      del.style.cssText = 'background:transparent;border:none;cursor:pointer;color:#ddd;font-size:11px;float:right;padding:0 2px;line-height:1.5';
      del.addEventListener('click', function() { item.remove(); });
      item.insertBefore(del, item.firstChild);
    });
    var addBtn = document.createElement('button');
    addBtn.className = 'result-add-btn edit-only';
    addBtn.textContent = '+ Add result';
    addBtn.style.cssText = 'width:100%;background:transparent;border:1px dashed var(--border,#E0DFF0);border-radius:5px;padding:6px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;cursor:pointer;color:#888;margin-top:8px;transition:all .15s';
    addBtn.addEventListener('click', function() { addResultInline(card, addBtn); });
    card.appendChild(addBtn);
  });
}

// ── Section management ────────────────────────────────────────────────────────
function addSection(btn) {
  var block = btn.closest('.lang-block') || document.querySelector('.lang-block.active');
  if (!block) return;
  var container = block.querySelector('.main-content');
  if (!container) return;
  var sec = document.createElement('div');
  sec.className = 'story-sec';
  // drag handle
  var handle = document.createElement('div');
  handle.className = 'drag-handle edit-only'; handle.title = 'Drag to reorder'; handle.textContent = '⠿';
  var delBtn = document.createElement('button');
  delBtn.className = 'sec-delete-btn edit-only'; delBtn.innerHTML = '🗑'; delBtn.title = 'Delete section';
  delBtn.addEventListener('click', function() { if (confirm('Delete this section?')) sec.remove(); });
  var label = document.createElement('div');
  label.className = 'sec-label'; label.contentEditable = 'true'; label.textContent = 'Section label';
  var h2 = document.createElement('h2');
  h2.contentEditable = 'true'; h2.textContent = 'Section heading';
  var p = document.createElement('p');
  p.contentEditable = 'true'; p.textContent = 'Write your content here.';
  sec.appendChild(delBtn); sec.appendChild(handle); sec.appendChild(label); sec.appendChild(h2); sec.appendChild(p);
  container.appendChild(sec);
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function addStatDeleteBtn(tile) {
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

// ── Delete audio file from GitHub ────────────────────────────────────────────
async function deleteAudioFile(player, xBtn) {
  var srcEl = player.querySelector('audio source');
  var rawSrc = srcEl ? (srcEl.getAttribute('src') || '') : '';
  if (!rawSrc && srcEl && srcEl.src && srcEl.src.indexOf('.mp3') > -1) rawSrc = srcEl.src;
  if (!rawSrc) { alert('No audio file on this clip yet.'); return; }
  var filename = rawSrc.split('?')[0].split('/').pop();
  if (!filename || !filename.includes('.')) { alert('Could not determine filename.'); return; }
  if (!confirm('Delete "' + filename + '" from GitHub?\nThis cannot be undone.')) return;

  var orig = xBtn.textContent;
  xBtn.textContent = '…'; xBtn.disabled = true;
  var path = (GH_CLIENT_FOLDER + filename).replace(/\/\//g, '/');
  try {
    var getRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, {
      headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json'}
    });
    if (!getRes.ok) { var e=await getRes.json().catch(function(){return{};}); throw new Error('File not found ('+getRes.status+'): '+(e.message||path)); }
    var fileData = await getRes.json();
    var delRes = await fetch('https://api.github.com/repos/'+GH_REPO+'/contents/'+path, {
      method:'DELETE',
      headers:{'Authorization':'Bearer '+sessionToken,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify({message:'Delete audio: '+filename, sha:fileData.sha})
    });
    if (!delRes.ok) { var e2=await delRes.json().catch(function(){return{};}); throw new Error('Delete failed ('+delRes.status+'): '+(e2.message||'unknown')); }
    if (srcEl) srcEl.removeAttribute('src');
    var aud = player.querySelector('audio'); if (aud) aud.load();
    var upBtn = player.querySelector('.upload-audio-btn'); if (upBtn) upBtn.textContent = 'Upload MP3';
    xBtn.style.display = 'none'; // hide ✕ since no audio now
  } catch(err) {
    xBtn.textContent = orig; xBtn.disabled = false;
    alert('Delete audio failed:\n\n' + err.message + '\n\nPath: ' + path);
  }
}

// ── Clips ─────────────────────────────────────────────────────────────────────
function addClipInline(btn) {
  var block = btn.closest('.lang-block') || document.querySelector('.lang-block.active');
  var container = block ? block.querySelector('.main-content') : btn.parentNode;
  var card = document.createElement('div');
  card.className = 'clip-card';

  var handle = document.createElement('div');
  handle.className = 'drag-handle edit-only'; handle.title = 'Drag to reorder'; handle.textContent = '⠿';

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

  // ✕ on the label — deletes the uploaded audio file
  var xBtn = document.createElement('button');
  xBtn.className = 'audio-del-x edit-only';
  xBtn.title = 'Delete uploaded audio'; xBtn.textContent = '✕';
  xBtn.addEventListener('click', async function(e) {
    e.stopPropagation();
    await deleteAudioFile(pl, xBtn);
  });
  lbl.appendChild(xBtn);

  var pl = document.createElement('div');
  pl.className = 'clip-player';
  pl.appendChild(aud); pl.appendChild(upBtn);

  card.appendChild(rb); card.appendChild(handle); card.appendChild(lbl); card.appendChild(qt); card.appendChild(pl);
  if (container) container.appendChild(card);
  else btn.parentNode.insertBefore(card, btn);
}

// ── Who sidebar stats ─────────────────────────────────────────────────────────
function addWhoStatDeleteBtn(tile) {
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
  document.querySelectorAll('.app-tag .app-name').forEach(function(s) { currentApps.push(s.textContent.trim()); });
  PROPHIX_PRODUCTS.forEach(function(prod) {
    var lbl = document.createElement('label');
    lbl.className = 'prod-toggle' + (currentApps.indexOf(prod.name) > -1 ? ' active' : '');
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = prod.name; cb.checked = currentApps.indexOf(prod.name) > -1; cb.style.display = 'none';
    var img = document.createElement('img');
    img.src = prod.icon; img.style.cssText = 'width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:6px';
    lbl.appendChild(cb); lbl.appendChild(img); lbl.appendChild(document.createTextNode(prod.name));
    lbl.addEventListener('click', function(e) {
      e.preventDefault(); cb.checked = !cb.checked; lbl.classList.toggle('active', cb.checked);
      var sel = [];
      panel.querySelectorAll('input:checked').forEach(function(c) {
        var p = PROPHIX_PRODUCTS.find(function(x){ return x.name === c.value; });
        if (p) sel.push(p);
      });
      document.querySelectorAll('.apps-display').forEach(function(d) {
        d.innerHTML = sel.map(function(p) {
          return '<div class="app-tag"><img class="app-icon" src="'+p.icon+'" alt="'+p.name+'"><span class="app-name">'+p.name+'</span></div>';
        }).join('');
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

// ── Strip all dynamically injected edit controls before save snapshot ─────────
// These are re-injected fresh by addEditControlsToExisting() on every edit-mode
// open. Saving them into the HTML causes dead buttons (no event listeners) after
// reload, which is why add/remove features break intermittently over time.
function stripEditControls() {
  var selectors = [
    '.sec-delete-btn',
    '.drag-handle',
    '.clip-remove-btn',
    '.upload-audio-btn',
    '.audio-del-x',
    '.delete-audio-btn',      // old style, may exist on pages from earlier versions
    '.stat-add-btn',
    '.stat-tile-del',         // was wrongly listed as .stat-del-btn
    '.krs-add-btn',
    '.krs-item-del',
    '.who-stat-add-btn',
    '.who-stat-del',
    '.part-add-btn',
    '.part-del-btn',
    '.result-add-btn',
    '.result-del-btn',
    '#inline-products-panel'
  ];
  selectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) { el.remove(); });
  });
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
    var panel = document.getElementById('inline-products-panel'); if (panel) panel.remove();
    disableDragDrop();
    stripEditControls();

    var html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Restore edit mode visually while the API call runs so the user can see the saving indicator
    document.body.classList.add('edit-mode');
    document.getElementById('edit-fab').classList.add('hidden');
    document.getElementById('edit-toolbar').classList.add('visible');
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

  // Inject styles needed for features added after a page was first published.
  // This guarantees they work on old pages without re-publishing.
  var runtimeStyle = document.createElement('style');
  runtimeStyle.textContent = [
    '.audio-del-x{display:none;margin-left:auto;background:transparent;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0 4px;line-height:1;flex-shrink:0}',
    '.audio-del-x:hover{color:#EF363D}',
    '.edit-mode .audio-del-x{display:inline!important}',
    '.clips-section-title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid #E0DFF0}',
    '.edit-only{display:none!important}',
    '.edit-mode .edit-only{display:block!important}',
    '.edit-mode .clip-remove-btn,.edit-mode .sec-delete-btn{display:inline-block!important}',
    '.edit-mode .lang-btn.remove-lang{display:inline-flex!important}',
    /* clip style — Eaglestone reference */
    '.clip-card{border-left:4px solid #EF363D!important}',
    '.clip-label{font-size:11px!important;font-weight:700!important;letter-spacing:1.5px!important;text-transform:uppercase!important;color:#EF363D!important}',
    '.clip-quote{font-size:15px!important;font-style:italic!important;color:#1A1A2E!important;font-weight:500!important;border-left:none!important;padding-left:0!important}',
    '.clip-quote::before{content:"\u201C"}',
    '.clip-quote::after{content:"\u201D"}',
    /* product panel */
    '.inline-products-panel{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #E0DFF0;border-radius:8px;padding:8px;z-index:200;box-shadow:0 4px 16px rgba(0,0,0,.1);display:flex;flex-direction:column;gap:4px}',
    '.prod-toggle{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;border:1px solid #E0DFF0;cursor:pointer;font-size:13px;font-weight:600;color:#1A1A2E;transition:all .15s;user-select:none}',
    '.prod-toggle img{width:22px;height:22px;object-fit:contain;flex-shrink:0}',
    '.prod-toggle.active{background:#fff5f5;border-color:#EF363D;color:#EF363D}',
    '.prod-toggle:hover{border-color:#EF363D}',
    /* story-sec bullet lists */
    '.story-sec ul{list-style:none!important;padding-left:0!important;margin:10px 0!important}',
    '.story-sec ul li{padding-left:18px!important;margin-bottom:8px!important;position:relative!important;font-size:15px!important;color:#444!important;line-height:1.75!important}',
    '.story-sec ul li::before{content:""!important;position:absolute!important;left:0!important;top:9px!important;width:7px!important;height:7px!important;border-radius:50%!important;background:#EF363D!important}',
    '.story-sec p{overflow-wrap:break-word;word-break:break-word}',
    /* drag handle */
    '.drag-handle{display:none;position:absolute;left:-22px;top:50%;transform:translateY(-50%);cursor:grab;color:#ccc;font-size:18px;line-height:1;user-select:none;padding:4px 2px}',
    '.drag-handle:hover{color:#888}',
    '.drag-handle:active{cursor:grabbing}',
    '.edit-mode .drag-handle{display:block!important}',
    '.story-sec,.clip-card{position:relative}',
    /* sortable feedback */
    '.drag-ghost{opacity:0.4;background:#f0f0ff!important;border:2px dashed #aab!important}',
    '.drag-chosen{box-shadow:0 4px 20px rgba(0,0,0,.15)!important}'
  ].join('');
  document.head.appendChild(runtimeStyle);
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
  // ── Inject product icons into existing app tags (old pages published without icons) ──
  document.querySelectorAll('.app-tag').forEach(function(tag) {
    if (tag.querySelector('img.app-icon')) return; // already has icon
    var nameEl = tag.querySelector('span:last-child') || tag.querySelector('span');
    if (!nameEl) return;
    var productName = nameEl.textContent.trim();
    var prod = PROPHIX_PRODUCTS.find(function(p) { return p.name === productName; });
    if (!prod) return;
    var img = document.createElement('img');
    img.className = 'app-icon';
    img.src = prod.icon; img.alt = productName;
    img.style.cssText = 'width:20px;height:20px;object-fit:contain;flex-shrink:0';
    tag.insertBefore(img, tag.firstChild);
    var dot = tag.querySelector('.app-dot'); if (dot) dot.remove();
    nameEl.className = 'app-name';
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
