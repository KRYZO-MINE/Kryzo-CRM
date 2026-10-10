/* ========== LEADS / CUSTOMERS ========== */
let leadsSt = { sort: 'createdAt', dir: 'desc', search: '', cat: '', status: '' };
function renderLeads(el) {
    const leads = (Storage.get('leads') || []).slice();
    const categories = [...new Set(leads.map(l => l.category).filter(Boolean))];
    const statuses = Storage.get('statuses') || [];
    let list = leads.filter(l => {
        const s = leadsSt.search.toLowerCase();
        const m = !s || (l.name || '').toLowerCase().includes(s) || (l.company || '').toLowerCase().includes(s) || (l.phone || '').includes(s) || (l.serial || '').toLowerCase().includes(s);
        return m && (!leadsSt.cat || l.category === leadsSt.cat) && (!leadsSt.status || l.status === leadsSt.status);
    });
    list.sort((a, b) => {
        const ka = a[leadsSt.sort] || '', kb = b[leadsSt.sort] || '';
        return leadsSt.dir === 'asc' ? (ka > kb ? 1 : -1) : (ka < kb ? 1 : -1);
    });
    el.innerHTML = `
        <div class="fade-in space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div><h3 class="section-title">Leads / Customers</h3><p class="section-subtitle mb-0">Central customer database.</p></div>
                <input id="lq" class="input" placeholder="🔍 Name / Company / Phone / Serial" style="width:300px" value="${escapeHtml(leadsSt.search)}">
            </div>
            <div class="flex flex-wrap gap-2 items-center">
                <select id="lc" class="input" style="width:180px"><option value="">All Categories</option>${categories.map(c => `<option ${c === leadsSt.cat ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}</select>
                <select id="ls" class="input" style="width:180px"><option value="">All Statuses</option>${statuses.map(s => `<option ${s === leadsSt.status ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}</select>
                <select id="lsort" class="input" style="width:210px">
                    <option value="createdAt" ${leadsSt.sort === 'createdAt' ? 'selected' : ''}>Date Added (Newest)</option>
                    <option value="name" ${leadsSt.sort === 'name' ? 'selected' : ''}>Name (A-Z)</option>
                    <option value="company" ${leadsSt.sort === 'company' ? 'selected' : ''}>Company (A-Z)</option>
                    <option value="status" ${leadsSt.sort === 'status' ? 'selected' : ''}>Status</option>
                </select>
                <button class="btn btn-primary ml-auto" onclick="openLeadModal()">+ New Lead</button>
                <span class="text-sm text-slate-500">${list.length} of ${leads.length}</span>
            </div>
            ${list.length === 0 ? `
                <div class="card p-12 empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <h4 class="font-semibold text-slate-700 mb-1">No leads found</h4>
                    <p class="text-sm">Save from Demo/TSS pages or click + New Lead.</p>
                </div>
            ` : `
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Name</th><th>Company</th><th>Phone</th><th>Serial</th><th>Category</th><th>Status</th><th>Last Contact</th><th>Next</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${list.map(l => `
                                <tr>
                                    <td><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-semibold">${(l.name||'?').charAt(0).toUpperCase()}</div><span class="font-medium">${escapeHtml(l.name)}</span></div></td>
                                    <td class="text-slate-600">${escapeHtml(l.company||'-')}</td>
                                    <td><a href="tel:${escapeHtml(l.phone||'')}" class="text-indigo-600 hover:underline">${escapeHtml(l.phone||'-')}</a></td>
                                    <td class="font-mono text-xs text-slate-600">${escapeHtml(l.serial||'-')}</td>
                                    <td>${l.category ? `<span class="badge badge-indigo">${escapeHtml(l.category)}</span>` : '-'}</td>
                                    <td>${statusBadge(l.status)}</td>
                                    <td class="text-xs text-slate-500">${formatDate(l.updatedAt)}</td>
                                    <td class="text-xs ${l.nextFollowUp && isPast(l.nextFollowUp) ? 'text-red-600 font-semibold' : 'text-slate-500'}">${formatDate(l.nextFollowUp)}</td>
                                    <td><div class="flex justify-end gap-1">
                                        <button class="btn btn-sm btn-ghost btn-icon" onclick="viewLead('${l.id}')" title="View">👁️</button>
                                        <button class="btn btn-sm btn-ghost btn-icon" onclick="openLeadModal('${l.id}')" title="Edit">✏️</button>
                                        <button class="btn btn-sm btn-ghost btn-icon" onclick="makeCall('${escapeHtml(l.phone)}')" title="Call">📞</button>
                                        <button class="btn btn-sm btn-ghost btn-icon" onclick="openWhatsApp('${escapeHtml(l.phone)}','Hi ${escapeHtml(l.name||'')}')" title="WA">💬</button>
                                        <button class="btn btn-sm btn-ghost btn-icon text-red-500" onclick="delLead('${l.id}')" title="Delete">🗑️</button>
                                    </div></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
    setTimeout(() => {
        const q = document.getElementById('lq'); q.addEventListener('input', e => { leadsSt.search = e.target.value; renderLeads(document.getElementById('pageContent')); });
        document.getElementById('lc').addEventListener('change', e => { leadsSt.cat = e.target.value; renderLeads(document.getElementById('pageContent')); });
        document.getElementById('ls').addEventListener('change', e => { leadsSt.status = e.target.value; renderLeads(document.getElementById('pageContent')); });
        document.getElementById('lsort').addEventListener('change', e => {
            leadsSt.sort = e.target.value;
            leadsSt.dir = (e.target.value === 'name' || e.target.value === 'company' || e.target.value === 'status') ? 'asc' : 'desc';
            renderLeads(document.getElementById('pageContent'));
        });
    }, 10);
}

function viewLead(id) {
    const l = (Storage.get('leads') || []).find(x => x.id === id); if (!l) return;
    const fus = (Storage.get('followUps') || []).filter(f => f.leadId === id || f.name === l.name);
    openModal(`
        <div class="p-6">
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">${(l.name||'?').charAt(0).toUpperCase()}</div>
                    <div><h3 class="font-bold text-xl text-slate-800">${escapeHtml(l.name)}</h3><p class="text-sm text-slate-500">${escapeHtml(l.company||'No company')}</p></div>
                </div>
                <button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Phone</p><p class="font-medium"><a href="tel:${escapeHtml(l.phone||'')}">${escapeHtml(l.phone||'-')}</a></p></div>
                <div><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Tally Serial</p><p class="font-mono text-sm">${escapeHtml(l.serial||'-')}</p></div>
                <div><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Category</p>${l.category ? `<span class="badge badge-indigo">${escapeHtml(l.category)}</span>` : '<p>-</p>'}</div>
                <div><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>${statusBadge(l.status)}</div>
                <div><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Added On</p><p>${formatDate(l.createdAt)}</p></div>
                <div><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Next Follow-up</p><p>${formatDate(l.nextFollowUp)}</p></div>
            </div>
            <div class="mb-5"><p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Remarks</p><div class="card p-3 text-sm text-slate-700 whitespace-pre-wrap">${escapeHtml(l.remark||'No remarks')}</div></div>
            ${fus.length > 0 ? `<div><p class="text-xs text-slate-500 uppercase tracking-wide mb-2">Follow-up History (${fus.length})</p><div class="space-y-2">${fus.map(f => `<div class="p-3 border border-slate-100 rounded-lg flex items-start justify-between gap-3"><div class="flex-1"><p class="text-sm font-medium text-slate-700">${escapeHtml(f.purpose||'Follow-up')}</p><p class="text-xs text-slate-500">${formatDate(f.date)} · ${escapeHtml(f.remark||'')}</p></div><span class="badge ${f.status==='completed'?'badge-green':'badge-yellow'}">${escapeHtml(f.status)}</span></div>`).join('')}</div></div>` : ''}
            <div class="flex flex-wrap gap-2 mt-6 justify-end">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-success" onclick="makeCall('${escapeHtml(l.phone)}')">📞 Call</button>
                <button class="btn btn-primary" onclick="openWhatsApp('${escapeHtml(l.phone)}','Hi ${escapeHtml(l.name||'')}')">💬 WhatsApp</button>
                <button class="btn btn-warning" onclick="closeModal(); openLeadFU('${l.id}')">⏰ Follow-up</button>
                <button class="btn btn-secondary" onclick="closeModal(); openLeadModal('${l.id}')">✏️ Edit</button>
            </div>
        </div>
    `);
}

function openLeadFU(leadId) {
    const l = (Storage.get('leads') || []).find(x => x.id === leadId); if (!l) return;
    openModal(`<div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">Follow-up for ${escapeHtml(l.name)}</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div><div class="form-group"><label class="form-label">Date *</label><input id="fl_d" type="date" class="input" value="${todayStr()}"></div>${textField('fl_p', 'Purpose', 'e.g. Demo follow-up')}${textArea('fl_r', 'Remark', '', l.remark||'')}<div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveLeadFU('${leadId}')">Schedule</button></div></div>`);
}
function saveLeadFU(id) {
    const d = getVal('fl_d'); if (!d) { toast('Date required', 'error'); return; }
    const leads = Storage.get('leads') || []; const l = leads.find(x => x.id === id); if (!l) return;
    l.nextFollowUp = d; l.updatedAt = Date.now(); Storage.set('leads', leads);
    addFollowUp(id, l.name, l.phone, d, getVal('fl_p') || 'Follow-up', getVal('fl_r') || l.remark);
    closeModal(); renderLeads(document.getElementById('pageContent')); toast('Follow-up scheduled ✅', 'success');
}

function openLeadModal(id = null) {
    const statuses = Storage.get('statuses') || [];
    const categories = [...new Set([...((Storage.get('leads') || []).map(l => l.category).filter(Boolean)), 'Daily Call', 'Demo', 'TSS', 'Increment', 'Existing Customer', 'Prospect'])];
    const d = id ? (Storage.get('leads') || []).find(l => l.id === id) || {} : {};
    openModal(`
        <div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-lg">${id ? 'Edit' : 'New'} Lead</h3><button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${textField('ld_n', 'Name *', '', d.name||'')}
            ${textField('ld_co', 'Company Name', '', d.company||'')}
            ${textField('ld_ph', 'Phone Number *', '', d.phone||'', false, 'tel')}
            ${textField('ld_sn', 'Tally Serial Number', '', d.serial||'')}
            <div class="form-group"><label class="form-label">Category</label><input list="ldC" id="ld_ca" class="input" value="${escapeHtml(d.category||'')}" placeholder="Select or type"><datalist id="ldC">${categories.map(c => `<option value="${escapeHtml(c)}">`).join('')}</datalist></div>
            ${selectField('ld_st', 'Status', statuses, d.status||'Pending')}
            <div class="form-group"><label class="form-label">Next Follow-up</label><input type="date" id="ld_fu" class="input" value="${d.nextFollowUp||''}"></div>
            <div class="form-group"><label class="form-label">Last Contacted</label><input type="date" id="ld_lc" class="input" value="${d.lastContact ? new Date(d.lastContact).toISOString().slice(0,10) : ''}"></div>
        </div>
        ${textArea('ld_rm', 'Remarks', '', d.remark||'', 4)}
        <div class="flex justify-end gap-2 mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveLeadDb('${id||''}')">${id?'Update':'Create'}</button></div></div>
    `);
}
function saveLeadDb(id) {
    const name = getVal('ld_n'), phone = getVal('ld_ph');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const leads = Storage.get('leads') || [];
    const entry = { name, company: getVal('ld_co'), phone, serial: getVal('ld_sn'), category: getVal('ld_ca'), status: getVal('ld_st')||'Pending', nextFollowUp: getVal('ld_fu'), remark: getVal('ld_rm'), lastContact: getVal('ld_lc'), updatedAt: Date.now() };
    if (id) { const i = leads.findIndex(l => l.id === id); if (i >= 0) leads[i] = { ...leads[i], ...entry }; }
    else leads.push({ id: Storage.uid('l'), createdAt: Date.now(), ...entry });
    Storage.set('leads', leads);
    if (entry.nextFollowUp) addFollowUp(id||null, name, phone, entry.nextFollowUp, 'Follow-up', entry.remark);
    closeModal(); renderLeads(document.getElementById('pageContent')); toast('Lead saved ✅', 'success');
}
function delLead(id) {
    confirmDialog('Delete Lead', 'Permanently delete this lead?', () => {
        Storage.set('leads', (Storage.get('leads') || []).filter(l => l.id !== id));
        renderLeads(document.getElementById('pageContent')); toast('Deleted', 'success');
    }, 'Delete Lead');
}

/* ========== FOLLOW-UPS ========== */
let fuTab = 'today';
function renderFollowUps(el) {
    const all = (Storage.get('followUps') || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const today = all.filter(f => isToday(f.date) && f.status !== 'completed');
    const upcoming = all.filter(f => isFuture(f.date) && f.status !== 'completed');
    const overdue = all.filter(f => isPast(f.date) && !isToday(f.date) && f.status !== 'completed');
    const done = all.filter(f => f.status === 'completed').reverse();
    const tabs = [
        { id: 'today', label: 'Today', count: today.length, list: today },
        { id: 'upcoming', label: 'Upcoming', count: upcoming.length, list: upcoming },
        { id: 'overdue', label: 'Overdue', count: overdue.length, list: overdue },
        { id: 'completed', label: 'Completed', count: done.length, list: done }
    ];
    const cur = tabs.find(t => t.id === fuTab) || tabs[0];
    el.innerHTML = `
        <div class="fade-in space-y-5">
            <div><h3 class="section-title">Follow-ups</h3><p class="section-subtitle mb-0">${overdue.length} overdue, ${today.length} today.</p></div>
            <div class="tabs">
                ${tabs.map(t => `<div class="tab ${fuTab===t.id?'active':''}" onclick="fuSw('${t.id}')">${t.label} <span class="badge ${t.id==='overdue'?'badge-red':t.id==='today'?'badge-yellow':t.id==='completed'?'badge-green':'badge-blue'}" style="margin-left:4px">${t.count}</span></div>`).join('')}
            </div>
            ${cur.list.length === 0 ? `
                <div class="card p-12 empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <h4 class="font-semibold text-slate-700 mb-1">No ${cur.label.toLowerCase()} follow-ups</h4>
                    <p class="text-sm">All caught up! 🎉</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${cur.list.map(f => {
                        const over = f.status !== 'completed' && isPast(f.date) && !isToday(f.date);
                        const tod = f.status !== 'completed' && isToday(f.date);
                        return `<div class="card p-4 border-l-4 ${f.status==='completed'?'border-l-green-500':over?'border-l-red-500':tod?'border-l-amber-500':'border-l-blue-500'}">
                            <div class="flex items-start justify-between gap-2 mb-3">
                                <div class="flex items-center gap-2 min-w-0"><div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">${(f.name||'?').charAt(0).toUpperCase()}</div><div class="min-w-0"><p class="font-semibold truncate">${escapeHtml(f.name)}</p><p class="text-xs text-slate-500 truncate">${escapeHtml(f.phone||'-')}</p></div></div>
                                ${statusBadge(f.status==='completed'?'Completed':over?'Pending':'Follow-up')}
                            </div>
                            <p class="text-sm font-medium mb-1">${escapeHtml(f.purpose||'Follow-up')}</p>
                            ${f.remark ? `<p class="text-xs text-slate-500 mb-2 line-clamp-2">${escapeHtml(f.remark)}</p>` : ''}
                            <div class="flex items-center gap-2 text-xs mb-3"><svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span class="${over?'text-red-600 font-semibold':''}">${formatDate(f.date)}</span></div>
                            <div class="flex flex-wrap gap-1.5">
                                <button class="btn btn-sm btn-success flex-1 min-w-[60px]" onclick="makeCall('${escapeHtml(f.phone)}')">📞</button>
                                <button class="btn btn-sm btn-primary flex-1 min-w-[60px]" onclick="openWhatsApp('${escapeHtml(f.phone)}','Hi ${escapeHtml(f.name||'')}, following up regarding ${escapeHtml(f.purpose||'')}')">💬</button>
                                ${f.status !== 'completed' ? `<button class="btn btn-sm btn-secondary flex-1 min-w-[60px]" onclick="fuDone('${f.id}')">✓ Done</button>` : ''}
                                <button class="btn btn-sm btn-danger btn-icon" onclick="fuDel('${f.id}')">🗑️</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            `}
        </div>
    `;
}
function fuSw(id) { fuTab = id; renderFollowUps(document.getElementById('pageContent')); }
function fuDone(id) {
    const arr = Storage.get('followUps') || [];
    const f = arr.find(x => x.id === id); if (!f) return;
    f.status = 'completed'; f.completedAt = Date.now(); Storage.set('followUps', arr);
    updateFUBadge(); renderFollowUps(document.getElementById('pageContent')); toast('Marked completed 🎉', 'success');
}
function fuDel(id) {
    confirmDialog('Delete Follow-up', 'Delete this follow-up?', () => {
        Storage.set('followUps', (Storage.get('followUps') || []).filter(x => x.id !== id));
        updateFUBadge(); renderFollowUps(document.getElementById('pageContent')); toast('Deleted', 'success');
    }, 'Delete');
}
