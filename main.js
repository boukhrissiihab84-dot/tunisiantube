// ============================================================
// MAIN.JS - TunisianTube 🇹🇳
// Bootstrap + Videos + Settings
// ============================================================

(function () {

    "use strict";

    // ============================================================
    // Settings defaults
    // ============================================================

    const SETTINGS_KEY = "tt_settings";

    const DEFAULT_SETTINGS = {

        theme: "dark",
        themeColor: "#e11a24",

        accountName: "",
        accountHandle: "",
        accountEmail: "",
        accountBio: "",

        channelName: "",
        channelBio: "",
        channelCategory: "",
        channelLink: "",
        channelSocial: "",

        avatar: "",

        language: "dz",

        autoplay: false,
        quality: "auto",
        playbackSpeed: "1.0",
        fontSize: "normal",
        startPage: "home",

        compactMode: false,
        reduceMotion: false,

        notifNew: true,
        notifEmail: false,

        privateLikes: false,
        incognito: false,
        dataSaver: false
    };

    window.TT_DEFAULT_SETTINGS =
        DEFAULT_SETTINGS;

    // ============================================================
    // Video ID
    // ============================================================

    function safeExtractCleanId(value) {

        if (
            typeof extractCleanId ===
            "function"
        ) {
            return extractCleanId(
                value
            );
        }

        const text =
            String(value || "");

        const match =
            text.match(
                /(?:v=|youtu\.be\/|embed\/|\/v\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})/
            );

        if (match) {
            return match[1];
        }

        if (
            text.length === 11
        ) {
            return text;
        }

        return "";
    }

    // ============================================================
    // Video initialization
    // ============================================================

    function initApp(raw) {

        if (
            !Array.isArray(raw) ||
            raw.length === 0
        ) {

            raw =
                typeof GUARANTEED_TOUNES_COURSES !==
                "undefined"
                    ? GUARANTEED_TOUNES_COURSES
                    : [];
        }

        window.allVideos =
            raw
                .map(function (v) {

                    const id =
                        safeExtractCleanId(
                            v.Video_ID ||
                            v.video_id ||
                            v.id ||
                            v.Lien ||
                            v.url ||
                            ""
                        );

                    return {

                        id: id,

                        title:
                            v.Titre ||
                            v.title ||
                            "",

                        channel:
                            v.Chaine ||
                            v.channel ||
                            "",

                        category:
                            v.Categorie ||
                            v.category ||
                            "Autre",

                        topic:
                            v.Mawdhou3 ||
                            v.topic ||
                            "Général",

                        thumb:
                            "https://img.youtube.com/vi/" +
                            id +
                            "/mqdefault.jpg",

                        views:
                            v.views ||
                            v.Vues ||
                            0,

                        date:
                            v.date ||
                            v.Date ||
                            "",

                        duration:
                            v.duration ||
                            v.Duree ||
                            ""
                    };
                })
                .filter(function (v) {

                    return (
                        v.id &&
                        v.id.length === 11
                    );
                });

        // Fallback
        if (
            window.allVideos.length === 0 &&
            typeof GUARANTEED_TOUNES_COURSES !==
            "undefined"
        ) {

            window.allVideos =
                GUARANTEED_TOUNES_COURSES
                    .map(function (v) {

                        const id =
                            v.Video_ID;

                        return {

                            id: id,

                            title:
                                v.Titre ||
                                "",

                            channel:
                                v.Chaine ||
                                "",

                            category:
                                v.Categorie ||
                                "Autre",

                            topic:
                                v.Mawdhou3 ||
                                "Général",

                            thumb:
                                "https://img.youtube.com/vi/" +
                                id +
                                "/mqdefault.jpg"
                        };
                    });
        }

        // Count
        const count =
            document.getElementById(
                "vCount"
            );

        if (count) {

            count.textContent =
                window.allVideos.length +
                " دورة";
        }

        // UI
        if (
            typeof buildSide ===
            "function"
        ) {
            buildSide();
        }

        if (
            typeof buildChips ===
            "function"
        ) {
            buildChips();
        }

        if (
            typeof initRouter ===
            "function"
        ) {
            initRouter();
        } else if (
            typeof renderHome ===
            "function"
        ) {
            renderHome();
        }
    }

    window.initApp =
        initApp;

    // ============================================================
    // Theme compatibility
    // ============================================================

    window.applyTheme =
        function () {

            let settings = {};

            try {

                settings =
                    JSON.parse(
                        localStorage.getItem(
                            SETTINGS_KEY
                        ) || "{}"
                    );

            } catch (e) {}

            const theme =
                settings.theme ||
                "dark";

            document.documentElement
                .setAttribute(
                    "data-theme",
                    theme
                );

            const accent =
                settings.themeColor ||
                DEFAULT_SETTINGS.themeColor;

            document.documentElement.style
                .setProperty(
                    "--accent",
                    accent
                );

            document.documentElement.style
                .setProperty(
                    "--accent-soft",
                    accent + "26"
                );

            const btn =
                document.getElementById(
                    "themeBtn"
                );

            if (btn) {

                btn.innerHTML =
                    theme === "dark"
                        ? '<i class="fa-solid fa-sun"></i>'
                        : '<i class="fa-solid fa-moon"></i>';
            }
        };

    // ============================================================
    // Font compatibility
    // ============================================================

    window.applyFontSize =
        function () {

            let settings = {};

            try {

                settings =
                    JSON.parse(
                        localStorage.getItem(
                            SETTINGS_KEY
                        ) || "{}"
                    );

            } catch (e) {}

            const size =
                settings.fontSize ||
                "normal";

            document.body.classList.remove(
                "font-small",
                "font-normal",
                "font-large"
            );

            document.body.classList.add(
                "font-" + size
            );
        };

    // ============================================================
    // Settings shortcut
    // ============================================================

    window.getTTSettings =
        function () {

            if (
                typeof SettingsState !==
                "undefined"
            ) {
                return SettingsState.current;
            }

            try {

                return {
                    ...DEFAULT_SETTINGS,
                    ...JSON.parse(
                        localStorage.getItem(
                            SETTINGS_KEY
                        ) || "{}"
                    )
                };

            } catch (e) {

                return {
                    ...DEFAULT_SETTINGS
                };
            }
        };

    // ============================================================
    // Page exit protection
    // ============================================================

    window.addEventListener(
        "beforeunload",
        function (event) {

            if (
                typeof SettingsState ===
                    "undefined" ||
                !SettingsState.hasChanges
            ) {
                return;
            }

            event.preventDefault();

            event.returnValue =
                "عندك تغييرات مازال ما تحفّظتش.";

            return event.returnValue;
        }
    );

    // ============================================================
    // DOM Ready
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "🇹🇳 TunisianTube: تشغيل..."
            );

            // Theme
            if (
                typeof applyTheme ===
                "function"
            ) {
                applyTheme();
            }

            // Font
            if (
                typeof applyFontSize ===
                "function"
            ) {
                applyFontSize();
            }

            // Settings
            if (
                typeof SettingsState !==
                "undefined"
            ) {

                SettingsState.init();

                if (
                    typeof bindFormListeners ===
                    "function"
                ) {
                    bindFormListeners();
                }
            }

            // Auth
            if (
                typeof renderAuth ===
                "function"
            ) {
                renderAuth();
            }

            // Data
            try {

                if (
                    typeof rawVideosData !==
                        "undefined" &&
                    Array.isArray(
                        rawVideosData
                    ) &&
                    rawVideosData.length
                ) {

                    initApp(
                        rawVideosData
                    );

                } else {

                    throw new Error(
                        "data.js empty"
                    );
                }

            } catch (error) {

                fetch(
                    "tounes_courses.json?nocache=" +
                    Date.now(),
                    {
                        cache:
                            "no-store"
                    }
                )
                    .then(function (response) {

                        if (
                            !response.ok
                        ) {
                            throw new Error(
                                "JSON error"
                            );
                        }

                        return response.json();
                    })
                    .then(function (data) {

                        initApp(data);
                    })
                    .catch(function () {

                        if (
                            typeof GUARANTEED_TOUNES_COURSES !==
                            "undefined"
                        ) {

                            initApp(
                                GUARANTEED_TOUNES_COURSES
                            );

                        } else {

                            initApp([]);
                        }
                    });
            }

            // Keyboard
            document.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !==
                        "Escape"
                    ) {
                        return;
                    }

                    if (
                        typeof closeAuth ===
                        "function"
                    ) {
                        closeAuth();
                    }

                    if (
                        typeof closeDlModal ===
                        "function"
                    ) {
                        closeDlModal();
                    }

                    document
                        .getElementById(
                            "dropdown"
                        )
                        ?.classList.remove(
                            "show",
                            "open"
                        );
                }
            );

            console.log(
                "✅ TunisianTube: جاهز!"
            );
        }
    );

})();
