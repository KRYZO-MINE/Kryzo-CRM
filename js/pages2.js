/* ========== DAILY CALLING ========== */
function renderDailyCalling(el) {
    const calls = (Storage.get('dailyCalls') || []).slice().sort((a, b) => {
        const order = { Pending: 0, 'Follow-up': 1, Called: 2, Interested: 3, 'Demo Required': 4, 'TSS Required': 5, Completed: 6, 'Not Interested': 7 };
        return (order[a.status] || 0) - (order[b.status] || 0);
    });
    const statuses = Storage.get('statuses') || [];
    el.innerHTML = `
        <div class="fade-in space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div><h3 class="section-title">Daily Calling</h3><p class="section-subtitle mb-0">Manage today's call list.</p></div>
                <div class="flex flex-wrap gap-2">
                    <input id="dcSearch" type="text" class="input" placeholder="Search..." style="width:220px">
                    <button class="btn btn-primary" onclick="openDcModal()">+ Add Call Entry</button>
                </div>
            </div>
            <div class="flex flex-wrap gap-2" id="dcSF">
                <button class="chip-btn active" data-s="">All (${calls.length})</button>
                ${statuses.map(s => `<button class="chip-btn" data-s="${escapeHtml(s)}">${escapeHtml(s)} (${calls.filter(c => c.status === s).length})</button>`).join('')}
            </div>
            <div id="dcList" class="space-y-3">
                ${calls.length === 0 ? `
                    <div class="card p-10 empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        <h4 class="font-semibold text-slate-700 mb-1">No call entries yet</h4>
                        <p class="text-sm">Click "Add Call Entry" to start.</p>
                    </div>
                ` : calls.map(c => dcCard(c)).join('')}
            </div>
        </div>
    `;
    setTimeout(() => {
        document.getElementById('dcSearch').addEventListener('input', filtDC);
        document.querySelectorAll('#dcSF .chip-btn').forEach(b => b.addEventListener('click', () => {
            document.querySelectorAll('#dcSF .chip-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); filtDC();
        }));
    }, 10);
}

function dcCard(c) {
    return `
        <div class="card p-4" data-search="${escapeHtml([c.name,c.company,c.phone,c.purpose,c.remark].join(' '))}" data-status="${escapeHtml(c.status || '')}">
            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold flex-shrink-0">${(c.name || '?').charAt(0).toUpperCase()}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                        <h5 class="font-semibold text-slate-800 truncate">${escapeHtml(c.name)}</h5>
                        ${statusBadge(c.status)}
                        <span class="text-xs text-slate-500">${formatDate(c.nextActionDate || c.followUpDate)}</span>
                    </div>
                    <p class="text-sm text-slate-600 truncate">${escapeHtml(c.company || 'No company')} ${c.phone ? '· ' + escapeHtml(c.phone) : ''}</p>
                    ${c.purpose ? `<p class="text-xs text-slate-500 mt-1">Purpose: ${escapeHtml(c.purpose)}</p>` : ''}
                    ${c.remark ? `<p class="text-xs text-slate-500">Remark: ${escapeHtml(c.remark)}</p>` : ''}
                    <div class="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                        ${c.lastContacted ? `<span>Last: ${formatDateTime(c.lastContacted)}</span>` : ''}
                        ${c.nextAction ? `<span class="text-indigo-600 font-medium">Next: ${escapeHtml(c.nextAction)}</span>` : ''}
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 md:flex-col w-full md:w-auto">
                    <div class="flex gap-2 flex-1"><button class="btn btn-sm btn-success flex-1" onclick="makeCall('${escapeHtml(c.phone)}')">📞 Call</button>
                    <button class="btn btn-sm btn-primary flex-1" onclick="openWhatsApp('${escapeHtml(c.phone)}','Hi ${escapeHtml(c.name || '')}')">💬 WA</button></div>
                    <div class="flex gap-2 flex-1">
                        <button class="btn btn-sm btn-secondary flex-1" onclick="markCalled('${c.id}')">✓ Called</button>
                        <select class="input btn-sm flex-1 p-1 text-xs" onchange="chgDcStatus('${c.id}', this.value)">
                            ${(Storage.get('statuses') || []).map(s => `<option ${s === c.status ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-2 flex-1">
                        <button class="btn btn-sm btn-ghost flex-1" onclick="openRmk('${c.id}')">📝 Remark</button>
                        <button class="btn btn-sm btn-warning flex-1" onclick="openDCFU('${c.id}')">⏰ Follow-up</button>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="delDC('${c.id}')">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function filtDC() {
    const q = (document.getElementById('dcSearch')?.value || '').toLowerCase();
    const s = document.querySelector('#dcSF .chip-btn.active')?.dataset?.s || '';
    document.querySelectorAll('#dcList > [data-search]').forEach(el => {
        const ok = el.dataset.search.toLowerCase().includes(q) && (!s || el.dataset.status === s);
        el.style.display = ok ? '' : 'none';
    });
}

function openDcModal(editId = null) {
    const statuses = Storage.get('statuses') || [];
    let d = {}; if (editId) d = (Storage.get('dailyCalls') || []).find(c => c.id === editId) || {};
    openModal(`
        <div class="p-6">
            <div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">${editId ? 'Edit' : 'Add'} Call Entry</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${textField('dcf_name', 'Name *', '', d.name || '')}
                ${textField('dcf_company', 'Company Name', '', d.company || '')}
                ${textField('dcf_phone', 'Phone Number *', '', d.phone || '', false, 'tel')}
                ${textField('dcf_serial', 'Tally Serial Number', '', d.serial || '')}
                ${textField('dcf_purpose', 'Purpose of Call', '', d.purpose || '')}
                ${selectField('dcf_status', 'Status *', statuses, d.status || 'Pending')}
            </div>
            ${textArea('dcf_remark', 'Remark', '', d.remark || '')}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group"><label class="form-label">Follow-up Date</label><input type="date" id="dcf_fu" class="input" value="${d.followUpDate || ''}"></div>
                <div class="form-group"><label class="form-label">Next Action Date</label><input type="date" id="dcf_na" class="input" value="${d.nextActionDate || ''}"></div>
            </div>
            ${textField('dcf_nad', 'Next Action', '', d.nextAction || '')}
            <div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDC('${editId || ''}')">${editId ? 'Update' : 'Add'}</button></div>
        </div>
    `);
}

function saveDC(editId) {
    const name = getVal('dcf_name'), phone = getVal('dcf_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const arr = Storage.get('dailyCalls') || [];
    const entry = { name, company: getVal('dcf_company'), phone, serial: getVal('dcf_serial'), purpose: getVal('dcf_purpose'), status: getVal('dcf_status') || 'Pending', remark: getVal('dcf_remark'), followUpDate: getVal('dcf_fu'), nextActionDate: getVal('dcf_na'), nextAction: getVal('dcf_nad'), date: todayStr() };
    if (editId) { const i = arr.findIndex(c => c.id === editId); if (i >= 0) arr[i] = { ...arr[i], ...entry, updatedAt: Date.now() }; }
    else arr.unshift({ id: Storage.uid('dc'), createdAt: Date.now(), lastContacted: null, ...entry });
    Storage.set('dailyCalls', arr);
    upsertLead({ name, company: entry.company, phone, serial: entry.serial, remark: entry.remark, status: entry.status, category: 'Daily Call', nextFollowUp: entry.followUpDate });
    if (entry.followUpDate) addFollowUp(null, name, phone, entry.followUpDate, entry.purpose, entry.remark);
    closeModal(); renderDailyCalling(document.getElementById('pageContent'));
    toast('Call entry saved ✅', 'success');
}

function markCalled(id) {
    const arr = Storage.get('dailyCalls') || [];
    const c = arr.find(x => x.id === id); if (!c) return;
    c.lastContacted = Date.now(); if (c.status === 'Pending') c.status = 'Called';
    Storage.set('dailyCalls', arr); renderDailyCalling(document.getElementById('pageContent'));
    toast('Marked as called', 'success');
}
function chgDcStatus(id, s) {
    const arr = Storage.get('dailyCalls') || [];
    const c = arr.find(x => x.id === id); if (!c) return;
    c.status = s; c.updatedAt = Date.now(); Storage.set('dailyCalls', arr);
    toast('Status updated', 'success');
}
function openRmk(id) {
    const arr = Storage.get('dailyCalls') || []; const c = arr.find(x => x.id === id); if (!c) return;
    openModal(`<div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">Add Remark</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div>${textArea('rmk_t', 'Remark for ' + escapeHtml(c.name), '', c.remark || '', 4)}<div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveRmk('${id}')">Save</button></div></div>`);
}
function saveRmk(id) {
    const arr = Storage.get('dailyCalls') || []; const c = arr.find(x => x.id === id); if (!c) return;
    c.remark = getVal('rmk_t'); c.updatedAt = Date.now(); Storage.set('dailyCalls', arr);
    closeModal(); renderDailyCalling(document.getElementById('pageContent')); toast('Remark saved', 'success');
}
function openDCFU(id) {
    const arr = Storage.get('dailyCalls') || []; const c = arr.find(x => x.id === id); if (!c) return;
    openModal(`<div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">Schedule Follow-up</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div><div class="form-group"><label class="form-label">Follow-up Date *</label><input id="fu_d" type="date" class="input" value="${c.followUpDate || todayStr()}"></div>${textField('fu_p', 'Purpose', '', c.purpose || '')}${textArea('fu_r', 'Remark', '', c.remark || '')}<div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDCFU('${id}')">Schedule</button></div></div>`);
}
function saveDCFU(id) {
    const arr = Storage.get('dailyCalls') || []; const c = arr.find(x => x.id === id); if (!c) return;
    const d = getVal('fu_d'); if (!d) { toast('Date required', 'error'); return; }
    c.followUpDate = d; c.nextAction = getVal('fu_p') || c.nextAction; c.remark = getVal('fu_r') || c.remark;
    Storage.set('dailyCalls', arr);
    addFollowUp(null, c.name, c.phone, d, getVal('fu_p') || c.purpose, getVal('fu_r') || c.remark);
    closeModal(); renderDailyCalling(document.getElementById('pageContent')); toast('Follow-up scheduled ✅', 'success');
}
function delDC(id) {
    confirmDialog('Delete', 'Permanently delete this call entry?', () => {
        Storage.set('dailyCalls', (Storage.get('dailyCalls') || []).filter(x => x.id !== id));
        renderDailyCalling(document.getElementById('pageContent')); toast('Deleted', 'success');
    }, 'Delete');
}

/* ========== SCRIPTS ========== */
let scrTab = 'all';
function renderScripts(el) {
    const scripts = Storage.get('scripts') || [];
    const cats = [...new Set(scripts.map(s => s.category || 'Uncategorized'))];
    el.innerHTML = `
        <div class="fade-in space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div><h3 class="section-title">Calling Scripts</h3><p class="section-subtitle mb-0">Scripts for every call scenario.</p></div>
                <div class="flex gap-2"><input id="scrQ" class="input" placeholder="Search..." style="width:220px"><button class="btn btn-primary" onclick="openScrModal()">+ New Script</button></div>
            </div>
            <div class="tabs" id="scrT">
                <div class="tab ${scrTab==='all'?'active':''}" onclick="swScr('all')">All (${scripts.length})</div>
                ${cats.map(c => `<div class="tab ${scrTab===c?'active':''}" onclick="swScr('${escapeHtml(c)}')">${escapeHtml(c)} (${scripts.filter(s => (s.category||'Uncategorized')===c).length})</div>`).join('')}
            </div>
            <div id="scrL" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${scripts.length === 0 ? `
                    <div class="card p-10 empty-state md:col-span-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <h4 class="font-semibold text-slate-700 mb-1">No scripts yet</h4><p class="text-sm">Create your first script.</p>
                    </div>
                ` : scripts.map(s => scrCard(s)).join('')}
            </div>
        </div>
    `;
    setTimeout(() => document.getElementById('scrQ').addEventListener('input', filtS), 10);
}
function swScr(t) { scrTab = t; renderScripts(document.getElementById('pageContent')); }
function scrCard(s) {
    return `<div class="script-card" data-search="${escapeHtml([s.name,s.category,s.content].join(' '))}" data-cat="${escapeHtml(s.category||'Uncategorized')}" style="display:${scrTab==='all'||scrTab===(s.category||'Uncategorized')?'':'none'}">
        <div class="flex items-start justify-between gap-3 mb-2"><div><h5 class="font-semibold text-slate-800">${escapeHtml(s.name)}</h5><div class="flex items-center gap-2 mt-1"><span class="badge badge-indigo">${escapeHtml(s.category||'Uncategorized')}</span><span class="text-xs text-slate-400">Updated ${formatDate(s.updatedAt)}</span></div></div></div>
        <div class="text-sm text-slate-600 whitespace-pre-wrap max-h-32 overflow-hidden mb-3" style="mask-image:linear-gradient(to bottom, black 60%, transparent)">${escapeHtml(s.content)}</div>
        <div class="flex flex-wrap gap-2"><button class="btn btn-sm btn-success flex-1" onclick="cpScr('${s.id}')">📋 Copy</button><button class="btn btn-sm btn-secondary" onclick="openScrModal('${s.id}')">Edit</button><button class="btn btn-sm btn-danger btn-icon" onclick="delScr('${s.id}')">🗑️</button></div>
    </div>`;
}
function filtS() {
    const q = (document.getElementById('scrQ')?.value || '').toLowerCase();
    document.querySelectorAll('#scrL > .script-card').forEach(el => {
        const ok = el.dataset.search.toLowerCase().includes(q) && (scrTab === 'all' || scrTab === el.dataset.cat);
        el.style.display = ok ? '' : 'none';
    });
}
async function cpScr(id) {
    const s = (Storage.get('scripts') || []).find(x => x.id === id); if (!s) return;
    const ok = await copyToClipboard(s.content || '');
    toast(ok ? 'Script copied ✅' : 'Copy failed', ok ? 'success' : 'error');
}
function openScrModal(id = null) {
    const scripts = Storage.get('scripts') || [];
    const d = id ? scripts.find(s => s.id === id) || {} : {};
    const cats = [...new Set([...scripts.map(s => s.category), 'New Customer', 'Demo', 'TSS', 'Follow-up', 'Increment', 'Custom'].filter(Boolean))];
    openModal(`<div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">${id ? 'Edit' : 'New'} Script</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${textField('scf_n', 'Script Name *', 'e.g. Cold Call', d.name || '')}<div class="form-group"><label class="form-label">Category</label><input list="scCats" id="scf_c" class="input" value="${escapeHtml(d.category||'')}" placeholder="Select or type"><datalist id="scCats">${cats.map(c => `<option value="${escapeHtml(c)}">`).join('')}</datalist></div></div>${textArea('scf_cnt', 'Script Content', 'Write script, use [Name] [Company] placeholders', d.content || '', 10)}<div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveScr('${id||''}')">${id?'Update':'Create'}</button></div></div>`);
}
function saveScr(id) {
    const name = getVal('scf_n'), content = getVal('scf_cnt');
    if (!name) { toast('Script name required', 'error'); return; }
    const arr = Storage.get('scripts') || [];
    const e = { name, category: getVal('scf_c') || 'Custom', content, updatedAt: Date.now() };
    if (id) { const i = arr.findIndex(s => s.id === id); if (i >= 0) arr[i] = { ...arr[i], ...e }; }
    else arr.push({ id: Storage.uid('sc'), createdAt: Date.now(), ...e });
    Storage.set('scripts', arr); closeModal(); renderScripts(document.getElementById('pageContent')); toast('Script saved ✅', 'success');
}
function delScr(id) {
    confirmDialog('Delete Script', 'Permanently delete this script?', () => {
        Storage.set('scripts', (Storage.get('scripts') || []).filter(s => s.id !== id));
        renderScripts(document.getElementById('pageContent')); toast('Deleted', 'success');
    }, 'Delete');
}
