const Storage = (() => {
    const PREFIX = 'callflow_';
    const API_BASE_URL = (window.CALLFLOW_API_BASE_URL || '').replace(/\/+$/, '');
    const STATE_URL = API_BASE_URL + '/api/state';
    let backendEnabled = false;
    let syncTimer = null;
    let syncQueue = Promise.resolve();
    let syncErrorNotified = false;

    const defaults = {
        menuItems: [
            { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', order: 0, visible: true, system: true },
            { id: 'daily-calling', name: 'Daily Calling', icon: 'phone', order: 1, visible: true, system: true },
            { id: 'demo-ready', name: 'Demo Ready', icon: 'play', order: 2, visible: true, system: true },
            { id: 'tss-required', name: 'TSS Required', icon: 'file', order: 3, visible: true, system: true },
            { id: 'increment', name: 'Increment', icon: 'trending', order: 4, visible: true, system: true },
            { id: 'call-insights', name: 'Call Insights', icon: 'spark', order: 5, visible: true, system: true },
            { id: 'scripts', name: 'Scripts', icon: 'doc', order: 6, visible: true, system: true },
            { id: 'leads', name: 'Leads / Customers', icon: 'users', order: 7, visible: true, system: true },
            { id: 'follow-ups', name: 'Follow-ups', icon: 'clock', order: 8, visible: true, system: true },
            { id: 'settings', name: 'Settings', icon: 'cog', order: 99, visible: true, system: true }
        ],
        leads: [],
        dailyCalls: [],
        demos: [],
        tss: [],
        increments: [],
        recordings: [],
        followUps: [],
        scripts: [
            { id: 's1', name: 'New Customer Script', category: 'New Customer', content: 'Namaste! Main [Your Name] bol raha hoon [Company] se. Aapse Tally ke baare mein baat karni thi...\n\n1. Tally kaunsa version use kar rahe ho?\n2. Koi specific requirement hai?\n3. Kab demo le sakte ho?', createdAt: Date.now(), updatedAt: Date.now() },
            { id: 's2', name: 'Demo Script', category: 'Demo', content: 'Demo ke liye taiyaar ho na?\n\nDemo date aur time confirm kar sakte ho?\n\nRequirements share kar do.\n\nMain demo link/time bhej dunga.', createdAt: Date.now(), updatedAt: Date.now() },
            { id: 's3', name: 'Follow-up Script', category: 'Follow-up', content: 'Hi [Name], pehli baat ka follow-up kar raha hoon.\n\nKoi update hai?\n\nKab baat kar sakte ho?', createdAt: Date.now(), updatedAt: Date.now() }
        ],
        templates: [
            { id: 't1', name: 'Demo Required', section: 'demo', content: 'Demo Required\n\n*Name:* {{name}}\n*Company Name:* {{company}}\n*Phone Number:* {{phone}}\n*Tally Serial Number:* {{serial}}\n\n*Remark:* {{remark}}', createdAt: Date.now(), default: true },
            { id: 't2', name: 'TSS Required', section: 'tss', content: 'TSS Required\n\n*Name:* {{name}}\n*Company Name:* {{company}}\n*Phone Number:* {{phone}}\n*Tally Serial Number:* {{serial}}\n\n*TSS Type:* {{requirement}}\n\n*Remark:* {{remark}}', createdAt: Date.now(), default: true },
            { id: 't3', name: 'Increment Required', section: 'increment', content: 'Increment Request\n\n*Name:* {{name}}\n*Company Name:* {{company}}\n*Phone Number:* {{phone}}\n*Tally Serial Number:* {{serial}}\n\n*Current Plan:* {{currentPlan}}\n*Required Upgrade:* {{requirement}}\n\n*Remark:* {{remark}}', createdAt: Date.now(), default: true }
        ],
        statuses: ['Pending', 'Called', 'Interested', 'Demo Required', 'TSS Required', 'Follow-up', 'Completed', 'Not Interested'],
        demoDateOptions: ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Custom'],
        tssTypes: ['TSS Renewal', 'TSS Silver Renewal', 'TSS Gold Renewal', 'TSS Upgrade', 'TSS with GST', 'Remote Support', 'Onsite Support', 'E-Invoice Activation', 'Data Migration Help', 'TSS Custom'],
        incrementTypes: ['Tally ERP to Tally Prime Upgrade', 'Tally Prime Silver to Gold', 'Add User', 'Add Module', 'TSS Upgrade', 'TSS Renewal', 'TallyDrive / Cloud Backup', 'Add-on Purchase', 'Statutory Update', 'Custom Upgrade'],
        dailyStats: {},
        settings: {
            theme: 'light',
            defaultCountryCode: '+91',
            openai: {
                apiKey: '',
                transcribeModel: 'whisper-1',
                analyzeModel: 'gpt-4o-mini',
                autoAnalyze: true
            }
        }
    };

    const get = (key) => {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (raw === null) {
                if (defaults[key] !== undefined) {
                    set(key, JSON.parse(JSON.stringify(defaults[key])));
                    return JSON.parse(JSON.stringify(defaults[key]));
                }
                return null;
            }
            return JSON.parse(raw);
        } catch (e) { return null; }
    };

    const scheduleSync = () => {
        if (!backendEnabled) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            syncQueue = syncQueue.catch(() => {}).then(async () => {
                const response = await fetch(STATE_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAll())
                });
                if (!response.ok) throw new Error('Could not save data to the SQL database.');
                syncErrorNotified = false;
            }).catch(error => {
                console.error(error);
                if (!syncErrorNotified) {
                    window.dispatchEvent(new CustomEvent('callflow:sync-error'));
                    syncErrorNotified = true;
                }
            });
        }, 300);
    };

    const set = (key, value) => {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            scheduleSync();
            return true;
        } catch (e) { return false; }
    };

    const getAll = () => {
        const data = {};
        Object.keys(defaults).forEach(k => data[k] = get(k));
        return data;
    };

    const init = async () => {
        try {
            const response = await fetch(STATE_URL);
            if (!response.ok) throw new Error('SQL backend is unavailable.');
            const result = await response.json();

            if (result.initialized) {
                Object.entries(result.state || {}).forEach(([key, value]) => {
                    localStorage.setItem(PREFIX + key, JSON.stringify(value));
                });
            } else {
                const importResponse = await fetch(STATE_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAll())
                });
                if (!importResponse.ok) throw new Error('Could not initialize the SQL database.');
            }

            backendEnabled = true;
            return true;
        } catch (error) {
            backendEnabled = false;
            console.warn('Kryzo CRM is using browser storage because the SQL backend is unavailable.', error);
            return false;
        }
    };

    const reset = async () => {
        try {
            const state = JSON.parse(JSON.stringify(defaults));
            Object.entries(state).forEach(([key, value]) => {
                localStorage.setItem(PREFIX + key, JSON.stringify(value));
            });
            if (backendEnabled) {
                const response = await fetch(STATE_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state)
                });
                if (!response.ok) return false;
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const uid = (prefix = 'id') => prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    return { get, set, getAll, init, reset, uid, defaults };
})();
