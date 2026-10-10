/* ========== FORM HELPERS ========== */
function textField(id, label, placeholder = '', value = '', required = false, type = 'text') {
    return `<div class="form-group"><label class="form-label" for="${id}">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label><input id="${id}" type="${type}" class="input" placeholder="${placeholder}" value="${escapeHtml(value)}"></div>`;
}
function textArea(id, label, placeholder = '', value = '', rows = 3) {
    return `<div class="form-group"><label class="form-label" for="${id}">${label}</label><textarea id="${id}" class="input" rows="${rows}" placeholder="${placeholder}">${escapeHtml(value)}</textarea></div>`;
}
function selectField(id, label, options, value = '', required = false) {
    return `<div class="form-group"><label class="form-label" for="${id}">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label><select id="${id}" class="input"><option value="">Select...</option>${options.map(o => `<option value="${escapeHtml(typeof o === 'string' ? o : o.value)}" ${(typeof o === 'string' ? o : o.value) === value ? 'selected' : ''}>${escapeHtml(typeof o === 'string' ? o : o.label)}</option>`).join('')}</select></div>`;
}
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v || ''; }

function fillTemplate(template, data) {
    let text = template || '';
    Object.keys(data).forEach(k => { text = text.split('{{' + k + '}}').join(data[k] || ''); });
    return text;
}

function getTemplateFor(section) {
    const templates = Storage.get('templates') || [];
    return templates.find(t => t.section === section && t.default) || templates.find(t => t.section === section) || { content: '' };
}

function upsertLead(data) {
    const leads = Storage.get('leads') || [];
    const existing = leads.find(l =>
        (l.phone && data.phone && l.phone === data.phone) ||
        (l.serial && data.serial && l.serial === data.serial) ||
        (l.id && data.id && l.id === data.id)
    );
    if (existing) {
        Object.assign(existing, data, { updatedAt: Date.now() });
        if (!existing.createdAt) existing.createdAt = Date.now();
        Storage.set('leads', leads);
        return existing;
    } else {
        const newLead = { id: Storage.uid('l'), createdAt: Date.now(), updatedAt: Date.now(), ...data };
        leads.push(newLead);
        Storage.set('leads', leads);
        return newLead;
    }
}

function addFollowUp(leadId, name, phone, date, purpose, remark) {
    if (!date) return;
    const fus = Storage.get('followUps') || [];
    fus.push({ id: Storage.uid('fu'), leadId, name, phone, date, purpose, remark: remark || '', status: 'pending', createdAt: Date.now() });
    Storage.set('followUps', fus);
    updateFUBadge();
}

function updateFUBadge() {
    const fus = Storage.get('followUps') || [];
    const pending = fus.filter(f => f.status !== 'completed' && (isToday(f.date) || isPast(f.date)));
    const badge = document.getElementById('fuBadge');
    if (badge) badge.classList.toggle('hidden', pending.length === 0);
}

function makeCall(phone) {
    if (!phone) { toast('Phone number not available', 'warning'); return; }
    window.location.href = 'tel:' + phone.replace(/\D/g, '');
}

/* ========== DATE CHIP HELPER ========== */
function resolveChipDate(chipVal, customId) {
    if (chipVal === 'Custom') return getVal(customId);
    const now = new Date();
    if (chipVal === 'Today') return now.toISOString().slice(0,10);
    if (chipVal === 'Tomorrow') { now.setDate(now.getDate()+1); return now.toISOString().slice(0,10); }
    if (chipVal === 'This Week') { now.setDate(now.getDate() + (7 - now.getDay()) % 7); return now.toISOString().slice(0,10); }
    if (chipVal === 'Next Week') { now.setDate(now.getDate() + 7 + (7 - now.getDay()) % 7); return now.toISOString().slice(0,10); }
    return chipVal;
}

function bindDateChips(chipsSelector, customId) {
    setTimeout(() => {
        document.querySelectorAll(chipsSelector).forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll(chipsSelector).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(customId).classList.toggle('hidden', btn.dataset.val !== 'Custom');
            });
        });
    }, 10);
}

function getActiveChipVal(chipsSelector) {
    const a = document.querySelector(chipsSelector + '.active');
    return a ? a.dataset.val : '';
}

