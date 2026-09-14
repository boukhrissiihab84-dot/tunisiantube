// =====================================================================
// UI.JS - محرك الواجهة والشبكة (TunisianTube 🇹🇳)
// =====================================================================

(function() {
    'use strict';

    // =================================================================
    // إعدادات ومتغيرات
    // =================================================================
    
    // BATCH_SIZE للتحميل التدريجي (إذا مش معرف في globals.js)
    if (typeof window.BATCH_SIZE === 'undefined') {
        window.BATCH_SIZE = 24;
    }

    // متغيرات global (إذا مش معرفين في globals.js)
    if (typeof window.activeList === 'undefined') window.activeList = [];
    if (typeof window.displayedCount === 'undefined') window.displayedCount = 0;
    if (typeof window.currentFilter === 'undefined') window.currentFilter = { cat: null, sub: null, search: '' };
    if (typeof window.searchTimer === 'undefined') window.searchTimer = null;
    if (typeof window.observer === 'undefined') window.observer = null;

    // خريطة أيقونات التصنيفات
    const CAT_FA_ICONS = {
        "Design": "fa-palette",
        "Programmation": "fa-code",
        "Langues": "fa-language",
        "Marketing": "fa-chart-line",
        "Montage": "fa-clapperboard",
        "Freelance": "fa-briefcase",
        "Bac & Etudes": "fa-graduation-cap",
        "Bureautique": "fa-file-excel",
        "Autre": "fa-box"
    };

    // =================================================================
    // 1. أدوات مساعدة (Helpers)
    // =================================================================

    // Escape للـ HTML (يحمي من XSS)
    function escHTML(s) {
        if (s === null || s === undefined) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Escape للـ JavaScript strings (للـ onclick attributes)
    function escStr(s) {
        if (s === null || s === undefined) return '';
        return String(s)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }

    // نشر الدوال في window باش تنجم تستعملها من HTML
    window.escStr = escStr;
    window.escHTML = escHTML;

    // جلب قائمة الفيديوهات من أي مصدر متوفر
    function getVideosList() {
        if (typeof window.allVideos !== 'undefined' && Array.isArray(window.allVideos) && window.allVideos.length > 0) {
            return window.allVideos;
        }
        if (typeof window.rawVideosData !== 'undefined' && Array.isArray(window.rawVideosData) && window.rawVideosData.length > 0) {
            return window.rawVideosData;
        }
        return [];
    }
    window.getVideosList = getVideosList;

    // =================================================================
    // 2. بناء القائمة الجانبية (Sidebar)
    // =================================================================
    window.buildSide = function() {
        const vids = getVideosList();
        const cats = {};
        const subs = {};

        // تجميع التصنيفات والمواضيع
        vids.forEach(function(v) {
            if (!v) return;
            const c = v.category || 'Autre';
            cats[c] = (cats[c] || 0) + 1;
            const t = v.topic || '';
            if (t && t !== 'Général') {
                subs[t] = (subs[t] || 0) + 1;
            }
        });

        // بناء قائمة التصنيفات
        const cl = document.getElementById('catList');
        if (cl) {
            let html = '<h4>الرئيسية</h4>';
            html += '<button class="side-btn active" onclick="showAll()" data-view="home">'
                 + '<i class="fa-solid fa-house" aria-hidden="true"></i>'
                 + '<span class="side-txt">الرئيسية</span>'
                 + '<span class="side-cnt">' + vids.length + '</span>'
                 + '</button>';

            html += '<h4>التصنيفات</h4>';
            Object.entries(cats)
                .sort(function(a, b) { return b[1] - a[1]; })
                .forEach(function(entry) {
                    const c = entry[0];
                    const n = entry[1];
                    const icon = CAT_FA_ICONS[c] || 'fa-folder';
                    html += '<button class="side-btn" onclick="filterChipHome(\'' + escStr(c) + '\', event)" data-cat="' + escHTML(c) + '">'
                         + '<i class="fa-solid ' + icon + '" aria-hidden="true"></i>'
                         + '<span class="side-txt">' + escHTML(c) + '</span>'
                         + '<span class="side-cnt">' + n + '</span>'
                         + '</button>';
                });
            cl.innerHTML = html;
        }

        // بناء قائمة المواضيع الفرعية
        const sl = document.getElementById('subList');
        if (sl) {
            let html2 = '<h4>المواضيع الأكثر طلباً 🔥</h4>';
            Object.entries(subs)
                .sort(function(a, b) { return b[1] - a[1]; })
                .slice(0, 15)
                .forEach(function(entry) {
                    const t = entry[0];
                    const n = entry[1];
                    html2 += '<button class="side-btn" onclick="filterSubHome(\'' + escStr(t) + '\', event)" data-sub="' + escHTML(t) + '">'
                          + '<i class="fa-solid fa-hashtag" aria-hidden="true"></i>'
                          + '<span class="side-txt">' + escHTML(t) + '</span>'
                          + '<span class="side-cnt">' + n + '</span>'
                          + '</button>';
                });
            sl.innerHTML = html2;
        }

        updateHeroStats(vids, cats);
    };

    // تحديث إحصائيات الـ Hero
    function updateHeroStats(vids, cats) {
        const totalVids = vids.length || 5007;
        const catCount = Object.keys(cats).length || 8;

        setText('statV', totalVids);
        setText('vCount', totalVids + ' دورة');
        setText('statC', catCount);
        setText('statH', '+1500h');
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    // =================================================================
    // 3. بناء شريط الفلاتر (YouTube Chips)
    // =================================================================
    window.buildChips = function() {
        const fb = document.getElementById('filterBar');
        if (!fb) return;

        const vids = getVideosList();
        const categoriesSet = {};
        vids.forEach(function(v) {
            if (v && v.category) categoriesSet[v.category] = true;
        });
        const categories = Object.keys(categoriesSet);

        let html = '<button class="chip active" onclick="showAll(event)">الكل</button>';
        categories.forEach(function(c) {
            html += '<button class="chip" onclick="filterChipHome(\'' + escStr(c) + '\', event)">' + escHTML(c) + '</button>';
        });
        fb.innerHTML = html;
    };

    // =================================================================
    // 4. كارت الفيديو (YouTube Design)
    // =================================================================
    function ytCardHTML(v) {
        if (!v || !v.id) return '';

        const thumb = v.thumb || 'https://img.youtube.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg';
        const fallback = 'https://img.youtube.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg';
        const dur = v.duration ? '<span class="dur">' + escHTML(v.duration) + '</span>' : '';
        const catBadge = v.category ? '<span class="cat-chip">' + escHTML(v.category) + '</span>' : '';
        const views = v.views ? formatViews(v.views) + ' مشاهدة' : (v.category || 'دورة تونسية');
        const time = v.date ? ' • ' + timeAgo(v.date) : '';
        const title = escHTML(v.title || 'دورة تعليمية');
        const channel = escHTML(v.channel || 'TunisianTube');
        const topic = escHTML(v.topic || v.category || '');

        return '<div class="card" onclick="navigate(\'video\', {id: \'' + escStr(v.id) + '\'})" role="button" tabindex="0" aria-label="' + title + '">'
             +   '<div class="thumb">'
             +     '<img src="' + escHTML(thumb) + '" alt="' + title + '" loading="lazy" onerror="if(this.src!==\'' + escStr(fallback) + '\'){this.src=\'' + escStr(fallback) + '\';}">'
             +     dur
             +     catBadge
             +     '<div class="thumb-play"><span><i class="fa-solid fa-play" aria-hidden="true"></i></span></div>'
             +   '</div>'
             +   '<div class="card-body">'
             +     '<div class="card-info">'
             +       '<div class="card-title">' + title + '</div>'
             +       '<div class="card-ch"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + channel + '</div>'
             +       '<div class="card-meta">' + escHTML(views) + escHTML(time) + '</div>'
             +       (topic ? '<span class="card-topic">🇹🇳 ' + topic + '</span>' : '')
             +     '</div>'
             +   '</div>'
             + '</div>';
    }
    window.ytCardHTML = ytCardHTML;

    // =================================================================
    // 5. محرك العرض والتحميل اللانهائي
    // =================================================================
    window.renderHome = function() {
        applyFilters();
    };

    function setListAndRender(list) {
        window.activeList = list || [];
        window.displayedCount = 0;

        const g = document.getElementById('grid');
        const e = document.getElementById('empty');

        if (g) g.innerHTML = '';

        if (!window.activeList.length) {
            if (e) {
                e.style.display = 'block';
                e.innerHTML = '<div class="e-i"><i class="fa-solid fa-face-sad-tear" aria-hidden="true"></i></div>'
                           + '<h2>ما فما حتى فيديو 🇹🇳</h2>'
                           + '<p>بدل الفلتر ولا لوج بكلمة أخرى</p>';
            }
            return;
        }

        if (e) e.style.display = 'none';

        setupInfiniteScroll();
        renderNextBatch();
    }
    window.setListAndRender = setListAndRender;

    function setupInfiniteScroll() {
        if (window.observer) {
            try { window.observer.disconnect(); } catch(e) {}
        }

        const sentinel = document.getElementById('sentinel');
        if (!sentinel) return;

        // Fallback إذا IntersectionObserver غير مدعوم
        if (typeof IntersectionObserver === 'undefined') {
            window.addEventListener('scroll', throttle(function() {
                const rect = sentinel.getBoundingClientRect();
                if (rect.top < window.innerHeight + 400) renderNextBatch();
            }, 200));
            return;
        }

        window.observer = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) renderNextBatch();
        }, { rootMargin: '400px' });

        window.observer.observe(sentinel);
    }

    function renderNextBatch() {
        const g = document.getElementById('grid');
        if (!g) return;

        const batch = window.activeList.slice(window.displayedCount, window.displayedCount + window.BATCH_SIZE);
        if (!batch.length) return;

        window.displayedCount += batch.length;
        
        const htmlParts = [];
        for (let i = 0; i < batch.length; i++) {
            htmlParts.push(ytCardHTML(batch[i]));
        }
        g.insertAdjacentHTML('beforeend', htmlParts.join(''));
    }
    window.renderNextBatch = renderNextBatch;

    // Throttle للـ scroll fallback
    function throttle(fn, wait) {
        let last = 0;
        return function() {
            const now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

    // =================================================================
    // 6. الفلاتر والبحث
    // =================================================================
    window.showAll = function(evt) {
        window.currentFilter = { cat: null, sub: null, search: '' };
        
        const si = document.getElementById('searchInput');
        if (si) si.value = '';

        // إزالة النشاط من كل الأزرار
        document.querySelectorAll('.side-btn, .chip').forEach(function(b) {
            b.classList.remove('active');
        });

        // تفعيل زر "الكل" في الـ chips
        const firstChip = document.querySelector('#filterBar .chip');
        if (firstChip) firstChip.classList.add('active');

        // تفعيل زر "الرئيسية" في الـ sidebar
        const homeBtn = document.querySelector('[data-view="home"]');
        if (homeBtn) homeBtn.classList.add('active');

        if (typeof navigate === 'function') navigate('home');
        else applyFilters();
    };

    window.filterChipHome = function(c, evt) {
        window.currentFilter.cat = c;
        window.currentFilter.sub = null;

        // إزالة النشاط من الـ chips
        document.querySelectorAll('.chip').forEach(function(b) {
            b.classList.remove('active');
        });

        // تفعيل الزر المضغوط
        if (evt && evt.target) {
            const btn = evt.target.closest('.chip, .side-btn');
            if (btn) btn.classList.add('active');
        }

        if (typeof navigate === 'function') navigate('home');
        else applyFilters();
    };

    window.filterSubHome = function(s, evt) {
        window.currentFilter.sub = s;

        document.querySelectorAll('#subList .side-btn').forEach(function(b) {
            b.classList.remove('active');
        });

        if (evt && evt.target) {
            const btn = evt.target.closest('.side-btn');
            if (btn) btn.classList.add('active');
        }

        if (typeof navigate === 'function') navigate('home');
        else applyFilters();
    };

    window.onSearchInput = function() {
        clearTimeout(window.searchTimer);
        window.searchTimer = setTimeout(function() {
            const si = document.getElementById('searchInput');
            window.currentFilter.search = (si ? si.value : '').toLowerCase().trim();
            
            if (typeof navigate === 'function') navigate('home');
            else applyFilters();
        }, 300);
    };

    function applyFilters() {
        let r = getVideosList();

        if (window.currentFilter.cat) {
            r = r.filter(function(v) { return v && v.category === window.currentFilter.cat; });
        }

        if (window.currentFilter.sub) {
            r = r.filter(function(v) { return v && v.topic === window.currentFilter.sub; });
        }

        if (window.currentFilter.search) {
            const q = window.currentFilter.search;
            r = r.filter(function(v) {
                if (!v) return false;
                const haystack = ((v.title || '') + ' ' + (v.channel || '') + ' ' + (v.topic || '') + ' ' + (v.category || '')).toLowerCase();
                return haystack.includes(q);
            });
        }

        setListAndRender(r);
    }
    window.applyFilters = applyFilters;

    // =================================================================
    // 7. تحميل الصفحات الجانبية
    // =================================================================
    window.loadCategoryPage = function(cat) {
        const ci = document.getElementById('catIcon');
        if (ci) {
            ci.innerHTML = '<i class="fa-solid ' + (CAT_FA_ICONS[cat] || 'fa-folder') + '" aria-hidden="true"></i>';
        }

        const ct = document.getElementById('catTitle');
        if (ct) ct.textContent = cat;

        const cs = document.getElementById('catSub');
        const filtered = getVideosList().filter(function(v) { return v && v.category === cat; });
        
        if (cs) cs.textContent = filtered.length + ' دورة بالدارجة 🇹🇳';

        const cg = document.getElementById('categoryGrid');
        if (cg) {
            if (!filtered.length) {
                cg.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:60px;">'
                            + '<h2>فارغة 😅</h2><p>ما فما دورات في هذا التصنيف توّا</p></div>';
            } else {
                cg.innerHTML = filtered.map(ytCardHTML).join('');
            }
        }
    };

    function renderGridPage(gid, list) {
        const g = document.getElementById(gid);
        if (!g) return;

        if (!list || !list.length) {
            g.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:60px;">'
                       + '<div class="e-i"><i class="fa-solid fa-inbox" aria-hidden="true" style="font-size:48px;opacity:0.3;"></i></div>'
                       + '<h2>فارغة 😅</h2>'
                       + '<p>ما فما شيء لهنا توّا</p></div>';
            return;
        }
        g.innerHTML = list.map(ytCardHTML).join('');
    }
    window.renderGridPage = renderGridPage;

    window.loadLikedPage = function() {
        try {
            const likes = JSON.parse(localStorage.getItem('tt_likes') || '{}');
            const ids = Object.keys(likes).filter(function(k) { return likes[k]; });
            const filtered = getVideosList().filter(function(v) { return v && ids.includes(v.id); });
            renderGridPage('likedGrid', filtered);
        } catch(e) {
            console.warn('⚠️ loadLikedPage:', e.message);
            renderGridPage('likedGrid', []);
        }
    };

    window.loadSubscriptionsPage = function() {
        try {
            const subs = JSON.parse(localStorage.getItem('tt_subs') || '{}');
            const channels = Object.keys(subs).filter(function(k) { return subs[k]; });
            const filtered = getVideosList().filter(function(v) { return v && channels.includes(v.channel); });
            renderGridPage('subsGrid', filtered);
        } catch(e) {
            console.warn('⚠️ loadSubscriptionsPage:', e.message);
            renderGridPage('subsGrid', []);
        }
    };

    window.loadHistoryPage = function() {
        try {
            const h = JSON.parse(localStorage.getItem('tt_history') || '[]');
            const vids = getVideosList();
            const filtered = h.map(function(id) {
                return vids.find(function(v) { return v && v.id === id; });
            }).filter(Boolean);
            renderGridPage('historyGrid', filtered);
        } catch(e) {
            console.warn('⚠️ loadHistoryPage:', e.message);
            renderGridPage('historyGrid', []);
        }
    };

    // =================================================================
    // 8. أدوات تواريخ ومشاهدات
    // =================================================================
    function formatViews(n) {
        n = parseInt(n || 0, 10);
        if (!n || isNaN(n)) return '';
        if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    }
    window.formatViews = formatViews;

    function timeAgo(d) {
        if (!d) return 'جديد';
        
        const date = new Date(d);
        if (isNaN(date.getTime())) return 'جديد';
        
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        
        if (diff < 0) return 'جديد';
        if (diff < 60) return 'توّا';
        
        if (diff < 3600) {
            const m = Math.floor(diff / 60);
            return 'قبل ' + m + ' ' + (m === 1 ? 'دقيقة' : m === 2 ? 'دقيقتين' : m < 11 ? 'دقايق' : 'دقيقة');
        }
        
        if (diff < 86400) {
            const h = Math.floor(diff / 3600);
            return 'قبل ' + h + ' ' + (h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : h < 11 ? 'سوايع' : 'ساعة');
        }
        
        if (diff < 2592000) {
            const dd = Math.floor(diff / 86400);
            if (dd === 1) return 'الأمس';
            if (dd === 2) return 'قبل يومين';
            return 'قبل ' + dd + ' ' + (dd < 11 ? 'أيام' : 'يوم');
        }
        
        if (diff < 31536000) {
            const mo = Math.floor(diff / 2592000);
            return 'قبل ' + mo + ' ' + (mo === 1 ? 'شهر' : mo === 2 ? 'شهرين' : mo < 11 ? 'أشهر' : 'شهر');
        }
        
        const y = Math.floor(diff / 31536000);
        return 'قبل ' + y + ' ' + (y === 1 ? 'عام' : y === 2 ? 'عامين' : y < 11 ? 'سنين' : 'سنة');
    }
    window.timeAgo = timeAgo;

    // =================================================================
    // 9. تنظيف عند إغلاق الصفحة (منع تسريب الذاكرة)
    // =================================================================
    window.addEventListener('beforeunload', function() {
        if (window.observer) {
            try { window.observer.disconnect(); } catch(e) {}
        }
        if (window.searchTimer) {
            clearTimeout(window.searchTimer);
        }
    });

})();
