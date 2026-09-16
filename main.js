// =====================================================================
// MAIN.JS - تشغيل المنصة وجلب البيانات + الإعدادات الاحترافية 🇹🇳
// =====================================================================

(function () {
    'use strict';

    // =================================================================
    // 1. ثوابت الإعدادات (Settings Constants)
    // =================================================================
    const SETTINGS_KEY = 'tt_settings';
    const DEFAULT_SETTINGS = {
        theme: 'dark',
        accountName: '',
        accountEmail: '',
        channelName: '',
        channelBio: '',
        channelCategory: '',
        channelLink: '',
        channelSocial: '',
        avatar: '',
        language: 'dz',
        autoplay: false,
        quality: 'auto',
        fontSize: 'normal'
    };

    // =================================================================
    // 2. محرك بيانات الفيديوهات (القديم والمضمون)
    // =================================================================
    
    // دالة مساعدة لتنظيف الـ ID إذا لم تكن موجودة في utils.js
    function safeExtractCleanId(url) {
        if (typeof extractCleanId === 'function') return extractCleanId(url);
        let match = url.match(/(?:v=|v\/|vi\/|youtu\.be\/|\/v\/|embed\/|\/e\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : (url && url.length === 11 ? url : "");
    }

    function initApp(raw) {
        // حماية: إذا كانت البيانات فارغة، نستعمل قاعدة الطوارئ
        if (!Array.isArray(raw) || raw.length === 0) {
            console.warn("⚠️ Database empty! Forcing GUARANTEED fallback...");
            if (typeof GUARANTEED_TOUNES_COURSES !== 'undefined') {
                raw = GUARANTEED_TOUNES_COURSES;
            } else {
                raw = [];
            }
        }

        // تحويل البيانات الخام إلى المصفوفة العالمية
        window.allVideos = raw.map(v => {
            const id = safeExtractCleanId(v.Video_ID || v.video_id || v.id || v.Lien || v.url || "");
            return { 
                id, 
                title: v.Titre || v.title || "", 
                channel: v.Chaine || v.channel || "", 
                category: v.Categorie || v.category || "Autre", 
                topic: v.Mawdhou3 || v.topic || "Général", 
                thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg` 
            };
        }).filter(v => v.id && v.id.length === 11);
        
        // حماية إضافية: إذا فشل كل شيء
        if (window.allVideos.length === 0 && typeof GUARANTEED_TOUNES_COURSES !== 'undefined') {
            console.error("🚨 Zero videos passed the filter! Hard reloading with GUARANTEED data...");
            window.allVideos = GUARANTEED_TOUNES_COURSES.map(v => {
                const id = v.Video_ID;
                return { id, title: v.Titre, channel: v.Chaine, category: v.Categorie, topic: v.Mawdhou3, thumb: `https://img.youtube.com/vi/${id}/mqdefault.jpg` };
            });
        }
        
        // تحديث العداد
        const vCountEl = document.getElementById("vCount");
        if (vCountEl) {
            vCountEl.textContent = window.allVideos.length + " cours";
        }
        
        // بناء الواجهة
        if (typeof buildSide === 'function') buildSide();
        if (typeof buildChips === 'function') buildChips();
        if (typeof initRouter === 'function') initRouter();
        else if (typeof renderHome === 'function') renderHome(); // Fallback
    }

    // =================================================================
    // 3. مدير حالة الإعدادات (Settings State Manager)
    // =================================================================
    const SettingsState = {
        original: {},
        current: {},
        hasChanges: false,

        init() {
            this.original = this.loadFromStorage();
            this.current = { ...this.original };
            this.hasChanges = false;
            this.applyTheme();
        },

        loadFromStorage() {
            let stored = {};
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        stored = parsed;
                    }
                }
            } catch (e) {
                console.warn('TunisianTube: invalid settings data, using defaults.', e);
            }
            
            // دمج مع القيم الافتراضية
            const result = {};
            for (const key in DEFAULT_SETTINGS) {
                result[key] = (stored[key] !== undefined && stored[key] !== null && stored[key] !== '') 
                              ? stored[key] : DEFAULT_SETTINGS[key];
            }
            return result;
        },

        update(key, value) {
            if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) return;
            this.current[key] = value;
            this.hasChanges = JSON.stringify(this.current) !== JSON.stringify(this.original);
            this.updateSaveBar();
        },

        save() {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.current));
                this.original = { ...this.current };
                this.hasChanges = false;
                this.applyTheme();
                applyValuesToForm();
                this.updateSaveBar();
                showToast('تم حفظ التعديلات بنجاح ✅', 'success');
                return true;
            } catch (e) {
                showToast('صارت مشكلة في الحفظ ❌', 'error');
                return false;
            }
        },

        discard() {
            this.current = { ...this.original };
            this.hasChanges = false;
            this.applyTheme();
            applyValuesToForm();
            syncThemeIcon();
            this.updateSaveBar();
            showToast('تم إلغاء التعديلات', 'success');
        },

        applyTheme() {
            const theme = this.current && this.current.theme ? this.current.theme : DEFAULT_SETTINGS.theme;
            document.documentElement.setAttribute('data-theme', theme);
            syncThemeIcon();
        },

        updateSaveBar() {
            let bar = document.getElementById('save-bar');
            if (!bar) bar = createSaveBar();
            if (bar) bar.classList.toggle('show', !!this.hasChanges);
        }
    };
    window.SettingsManager = SettingsState;

    // =================================================================
    // 4. إنشاء شريط الحفظ (Save Bar) والتنبيهات (Toasts)
    // =================================================================
    function createSaveBar() {
        if (!document.body || document.getElementById('save-bar')) return document.getElementById('save-bar');
        const bar = document.createElement('div');
        bar.id = 'save-bar';
        bar.className = 'save-bar';
        bar.innerHTML = `
            <div class="save-bar-text"><i class="fa-solid fa-circle-exclamation"></i> عندك تعديلات ما محفوظينش</div>
            <button type="button" class="save-bar-cancel" id="settings-save-cancel">إلغاء</button>
            <button type="button" class="save-bar-save" id="settings-save-confirm">حفظ التعديلات</button>
        `;
        document.body.appendChild(bar);
        document.getElementById('settings-save-cancel')?.addEventListener('click', () => SettingsState.discard());
        document.getElementById('settings-save-confirm')?.addEventListener('click', () => SettingsState.save());
        return bar;
    }

    function showToast(message, type) {
        document.querySelectorAll('.settings-toast').forEach(t => t.remove());
        if (!document.body) return;
        const toast = document.createElement('div');
        toast.className = 'settings-toast' + (type === 'error' ? ' error' : '');
        const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    window.showToast = showToast;

    // =================================================================
    // 5. ربط الإعدادات بنماذج الـ HTML
    // =================================================================
    function applyValuesToForm() {
        const s = SettingsState.current || DEFAULT_SETTINGS;
        const map = {
            accNamePro: s.accountName, accEmailPro: s.accountEmail,
            channelNamePro: s.channelName, channelBioPro: s.channelBio,
            channelCatPro: s.channelCategory, channelLinkPro: s.channelLink,
            channelSocialPro: s.channelSocial, langSelectPro: s.language,
            qualitySelectPro: s.quality, fontSelectPro: s.fontSize
        };
        for (const id in map) {
            const el = document.getElementById(id);
            if (el) el.value = map[id] || '';
        }
        
        // Toggles
        const darkToggle = document.getElementById('t-pro-dark');
        if (darkToggle) darkToggle.classList.toggle('active', s.theme === 'dark');
        
        const autoToggle = document.getElementById('t-pro-auto');
        if (autoToggle) autoToggle.classList.toggle('active', s.autoplay === true);

        // Avatars
        renderAvatar(document.getElementById('accAvatarWrapPro'), s.avatar);
        renderAvatar(document.getElementById('ddAvatar'), s.avatar, true);
    }

    function bindFormListeners() {
        const fields = {
            accNamePro: 'accountName', accEmailPro: 'accountEmail',
            channelNamePro: 'channelName', channelBioPro: 'channelBio',
            channelCatPro: 'channelCategory', channelLinkPro: 'channelLink',
            channelSocialPro: 'channelSocial', langSelectPro: 'language',
            qualitySelectPro: 'quality', fontSelectPro: 'fontSize'
        };
        Object.keys(fields).forEach(id => {
            const el = document.getElementById(id);
            if (!el || el.dataset.settingsBound === '1') return;
            el.dataset.settingsBound = '1';
            const update = () => SettingsState.update(fields[id], el.value);
            el.addEventListener('input', update);
            el.addEventListener('change', update);
        });
    }

    function renderAvatar(container, avatarUrl, isDropdown = false) {
        if (!container || !avatarUrl) return;
        container.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">`;
    }

    // =================================================================
    // 6. التحكم بالثيمات والأزرار المباشرة
    // =================================================================
    window.forceToggleTheme = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || SettingsState.current.theme || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        try {
            const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
            stored.theme = newTheme;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
            SettingsState.original.theme = newTheme;
            SettingsState.current.theme = newTheme;
        } catch (e) {
            SettingsState.current.theme = newTheme;
        }
        
        syncThemeIcon();
        const toggleBtn = document.getElementById('t-pro-dark');
        if (toggleBtn) toggleBtn.classList.toggle('active', newTheme === 'dark');
    };

    function syncThemeIcon() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const btn = document.getElementById('themeBtn');
        if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    window.toggleSetPro = function (key) {
        if (key === 'dark') forceToggleTheme();
        if (key === 'auto') {
            const toggle = document.getElementById('t-pro-auto');
            if (!toggle) return;
            const newValue = !toggle.classList.contains('active');
            toggle.classList.toggle('active', newValue);
            SettingsState.update('autoplay', newValue);
        }
    };

    window.setLangPro = function (v) { SettingsState.update('language', v); };
    window.setQualityPro = function (v) { SettingsState.update('quality', v); };
    window.setFontSizePro = function (v) { SettingsState.update('fontSize', v); };

    // =================================================================
    // 7. التنقل في الإعدادات
    // =================================================================
    window.forceOpenSettingsTab = function (tabId, btn) {
        if (!tabId) return;
        document.querySelectorAll('.settings-pane-pro').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
        document.querySelectorAll('.tab-btn-pro').forEach(b => b.classList.remove('active'));
        
        const target = document.getElementById('set-pro-' + tabId);
        if (target) { target.classList.add('active'); target.style.display = 'block'; }
        if (btn) btn.classList.add('active');
        
        applyValuesToForm();
        bindFormListeners();
    };

    window.forceGoSettings = function (tab) {
        const openSettings = function () {
            const btn = tab ? document.querySelector(`.tab-btn-pro[data-tab="${CSS.escape(tab)}"]`) : null;
            if (btn) forceOpenSettingsTab(tab, btn);
            else if (!tab) { applyValuesToForm(); bindFormListeners(); }
        };

        if (typeof window.navigate === 'function') {
            window.navigate('settings');
            setTimeout(openSettings, 50);
        } else {
            openSettings();
        }
        
        const dropdown = document.getElementById('dropdown');
        if (dropdown) dropdown.classList.remove('show');
    };

    // =================================================================
    // 8. رفع الصورة والضغط (Avatar Upload & Compress)
    // =================================================================
    window.forceAvatarChange = function (event) {
        const file = event?.target?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('اختار صورة صحيحة 🇹🇳', 'error');
            event.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('الصورة كبيرة (أقصى 5MB)', 'error');
            event.target.value = '';
            return;
        }
        compressImage(file, 200, 200, 0.75, function (dataUrl) {
            renderAvatar(document.getElementById('accAvatarWrapPro'), dataUrl);
            renderAvatar(document.getElementById('ddAvatar'), dataUrl, true);
            SettingsState.update('avatar', dataUrl);
        });
    };

    function compressImage(file, maxWidth, maxHeight, quality, callback) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                width = Math.max(1, Math.round(width * ratio));
                height = Math.max(1, Math.round(height * ratio));
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // =================================================================
    // 9. حماية التنقل والمغادرة (Navigation Protection)
    // =================================================================
    window.toggleDropdown = function () {
        const dd = document.getElementById('dropdown');
        if (dd) dd.classList.toggle('show');
    };

    window.addEventListener('beforeunload', function (event) {
        if (!SettingsState.hasChanges) return;
        event.preventDefault();
        event.returnValue = '';
        return '';
    });

    let navigateWrapped = false;
    function protectNavigate() {
        if (navigateWrapped) return true;
        const currentNavigate = window.navigate;
        if (typeof currentNavigate !== 'function') return false;
        if (currentNavigate.__ttSettingsWrapped) { navigateWrapped = true; return true; }

        const protectedNavigate = function (page, param) {
            if (SettingsState.hasChanges && page !== 'settings') {
                if (!window.confirm('عندك تعديلات ما محفوظينش. متأكد باش تخرج بلا حفظ؟')) return false;
                SettingsState.current = { ...SettingsState.original };
                SettingsState.hasChanges = false;
                SettingsState.updateSaveBar();
            }
            return currentNavigate.call(window, page, param);
        };
        protectedNavigate.__ttSettingsWrapped = true;
        window.navigate = protectedNavigate;
        navigateWrapped = true;
        return true;
    }

    setInterval(() => protectNavigate(), 100);

    // =================================================================
    // 10. تفريغ البيانات وحفظ الأزرار السريعة
    // =================================================================
    window.clearHistoryPro = function () {
        if (!window.confirm('متأكد باش تمسح السجل الكل؟ 🗑️')) return;
        localStorage.removeItem('tt_history');
        localStorage.removeItem('history');
        const grid = document.getElementById('historyGrid');
        if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px"><h3>السجل فارغ</h3></div>`;
        showToast('تم مسح السجل ✅', 'success');
    };

    window.clearLikesPro = function () {
        if (!window.confirm('متأكد باش تمسح الفيديوهات المعجب بيها؟')) return;
        localStorage.removeItem('tt_likes');
        localStorage.removeItem('likes');
        showToast('تم المسح ✅', 'success');
    };

    window.resetAllAppDataPro = function () {
        if (!window.confirm('⚠️ متأكد؟ باش يتمسح كل شيء نهائياً!')) return;
        localStorage.clear();
        window.location.reload();
    };

    window.randomizeAvatarPro = function () {
        const url = `https://i.pravatar.cc/200?u=${Math.floor(Math.random() * 1000000)}`;
        renderAvatar(document.getElementById('accAvatarWrapPro'), url);
        renderAvatar(document.getElementById('ddAvatar'), url, true);
        SettingsState.update('avatar', url);
    };

    window.saveAccountPro = function () { return SettingsState.save(); };
    window.saveChannelPro = function () { return SettingsState.save(); };

    // =================================================================
    // 11. التشغيل (ON START)
    // =================================================================
    document.addEventListener('DOMContentLoaded', function () {
        console.log('%c🇹🇳 TunisianTube: تشغيل المنصة...', 'color:#e11a24;font-weight:bold;font-size:14px');

        // أ. جلب الفيديوهات وتشغيل التطبيق (من الكود القديم)
        try {
            if (typeof rawVideosData !== 'undefined' && Array.isArray(rawVideosData) && rawVideosData.length > 0) {
                initApp(rawVideosData);
            } else {
                throw new Error("data.js not defined or empty");
            }
        } catch (e) {
            fetch(`tounes_courses.json?nocache=${Date.now()}`, { cache: "no-store" })
                .then(r => { if (!r.ok) throw new Error("JSON Fetch failed"); return r.json(); })
                .then(d => { initApp(d); })
                .catch(err => {
                    if (typeof GUARANTEED_TOUNES_COURSES !== 'undefined') initApp(GUARANTEED_TOUNES_COURSES);
                    else initApp([]);
                });
        }

        // ب. تشغيل دوال الـ Theme والـ Auth (إن وجدت)
        if (typeof applyTheme === 'function') applyTheme();
        if (typeof applyFontSize === 'function') applyFontSize();
        if (typeof renderAuth === 'function') renderAuth();

        // ج. تشغيل مدير الإعدادات
        SettingsState.init();
        applyValuesToForm();
        bindFormListeners();
        syncThemeIcon();
        createSaveBar();
        SettingsState.updateSaveBar();
        
        // د. تطبيق اللغة لو كانت محفوظة سابقاً بطريقة الكود القديم
        const oldSettings = JSON.parse(localStorage.getItem("tt_settings") || "{}");
        const il = oldSettings.lang || oldSettings.language;
        if (il && typeof setLangPro === 'function') setLangPro(il);

        // هـ. أحداث الإغلاق
        document.addEventListener('click', function (event) {
            const dropdown = document.getElementById('dropdown');
            const auth = document.getElementById('authArea');
            if (!dropdown || !dropdown.classList.contains('show')) return;
            if (!dropdown.contains(event.target) && (!auth || !auth.contains(event.target))) {
                dropdown.classList.remove('show');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const dropdown = document.getElementById('dropdown');
                if (dropdown) dropdown.classList.remove('show');
                if (typeof closeAuth === 'function') closeAuth();
                if (typeof closeDlModal === 'function') closeDlModal();
            }
        });

        console.log('✅ TunisianTube: جاهز 100%!');
    });

})();
save() {
    try {
        // 1. حفظ الإعدادات
        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(this.current)
        );

        // 2. تحديث الحالة الداخلية
        this.original = { ...this.current };
        this.hasChanges = false;

        // 3. تطبيق الـ Theme
        if (typeof this.applyTheme === 'function') {
            this.applyTheme();
        }

        // 4. تحديث الفورم
        if (typeof applyValuesToForm === 'function') {
            applyValuesToForm();
        }

        // 5. تحديث Save Bar
        if (typeof this.updateSaveBar === 'function') {
            this.updateSaveBar();
        }

        // 6. تطبيق الإعدادات مباشرة على الموقع
        if (typeof applySettingsToUI === 'function') {
            applySettingsToUI(this.current);
        }

        // 7. رسالة النجاح
        if (typeof showToast === 'function') {
            showToast('تم حفظ التعديلات بنجاح ✅', 'success');
        }

        return true;

    } catch (e) {
        console.error('Settings save error:', e);

        if (typeof showToast === 'function') {
            showToast('صارت مشكلة في الحفظ ❌', 'error');
        }

        return false;
    }
},
