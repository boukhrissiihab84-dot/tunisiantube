// =====================================================================
// MAIN.JS - TunisianTube 🇹🇳
// فيديوهات + إعدادات Pro + Save Bar + تطبيق فوري على الواجهة
// =====================================================================

(function () {
    'use strict';

    // =================================================================
    // 1. ثوابت الإعدادات
    // =================================================================
    const SETTINGS_KEY = 'tt_settings';

    const DEFAULT_SETTINGS = {
        theme: 'dark',
        themeColor: '#e11a24',
        accountName: '',
        accountHandle: '',
        accountEmail: '',
        accountBio: '',
        channelName: '',
        channelBio: '',
        channelCategory: '',
        channelLink: '',
        channelSocial: '',
        avatar: '',
        language: 'dz',
        autoplay: false,
        quality: 'auto',
        playbackSpeed: '1.0',
        fontSize: 'normal',
        startPage: 'home',
        compactMode: false,
        reduceMotion: false,
        notifNew: true,
        notifEmail: false,
        privateLikes: false,
        incognito: false,
        dataSaver: false
    };

    // =================================================================
    // 2. محرك الفيديوهات
    // =================================================================
    function safeExtractCleanId(url) {
        if (typeof extractCleanId === 'function') return extractCleanId(url);

        const match = String(url || '').match(
            /(?:v=|v\/|vi\/|youtu\.be\/|\/v\/|embed\/|\/e\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})/
        );

        return match
            ? match[1]
            : (url && String(url).length === 11 ? url : '');
    }

    function initApp(raw) {
        if (!Array.isArray(raw) || raw.length === 0) {
            console.warn('⚠️ Database empty! Forcing GUARANTEED fallback...');
            raw = (
                typeof GUARANTEED_TOUNES_COURSES !== 'undefined'
            ) ? GUARANTEED_TOUNES_COURSES : [];
        }

        window.allVideos = raw.map(function (v) {
            const id = safeExtractCleanId(
                v.Video_ID ||
                v.video_id ||
                v.id ||
                v.Lien ||
                v.url ||
                ''
            );

            return {
                id: id,
                title: v.Titre || v.title || '',
                channel: v.Chaine || v.channel || '',
                category: v.Categorie || v.category || 'Autre',
                topic: v.Mawdhou3 || v.topic || 'Général',
                thumb: 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg'
            };
        }).filter(function (v) {
            return v.id && v.id.length === 11;
        });

        if (
            window.allVideos.length === 0 &&
            typeof GUARANTEED_TOUNES_COURSES !== 'undefined'
        ) {
            console.error('🚨 Zero videos passed filter! Hard fallback...');

            window.allVideos = GUARANTEED_TOUNES_COURSES.map(function (v) {
                const id = v.Video_ID;

                return {
                    id: id,
                    title: v.Titre,
                    channel: v.Chaine,
                    category: v.Categorie,
                    topic: v.Mawdhou3,
                    thumb: 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg'
                };
            });
        }

        const vCountEl = document.getElementById('vCount');

        if (vCountEl) {
            vCountEl.textContent = window.allVideos.length + ' دورة';
        }

        if (typeof buildSide === 'function') buildSide();
        if (typeof buildChips === 'function') buildChips();

        if (typeof initRouter === 'function') {
            initRouter();
        } else if (typeof renderHome === 'function') {
            renderHome();
        }
    }

    // =================================================================
    // 3. Settings State Manager
    // =================================================================
    const SettingsState = {

        original: {},
        current: {},
        hasChanges: false,

        init: function () {
            this.original = this.loadFromStorage();
            this.current = Object.assign({}, this.original);
            this.hasChanges = false;

            this.applyTheme();
            applySettingsToUI(this.current);
        },

        loadFromStorage: function () {
            var stored = {};

            try {
                var raw = localStorage.getItem(SETTINGS_KEY);

                if (raw) {
                    var parsed = JSON.parse(raw);

                    if (
                        parsed &&
                        typeof parsed === 'object' &&
                        !Array.isArray(parsed)
                    ) {
                        stored = parsed;
                    }
                }
            } catch (e) {
                console.warn(
                    'TunisianTube: invalid settings, using defaults.',
                    e
                );
            }

            // Compatibility with older versions
            if (
                stored.themeColor == null &&
                stored.accentColor != null
            ) {
                stored.themeColor = stored.accentColor;
            }

            if (
                stored.playbackSpeed == null &&
                stored.speed != null
            ) {
                stored.playbackSpeed = stored.speed;
            }

            if (
                stored.language == null &&
                stored.lang != null
            ) {
                stored.language = stored.lang;
            }

            var result = Object.assign({}, DEFAULT_SETTINGS);

            for (var key in DEFAULT_SETTINGS) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        DEFAULT_SETTINGS,
                        key
                    )
                ) {
                    continue;
                }

                if (
                    stored[key] !== undefined &&
                    stored[key] !== null
                ) {
                    result[key] = stored[key];
                }
            }

            // Validate theme
            if (
                result.theme !== 'dark' &&
                result.theme !== 'light'
            ) {
                result.theme = DEFAULT_SETTINGS.theme;
            }

            // Validate language
            if (
                result.language !== 'dz' &&
                result.language !== 'fr'
            ) {
                result.language = DEFAULT_SETTINGS.language;
            }

            // Validate quality
            if (
                [
                    'auto',
                    '1080p',
                    '720p',
                    '480p',
                    '360p'
                ].indexOf(result.quality) === -1
            ) {
                result.quality = DEFAULT_SETTINGS.quality;
            }

            // Validate playback speed
            if (
                [
                    '0.5',
                    '0.75',
                    '1.0',
                    '1.25',
                    '1.5',
                    '1.75',
                    '2.0'
                ].indexOf(String(result.playbackSpeed)) === -1
            ) {
                result.playbackSpeed =
                    DEFAULT_SETTINGS.playbackSpeed;
            }

            // Validate font size
            if (
                ['small', 'normal', 'large']
                    .indexOf(result.fontSize) === -1
            ) {
                result.fontSize = DEFAULT_SETTINGS.fontSize;
            }

            // Force booleans
            [
                'autoplay',
                'compactMode',
                'reduceMotion',
                'notifNew',
                'notifEmail',
                'privateLikes',
                'incognito',
                'dataSaver'
            ].forEach(function (key) {
                result[key] = Boolean(result[key]);
            });

            return result;
        },

        update: function (key, value) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    DEFAULT_SETTINGS,
                    key
                )
            ) {
                return;
            }

            this.current[key] = value;

            this.hasChanges =
                JSON.stringify(this.current) !==
                JSON.stringify(this.original);

            // Preview immediately.
            // Nothing is saved to localStorage until Save.
            applySettingsToUI(this.current);
            applyValuesToForm();
            this.updateSaveBar();
        },

        save: function () {
            try {
                localStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(this.current)
                );

                this.original = Object.assign({}, this.current);
                this.hasChanges = false;

                this.applyTheme();
                applyValuesToForm();
                applySettingsToUI(this.current);
                this.updateSaveBar();

                showToast(
                    'تم حفظ التعديلات بنجاح ✅',
                    'success'
                );

                return true;

            } catch (e) {
                console.error(
                    'Settings save error:',
                    e
                );

                showToast(
                    'صارت مشكلة في الحفظ ❌',
                    'error'
                );

                return false;
            }
        },

        discard: function () {
            this.current =
                Object.assign({}, this.original);

            this.hasChanges = false;

            this.applyTheme();
            applyValuesToForm();
            applySettingsToUI(this.current);
            syncThemeIcon();
            this.updateSaveBar();

            showToast(
                'تم إلغاء التعديلات',
                'success'
            );
        },

        applyTheme: function () {
            var theme =
                (
                    this.current &&
                    this.current.theme
                )
                    ? this.current.theme
                    : DEFAULT_SETTINGS.theme;

            document.documentElement.setAttribute(
                'data-theme',
                theme
            );

            syncThemeIcon();
        },

        updateSaveBar: function () {
            var bar =
                document.getElementById('save-bar');

            if (!bar) {
                bar = createSaveBar();
            }

            if (bar) {
                bar.classList.toggle(
                    'show',
                    !!this.hasChanges
                );
            }
        }
    };

    window.SettingsManager = SettingsState;

    // =================================================================
    // 4. Save Bar + Toast
    // =================================================================
    function createSaveBar() {
        if (!document.body) return null;

        var existing =
            document.getElementById('save-bar');

        if (existing) return existing;

        var bar =
            document.createElement('div');

        bar.id = 'save-bar';
        bar.className = 'save-bar';

        bar.innerHTML =
            '<div class="save-bar-text">' +
                '<i class="fa-solid fa-circle-exclamation"></i>' +
                ' عندك تعديلات ما محفوظينش' +
            '</div>' +

            '<button type="button" ' +
                'class="save-bar-cancel" ' +
                'id="settings-save-cancel">' +
                'إلغاء' +
            '</button>' +

            '<button type="button" ' +
                'class="save-bar-save" ' +
                'id="settings-save-confirm">' +
                'حفظ التعديلات' +
            '</button>';

        document.body.appendChild(bar);

        var cancelBtn =
            document.getElementById(
                'settings-save-cancel'
            );

        var saveBtn =
            document.getElementById(
                'settings-save-confirm'
            );

        if (cancelBtn) {
            cancelBtn.addEventListener(
                'click',
                function () {
                    SettingsState.discard();
                }
            );
        }

        if (saveBtn) {
            saveBtn.addEventListener(
                'click',
                function () {
                    SettingsState.save();
                }
            );
        }

        return bar;
    }

    function showToast(message, type) {
        document
            .querySelectorAll('.settings-toast')
            .forEach(function (t) {
                t.remove();
            });

        if (!document.body) return;

        var toast =
            document.createElement('div');

        toast.className =
            'settings-toast' +
            (type === 'error' ? ' error' : '');

        var icon =
            type === 'error'
                ? 'fa-circle-xmark'
                : 'fa-circle-check';

        toast.innerHTML =
            '<i class="fa-solid ' +
            icon +
            '"></i> <span></span>';

        var span =
            toast.querySelector('span');

        if (span) {
            span.textContent = message;
        }

        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');

            setTimeout(function () {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2500);
    }

    window.showToast = showToast;

    // =================================================================
    // 5. تطبيق الإعدادات على الواجهة
    // =================================================================
    function applySettingsToUI(settings) {
        var s =
            settings ||
            SettingsState.current ||
            DEFAULT_SETTINGS;

        // Theme
        document.documentElement.setAttribute(
            'data-theme',
            s.theme || 'dark'
        );

        syncThemeIcon();

        // Accent color
        if (s.themeColor) {
            document.documentElement.style.setProperty(
                '--accent',
                s.themeColor
            );

            document.documentElement.style.setProperty(
                '--accent-soft',
                s.themeColor + '26'
            );
        }

        // Body classes
        if (document.body) {
            document.body.classList.toggle(
                'compact-mode',
                !!s.compactMode
            );

            document.body.classList.toggle(
                'reduce-motion',
                !!s.reduceMotion
            );

            document.body.classList.toggle(
                'lang-fr',
                s.language === 'fr'
            );

            document.body.classList.toggle(
                'lang-dz',
                s.language !== 'fr'
            );
        }

        // Dropdown name
        var ddName =
            document.getElementById('ddName');

        if (ddName) {
            ddName.textContent =
                s.accountName || '';
        }

        // Dropdown email/handle
        var ddEmail =
            document.getElementById('ddEmail');

        if (ddEmail) {
            ddEmail.textContent =
                s.accountHandle ||
                s.accountEmail ||
                '';
        }

        // Avatars
        renderAvatar(
            document.getElementById(
                'accAvatarWrapPro'
            ),
            s.avatar
        );

        renderAvatar(
            document.getElementById('ddAvatar'),
            s.avatar
        );

        var hdrAvatar =
            document.querySelector(
                '.hdr-avatar, #authArea .hdr-avatar, #authArea img'
            );

        if (hdrAvatar) {
            renderAvatar(
                hdrAvatar,
                s.avatar
            );
        }
    }

    window.applySettingsToUI =
        applySettingsToUI;

    // =================================================================
    // 6. Forms
    // =================================================================
    function applyValuesToForm() {
        var s =
            SettingsState.current ||
            DEFAULT_SETTINGS;

        var map = {
            accNamePro: s.accountName,
            accHandlePro: s.accountHandle,
            accEmailPro: s.accountEmail,
            accBioPro: s.accountBio,

            channelNamePro: s.channelName,
            channelBioPro: s.channelBio,
            channelCatPro: s.channelCategory,
            channelLinkPro: s.channelLink,
            channelSocialPro: s.channelSocial,

            langSelectPro: s.language,

            qualitySelectPro: s.quality,
            prefQualityPro: s.quality,

            fontSelectPro: s.fontSize,

            prefSpeedPro: s.playbackSpeed,

            startPagePro: s.startPage
        };

        Object.keys(map).forEach(function (id) {
            var el =
                document.getElementById(id);

            if (el) {
                el.value =
                    map[id] == null
                        ? ''
                        : String(map[id]);
            }
        });

        // Toggles
        setToggle(
            't-pro-dark',
            s.theme === 'dark'
        );

        setToggle(
            't-pro-auto',
            !!s.autoplay
        );

        setToggle(
            't-pro-autoplay',
            !!s.autoplay
        );

        setToggle(
            't-pro-compact',
            !!s.compactMode
        );

        setToggle(
            't-pro-animation',
            !!s.reduceMotion
        );

        setToggle(
            't-pro-notif-new',
            !!s.notifNew
        );

        setToggle(
            't-pro-notif-email',
            !!s.notifEmail
        );

        setToggle(
            't-pro-priv-likes',
            !!s.privateLikes
        );

        setToggle(
            't-pro-incognito',
            !!s.incognito
        );

        setToggle(
            't-pro-datasaver',
            !!s.dataSaver
        );

        // Color dots
        document
            .querySelectorAll('.color-dot')
            .forEach(function (dot) {

                var bg =
                    dot.getAttribute('data-color') ||
                    dot.style.backgroundColor ||
                    dot.style.background ||
                    '';

                var target =
                    String(
                        s.themeColor || ''
                    ).trim().toLowerCase();

                function normalizeColor(value) {
                    value =
                        String(value || '')
                            .trim()
                            .toLowerCase();

                    var hex =
                        value.match(
                            /^#([0-9a-f]{6})$/i
                        );

                    if (hex) {
                        return hex[1];
                    }

                    var rgb =
                        value.match(
                            /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
                        );

                    if (rgb) {
                        return [
                            rgb[1],
                            rgb[2],
                            rgb[3]
                        ]
                        .map(function (n) {
                            return Number(n)
                                .toString(16)
                                .padStart(2, '0');
                        })
                        .join('');
                    }

                    return value.replace(
                        /^#/,
                        ''
                    );
                }

                var active =
                    normalizeColor(bg) ===
                    normalizeColor(target);

                dot.classList.toggle(
                    'active',
                    active
                );
            });

        renderAvatar(
            document.getElementById(
                'accAvatarWrapPro'
            ),
            s.avatar
        );

        renderAvatar(
            document.getElementById(
                'ddAvatar'
            ),
            s.avatar
        );
    }

    function setToggle(id, on) {
        var el =
            document.getElementById(id);

        if (el) {
            el.classList.toggle(
                'active',
                !!on
            );
        }
    }

    function bindFormListeners() {
        var fields = {

            accNamePro: 'accountName',
            accHandlePro: 'accountHandle',
            accEmailPro: 'accountEmail',
            accBioPro: 'accountBio',

            channelNamePro: 'channelName',
            channelBioPro: 'channelBio',
            channelCatPro: 'channelCategory',
            channelLinkPro: 'channelLink',
            channelSocialPro: 'channelSocial',

            langSelectPro: 'language',

            qualitySelectPro: 'quality',
            prefQualityPro: 'quality',

            fontSelectPro: 'fontSize',

            prefSpeedPro: 'playbackSpeed',

            startPagePro: 'startPage'
        };

        Object.keys(fields).forEach(function (id) {

            var el =
                document.getElementById(id);

            if (
                !el ||
                el.dataset.settingsBound === '1'
            ) {
                return;
            }

            el.dataset.settingsBound = '1';

            var key = fields[id];

            var update = function () {
                SettingsState.update(
                    key,
                    el.value
                );
            };

            el.addEventListener(
                'input',
                update
            );

            el.addEventListener(
                'change',
                update
            );
        });
    }

    function renderAvatar(container, avatarUrl) {
        if (!container) return;

        // If target itself is an IMG
        if (container.tagName === 'IMG') {

            if (avatarUrl) {
                container.src = avatarUrl;
                container.alt = 'Avatar';
                container.style.objectFit = 'cover';
                container.style.display = 'block';
            } else {
                container.removeAttribute('src');
                container.alt = '';
            }

            return;
        }

        // Wrapper/container
        container.innerHTML = '';

        if (!avatarUrl) return;

        var img =
            document.createElement('img');

        img.src = avatarUrl;
        img.alt = 'Avatar';

        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.display = 'block';

        img.addEventListener(
            'error',
            function () {
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
            }
        );

        container.appendChild(img);
    }

    // =================================================================
    // 7. Theme / Toggles / Colors
    // =================================================================
    function syncThemeIcon() {
        var theme =
            document.documentElement
                .getAttribute('data-theme') ||
            'dark';

        var btn =
            document.getElementById('themeBtn');

        if (!btn) return;

        btn.innerHTML =
            theme === 'dark'
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
    }

    window.forceToggleTheme =
        function () {

            var current =
                SettingsState.current.theme ||
                document.documentElement
                    .getAttribute('data-theme') ||
                'dark';

            var newTheme =
                current === 'dark'
                    ? 'light'
                    : 'dark';

            // Preview only.
            // Save / Discard control persistence.
            SettingsState.update(
                'theme',
                newTheme
            );
        };

    window.toggleSetPro =
        function (key) {

            // Theme
            if (
                key === 'dark' ||
                key === 'theme'
            ) {
                forceToggleTheme();
                return;
            }

            var map = {

                auto: {
                    id: 't-pro-auto',
                    state: 'autoplay'
                },

                autoplay: {
                    id: 't-pro-autoplay',
                    state: 'autoplay'
                },

                compactMode: {
                    id: 't-pro-compact',
                    state: 'compactMode'
                },

                reduceMotion: {
                    id: 't-pro-animation',
                    state: 'reduceMotion'
                },

                notifNew: {
                    id: 't-pro-notif-new',
                    state: 'notifNew'
                },

                notifEmail: {
                    id: 't-pro-notif-email',
                    state: 'notifEmail'
                },

                privateLikes: {
                    id: 't-pro-priv-likes',
                    state: 'privateLikes'
                },

                incognito: {
                    id: 't-pro-incognito',
                    state: 'incognito'
                },

                dataSaver: {
                    id: 't-pro-datasaver',
                    state: 'dataSaver'
                }
            };

            var conf = map[key];

            if (!conf) return;

            var el =
                document.getElementById(
                    conf.id
                );

            if (!el) return;

            var newValue =
                !el.classList.contains('active');

            el.classList.toggle(
                'active',
                newValue
            );

            SettingsState.update(
                conf.state,
                newValue
            );

            // update() applies preview immediately.
        };

    window.changeThemeColor =
        function (colorHex, btn) {

            document
                .querySelectorAll('.color-dot')
                .forEach(function (d) {
                    d.classList.remove('active');
                });

            if (btn) {
                btn.classList.add('active');
            }

            document.documentElement.style.setProperty(
                '--accent',
                colorHex
            );

            document.documentElement.style.setProperty(
                '--accent-soft',
                colorHex + '26'
            );

            SettingsState.update(
                'themeColor',
                colorHex
            );
        };

    window.setLangPro =
        function (v) {
            SettingsState.update(
                'language',
                v
            );
        };

    window.setQualityPro =
        function (v) {
            SettingsState.update(
                'quality',
                v
            );
        };

    window.setFontSizePro =
        function (v) {
            SettingsState.update(
                'fontSize',
                v
            );
        };

    // =================================================================
    // 8. Settings tabs navigation
    // =================================================================
    window.forceOpenSettingsTab =
        function (tabId, btn) {

            if (!tabId) return;

            document
                .querySelectorAll(
                    '.settings-pane-pro'
                )
                .forEach(function (p) {

                    p.classList.remove(
                        'active'
                    );

                    p.style.display = 'none';
                });

            document
                .querySelectorAll(
                    '.tab-btn-pro'
                )
                .forEach(function (b) {
                    b.classList.remove(
                        'active'
                    );
                });

            var target =
                document.getElementById(
                    'set-pro-' + tabId
                );

            if (target) {
                target.classList.add(
                    'active'
                );

                target.style.display =
                    'block';
            }

            if (btn) {
                btn.classList.add(
                    'active'
                );
            }

            applyValuesToForm();
            bindFormListeners();
        };

    window.forceGoSettings =
        function (tab) {

            function openSettings() {

                var btn = tab
                    ? document.querySelector(
                        '.tab-btn-pro[data-tab="' +
                        String(tab).replace(
                            /"/g,
                            ''
                        ) +
                        '"]'
                    )
                    : null;

                if (btn) {
                    forceOpenSettingsTab(
                        tab,
                        btn
                    );
                } else {
                    applyValuesToForm();
                    bindFormListeners();
                }
            }

            if (
                typeof window.navigate ===
                'function'
            ) {
                window.navigate(
                    'settings'
                );

                setTimeout(
                    openSettings,
                    80
                );
            } else {
                openSettings();
            }

            var dropdown =
                document.getElementById(
                    'dropdown'
                );

            if (dropdown) {
                dropdown.classList.remove(
                    'show'
                );
            }
        };

    // =================================================================
    // 9. Avatar upload
    // =================================================================
    window.forceAvatarChange =
        function (event) {

            var file =
                event &&
                event.target &&
                event.target.files
                    ? event.target.files[0]
                    : null;

            if (!file) return;

            if (
                !file.type ||
                file.type.indexOf('image/') !== 0
            ) {
                showToast(
                    'اختار صورة صحيحة 🇹🇳',
                    'error'
                );

                if (event && event.target) {
                    event.target.value = '';
                }

                return;
            }

            if (
                file.size >
                5 * 1024 * 1024
            ) {
                showToast(
                    'الصورة كبيرة (أقصى 5MB)',
                    'error'
                );

                if (event && event.target) {
                    event.target.value = '';
                }

                return;
            }

            compressImage(
                file,
                200,
                200,
                0.75,
                function (dataUrl) {

                    renderAvatar(
                        document.getElementById(
                            'accAvatarWrapPro'
                        ),
                        dataUrl
                    );

                    renderAvatar(
                        document.getElementById(
                            'ddAvatar'
                        ),
                        dataUrl
                    );

                    SettingsState.update(
                        'avatar',
                        dataUrl
                    );
                }
            );
        };

    function compressImage(
        file,
        maxWidth,
        maxHeight,
        quality,
        callback
    ) {

        var reader =
            new FileReader();

        reader.onload =
            function (ev) {

                var img =
                    new Image();

                img.onload =
                    function () {

                        var canvas =
                            document.createElement(
                                'canvas'
                            );

                        var width =
                            img.width;

                        var height =
                            img.height;

                        var ratio =
                            Math.min(
                                maxWidth / width,
                                maxHeight / height,
                                1
                            );

                        width =
                            Math.max(
                                1,
                                Math.round(
                                    width * ratio
                                )
                            );

                        height =
                            Math.max(
                                1,
                                Math.round(
                                    height * ratio
                                )
                            );

                        canvas.width =
                            width;

                        canvas.height =
                            height;

                        var ctx =
                            canvas.getContext(
                                '2d'
                            );

                        if (!ctx) {
                            showToast(
                                'ما نجمتش نعالج الصورة ❌',
                                'error'
                            );
                            return;
                        }

                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );

                        callback(
                            canvas.toDataURL(
                                'image/jpeg',
                                quality
                            )
                        );
                    };

                img.onerror =
                    function () {
                        showToast(
                            'الصورة غير صالحة ❌',
                            'error'
                        );
                    };

                img.src =
                    ev.target.result;
            };

        reader.onerror =
            function () {
                showToast(
                    'ما نجمتش نقرا الصورة ❌',
                    'error'
                );
            };

        reader.readAsDataURL(file);
    }

    window.randomizeAvatarPro =
        function () {

            var url =
                'https://i.pravatar.cc/200?u=' +
                Math.floor(
                    Math.random() * 1000000
                );

            renderAvatar(
                document.getElementById(
                    'accAvatarWrapPro'
                ),
                url
            );

            renderAvatar(
                document.getElementById(
                    'ddAvatar'
                ),
                url
            );

            SettingsState.update(
                'avatar',
                url
            );
        };

    // =================================================================
    // 10. Dropdown + leave protection
    // =================================================================
    window.toggleDropdown =
        function () {

            var dd =
                document.getElementById(
                    'dropdown'
                );

            if (dd) {
                dd.classList.toggle(
                    'show'
                );
            }
        };

    window.addEventListener(
        'beforeunload',
        function (event) {

            if (!SettingsState.hasChanges) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';

            return '';
        }
    );

    var navigateWrapped = false;

    function protectNavigate() {

        if (navigateWrapped) {
            return true;
        }

        var currentNavigate =
            window.navigate;

        if (
            typeof currentNavigate !==
            'function'
        ) {
            return false;
        }

        if (
            currentNavigate.__ttSettingsWrapped
        ) {
            navigateWrapped = true;
            return true;
        }

        var protectedNavigate =
            function (page, param) {

                if (
                    SettingsState.hasChanges &&
                    page !== 'settings'
                ) {

                    var leave =
                        window.confirm(
                            'عندك تعديلات ما محفوظينش. متأكد باش تخرج بلا حفظ؟'
                        );

                    if (!leave) {
                        return false;
                    }

                    SettingsState.current =
                        Object.assign(
                            {},
                            SettingsState.original
                        );

                    SettingsState.hasChanges =
                        false;

                    applySettingsToUI(
                        SettingsState.current
                    );

                    applyValuesToForm();

                    SettingsState.updateSaveBar();
                }

                return currentNavigate.call(
                    window,
                    page,
                    param
                );
            };

        protectedNavigate.__ttSettingsWrapped =
            true;

        window.navigate =
            protectedNavigate;

        navigateWrapped = true;

        return true;
    }

    setInterval(
        function () {
            protectNavigate();
        },
        150
    );

    // =================================================================
    // 11. Danger zone + save shortcuts
    // =================================================================
    window.clearHistoryPro =
        function () {

            if (
                !window.confirm(
                    'متأكد باش تمسح السجل الكل؟ 🗑️'
                )
            ) {
                return;
            }

            try {

                localStorage.removeItem(
                    'tt_history'
                );

                localStorage.removeItem(
                    'history'
                );

                var grid =
                    document.getElementById(
                        'historyGrid'
                    );

                if (grid) {
                    grid.innerHTML =
                        '<div style="grid-column:1/-1;text-align:center;padding:60px">' +
                        '<h3>السجل فارغ</h3>' +
                        '</div>';
                }

                showToast(
                    'تم مسح السجل ✅',
                    'success'
                );

            } catch (e) {

                showToast(
                    'صارت مشكلة ❌',
                    'error'
                );
            }
        };

    window.clearLikesPro =
        function () {

            if (
                !window.confirm(
                    'متأكد باش تمسح الفيديوهات المعجب بيها؟'
                )
            ) {
                return;
            }

            try {

                localStorage.removeItem(
                    'tt_likes'
                );

                localStorage.removeItem(
                    'likes'
                );

                showToast(
                    'تم المسح ✅',
                    'success'
                );

            } catch (e) {

                showToast(
                    'صارت مشكلة ❌',
                    'error'
                );
            }
        };

    window.resetAllAppDataPro =
        function () {

            if (
                !window.confirm(
                    '⚠️ متأكد؟ باش يتمسح كل شيء نهائياً!'
                )
            ) {
                return;
            }

            try {

                [
                    SETTINGS_KEY,
                    'tt_history',
                    'history',
                    'tt_likes',
                    'likes',
                    'tt_user',
                    'tt_auth',
                    'tt_profile'
                ].forEach(function (key) {

                    try {
                        localStorage.removeItem(
                            key
                        );
                    } catch (e) {}
                });

                try {
                    sessionStorage.clear();
                } catch (e) {}

                window.location.reload();

            } catch (e) {

                showToast(
                    'صارت مشكلة في المسح ❌',
                    'error'
                );
            }
        };

    window.saveAccountPro =
        function () {
            return SettingsState.save();
        };

    window.saveChannelPro =
        function () {
            return SettingsState.save();
        };

    // =================================================================
    // 12. ON START
    // =================================================================
    document.addEventListener(
        'DOMContentLoaded',
        function () {

            console.log(
                '%c🇹🇳 TunisianTube: تشغيل المنصة...',
                'color:#e11a24;font-weight:bold;font-size:14px'
            );

            // ---------------------------------------------------------
            // أ) فيديوهات
            // ---------------------------------------------------------
            try {

                if (
                    typeof rawVideosData !==
                        'undefined' &&
                    Array.isArray(
                        rawVideosData
                    ) &&
                    rawVideosData.length > 0
                ) {

                    initApp(
                        rawVideosData
                    );

                } else {

                    throw new Error(
                        'data.js not defined or empty'
                    );
                }

            } catch (e) {

                fetch(
                    'tounes_courses.json?nocache=' +
                    Date.now(),
                    {
                        cache: 'no-store'
                    }
                )
                    .then(function (r) {

                        if (!r.ok) {
                            throw new Error(
                                'JSON Fetch failed'
                            );
                        }

                        return r.json();
                    })

                    .then(function (d) {
                        initApp(d);
                    })

                    .catch(function () {

                        if (
                            typeof GUARANTEED_TOUNES_COURSES !==
                            'undefined'
                        ) {
                            initApp(
                                GUARANTEED_TOUNES_COURSES
                            );
                        } else {
                            initApp([]);
                        }
                    });
            }

            // ---------------------------------------------------------
            // ب) دوال قديمة إن وجدت
            // ---------------------------------------------------------
            if (
                typeof applyTheme ===
                'function'
            ) {
                applyTheme();
            }

            if (
                typeof applyFontSize ===
                'function'
            ) {
                applyFontSize();
            }

            if (
                typeof renderAuth ===
                'function'
            ) {
                renderAuth();
            }

            // ---------------------------------------------------------
            // ج) Settings
            // ---------------------------------------------------------
            SettingsState.init();

            // Compatibility with old language key
            if (
                SettingsState.current.language !==
                    'fr' &&
                SettingsState.current.language !==
                    'dz'
            ) {
                SettingsState.current.language =
                    'dz';
            }

            applyValuesToForm();
            bindFormListeners();
            applySettingsToUI(
                SettingsState.current
            );
            syncThemeIcon();

            createSaveBar();

            SettingsState.updateSaveBar();

            protectNavigate();

            // ---------------------------------------------------------
            // د) Dropdown
            // ---------------------------------------------------------
            document.addEventListener(
                'click',
                function (event) {

                    var dropdown =
                        document.getElementById(
                            'dropdown'
                        );

                    var auth =
                        document.getElementById(
                            'authArea'
                        );

                    if (
                        !dropdown ||
                        !dropdown.classList.contains(
                            'show'
                        )
                    ) {
                        return;
                    }

                    if (
                        !dropdown.contains(
                            event.target
                        ) &&
                        (
                            !auth ||
                            !auth.contains(
                                event.target
                            )
                        )
                    ) {
                        dropdown.classList.remove(
                            'show'
                        );
                    }
                }
            );

            // ---------------------------------------------------------
            // هـ) Escape
            // ---------------------------------------------------------
            document.addEventListener(
                'keydown',
                function (e) {

                    if (e.key === 'Escape') {

                        var dropdown =
                            document.getElementById(
                                'dropdown'
                            );

                        if (dropdown) {
                            dropdown.classList.remove(
                                'show'
                            );
                        }

                        if (
                            typeof closeAuth ===
                            'function'
                        ) {
                            closeAuth();
                        }

                        if (
                            typeof closeDlModal ===
                            'function'
                        ) {
                            closeDlModal();
                        }
                    }
                }
            );

            console.log(
                '✅ TunisianTube: جاهز 100%!'
            );
        }
    );

})();
