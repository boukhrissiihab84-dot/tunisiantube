// ==========================================================
// TUNISIANTUBE 🇹🇳
// MAIN.JS
// APPLICATION BOOTSTRAP
// ==========================================================

"use strict";


// ==========================================================
// NORMALIZE VIDEO
// ==========================================================

function normalizeVideo(raw) {

    if (!raw || typeof raw !== "object") {

        return null;

    }


    const id =
        extractCleanId(
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
        raw.Views ??
        raw.views ??
        raw.Vues ??
        raw.vues ??
        null;


    const date =
        raw.Date ||
        raw.date ||
        raw.PublishedAt ||
        raw.publishedAt ||
        raw.createdAt ||
        null;


    const duration =
        raw.Duration ||
        raw.duration ||
        raw.Duree ||
        raw.duree ||
        "";


    return {

        id,

        title: String(
            title
        ),

        channel: String(
            channel
        ),

        category: String(
            category
        ),

        topic: String(
            topic
        ),

        views,

        date,

        duration,

        thumb:
            `https://img.youtube.com/vi/${id}/mqdefault.jpg`

    };

}


// ==========================================================
// INITIALIZE DATABASE
// ==========================================================

function initApp(raw) {

    let source =
        Array.isArray(raw)
            ? raw
            : [];


    if (!source.length) {

        console.warn(
            "⚠️ Database empty. Using fallback."
        );


        if (
            typeof GUARANTEED_TOUNES_COURSES !==
            "undefined"
        ) {

            source =
                GUARANTEED_TOUNES_COURSES;

        }

    }


    const normalized =
        source
            .map(
                normalizeVideo
            )
            .filter(Boolean);


    if (!normalized.length) {

        console.error(
            "🚨 No valid videos found. Using guaranteed data."
        );


        if (
            typeof GUARANTEED_TOUNES_COURSES !==
            "undefined"
        ) {

            allVideos =
                GUARANTEED_TOUNES_COURSES
                    .map(
                        normalizeVideo
                    )
                    .filter(Boolean);

        } else {

            allVideos = [];

        }

    } else {

        allVideos =
            normalized;

    }


    /* ======================================================
       GLOBAL STATE
    ====================================================== */

    activeList =
        [...allVideos];


    displayedCount =
        0;


    currentFilter =
        {
            cat: null,
            sub: null,
            search: ""
        };


    /* ======================================================
       UI
    ====================================================== */

    updateVideoCount();

    buildSide();

    buildChips();


    /* ======================================================
       ROUTER
    ====================================================== */

    if (
        typeof initRouter ===
        "function"
    ) {

        initRouter();

    }


    /* ======================================================
       FIRST RENDER
    ====================================================== */

    if (
        typeof renderHome ===
        "function"
    ) {

        renderHome();

    }

}


// ==========================================================
// UPDATE VIDEO COUNT
// ==========================================================

function updateVideoCount() {

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

}


// ==========================================================
// LOAD DATABASE
// ==========================================================

function loadVideosDatabase() {

    return new Promise(
        resolve => {

            /* =================================================
               FIRST SOURCE: data.js
            ================================================== */

            if (
                typeof rawVideosData !==
                    "undefined" &&
                Array.isArray(
                    rawVideosData
                ) &&
                rawVideosData.length
            ) {

                resolve(
                    rawVideosData
                );

                return;

            }


            /* =================================================
               SECOND SOURCE: JSON
            ================================================== */

            fetch(
                `tounes_courses.json?nocache=${Date.now()}`,
                {
                    cache:
                        "no-store"
                }
            )
                .then(
                    response => {

                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                "JSON fetch failed"
                            );

                        }


                        return response.json();

                    }
                )
                .then(
                    data => {

                        if (
                            Array.isArray(
                                data
                            ) &&
                            data.length
                        ) {

                            resolve(
                                data
                            );

                            return;

                        }


                        throw new Error(
                            "JSON empty"
                        );

                    }
                )
                .catch(
                    error => {

                        console.warn(
                            "⚠️ JSON unavailable:",
                            error
                        );


                        if (
                            typeof GUARANTEED_TOUNES_COURSES !==
                            "undefined"
                        ) {

                            resolve(
                                GUARANTEED_TOUNES_COURSES
                            );

                        } else {

                            resolve([]);

                        }

                    }
                );

        }
    );

}


// ==========================================================
// APP START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            /*
             * Load data
             */

            const data =
                await loadVideosDatabase();


            /*
             * Initialize
             */

            initApp(
                data
            );


        } catch (error) {

            console.error(
                "❌ TunisianTube startup error:",
                error
            );


            try {

                initApp(
                    typeof GUARANTEED_TOUNES_COURSES !==
                    "undefined"
                        ? GUARANTEED_TOUNES_COURSES
                        : []
                );

            } catch (fallbackError) {

                console.error(
                    "❌ Fatal startup error:",
                    fallbackError
                );

            }

        }


        /* =====================================================
           EXISTING APP SERVICES
        ====================================================== */

        try {

            if (
                typeof applyTheme ===
                "function"
            ) {

                applyTheme();

            }

        } catch (e) {

            console.warn(
                "Theme initialization failed:",
                e
            );

        }


        try {

            if (
                typeof applyFontSize ===
                "function"
            ) {

                applyFontSize();

            }

        } catch (e) {

            console.warn(
                "Font size initialization failed:",
                e
            );

        }


        try {

            if (
                typeof renderAuth ===
                "function"
            ) {

                renderAuth();

            }

        } catch (e) {

            console.warn(
                "Auth rendering failed:",
                e
            );

        }


        /* =====================================================
           ESCAPE KEY
        ====================================================== */

        document.addEventListener(
            "keydown",
            event => {

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


                closeMobileSidebar();

            }
        );


        /* =====================================================
           RESIZE
        ====================================================== */

        let resizeTimer;


        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    setTimeout(
                        () => {

                            if (
                                window.innerWidth >
                                900
                            ) {

                                closeMobileSidebar();

                            }

                        },
                        150
                    );

            }
        );

    }
);