/* ========== DEMO READY ========== */
let demoMsgCache = '';
function renderDemoReady(el) {
    const dateOptions = Storage.get('demoDateOptions') || [];
    const templates = (Storage.get('templates') || []).filter(t => t.section === 'demo');
    el.innerHTML = `
        <div class="fade-in grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div class="card p-5 lg:col-span-3">
                <h3 class="section-title">Demo Ready</h3>
                <p class="section-subtitle">Enter details & generate WhatsApp message instantly.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${textField('demo_name', 'Name', 'Customer name', '', true)}
                    ${textField('demo_company', 'Company Name', 'Company / Business')}
                    ${textField('demo_phone', 'Phone Number', 'e.g. 9876543210', '', true, 'tel')}
                    ${textField('demo_serial', 'Tally Serial Number', 'e.g. TLY-12345678')}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Demo Requirement Date</label>
                        <div class="flex flex-wrap gap-2 mb-2" id="demoDateChips">
                            ${dateOptions.map((o, i) => `<button type="button" class="chip-btn ${i === 0 ? 'active' : ''}" data-val="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}
                        </div>
                        <input id="demo_dateCustom" type="date" class="input hidden">
                    </div>
                    <div class="form-group"><label class="form-label">Template</label>
                        <select id="demo_template" class="input">${templates.map(t => `<option value="${t.id}" ${t.default ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}</select>
                    </div>
                </div>
                ${textArea('demo_remark', 'Remark / Requirement', 'Specific requirements, timing, etc.')}
                <div class="flex flex-wrap gap-3">
                    <button class="btn btn-primary" onclick="generateDemoMsg()">💬 Generate WhatsApp Message</button>
                    <button class="btn btn-secondary" onclick="clearDemoForm()">Clear Form</button>
                </div>
            </div>
            <div class="card p-5 lg:col-span-2">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-slate-800">Message Preview</h4>
                    <button class="btn btn-sm btn-ghost" onclick="toggleEdit('demo')" id="demo_tgl">Edit Message</button>
                </div>
                <div class="wa-preview" id="demo_pv">Fill form & click Generate to see preview.</div>
                <textarea id="demo_ed" class="input hidden mt-3" rows="10"></textarea>
                <div class="flex flex-wrap gap-2 mt-4">
                    <button class="btn btn-success flex-1 min-w-[130px]" onclick="copyCache('demo')">📋 Copy</button>
                    <button class="btn btn-primary flex-1 min-w-[130px]" onclick="goWA('demo')">💬 Open WhatsApp</button>
                    <button class="btn btn-secondary flex-1 min-w-[130px]" onclick="saveDemoLead()">💾 Save Lead</button>
                </div>
            </div>
        </div>
    `;
    bindDateChips('#demoDateChips .chip-btn', 'demo_dateCustom');
}

function getDemoDate() { return resolveChipDate(getActiveChipVal('#demoDateChips .chip-btn'), 'demo_dateCustom'); }

function generateDemoMsg() {
    const name = getVal('demo_name'); const phone = getVal('demo_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const data = { name, company: getVal('demo_company'), phone, serial: getVal('demo_serial'), remark: getVal('demo_remark'), date: formatDate(getDemoDate()), requirement: getVal('demo_remark') };
    const templates = Storage.get('templates') || [];
    const tpl = templates.find(t => t.id === getVal('demo_template')) || templates.find(t => t.section === 'demo');
    const msg = fillTemplate(tpl?.content, data);
    demoMsgCache = msg; document.getElementById('demo_pv').textContent = msg; document.getElementById('demo_ed').value = msg;
    toast('Message generated', 'success');
}

function toggleEdit(key) {
    const ed = document.getElementById(key + '_ed'); const pv = document.getElementById(key + '_pv'); const btn = document.getElementById(key + '_tgl');
    if (ed.classList.contains('hidden')) {
        ed.classList.remove('hidden'); pv.style.display = 'none'; btn.textContent = 'Preview';
    } else {
        ed.classList.add('hidden'); pv.style.display = ''; btn.textContent = 'Edit Message';
        const msg = ed.value; pv.textContent = msg;
        if (key === 'demo') demoMsgCache = msg; if (key === 'tss') tssMsgCache = msg; if (key === 'inc') incMsgCache = msg;
    }
}
function curMsg(key) {
    const ed = document.getElementById(key + '_ed');
    if (!ed.classList.contains('hidden')) {
        const msg = ed.value; if (key==='demo') demoMsgCache = msg; if (key==='tss') tssMsgCache = msg; if (key==='inc') incMsgCache = msg; return msg;
    }
    if (key === 'demo') return demoMsgCache; if (key === 'tss') return tssMsgCache; if (key === 'inc') return incMsgCache;
    return '';
}

async function copyCache(key) {
    const t = curMsg(key); if (!t) { toast('Generate message first', 'warning'); return; }
    const ok = await copyToClipboard(t);
    toast(ok ? 'Message copied ✅' : 'Copy failed', ok ? 'success' : 'error');
}
function goWA(key) {
    const t = curMsg(key); if (!t) { toast('Generate message first', 'warning'); return; }
    let ph = ''; if (key === 'demo') ph = getVal('demo_phone'); if (key === 'tss') ph = getVal('tss_phone'); if (key === 'inc') ph = getVal('inc_phone');
    openWhatsApp(ph, t);
}

function clearDemoForm() {
    ['demo_name','demo_company','demo_phone','demo_serial','demo_remark','demo_dateCustom'].forEach(setVal);
    document.querySelectorAll('#demoDateChips .chip-btn').forEach((b,i) => b.classList.toggle('active', i === 0));
    document.getElementById('demo_dateCustom').classList.add('hidden');
    document.getElementById('demo_pv').textContent = 'Fill form & click Generate.';
    demoMsgCache = '';
}

function saveDemoLead() {
    const name = getVal('demo_name'), phone = getVal('demo_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const d = getDemoDate();
    const data = { name, company: getVal('demo_company'), phone, serial: getVal('demo_serial'), remark: getVal('demo_remark'), category: 'Demo', status: 'Demo Required', nextFollowUp: d };
    const lead = upsertLead(data);
    const arr = Storage.get('demos') || [];
    arr.push({ id: Storage.uid('d'), leadId: lead.id, ...data, date: d, createdAt: Date.now() });
    Storage.set('demos', arr);
    if (d) addFollowUp(lead.id, name, phone, d, 'Demo Scheduled', data.remark);
    toast('Lead saved successfully ✅', 'success');
}

/* ========== TSS REQUIRED ========== */
let tssMsgCache = '';
function renderTssRequired(el) {
    const dateOptions = Storage.get('demoDateOptions') || [];
    const tssTypes = Storage.get('tssTypes') || [];
    const templates = (Storage.get('templates') || []).filter(t => t.section === 'tss');
    el.innerHTML = `
        <div class="fade-in grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div class="card p-5 lg:col-span-3">
                <h3 class="section-title">TSS Required</h3>
                <p class="section-subtitle">Record TSS requests for customers.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${textField('tss_name', 'Name', '', '', true)}
                    ${textField('tss_company', 'Company Name')}
                    ${textField('tss_phone', 'Phone Number', '', '', true, 'tel')}
                    ${textField('tss_serial', 'Tally Serial Number')}
                    ${selectField('tss_type', 'TSS Type / Requirement', tssTypes)}
                    <div class="form-group"><label class="form-label">Required Date</label>
                        <div class="flex flex-wrap gap-2 mb-2" id="tssDateChips">${dateOptions.map((o,i) => `<button type="button" class="chip-btn ${i===0?'active':''}" data-val="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}</div>
                        <input id="tss_dateCustom" type="date" class="input hidden">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group"><label class="form-label">Template</label>
                        <select id="tss_template" class="input">${templates.map(t => `<option value="${t.id}" ${t.default?'selected':''}>${escapeHtml(t.name)}</option>`).join('')}</select>
                    </div>
                </div>
                ${textArea('tss_remark', 'Remark / Additional Notes')}
                <div class="flex flex-wrap gap-3">
                    <button class="btn btn-primary" onclick="generateTssMsg()">💬 Generate WhatsApp Message</button>
                    <button class="btn btn-secondary" onclick="clearTssForm()">Clear Form</button>
                </div>
            </div>
            <div class="card p-5 lg:col-span-2">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-slate-800">Message Preview</h4>
                    <button class="btn btn-sm btn-ghost" onclick="toggleEdit('tss')" id="tss_tgl">Edit Message</button>
                </div>
                <div class="wa-preview" id="tss_pv">Fill form & click Generate.</div>
                <textarea id="tss_ed" class="input hidden mt-3" rows="10"></textarea>
                <div class="flex flex-wrap gap-2 mt-4">
                    <button class="btn btn-success flex-1 min-w-[130px]" onclick="copyCache('tss')">📋 Copy</button>
                    <button class="btn btn-primary flex-1 min-w-[130px]" onclick="goWA('tss')">💬 Open WhatsApp</button>
                    <button class="btn btn-secondary flex-1 min-w-[130px]" onclick="saveTssLead()">💾 Save Lead</button>
                </div>
            </div>
        </div>
    `;
    bindDateChips('#tssDateChips .chip-btn', 'tss_dateCustom');
}
function getTssDate() { return resolveChipDate(getActiveChipVal('#tssDateChips .chip-btn'), 'tss_dateCustom'); }
function generateTssMsg() {
    const name = getVal('tss_name'), phone = getVal('tss_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const data = { name, company: getVal('tss_company'), phone, serial: getVal('tss_serial'), requirement: getVal('tss_type'), remark: getVal('tss_remark'), date: formatDate(getTssDate()) };
    const templates = Storage.get('templates') || [];
    const tpl = templates.find(t => t.id === getVal('tss_template')) || templates.find(t => t.section === 'tss');
    const msg = fillTemplate(tpl?.content, data);
    tssMsgCache = msg; document.getElementById('tss_pv').textContent = msg; document.getElementById('tss_ed').value = msg;
    toast('Message generated', 'success');
}
function clearTssForm() {
    ['tss_name','tss_company','tss_phone','tss_serial','tss_type','tss_remark','tss_dateCustom'].forEach(setVal);
    document.querySelectorAll('#tssDateChips .chip-btn').forEach((b,i) => b.classList.toggle('active', i === 0));
    document.getElementById('tss_dateCustom').classList.add('hidden');
    document.getElementById('tss_pv').textContent = 'Fill form & click Generate.';
    tssMsgCache = '';
}
function saveTssLead() {
    const name = getVal('tss_name'), phone = getVal('tss_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const d = getTssDate();
    const data = { name, company: getVal('tss_company'), phone, serial: getVal('tss_serial'), remark: getVal('tss_remark'), category: 'TSS', status: 'TSS Required', nextFollowUp: d };
    const lead = upsertLead(data);
    const arr = Storage.get('tss') || [];
    arr.push({ id: Storage.uid('t'), leadId: lead.id, ...data, tssType: getVal('tss_type'), date: d, createdAt: Date.now() });
    Storage.set('tss', arr);
    if (d) addFollowUp(lead.id, name, phone, d, 'TSS - ' + getVal('tss_type'), data.remark);
    toast('TSS lead saved ✅', 'success');
}

/* ========== INCREMENT ========== */
let incMsgCache = '';
function renderIncrement(el) {
    const dateOptions = Storage.get('demoDateOptions') || [];
    const incTypes = Storage.get('incrementTypes') || [];
    const templates = (Storage.get('templates') || []).filter(t => t.section === 'increment');
    el.innerHTML = `
        <div class="fade-in grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div class="card p-5 lg:col-span-3">
                <h3 class="section-title">Increment / Upgrade Requests</h3>
                <p class="section-subtitle">Record plan upgrades and increment requests.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${textField('inc_name', 'Name', '', '', true)}
                    ${textField('inc_company', 'Company Name')}
                    ${textField('inc_phone', 'Phone Number', '', '', true, 'tel')}
                    ${textField('inc_serial', 'Tally Serial Number')}
                    ${textField('inc_plan', 'Current Plan', 'Silver / Gold / TSS Basic')}
                    ${selectField('inc_upgrade', 'Required Increment / Upgrade', incTypes)}
                    <div class="form-group"><label class="form-label">Requirement Date</label>
                        <div class="flex flex-wrap gap-2 mb-2" id="incDateChips">${dateOptions.map((o,i) => `<button type="button" class="chip-btn ${i===0?'active':''}" data-val="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}</div>
                        <input id="inc_dateCustom" type="date" class="input hidden">
                    </div>
                    <div class="form-group"><label class="form-label">Template</label>
                        <select id="inc_template" class="input">${templates.map(t => `<option value="${t.id}" ${t.default?'selected':''}>${escapeHtml(t.name)}</option>`).join('')}</select>
                    </div>
                </div>
                ${textArea('inc_remark', 'Remark / Details', 'Upgrade details, quotation, etc.')}
                <div class="flex flex-wrap gap-3">
                    <button class="btn btn-primary" onclick="generateIncMsg()">💬 Generate WhatsApp Message</button>
                    <button class="btn btn-secondary" onclick="clearIncForm()">Clear Form</button>
                </div>
            </div>
            <div class="card p-5 lg:col-span-2">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-slate-800">Message Preview</h4>
                    <button class="btn btn-sm btn-ghost" onclick="toggleEdit('inc')" id="inc_tgl">Edit Message</button>
                </div>
                <div class="wa-preview" id="inc_pv">Fill form & click Generate.</div>
                <textarea id="inc_ed" class="input hidden mt-3" rows="10"></textarea>
                <div class="flex flex-wrap gap-2 mt-4">
                    <button class="btn btn-success flex-1 min-w-[130px]" onclick="copyCache('inc')">📋 Copy</button>
                    <button class="btn btn-primary flex-1 min-w-[130px]" onclick="goWA('inc')">💬 Open WhatsApp</button>
                    <button class="btn btn-secondary flex-1 min-w-[130px]" onclick="saveIncLead()">💾 Save Lead</button>
                </div>
            </div>
        </div>
    `;
    bindDateChips('#incDateChips .chip-btn', 'inc_dateCustom');
}
function getIncDate() { return resolveChipDate(getActiveChipVal('#incDateChips .chip-btn'), 'inc_dateCustom'); }
function generateIncMsg() {
    const name = getVal('inc_name'), phone = getVal('inc_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const data = { name, company: getVal('inc_company'), phone, serial: getVal('inc_serial'), currentPlan: getVal('inc_plan'), requirement: getVal('inc_upgrade'), remark: getVal('inc_remark'), date: formatDate(getIncDate()) };
    const templates = Storage.get('templates') || [];
    const tpl = templates.find(t => t.id === getVal('inc_template')) || templates.find(t => t.section === 'increment');
    const msg = fillTemplate(tpl?.content, data);
    incMsgCache = msg; document.getElementById('inc_pv').textContent = msg; document.getElementById('inc_ed').value = msg;
    toast('Message generated', 'success');
}
function clearIncForm() {
    ['inc_name','inc_company','inc_phone','inc_serial','inc_plan','inc_upgrade','inc_remark','inc_dateCustom'].forEach(setVal);
    document.querySelectorAll('#incDateChips .chip-btn').forEach((b,i) => b.classList.toggle('active', i === 0));
    document.getElementById('inc_dateCustom').classList.add('hidden');
    document.getElementById('inc_pv').textContent = 'Fill form & click Generate.';
    incMsgCache = '';
}
function saveIncLead() {
    const name = getVal('inc_name'), phone = getVal('inc_phone');
    if (!name || !phone) { toast('Name & Phone required', 'error'); return; }
    const d = getIncDate();
    const remark = [getVal('inc_remark'), getVal('inc_plan') ? ('Current: ' + getVal('inc_plan')) : '', getVal('inc_upgrade') ? ('Upgrade: ' + getVal('inc_upgrade')) : ''].filter(Boolean).join(' | ');
    const data = { name, company: getVal('inc_company'), phone, serial: getVal('inc_serial'), remark, category: 'Increment', status: 'Interested', nextFollowUp: d };
    const lead = upsertLead(data);
    const arr = Storage.get('increments') || [];
    arr.push({ id: Storage.uid('i'), leadId: lead.id, ...data, currentPlan: getVal('inc_plan'), upgrade: getVal('inc_upgrade'), date: d, createdAt: Date.now() });
    Storage.set('increments', arr);
    if (d) addFollowUp(lead.id, name, phone, d, 'Increment/Upgrade Follow-up', remark);
    toast('Increment lead saved ✅', 'success');
}
