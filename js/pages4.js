/* ========== SETTINGS ========== */
let settingsTab = 'menu';

function renderSettings(el) {
    el.innerHTML = `
        <div class="fade-in space-y-5">
            <div><h3 class="section-title">Settings</h3><p class="section-subtitle mb-0">Customize everything from here — no code needed.</p></div>
            <div class="tabs">
                <div class="tab ${settingsTab==='menu'?'active':''}" onclick="swSt('menu')">Menu Items</div>
                <div class="tab ${settingsTab==='templates'?'active':''}" onclick="swSt('templates')">WhatsApp Templates</div>
                <div class="tab ${settingsTab==='scripts'?'active':''}" onclick="swSt('scripts')">Scripts</div>
                <div class="tab ${settingsTab==='options'?'active':''}" onclick="swSt('options')">Options & Statuses</div>
                <div class="tab ${settingsTab==='data'?'active':''}" onclick="swSt('data')">Data Management</div>
            </div>
            <div id="stc"></div>
        </div>
    `;
    renderStContent();
}
function swSt(t) { settingsTab = t; renderSettings(document.getElementById('pageContent')); }
function renderStContent() {
    const c = document.getElementById('stc'); if (!c) return;
    switch (settingsTab) {
        case 'menu': renderMenuSt(c); break;
        case 'templates': renderTplSt(c); break;
        case 'scripts': renderScriptSt(c); break;
        case 'options': renderOptionsSt(c); break;
        case 'data': renderDataSt(c); break;
    }
}

/* ---- Menu Items Settings ---- */
function renderMenuSt(c) {
    const items = getMenu();
    c.innerHTML = `
        <div class="card p-5">
            <div class="flex items-center justify-between mb-5">
                <div><h4 class="font-semibold text-slate-800">Sidebar Menu Items</h4><p class="text-xs text-slate-500 mt-0.5">Drag to reorder · Toggle visibility · Customize sections</p></div>
                <button class="btn btn-primary" onclick="addMenuItem()">+ Add New Section</button>
            </div>
            <div id="menuList" class="space-y-2">
                ${items.map((m, i) => `
                    <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white" data-id="${m.id}" draggable="true">
                        <div class="drag-handle p-1 text-slate-400 select-none">⠿</div>
                        <div class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">${ICONS[m.icon] || ICONS[DEFAULT_ICON]}</div>
                        <div class="flex-1 min-w-0"><input class="input !p-2 text-sm font-medium" value="${escapeHtml(m.name)}" onchange="renameMenu('${m.id}', this.value)"></div>
                        <div class="flex items-center gap-1.5">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" ${m.visible ? 'checked' : ''} onchange="toggleMenu('${m.id}', this.checked)">
                                <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                            </label>
                            ${!m.system ? `<button class="btn btn-sm btn-danger btn-icon" onclick="delMenu('${m.id}')">🗑️</button>` : `<span class="text-xs text-slate-400">Built-in</span>`}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    enableDrag();
}
function enableDrag() {
    let dragged = null;
    document.querySelectorAll('#menuList [data-id]').forEach(el => {
        el.addEventListener('dragstart', e => { dragged = el; el.style.opacity = '0.4'; });
        el.addEventListener('dragend', () => { dragged.style.opacity = '1'; dragged = null; saveMenuOrder(); });
        el.addEventListener('dragover', e => {
            e.preventDefault(); if (!dragged || dragged === el) return;
            const r = el.getBoundingClientRect();
            const next = (e.clientY - r.top) / r.height > 0.5;
            el.parentNode.insertBefore(dragged, next && el.nextSibling ? el.nextSibling : el);
        });
    });
}
function saveMenuOrder() {
    const items = Storage.get('menuItems');
    document.querySelectorAll('#menuList [data-id]').forEach((el, i) => {
        const m = items.find(x => x.id === el.dataset.id);
        if (m) m.order = i;
    });
    Storage.set('menuItems', items); renderSidebar();
}
function addMenuItem() {
    openModal(`
        <div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">Add New Section</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div>
        ${textField('nm_n', 'Section Name *', 'e.g. Reports, Payments')}
        <div class="form-group"><label class="form-label">Icon</label>
        <div class="grid grid-cols-5 md:grid-cols-9 gap-2" id="iconPk">
            ${Object.keys(ICONS).map(k => `<div class="w-11 h-11 rounded-lg border-2 ${k===DEFAULT_ICON?'border-indigo-500 bg-indigo-50':'border-slate-200 hover:border-indigo-300'} flex items-center justify-center cursor-pointer" data-icon="${k}" onclick="selIcon('${k}')">${ICONS[k]}</div>`).join('')}
        </div><input type="hidden" id="nm_i" value="${DEFAULT_ICON}"></div>
        <div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveNewMenu()">Add Section</button></div></div>
    `);
}
function selIcon(k) {
    document.querySelectorAll('#iconPk > div').forEach(d => d.className = 'w-11 h-11 rounded-lg border-2 border-slate-200 hover:border-indigo-300 flex items-center justify-center cursor-pointer');
    const el = document.querySelector(`#iconPk [data-icon="${k}"]`);
    if (el) el.className = 'w-11 h-11 rounded-lg border-2 border-indigo-500 bg-indigo-50 flex items-center justify-center cursor-pointer';
    setVal('nm_i', k);
}
function saveNewMenu() {
    const name = getVal('nm_n'); if (!name) { toast('Name required', 'error'); return; }
    const icon = getVal('nm_i') || DEFAULT_ICON;
    const items = Storage.get('menuItems');
    items.push({ id: 'custom_' + Date.now().toString(36), name, icon, order: items.length, visible: true, system: false });
    Storage.set('menuItems', items); renderSidebar(); closeModal(); renderStContent();
    toast('Section added ✅', 'success');
}
function renameMenu(id, name) {
    const items = Storage.get('menuItems');
    const m = items.find(x => x.id === id); if (m && name) { m.name = name; Storage.set('menuItems', items); renderSidebar(); }
}
function toggleMenu(id, vis) {
    const items = Storage.get('menuItems');
    const m = items.find(x => x.id === id); if (m) { m.visible = vis; Storage.set('menuItems', items); renderSidebar(); }
}
function delMenu(id) {
    confirmDialog('Delete Section', 'Remove this menu item?', () => {
        Storage.set('menuItems', Storage.get('menuItems').filter(m => m.id !== id));
        renderSidebar(); renderStContent(); toast('Deleted', 'success');
    }, 'Delete');
}

