// ============================================================
// MAIN.JS - TunisianTube 🇹🇳
// Bootstrap + Videos + Settings
// FIXED VIDEO STATE
// ============================================================

(function () {

    "use strict";

    // ============================================================
    // SETTINGS
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

        try {

            if (
                typeof extractCleanId === "function"
            ) {

                const result =
                    extractCleanId(value);

                if (
                    result &&
                    String(result).length === 11
                ) {
                    return String(result);
                }

            }

        } catch (e) {
            console.warn(
                "extractCleanId error:",
                e
            );
        }


        const text =
            String(value || "").trim();


        // Direct YouTube ID
        if (
            /^[a-zA-Z0-9_-]{11}$/.test(text)
        ) {

            return text;

        }


        // YouTube URL
        const match =
            text.match(
                /(?:v=|youtu\.be\/|embed\/|\/v\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})/
            );


        if (match) {

            return match[1];

        }


        return "";

    }


    // ============================================================
    // NORMALIZE VIDEO
    // ============================================================

    function normalizeVideo(raw) {

        if (
            !raw ||
            typeof raw !== "object"
        ) {

            return null;

        }


        const id =
            safeExtractCleanId(
                raw.Video_ID ||
                raw.video_id ||
                raw.videoId ||
                raw.id ||
                raw.Lien ||
                raw.lien ||
                raw.url ||
                raw.URL ||
                ""
            );


        if (
            !id ||
            id.length !== 11
        ) {

            return null;

        }


        const title =
            raw.Titre ||
            raw.titre ||
            raw.title ||
            raw.name ||
            "فيديو بلا عنوان";


        const channel =
            raw.Chaine ||
            raw.chaine ||
            raw.channel ||
            raw.Channel ||
            "قناة تونسية";


        const category =
            raw.Categorie ||
            raw.categorie ||
            raw.category ||
            raw.Category ||
            "Autre";


        const topic =
            raw.Mawdhou3 ||
            raw.mawdhou3 ||
            raw.topic ||
            raw.Topic ||
            "Général";


        const views =
            raw.views ??
            raw.Views ??
            raw.Vues ??
            raw.vues ??
            0;


        const date =
            raw.date ||
            raw.Date ||
            raw.PublishedAt ||
            raw.publishedAt ||
            "";


        const duration =
            raw.duration ||
            raw.Duration ||
            raw.Duree ||
            raw.duree ||
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
    // INITIALIZE VIDEOS
    // ============================================================

    function initApp(raw) {

        console.log(
            "🇹🇳 TunisianTube: initializing videos..."
        );


        let source =
            Array.isArray(raw)
                ? raw
                : [];


        // --------------------------------------------------------
        // Fallback if data.js is empty
        // --------------------------------------------------------

        if (
            source.length === 0
        ) {

            console.warn(
                "⚠️ data.js empty. Using guaranteed courses."
            );


            if (
                typeof GUARANTEED_TOUNES_COURSES !==
                "undefined" &&
                Array.isArray(
                    GUARANTEED_TOUNES_COURSES
                )
            ) {

                source =
                    GUARANTEED_TOUNES_COURSES;

            }

        }


        // --------------------------------------------------------
        // Normalize
        // --------------------------------------------------------

        let normalized =
            source
                .map(normalizeVideo)
                .filter(Boolean);


        console.log(
            "📦 Raw videos:",
            source.length
        );

        console.log(
            "🎬 Valid videos:",
            normalized.length
        );


        // --------------------------------------------------------
        // Guaranteed fallback
        // --------------------------------------------------------

        if (
            normalized.length === 0 &&
            typeof GUARANTEED_TOUNES_COURSES !==
                "undefined" &&
            Array.isArray(
                GUARANTEED_TOUNES_COURSES
            )
        ) {

            console.warn(
                "⚠️ No valid videos from data.js. Loading guaranteed courses."
            );


            normalized =
                GUARANTEED_TOUNES_COURSES
                    .map(normalizeVideo)
                    .filter(Boolean);

        }


        // ========================================================
        // IMPORTANT FIX
        // ========================================================
        //
        // globals.js contains:
        //
        // let allVideos = [];
        //
        // Therefore we MUST modify that exact variable.
        //
        // Do NOT replace it with:
        //
        // window.allVideos = [...]
        //
        // because window.allVideos is a different property.
        // ========================================================

        allVideos.length = 0;

        allVideos.push(
            ...normalized
        );


        // Compatibility for old scripts
        window.allVideos = allVideos;


        // --------------------------------------------------------
        // Active list
        // --------------------------------------------------------

        activeList.length = 0;

        activeList.push(
            ...allVideos
        );


        displayedCount = 0;


        currentFilter.cat = null;
        currentFilter.sub = null;
        currentFilter.search = "";


        // --------------------------------------------------------
        // Count
        // --------------------------------------------------------

        updateVideoCounters();


        // --------------------------------------------------------
        // Sidebar
        // --------------------------------------------------------

        try {

            if (
                typeof buildSide ===
                "function"
            ) {

                buildSide();

            }

        } catch (error) {

            console.error(
                "❌ buildSide error:",
                error
            );

        }


        // --------------------------------------------------------
        // Chips
        // --------------------------------------------------------

        try {

            if (
                typeof buildChips ===
                "function"
            ) {

                buildChips();

            }

        } catch (error) {

            console.error(
                "❌ buildChips error:",
                error
            );

        }


        // --------------------------------------------------------
        // Router
        // --------------------------------------------------------

        try {

            if (
                typeof initRouter ===
                "function"
            ) {

                initRouter();

            }

        } catch (error) {

            console.error(
                "❌ Router error:",
                error
            );

        }


        // --------------------------------------------------------
        // Home render
        // --------------------------------------------------------

        try {

            if (
                typeof renderHome ===
                "function"
            ) {

                renderHome();

            }

        } catch (error) {

            console.error(
                "❌ renderHome error:",
                error
            );

        }


        console.log(
            "✅ TunisianTube videos ready:",
            allVideos.length
        );

    }


    window.initApp = initApp;


    // ============================================================
    // VIDEO COUNTERS
    // ============================================================

    function updateVideoCounters() {

        const count =
            document.getElementById(
                "vCount"
            );


        if (count) {

            count.textContent =
                allVideos.length +
                " دورة";

        }


        const statV =
            document.getElementById(
                "statV"
            );


        if (statV) {

            statV.textContent =
                allVideos.length;

        }


        const statC =
            document.getElementById(
                "statC"
            );


        if (statC) {

            const categories =
                new Set(
                    allVideos
                        .map(v => v.category)
                        .filter(Boolean)
                );


            statC.textContent =
                categories.size;

        }

    }


    window.updateVideoCounters =
        updateVideoCounters;


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
                "dark";


            document.documentElement
                .setAttribute(
                    "data-theme",
                    theme
                );


            const accent =
                settings.themeColor ||
                settings.accent ||
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


            document.documentElement.style
                .setProperty(
                    "--yt-accent",
                    accent
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
    // SETTINGS GETTER
    // ============================================================

    window.getTTSettings =
        function () {

            try {

                if (
                    typeof SettingsState !==
                    "undefined" &&
                    SettingsState.current
                ) {

                    return SettingsState.current;

                }

            } catch (e) {}


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
    // BEFORE UNLOAD
    // ============================================================

    window.addEventListener(
        "beforeunload",
        function (event) {

            try {

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

            } catch (e) {}

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

            try {

                if (
                    typeof applyTheme ===
                    "function"
                ) {

                    applyTheme();

                }

            } catch (error) {

                console.warn(
                    "Theme initialization failed:",
                    error
                );

            }


            // ----------------------------------------------------
            // Font
            // ----------------------------------------------------

            try {

                if (
                    typeof applyFontSize ===
                    "function"
                ) {

                    applyFontSize();

                }

            } catch (error) {

                console.warn(
                    "Font initialization failed:",
                    error
                );

            }


            // ----------------------------------------------------
            // Settings
            // ----------------------------------------------------

            try {

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

            } catch (error) {

                console.warn(
                    "Settings initialization failed:",
                    error
                );

            }


            // ----------------------------------------------------
            // Auth
            // ----------------------------------------------------

            try {

                if (
                    typeof renderAuth ===
                    "function"
                ) {

                    renderAuth();

                }

            } catch (error) {

                console.warn(
                    "Auth initialization failed:",
                    error
                );

            }


            // ----------------------------------------------------
            // DATA
            // ----------------------------------------------------

            try {

                if (
                    typeof rawVideosData !==
                    "undefined" &&
                    Array.isArray(
                        rawVideosData
                    ) &&
                    rawVideosData.length > 0
                ) {

                    console.log(
                        "📚 Loading data.js:",
                        rawVideosData.length,
                        "videos"
                    );


                    initApp(
                        rawVideosData
                    );


                } else {

                    console.warn(
                        "⚠️ rawVideosData not available."
                    );


                    throw new Error(
                        "data.js empty or unavailable"
                    );

                }

            } catch (error) {

                console.warn(
                    "⚠️ data.js failed:",
                    error
                );


                // ------------------------------------------------
                // JSON fallback
                // ------------------------------------------------

                fetch(
                    "tounes_courses.json?nocache=" +
                    Date.now(),
                    {
                        cache: "no-store"
                    }
                )
                    .then(
                        function (response) {

                            if (
                                !response.ok
                            ) {

                                throw new Error(
                                    "JSON error " +
                                    response.status
                                );

                            }


                            return response.json();

                        }
                    )
                    .then(
                        function (data) {

                            console.log(
                                "📚 JSON loaded:",
                                Array.isArray(data)
                                    ? data.length
                                    : 0
                            );


                            initApp(data);

                        }
                    )
                    .catch(
                        function (jsonError) {

                            console.warn(
                                "⚠️ JSON fallback failed:",
                                jsonError
                            );


                            // ------------------------------------
                            // Guaranteed fallback
                            // ------------------------------------

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

                        }
                    );

            }


            // ====================================================
            // KEYBOARD
            // ====================================================

            document.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !==
                        "Escape"
                    ) {

                        return;

                    }


                    try {

                        if (
                            typeof closeAuth ===
                            "function"
                        ) {

                            closeAuth();

                        }

                    } catch (e) {}


                    try {

                        if (
                            typeof closeDlModal ===
                            "function"
                        ) {

                            closeDlModal();

                        }

                    } catch (e) {}


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
