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

    window.TT_DEFAULT_SETTINGS = DEFAULT_SETTINGS;


    // ============================================================
    // VIDEO ID
    // ============================================================

    function safeExtractCleanId(value) {

        if (typeof extractCleanId === "function") {

            try {

                const result = extractCleanId(value);

                if (
                    result &&
                    typeof result === "string" &&
                    result.length === 11
                ) {
                    return result;
                }

            } catch (e) {}
        }

        const text = String(value || "").trim();

        if (!text) {
            return "";
        }

        // Direct YouTube ID
        if (/^[A-Za-z0-9_-]{11}$/.test(text)) {
            return text;
        }

        // YouTube URL
        const patterns = [

            /[?&]v=([A-Za-z0-9_-]{11})/,

            /youtu\.be\/([A-Za-z0-9_-]{11})/,

            /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,

            /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,

            /youtube\.com\/live\/([A-Za-z0-9_-]{11})/

        ];

        for (const pattern of patterns) {

            const match = text.match(pattern);

            if (match && match[1]) {
                return match[1];
            }
        }

        // Last fallback:
        // search any 11-character YouTube-looking ID
        const generic = text.match(
            /(?:^|[^A-Za-z0-9_-])([A-Za-z0-9_-]{11})(?:[^A-Za-z0-9_-]|$)/
        );

        if (generic && generic[1]) {
            return generic[1];
        }

        return "";
    }


    // ============================================================
    // NORMALIZE VIDEO
    // ============================================================

    function normalizeVideo(video) {

        if (!video || typeof video !== "object") {
            return null;
        }

        const id = safeExtractCleanId(

            video.Video_ID ||

            video.video_id ||

            video.videoId ||

            video.id ||

            video.Lien ||

            video.lien ||

            video.url ||

            video.URL ||

            ""
        );

        if (!id || id.length !== 11) {
            return null;
        }

        const title =
            video.Titre ||
            video.titre ||
            video.title ||
            video.name ||
            "فيديو بلا عنوان";

        const channel =
            video.Chaine ||
            video.chaine ||
            video.channel ||
            video.Channel ||
            "قناة تونسية";

        const category =
            video.Categorie ||
            video.categorie ||
            video.category ||
            video.Category ||
            "Autre";

        const topic =
            video.Mawdhou3 ||
            video.mawdhou3 ||
            video.topic ||
            video.Topic ||
            "Général";

        const views =
            video.Views ??
            video.views ??
            video.Vues ??
            video.vues ??
            0;

        const date =
            video.Date ||
            video.date ||
            video.PublishedAt ||
            video.publishedAt ||
            video.createdAt ||
            "";

        const duration =
            video.Duration ||
            video.duration ||
            video.Duree ||
            video.duree ||
            "";

        return {

            id: id,

            title: String(title),

            channel: String(channel),

            category: String(category),

            topic: String(topic),

            views: views,

            date: date,

            duration: duration,

            thumb:
                "https://img.youtube.com/vi/" +
                id +
                "/mqdefault.jpg"
        };
    }


    // ============================================================
    // INIT VIDEOS
    // ============================================================

    function initApp(raw) {

        console.log(
            "🇹🇳 Initialisation des vidéos..."
        );

        let source = [];

        // --------------------------------------------------------
        // 1. data.js
        // --------------------------------------------------------

        if (
            Array.isArray(raw) &&
            raw.length > 0
        ) {

            source = raw;

            console.log(
                "📦 Source: data.js",
                source.length,
                "vidéos"
            );
        }

        // --------------------------------------------------------
        // 2. Guaranteed fallback
        // --------------------------------------------------------

        else if (
            typeof GUARANTEED_TOUNES_COURSES !==
            "undefined" &&
            Array.isArray(
                GUARANTEED_TOUNES_COURSES
            ) &&
            GUARANTEED_TOUNES_COURSES.length
        ) {

            source =
                GUARANTEED_TOUNES_COURSES;

            console.log(
                "📦 Source: GUARANTEED_TOUNES_COURSES",
                source.length,
                "vidéos"
            );
        }


        // --------------------------------------------------------
        // Normalize
        // --------------------------------------------------------

        const normalized =
            source
                .map(normalizeVideo)
                .filter(Boolean);


        console.log(
            "🎬 Vidéos valides:",
            normalized.length
        );


        // --------------------------------------------------------
        // IMPORTANT:
        // Use the lexical global from globals.js.
        //
        // DO NOT use:
        // window.allVideos = ...
        //
        // because ui.js uses:
        // allVideos
        // --------------------------------------------------------

        allVideos.length = 0;

        allVideos.push(
            ...normalized
        );


        // --------------------------------------------------------
        // Reset UI state
        // --------------------------------------------------------

        activeList.length = 0;

        activeList.push(
            ...allVideos
        );

        displayedCount = 0;

        currentFilter = {

            cat: null,

            sub: null,

            search: ""
        };


        // --------------------------------------------------------
        // Count
        // --------------------------------------------------------

        const count =
            document.getElementById(
                "vCount"
            );

        if (count) {

            count.textContent =
                allVideos.length +
                " دورة";
        }


        // --------------------------------------------------------
        // Sidebar
        // --------------------------------------------------------

        if (
            typeof buildSide ===
            "function"
        ) {

            try {
                buildSide();
            } catch (e) {

                console.error(
                    "buildSide error:",
                    e
                );
            }
        }


        // --------------------------------------------------------
        // Chips
        // --------------------------------------------------------

        if (
            typeof buildChips ===
            "function"
        ) {

            try {
                buildChips();
            } catch (e) {

                console.error(
                    "buildChips error:",
                    e
                );
            }
        }


        // --------------------------------------------------------
        // Router
        // --------------------------------------------------------

        if (
            typeof initRouter ===
            "function"
        ) {

            try {
                initRouter();
            } catch (e) {

                console.error(
                    "initRouter error:",
                    e
                );
            }
        }


        // --------------------------------------------------------
        // Render HOME
        // --------------------------------------------------------

        if (
            typeof renderHome ===
            "function"
        ) {

            try {

                renderHome();

                console.log(
                    "✅ Home rendered:",
                    allVideos.length,
                    "videos"
                );

            } catch (e) {

                console.error(
                    "❌ renderHome error:",
                    e
                );
            }

        } else {

            console.error(
                "❌ renderHome() introuvable"
            );
        }
    }


    window.initApp = initApp;


    // ============================================================
    // LOAD VIDEOS DATABASE
    // ============================================================

    function loadVideosDatabase() {

        // --------------------------------------------------------
        // data.js
        // --------------------------------------------------------

        if (
            typeof rawVideosData !==
            "undefined" &&
            Array.isArray(rawVideosData) &&
            rawVideosData.length > 0
        ) {

            initApp(
                rawVideosData
            );

            return;
        }


        // --------------------------------------------------------
        // JSON fallback
        // --------------------------------------------------------

        console.warn(
            "⚠️ rawVideosData absent. Trying JSON..."
        );


        fetch(
            "tounes_courses.json?nocache=" +
            Date.now(),
            {
                cache: "no-store"
            }
        )

            .then(function (response) {

                if (!response.ok) {

                    throw new Error(
                        "JSON HTTP " +
                        response.status
                    );
                }

                return response.json();
            })

            .then(function (data) {

                if (
                    Array.isArray(data) &&
                    data.length
                ) {

                    initApp(data);

                } else {

                    throw new Error(
                        "JSON vide"
                    );
                }
            })

            .catch(function (error) {

                console.warn(
                    "⚠️ JSON fallback failed:",
                    error
                );


                // ------------------------------------------------
                // Guaranteed fallback
                // ------------------------------------------------

                if (
                    typeof GUARANTEED_TOUNES_COURSES !==
                    "undefined" &&
                    Array.isArray(
                        GUARANTEED_TOUNES_COURSES
                    )
                ) {

                    initApp(
                        GUARANTEED_TOUNES_COURSES
                    );

                } else {

                    initApp([]);
                }
            });
    }


    // ============================================================
    // THEME
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

            } catch (e) {

                settings = {};
            }


            const theme =
                settings.theme ||
                DEFAULT_SETTINGS.theme;


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
    // FONT SIZE
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

            } catch (e) {

                settings = {};
            }


            const size =
                settings.fontSize ||
                DEFAULT_SETTINGS.fontSize;


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
    // SETTINGS SHORTCUT
    // ============================================================

    window.getTTSettings =
        function () {

            if (
                typeof SettingsState !==
                "undefined" &&
                SettingsState.current
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
    // PAGE EXIT PROTECTION
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
    // DOM READY
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "🇹🇳 TunisianTube: تشغيل..."
            );


            // ----------------------------------------------------
            // Theme
            // ----------------------------------------------------

            if (
                typeof applyTheme ===
                "function"
            ) {

                try {
                    applyTheme();
                } catch (e) {

                    console.warn(
                        "applyTheme error:",
                        e
                    );
                }
            }


            // ----------------------------------------------------
            // Font
            // ----------------------------------------------------

            if (
                typeof applyFontSize ===
                "function"
            ) {

                try {
                    applyFontSize();
                } catch (e) {

                    console.warn(
                        "applyFontSize error:",
                        e
                    );
                }
            }


            // ----------------------------------------------------
            // Settings
            // ----------------------------------------------------

            if (
                typeof SettingsState !==
                "undefined"
            ) {

                try {

                    SettingsState.init();

                } catch (e) {

                    console.warn(
                        "SettingsState.init error:",
                        e
                    );
                }


                if (
                    typeof bindFormListeners ===
                    "function"
                ) {

                    try {
                        bindFormListeners();
                    } catch (e) {

                        console.warn(
                            "bindFormListeners error:",
                            e
                        );
                    }
                }
            }


            // ----------------------------------------------------
            // Auth
            // ----------------------------------------------------

            if (
                typeof renderAuth ===
                "function"
            ) {

                try {
                    renderAuth();
                } catch (e) {

                    console.warn(
                        "renderAuth error:",
                        e
                    );
                }
            }


            // ----------------------------------------------------
            // VIDEOS
            // ----------------------------------------------------

            loadVideosDatabase();


            // ----------------------------------------------------
            // Keyboard
            // ----------------------------------------------------

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


                    const dropdown =
                        document.getElementById(
                            "dropdown"
                        );


                    if (dropdown) {

                        dropdown.classList.remove(
                            "show",
                            "open"
                        );
                    }
                }
            );


            console.log(
                "✅ TunisianTube: جاهز!"
            );
        }
    );

})();
