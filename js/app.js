/* ========== GLOBAL STATE ========== */
let currentPage = 'dashboard';
const ICONS = {
    dashboard: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
    phone: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    trending: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
    doc: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    cog: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>'
};
const DEFAULT_ICON = 'star';

/* ========== UTILITIES ========== */
function toast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="text-lg">${icons[type] || icons.info}</span><div class="flex-1 text-sm text-slate-700">${message}</div>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => { el.style.transition = 'all 0.3s'; el.style.opacity = '0'; el.style.transform = 'translateX(120%)'; setTimeout(() => el.remove(), 300); }, 2500);
}

function formatDate(d) {
    if (!d) return '-';
    const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (isNaN(date)) return '-';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateTime(d) {
    if (!d) return '-';
    const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (isNaN(date)) return '-';
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function isToday(d) { return d && new Date(d).toDateString() === new Date().toDateString(); }
function isPast(d) { return d && new Date(d).setHours(0,0,0,0) < new Date().setHours(0,0,0,0); }
function isFuture(d) { return d && new Date(d).setHours(0,0,0,0) > new Date().setHours(0,0,0,0); }

function statusBadge(s) {
    const map = {
        'Pending': 'badge-yellow', 'Called': 'badge-blue', 'Interested': 'badge-green',
        'Demo Required': 'badge-purple', 'TSS Required': 'badge-orange',
        'Follow-up': 'badge-indigo', 'Completed': 'badge-green', 'Not Interested': 'badge-gray'
    };
    return `<span class="badge ${map[s] || 'badge-gray'}">${s || 'N/A'}</span>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); document.body.removeChild(ta); return true; }
        catch (x) { document.body.removeChild(ta); return false; }
    }
}

function openWhatsApp(phone, message) {
    const p = (phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(message || '');
    const url = p ? `https://wa.me/${p}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
}

/* ========== CONFIRM DIALOG ========== */
function confirmDialog(title, message, onConfirm, confirmText = 'Confirm') {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    const btn = document.getElementById('confirmBtn');
    btn.textContent = confirmText;
    const c = document.getElementById('confirmContainer');
    c.classList.remove('hidden'); c.classList.add('flex');
    btn.onclick = () => { closeConfirm(); onConfirm && onConfirm(); };
}
function closeConfirm() {
    const c = document.getElementById('confirmContainer');
    c.classList.add('hidden'); c.classList.remove('flex');
}

/* ========== MODAL ========== */
function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    const c = document.getElementById('modalContainer');
    c.classList.remove('hidden'); c.classList.add('flex');
}
function closeModal() {
    const c = document.getElementById('modalContainer');
    c.classList.add('hidden'); c.classList.remove('flex');
}

/* ========== SIDEBAR / NAV ========== */
function getMenu() {
    return Storage.get('menuItems').sort((a, b) => a.order - b.order);
}
function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    const items = getMenu().filter(m => m.visible);
    nav.innerHTML = items.map(m => `
        <div class="nav-item ${currentPage === m.id ? 'active' : ''}" onclick="navigateTo('${m.id}')">
            ${ICONS[m.icon] || ICONS[DEFAULT_ICON]}
            <span class="truncate">${escapeHtml(m.name)}</span>
        </div>
    `).join('');
}

function toggleSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('overlay');
    s.classList.toggle('sidebar-open');
    o.classList.toggle('hidden');
}

function navigateTo(pageId) {
    currentPage = pageId;
    const menu = getMenu();
    const item = menu.find(m => m.id === pageId) || { name: 'Page' };
    document.getElementById('pageTitle').textContent = item.name;
    renderSidebar();
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.remove('sidebar-open');
        document.getElementById('overlay').classList.add('hidden');
    }
    renderPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========== ROUTER ========== */
function renderPage(pageId) {
    const el = document.getElementById('pageContent');
    el.innerHTML = '';
    switch (pageId) {
        case 'dashboard': renderDashboard(el); break;
        case 'daily-calling': renderDailyCalling(el); break;
        case 'demo-ready': renderDemoReady(el); break;
        case 'tss-required': renderTssRequired(el); break;
        case 'increment': renderIncrement(el); break;
        case 'scripts': renderScripts(el); break;
        case 'leads': renderLeads(el); break;
        case 'follow-ups': renderFollowUps(el); break;
        case 'settings': renderSettings(el); break;
        default: renderCustomPage(el, pageId);
    }
    updateFUBadge();
}

function renderCustomPage(el, pageId) {
    const menu = getMenu();
    const item = menu.find(m => m.id === pageId);
    el.innerHTML = `
        <div class="fade-in">
            <h3 class="section-title">${escapeHtml(item?.name || pageId)}</h3>
            <p class="section-subtitle">Custom section. Manage in Settings.</p>
            <div class="card p-8 empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <h4 class="font-semibold text-slate-700 mb-1">Custom Section</h4>
                <p class="text-sm">You can use Settings to configure this area.</p>
            </div>
        </div>
    `;
}

