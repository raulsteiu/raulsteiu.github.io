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
  {name:'FP&A Plus', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJsSURBVHgBlZXPaxNBFMefzO4GbJOY4KFaK0ShNodGAyroRdIgQhFpeqggJehVL61/QRLw0pu9eLQRWz3GKlW8aCp4q1DqD1IPNuAPPBibJrE/srudzpskNLvd3SRfCNl9M/PZ976z+4ZACw0+eRkhEhnBa6az+c/x61mn+cRuIPzsdUDT9Rl+GTEsICQtUZpavjmcbwsYzmR82qZrguyySUbAB7apkKRM6WMz2AAcnFtAUNIRZFyc5+DUp/FraQMQfeIDCTCV10peRYGSqgqwJElDmC0JPX0RY7s0Ax1q5FQf3L90FsZevYfcerkWZGyIcliiVRZWKqsaTH38ug9D8Sop/wvbwaInjsKHG1ch6PcY4se7D0Hu3wbM5tbMSyLUDhb0e+FXZRMernyDAf9hAWnofM8RqFQ1iPb1HFgnmwPoDSq3XoLV+g/l4aW/iUXh7Y8/otQ7oX64e+a00UMualVmPBgQIMzS66p5WOa7Of/9J/z+v2WY73G5nDOcWFwS2VzgZT26chGmlr7A7GpejGH5rWTpIWazn4HCS+sX5Tay7QiIHk5fPmeIHevugl6+KW5F7hyIO4g+2gkfiN62DXQSlo9fx/jASUdg1mqgXFUPxCpN3uKXYqGs1DsWX2SMxfiNr/Hy4jtY2K4K6EqhCIWtHRFDSHNsrVThr9cG/OVzCYOiLEvDottgM9V1PelWlFueNnbSXElF09JSV/Xe8uho0dAP6+B3DCDQJi/LO0yq+ViwPAJCcwu3+cSEHdiqsToCRbYz/CiQ5cl6461N5j4xYNOyW3uA5dk8zFnCBk0NA5V83KfndqCG9gCf1v1ZXKqgQAAAAABJRU5ErkJggg=='},
  {name:'Intercompany Management', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJcSURBVHgBnVXPSxRhGH5mHYIVzaVAUBcayouRpITYqexgedzoVJfM/gCnQ8fSJejSofHQpUPurUtQ1/LQ5imsqDASosMc3AKjbVZlp6TJnvdzd5nZvhnXHhjm/b73/Z7v/TXvGNgFby177A8wJnIKKAy7jptkbyQQWSSaoTjZpCqQOB9HbGiIMnxNk8zmOwM9PJI6JM0nEr627Bw37lK00BpcPvkTrlOIEC5Z9pBJou1arvYKkhT5XJE0GELWBjxHfHgtg2k6YzIX82Synulz6J46jWDdx/dHS9iXPYD00T4VSvVjCf5KiTYTynbtwQt8nXvaIKRjMyYNh+obBy+MoMeeUIYwDCV/ungPm9cfKn1m/BgO379K/SJ+b/jopX6rVObFr5ReUpYKu9xxsh/es2XlVVCpwqdHnaNHGnrxdGu1TO+raB/oxebLz+gY7Y+EHSGU2zpJWllYVmRC8Kv0o6EXWV3GdJRr6aiufIkQmuGFhNI1PohDdy6ptYQiB+sQWTzL3jyv1uJhWC8w3lj2NprQdXZQeSEHdJDUtO1Po8L0NCOlOyBEUm1B99QpHH9/Wz31PSmeXKiDqdsUY2/hA7I3cqqFwlUN+A7Wf8Z6r/VQ8I2tI8Sqqhs7VZUOSA/0YfXW47hj8YSCRlUrvspXO6seF2od0tjFuG9YV9W1+cVYMvVNt/ItSz8KpDcTICNtWE0bGaYBMMvFZfwHItMmrNjrPKTtOzpybcR1iqG9f8Fmn8TO+LdiuDyOqjyJHM0lesSlgQWcY85nGZ4HvdfJqP2ksiIz6U92++v9BeuFBZm4sc7RAAAAAElFTkSuQmCC'},
  {name:'Lease Accounting', icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAC8CAYAAAAO0P5AAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXd4FNX6xz+zfUNJQhFpIihNBKSoIIoIIgiCCkizg149+erN2w5ybkJEPHgQFcxBkXoxFdRgVYQ0FVpKliRqUMSY9CMmJs+ZlyYku9skHUg2772d3878Z3bCoIJ9GZblbDbrAA4jYoOBV5Ik5YBfVTfzYUabIZvcuraWG+c5PoF3tOqcGHP2vQ8rNQGDQ9aLHMCBP2WobCo6K31zkfuGwMCwbGOUHoANtmT8syTVnSrIYKKv+aEuF8JelcLazo1C64nTNQBZP+ocmh+yusQqOGhxcNSk9Ja286Owc9IBme/RMtc0ruPPHouPYayMKQzJIdDo1djTB9abHlj96BdrqWW7uDZ0WvCsF1KLQQhPXYLMt4iWGScg1+7Kdx4h7B2klhbEdfcNj4ju18N7ApiPPgLLF47rojRpN0i35sPDxXT3e99SKmAy7wArgindyJRdZNFun9QB67QbVIzVT37huOvaLfi3koCv16+UpUdR04ce/LNahJQS3Uz2w4OFQ0F6vG9Q07uwDaMqGMnRPHAEqqZMJpnzRaC0l0aOgjp2FnLJP7D3wYsiJJtMGLnqgRRd477eYvpm2zHhnHj9Mu+wUXECpxYXdECdhvHnT4R2BMrEogJKWq1jq8RuK5CcnSkWjrTVmmHbdGNq9R1WiLkUURyCphGe9M2IypIkVGX18hkjYNdvVL5sopADtQilRTquY2oFzeisCQsXvmoXDV5OY6o01mluwnFkK93n6b8idYJR/zV04Bsid4s3pb6tHaO3wIp/FtLqchkP+9Utpk1gwDLNTGwcajDSjx5UaK0SnPvgXHSiOL7y0zn3FA/6YWvm45wrhz5EfbQwHrCM4djnckUM6sUQtOmA1Vpg0OJkBNaT4pzn3C0tddN7fGpcdwoVjGTIZLNOE7CT+R1e9U/qPwWPL/KFHhi3AAAAAElFTkSuQmCC'}
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
