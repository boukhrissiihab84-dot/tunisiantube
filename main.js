// =====================================================================
// MAIN.JS - القلب النابض للمنصة (TunisianTube 🇹🇳)
// =====================================================================

(function() {
    'use strict';

    // =================================================================
    // 1. الإقلاع
    // =================================================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('%c🇹🇳 TunisianTube: جاري تشغيل المنصة...', 'color: #e74c3c; font-size: 16px; font-weight: bold;');
        initApp();
    });

    function initApp() {
        // بناء العناصر
        safeCall('buildSide');
        safeCall('buildChips');
        safeCall('renderHome');

        // ضبط أيقونة الثيم
        syncThemeIcon();

        // إغلاق القائمة المنسدلة عند النقر خارجها
        document.addEventListener('click', handleOutsideClick);

        // إغلاق القائمة عند الضغط Escape
        document.addEventListener('keydown', handleEscape);

        // تهيئة تبويبات الإعدادات (ضبط الـ active الأولي)
        initSettingsTabs();

        // تهيئة زر الـ Toggle في الإعدادات
        initDarkToggle();

        // الدعم الكيبورد للعناصر القابلة للنقر
        initKeyboardSupport();

        console.log('✅ TunisianTube: المنصة جاهزة!');
    }

    // =================================================================
    // 2. أدوات مساعدة داخلية
    // =================================================================

    // استدعاء آمن للدوال (ما يطيحش الكود إذا الدالة مش موجودة)
    function safeCall(name) {
        try {
            if (typeof window[name] === 'function') {
                window[name]();
            } else if (typeof eval(name) === 'function') {
                // fallback
            }
        } catch(e) {
            console.warn('⚠️ safeCall: الدالة "' + name + '" ما لقيتهاش أو فشلت:', e.message);
        }
    }

    // قراءة الإعدادات من localStorage بطريقة آمنة
    function getSettings() {
        try {
            return JSON.parse(localStorage.getItem('tt_settings') || '{}');
        } catch(e) {
            return {};
        }
    }

    // حفظ الإعدادات بطريقة آمنة (ما يمسحش البيانات الأخرى)
    function saveSettings(partial) {
        try {
            var current = getSettings();
            var keys = Object.keys(partial);
            for (var i = 0; i < keys.length; i++) {
                current[keys[i]] = partial[keys[i]];
            }
            localStorage.setItem('tt_settings', JSON.stringify(current));
        } catch(e) {
            console.warn('⚠️ ما نجّمناش نحفظو الإعدادات:', e.message);
        }
    }

    // قراءة بيانات المستخدم بطريقة آمنة
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('tt_user') || 'null');
        } catch(e) {
            return null;
        }
    }

    // حفظ بيانات المستخدم بطريقة آمنة
    function saveUser(data) {
        try {
            localStorage.setItem('tt_user', JSON.stringify(data));
        } catch(e) {
            // إذا localStorage مليانة (base64 كبيرة)، نمسحو الصورة القديمة
            if (e.name === 'QuotaExceededError') {
                console.warn('⚠️ الذاكرة ممتلئة، جاري المسح...');
                try {
                    // نجربو نحفظو من غير صورة
                    var clean = Object.assign({}, data);
                    delete clean.avatar;
                    localStorage.setItem('tt_user', JSON.stringify(clean));
                } catch(e2) {
                    console.error('❌ ما نجّمناش نحفظو البيانات نهائياً');
                }
            }
        }
    }

    // =================================================================
    // 3. مزامنة أيقونة الثيم
    // =================================================================
    function syncThemeIcon() {
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        var themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.innerHTML = currentTheme === 'dark'
                ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        }
    }

    // =================================================================
    // 4. التحكم في الوضع الليلي (Dark/Light Mode)
    // =================================================================
    window.forceToggleTheme = function() {
        var html = document.documentElement;
        var isDark = html.getAttribute('data-theme') === 'dark';
        var newTheme = isDark ? 'light' : 'dark';

        // تغيير الثيم
        html.setAttribute('data-theme', newTheme);

        // حفظ
        saveSettings({ theme: newTheme });

        // مزامنة الأيقونة
        syncThemeIcon();

        // تحديث زر الـ Toggle في الإعدادات
        var toggleBtn = document.getElementById('t-pro-dark');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', newTheme === 'dark');
        }
    };

    // =================================================================
    // 5. فتح تبويبات الإعدادات
    // =================================================================
    window.forceOpenSettingsTab = function(tabId, btn) {
        // إخفاء كل التبويبات
        var panes = document.querySelectorAll('.settings-pane-pro');
        for (var i = 0; i < panes.length; i++) {
            panes[i].classList.remove('active');
            panes[i].style.display = 'none';
        }

        // إزالة النشاط من كل الأزرار
        var tabs = document.querySelectorAll('.tab-btn-pro');
        for (var j = 0; j < tabs.length; j++) {
            tabs[j].classList.remove('active');
        }

        // إظهار التبويب المطلوب
        var target = document.getElementById('set-pro-' + tabId);
        if (target) {
            target.classList.add('active');
            target.style.display = 'block';
        }

        // تفعيل الزر
        if (btn) btn.classList.add('active');

        // حفظ آخر تبويب مفتوح
        saveSettings({ lastSettingsTab: tabId });
    };

    // =================================================================
    // 6. الدخول المباشر لتبويب معين من القائمة
    // =================================================================
    window.forceGoSettings = function(tab) {
        if (typeof navigate === 'function') {
            navigate('settings');
        } else {
            // fallback: إظهار الصفحة يدوياً
            var settingsPage = document.getElementById('page-settings');
            if (settingsPage) {
                var allPages = document.querySelectorAll('.page');
                for (var i = 0; i < allPages.length; i++) {
                    allPages[i].classList.remove('active');
                }
                settingsPage.classList.add('active');
            }
        }

        setTimeout(function() {
            var btn = document.querySelector('.tab-btn-pro[data-tab="' + tab + '"]');
            if (btn) forceOpenSettingsTab(tab, btn);

            // إغلاق القائمة المنسدلة
            var dd = document.getElementById('dropdown');
            if (dd) dd.classList.remove('show');
        }, 150);
    };

    // =================================================================
    // 7. رفع وعرض صورة البروفايل (Avatar)
    // =================================================================
    window.forceAvatarChange = function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        // التأكد من أن الملف صورة
        if (!file.type.startsWith('image/')) {
            showAlert('بالله اختار صورة صحيحة 🇹🇳');
            return;
        }

        // التحقق من الحجم (أقصى 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('الصورة كبيرة برشا! أقصى حجم 5MB 📸');
            return;
        }

        // ضغط الصورة قبل الحفظ
        compressImage(file, 200, 200, 0.7, function(dataUrl) {
            // إظهار الصورة في الإعدادات
            var wrap = document.getElementById('accAvatarWrapPro');
            if (wrap) {
                wrap.innerHTML = '<img src="' + dataUrl + '" alt="الصورة الشخصية" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">';
            }

            // إظهار الصورة في القائمة المنسدلة
            var ddAvatar = document.getElementById('ddAvatar');
            if (ddAvatar) {
                ddAvatar.innerHTML = '<img src="' + dataUrl + '" alt="الصورة الشخصية" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
            }

            // إظهار الصورة في الهيدر (إذا موجود)
            var authAvatar = document.querySelector('#authArea .avatar-img, #authArea img');
            if (authAvatar) {
                authAvatar.src = dataUrl;
            }

            // حفظ في window.user
            if (window.user) {
                window.user.avatar = dataUrl;
                saveUser(window.user);
            }

            // محاولة الحفظ في Firebase (إذا متصل)
            saveAvatarToFirebase(dataUrl);
        });
    };

    // =================================================================
    // 8. ضغط الصور (لتجنب حجم localStorage الكبير)
    // =================================================================
    function compressImage(file, maxWidth, maxHeight, quality, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var w = img.width;
                var h = img.height;

                // حساب الأبعاد الجديدة مع الحفاظ على النسبة
                if (w > maxWidth) {
                    h = Math.round(h * maxWidth / w);
                    w = maxWidth;
                }
                if (h > maxHeight) {
                    w = Math.round(w * maxHeight / h);
                    h = maxHeight;
                }

                canvas.width = w;
                canvas.height = h;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                var dataUrl = canvas.toDataURL('image/jpeg', quality);
                callback(dataUrl);
            };
            img.onerror = function() {
                // fallback: استعمل الأصل
                callback(e.target.result);
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            alert('ما نجّمناش نقراو الصورة ❌');
        };
        reader.readAsDataURL(file);
    }

    // =================================================================
    // 9. حفظ الصورة في Firebase (اختياري)
    // =================================================================
    function saveAvatarToFirebase(dataUrl) {
        try {
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                var user = firebase.auth().currentUser;
                user.updateProfile({ photoURL: dataUrl }).catch(function(err) {
                    console.warn('⚠️ ما نجّمناش نحفظو الصورة في Firebase:', err.message);
                });
            }
        } catch(e) {
            // Firebase مش متوفر، عادي
        }
    }

    // =================================================================
    // 10. فتح/غلق القائمة المنسدلة
    // =================================================================
    window.toggleDropdown = function() {
        var dd = document.getElementById('dropdown');
        if (dd) {
            var isShowing = !dd.classList.contains('show');
            dd.classList.toggle('show');
            dd.setAttribute('aria-hidden', !isShowing ? 'true' : 'false');

            // تركيز أول عنصر للوصولية
            if (isShowing) {
                var firstItem = dd.querySelector('.dd-item');
                if (firstItem) firstItem.focus();
            }
        }
    };

    // =================================================================
    // 11. التعامل مع النقر خارج القائمة
    // =================================================================
    function handleOutsideClick(e) {
        var dd = document.getElementById('dropdown');
        var authArea = document.getElementById('authArea');

        if (dd && dd.classList.contains('show')) {
            if (!dd.contains(e.target) && (!authArea || !authArea.contains(e.target))) {
                dd.classList.remove('show');
                dd.setAttribute('aria-hidden', 'true');
            }
        }
    }

    // =================================================================
    // 12. التعامل مع مفتاح Escape
    // =================================================================
    function handleEscape(e) {
        if (e.key === 'Escape') {
            // إغلاق القائمة المنسدلة
            var dd = document.getElementById('dropdown');
            if (dd && dd.classList.contains('show')) {
                dd.classList.remove('show');
                dd.setAttribute('aria-hidden', 'true');
            }

            // إغلاق الـ Sidebar في الموبايل
            var sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                if (typeof closeMobileSidebar === 'function') {
                    closeMobileSidebar();
                } else {
                    sidebar.classList.remove('mobile-open');
                }
            }
        }
    }

    // =================================================================
    // 13. تهيئة تبويبات الإعدادات
    // =================================================================
    function initSettingsTabs() {
        // إخفاء كل التبويبات ما عدا الأول
        var panes = document.querySelectorAll('.settings-pane-pro');
        for (var i = 0; i < panes.length; i++) {
            if (!panes[i].classList.contains('active')) {
                panes[i].style.display = 'none';
            }
        }
    }

    // =================================================================
    // 14. تهيئة زر الـ Dark Toggle
    // =================================================================
    function initDarkToggle() {
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        var toggleBtn = document.getElementById('t-pro-dark');
        if (toggleBtn) {
            if (currentTheme === 'dark') {
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
            }

            // دعم الكيبورد للـ toggle
            toggleBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    forceToggleTheme();
                }
            });
        }
    }

    // =================================================================
    // 15. دعم الكيبورد للعناصر القابلة للنقر
    // =================================================================
    function initKeyboardSupport() {
        // القائمة المنسدلة: دعم السهمين + Enter
        var dd = document.getElementById('dropdown');
        if (dd) {
            dd.addEventListener('keydown', function(e) {
                var items = dd.querySelectorAll('.dd-item:not([style*="display: none"])');
                var current = document.activeElement;
                var index = Array.prototype.indexOf.call(items, current);

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    var next = index < items.length - 1 ? index + 1 : 0;
                    items[next].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    var prev = index > 0 ? index - 1 : items.length - 1;
                    items[prev].focus();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (current && current.classList.contains('dd-item')) {
                        current.click();
                    }
                }
            });
        }

        // أزرار الإعدادات الجانبية
        var tabBtns = document.querySelectorAll('.tab-btn-pro');
        for (var i = 0; i < tabBtns.length; i++) {
            tabBtns[i].addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    }

    // =================================================================
    // 16. تنبيه مخصص بدل alert()
    // =================================================================
    function showAlert(message) {
        // إذا عندك نظام تنبيهات مخصص استعملو
        if (typeof showToast === 'function') {
            showToast(message);
            return;
        }

        // وإلا fallback لـ alert العادي
        alert(message);
    }

    // =================================================================
    // 17. فسخ السجل (من صفحة الإعدادات)
    // =================================================================
    window.clearHistoryPro = function() {
        var confirmed = confirm('متأكد إنك ت𠮷ي تمسح السجل الكل؟ 🗑️');
        if (!confirmed) return;

        try {
            localStorage.removeItem('tt_history');

            // مسح العناصر المرئية
            var historyGrid = document.getElementById('historyGrid');
            if (historyGrid) {
                historyGrid.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-secondary);"><i class="fa-solid fa-clock-rotate-left" style="font-size:48px;opacity:0.3;display:block;margin-bottom:16px;"></i><h3>السجل فارغ</h3><p>ما فما حتى فيديو في السجل.</p></div>';
            }

            showAlert('ال玿حف تم مسحه بنجاح ✅');
        } catch(e) {
            showAlert('صارت مشكلة أثناء المسح ❌');
        }
    };

})();