/* ========== DASHBOARD ========== */
function renderDashboard(el) {
    const leads = Storage.get('leads') || [];
    const demos = Storage.get('demos') || [];
    const tss = Storage.get('tss') || [];
    const increments = Storage.get('increments') || [];
    const calls = Storage.get('dailyCalls') || [];
    const fus = Storage.get('followUps') || [];

    const todayCalls = calls.filter(c => isToday(c.date) || isToday(c.createdAt));
    const todayNewLeads = leads.filter(l => isToday(l.createdAt));
    const demoReq = demos.filter(d => !d.completedAt);
    const demoDone = demos.filter(d => d.completedAt && isToday(d.completedAt));
    const tssReq = tss.filter(x => !x.completedAt);
    const tssDone = tss.filter(x => x.completedAt && isToday(x.completedAt));
    const pendingFU = fus.filter(f => f.status !== 'completed' && (isToday(f.date) || isPast(f.date)));
    const incReq = increments.filter(x => !x.completedAt);

    const recentLeads = leads.slice(-5).reverse();
    const todayFUs = fus.filter(f => isToday(f.date) && f.status !== 'completed').sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    const stats = [
        { label: 'Total Calls Today', value: todayCalls.length, icon: 'phone' },
        { label: 'New Leads Today', value: todayNewLeads.length, icon: 'users' },
        { label: 'Demo Required', value: demoReq.length, icon: 'play' },
        { label: 'Demo Completed', value: demoDone.length, icon: 'play' },
        { label: 'TSS Required', value: tssReq.length, icon: 'file' },
        { label: 'TSS Completed', value: tssDone.length, icon: 'file' },
        { label: 'Pending Follow-ups', value: pendingFU.length, icon: 'clock' },
        { label: 'Increment Requests', value: incReq.length, icon: 'trending' }
    ];

    el.innerHTML = `
        <div class="fade-in space-y-6">
            <div>
                <h3 class="section-title">Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋</h3>
                <p class="section-subtitle mb-0">Here's what's on your plate today.</p>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                ${stats.map((c, i) => `
                    <div class="stat-card">
                        <div class="flex items-start justify-between mb-3">
                            <span class="text-2xl font-bold text-slate-800">${c.value}</span>
                            <div class="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">${ICONS[c.icon] || ICONS.star}</div>
                        </div>
                        <p class="text-sm text-slate-500 font-medium">${c.label}</p>
                    </div>
                `).join('')}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div><h4 class="font-semibold text-slate-800">Today's Follow-ups</h4><p class="text-xs text-slate-500 mt-0.5">${todayFUs.length} items pending</p></div>
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo('follow-ups')">View All →</button>
                    </div>
                    ${todayFUs.length === 0 ? `
                        <div class="empty-state py-6"><svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p class="text-sm mt-0">All caught up! No follow-ups for today.</p></div>
                    ` : `
                        <div class="space-y-2">
                            ${todayFUs.slice(0, 6).map(f => `
                                <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                                    <div class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">${(f.name || '?').charAt(0).toUpperCase()}</div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2"><p class="font-medium text-slate-800 text-sm truncate">${escapeHtml(f.name)}</p><span class="badge badge-yellow">Today</span></div>
                                        <p class="text-xs text-slate-500 truncate">${escapeHtml(f.purpose || f.remark || 'No purpose')}</p>
                                    </div>
                                    <button class="btn btn-sm btn-ghost btn-icon" onclick="makeCall('${escapeHtml(f.phone)}')" title="Call">${ICONS.phone}</button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                <div class="card p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div><h4 class="font-semibold text-slate-800">Recent Leads</h4><p class="text-xs text-slate-500 mt-0.5">Latest added to database</p></div>
                        <button class="btn btn-sm btn-ghost" onclick="navigateTo('leads')">View All →</button>
                    </div>
                    ${recentLeads.length === 0 ? `
                        <div class="empty-state py-6"><svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg><p class="text-sm mt-0">No leads yet. Add from Demo Ready / TSS pages.</p></div>
                    ` : `
                        <div class="space-y-2">
                            ${recentLeads.map(l => `
                                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">${(l.name || '?').charAt(0).toUpperCase()}</div>
                                    <div class="flex-1 min-w-0"><p class="font-medium text-slate-800 text-sm truncate">${escapeHtml(l.name)}</p><p class="text-xs text-slate-500 truncate">${escapeHtml(l.company || l.phone || 'No info')}</p></div>
                                    ${statusBadge(l.status)}
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
            <div class="card p-5">
                <h4 class="font-semibold text-slate-800 mb-4">Quick Actions</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    ${[
                        { to: 'demo-ready', label: 'Add Demo', icon: ICONS.play, cls: 'from-indigo-500 to-blue-500' },
                        { to: 'tss-required', label: 'Add TSS', icon: ICONS.file, cls: 'from-amber-500 to-orange-500' },
                        { to: 'daily-calling', label: 'New Call', icon: ICONS.phone, cls: 'from-emerald-500 to-teal-500' },
                        { to: 'increment', label: 'Increment', icon: ICONS.trending, cls: 'from-pink-500 to-rose-500' }
                    ].map(q => `
                        <button onclick="navigateTo('${q.to}')" class="p-4 rounded-xl bg-gradient-to-br ${q.cls} text-white hover:scale-[1.02] transition shadow-lg">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">${q.icon}</div>
                                <div class="text-left"><p class="font-semibold">${q.label}</p><p class="text-xs text-white/80">Create new</p></div>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}