/* ---- Templates Settings ---- */
function renderTplSt(c) {
    const templates = Storage.get('templates') || [];
    const sections = [{v:'demo',l:'Demo Ready'},{v:'tss',l:'TSS Required'},{v:'increment',l:'Increment'}];
    c.innerHTML = `
        <div class="card p-5">
            <div class="flex items-center justify-between mb-5">
                <div><h4 class="font-semibold text-slate-800">WhatsApp Templates</h4><p class="text-xs text-slate-500 mt-0.5">Use variables: {{name}} {{company}} {{phone}} {{serial}} {{remark}} {{date}} {{requirement}} {{currentPlan}}</p></div>
                <button class="btn btn-primary" onclick="openTplModal()">+ New Template</button>
            </div>
            <div class="space-y-3">
                ${templates.length === 0 ? `<div class="empty-state py-8"><p class="text-slate-500">No templates yet. Create your first one.</p></div>` : templates.map(t => `
                    <div class="border border-slate-200 rounded-xl p-4 bg-white">
                        <div class="flex items-start justify-between gap-3 mb-2">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <h5 class="font-semibold text-slate-800">${escapeHtml(t.name)}</h5>
                                    <span class="badge badge-indigo">${sections.find(s=>s.v===t.section)?.l || t.section}</span>
                                    ${t.default ? '<span class="badge badge-green">Default</span>' : `<button class="btn btn-xs btn-secondary" style="padding:0.15rem 0.5rem;font-size:0.7rem" onclick="setDefaultTpl('${t.id}')">Make Default</button>`}
                                </div>
                                <pre class="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">${escapeHtml(t.content || '')}</pre>
                            </div>
                            <div class="flex flex-col gap-1">
                                <button class="btn btn-sm btn-secondary" onclick="openTplModal('${t.id}')">Edit</button>
                                ${!t.default ? `<button class="btn btn-sm btn-danger btn-icon" onclick="delTpl('${t.id}')">🗑️</button>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
function openTplModal(id = null) {
    const templates = Storage.get('templates') || [];
    const d = id ? templates.find(t => t.id === id) || {} : {};
    const sections = [{v:'demo',l:'Demo Ready'},{v:'tss',l:'TSS Required'},{v:'increment',l:'Increment'}];
    openModal(`
        <div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">${id ? 'Edit' : 'New'} Template</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${textField('tpl_n', 'Template Name *', '', d.name || '')}
            ${selectField('tpl_s', 'Section', sections.map(s=>({value:s.v,label:s.l})), d.section || 'demo')}
        </div>
        ${textArea('tpl_c', 'Template Content (use {{var}} placeholders)\nAvailable: {{name}}, {{company}}, {{phone}}, {{serial}}, {{remark}}, {{date}}, {{requirement}}, {{currentPlan}}', 'e.g. *Name:* {{name}}\n*Company:* {{company}}', d.content || '', 10)}
        <div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveTpl('${id||''}')">${id?'Update':'Create'}</button></div></div>
    `);
}
function saveTpl(id) {
    const name = getVal('tpl_n'), content = getVal('tpl_c'), section = getVal('tpl_s');
    if (!name || !content || !section) { toast('All fields required', 'error'); return; }
    const arr = Storage.get('templates') || [];
    const entry = { name, section, content, updatedAt: Date.now() };
    if (id) { const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = { ...arr[i], ...entry }; }
    else {
        if (!arr.some(x => x.section === section)) entry.default = true;
        arr.push({ id: Storage.uid('tpl'), createdAt: Date.now(), default: false, ...entry });
    }
    Storage.set('templates', arr); closeModal(); renderStContent(); toast('Template saved ✅', 'success');
}
function setDefaultTpl(id) {
    const arr = Storage.get('templates') || [];
    const t = arr.find(x => x.id === id); if (!t) return;
    arr.forEach(x => { x.default = (x.section === t.section) ? (x.id === id) : x.default; });
    Storage.set('templates', arr); renderStContent(); toast('Set as default ✅', 'success');
}
function delTpl(id) {
    confirmDialog('Delete Template', 'Delete this template?', () => {
        Storage.set('templates', (Storage.get('templates') || []).filter(x => x.id !== id));
        renderStContent(); toast('Deleted', 'success');
    }, 'Delete');
}

/* ---- Scripts redirect to Scripts section ---- */
function renderScriptSt(c) {
    c.innerHTML = `
        <div class="card p-6 text-center">
            <h4 class="font-semibold text-slate-800 mb-2">Scripts Management</h4>
            <p class="text-sm text-slate-500 mb-4">Scripts are managed in the dedicated Scripts section.</p>
            <button class="btn btn-primary" onclick="navigateTo('scripts')">Go to Scripts →</button>
        </div>
    `;
}

/* ---- Options & Statuses ---- */
function renderOptionsSt(c) {
    const statuses = Storage.get('statuses') || [];
    const dates = Storage.get('demoDateOptions') || [];
    const tss = Storage.get('tssTypes') || [];
    const inc = Storage.get('incrementTypes') || [];
    c.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="card p-5">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-slate-800">Status Options</h4><button class="btn btn-sm btn-primary" onclick="addOpt('statuses', 'New Status')">+ Add</button></div>
                <div id="statuses-list" class="space-y-2">${statuses.map((s,i)=>optItem(s,'statuses',i)).join('')}</div>
            </div>
            <div class="card p-5">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-slate-800">Demo Date Options</h4><button class="btn btn-sm btn-primary" onclick="addOpt('demoDateOptions', 'New Option')">+ Add</button></div>
                <div id="demoDateOptions-list" class="space-y-2">${dates.map((s,i)=>optItem(s,'demoDateOptions',i)).join('')}</div>
            </div>
            <div class="card p-5">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-slate-800">TSS Types</h4><button class="btn btn-sm btn-primary" onclick="addOpt('tssTypes', 'New TSS Type')">+ Add</button></div>
                <div id="tssTypes-list" class="space-y-2">${tss.map((s,i)=>optItem(s,'tssTypes',i)).join('')}</div>
            </div>
            <div class="card p-5">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-slate-800">Increment / Upgrade Types</h4><button class="btn btn-sm btn-primary" onclick="addOpt('incrementTypes', 'New Type')">+ Add</button></div>
                <div id="incrementTypes-list" class="space-y-2">${inc.map((s,i)=>optItem(s,'incrementTypes',i)).join('')}</div>
            </div>
        </div>
    `;
}
function optItem(val, key, idx) {
    return `<div class="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50">
        <input class="input !p-1.5 text-sm flex-1" value="${escapeHtml(val)}" onchange="updOpt('${key}', ${idx}, this.value)">
        <button class="btn btn-sm btn-danger btn-icon" onclick="delOpt('${key}', ${idx})">🗑️</button>
    </div>`;
}
function addOpt(key, placeholder) {
    const arr = Storage.get(key) || []; arr.push(placeholder);
    Storage.set(key, arr); renderStContent(); toast('Added', 'success');
}
function updOpt(key, idx, val) {
    const arr = Storage.get(key) || []; arr[idx] = val; Storage.set(key, arr);
}
function delOpt(key, idx) {
    confirmDialog('Remove Item', 'Remove this option?', () => {
        const arr = Storage.get(key) || []; arr.splice(idx, 1); Storage.set(key, arr);
        renderStContent(); toast('Removed', 'success');
    }, 'Remove');
}

/* ---- Data Management ---- */
function renderDataSt(c) {
    const keys = ['leads','dailyCalls','demos','tss','increments','followUps','scripts','templates'];
    const counts = keys.map(k => ({ k, n: (Storage.get(k) || []).length }));
    const total = counts.reduce((s,x) => s + x.n, 0);
    c.innerHTML = `
        <div class="space-y-5">
            <div class="card p-5">
                <h4 class="font-semibold text-slate-800 mb-4">Data Summary</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    ${counts.map(x => `
                        <div class="stat-card !p-3"><span class="text-xl font-bold">${x.n}</span><p class="text-xs text-slate-500 mt-0.5">${x.k}</p></div>
                    `).join('')}
                </div>
                <div class="flex flex-wrap gap-2"><p class="text-sm text-slate-600">Total records: <b>${total}</b></p></div>
            </div>

            <div class="card p-5">
                <h4 class="font-semibold text-slate-800 mb-2">Export / Import</h4>
                <p class="text-sm text-slate-500 mb-4">Backup your data as JSON file or restore from a backup.</p>
                <div class="flex flex-wrap gap-3">
                    <button class="btn btn-success" onclick="exportData()">⬇️ Export All Data (JSON)</button>
                    <label class="btn btn-primary cursor-pointer">⬆️ Import Data<input type="file" accept=".json" class="hidden" onchange="importData(event)"></label>
                </div>
            </div>

            <div class="card p-5 border-red-200">
                <h4 class="font-semibold text-red-700 mb-2">⚠️ Danger Zone</h4>
                <p class="text-sm text-slate-500 mb-4">These actions cannot be undone. Export a backup first!</p>
                <div class="flex flex-wrap gap-3">
                    <button class="btn btn-warning" onclick="resetAll()">🔄 Reset to Factory Defaults (keeps data)</button>
                    <button class="btn btn-danger" onclick="nukeAll()">🔥 Delete ALL Data</button>
                </div>
            </div>
        </div>
    `;
}
function exportData() {
    const data = Storage.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kryzo-crm-backup-${todayStr()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Backup downloaded ✅', 'success');
}
function importData(e) {
    const f = e.target.files[0]; if (!f) return;
    confirmDialog('Import Data', 'This will replace ALL current data. Continue?', () => {
        const r = new FileReader();
        r.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                Object.keys(data).forEach(k => Storage.set(k, data[k]));
                toast('Data imported successfully! Reloading...', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch (err) { toast('Invalid backup file', 'error'); }
        };
        r.readAsText(f);
    }, 'Import & Replace');
}
function resetAll() {
    confirmDialog('Reset', 'Reset menu & settings only? Data (leads, etc.) will be kept.', () => {
        ['menuItems','statuses','demoDateOptions','tssTypes','incrementTypes','settings'].forEach(k => Storage.set(k, JSON.parse(JSON.stringify(Storage.defaults[k]))));
        // Restore default templates if none exist
        if (!Storage.get('templates') || Storage.get('templates').length === 0) Storage.set('templates', JSON.parse(JSON.stringify(Storage.defaults.templates)));
        if (!Storage.get('scripts') || Storage.get('scripts').length === 0) Storage.set('scripts', JSON.parse(JSON.stringify(Storage.defaults.scripts)));
        setTimeout(() => location.reload(), 500);
        toast('Reset done ✅', 'success');
    }, 'Reset');
}
function nukeAll() {
    confirmDialog('⚠️ DELETE EVERYTHING', 'This will delete ALL data permanently! Export backup first if needed.', () => {
        Storage.reset().then(ok => {
            if (ok) location.reload();
            else toast('Could not reset the SQL database. Please try again.', 'error');
        });
    }, 'DELETE ALL DATA');
}
