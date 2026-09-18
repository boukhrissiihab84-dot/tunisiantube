// ==========================================================
// TUNISIANTUBE 🇹🇳
// UI.JS
// SYSTEM B - YOUTUBE 2024 STYLE
// ==========================================================

"use strict";


// ==========================================================
// YOUTUBE ICONS
// ==========================================================

const YT_ICONS = {

    home:
        `<svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z"/>
        </svg>`,

    trending:
        `<svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M17.53 11.2c-.23-.3-.5-.56-.76-.82-.65-.6-1.4-1.03-2.03-1.66C13.3 7.26 13 5.64 13.44 4c-2.13 1.17-3.5 3.2-3.72 5.52-.04.4-.02.8.06 1.18.08.4-.04.68-.32.93-.28.24-.64.3-.97.2-.34-.1-.55-.4-.6-.74-.02-.13-.02-.26-.01-.39-.46.72-.7 1.56-.68 2.42 0 .24.03.48.08.72.3 1.3 1.23 2.38 2.44 2.94 1.2.56 2.6.5 3.74-.14 1.14-.64 1.9-1.8 2.04-3.1-.3 1.3-.3 2.6-1.2 3.54z"/>
        </svg>`,

    subscriptions:
        `<svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zM3 20V10h18v10H3z"/>
        </svg>`,

    library:
        `<svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
        </svg>`,

    history:
        `<svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M14.97 16.95L10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.51-4.49 10-10 10S2 17.51 2 12h1c0 4.96 4.04 9 9 9s9-4.04 9-9-4.04-9-9-9C8.81 3 5.92 4.64 4.28 7.38c-.11.18-.22.37-.31.56L3.94 8H8v1H2.5V3.5h1V7c.22-.39.45-.73.72-1.08C6.04 3.46 8.83 2 12 2c5.51 0 10 4.49 10 10z"/>
        </svg>`,

    liked:
        `<svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H1v11h6l.97.97c.29.29.67.45 1.07.45h8.53c1.1 0 2.07-.72 2.38-1.78l1.72-5.77c.43-1.44-.22-2.97-1.52-3.63z"/>
        </svg>`
};


// ==========================================================
// CATEGORY ICONS
// ==========================================================

const CAT_ICONS = {

    Design:
        `<i class="fa-solid fa-palette"></i>`,

    Programmation:
        `<i class="fa-solid fa-code"></i>`,

    Langues:
        `<i class="fa-solid fa-language"></i>`,

    Marketing:
        `<i class="fa-solid fa-chart-line"></i>`,

    Montage:
        `<i class="fa-solid fa-film"></i>`,

    Freelance:
        `<i class="fa-solid fa-briefcase"></i>`,

    "Bac & Etudes":
        `<i class="fa-solid fa-graduation-cap"></i>`,

    Bureautique:
        `<i class="fa-solid fa-chart-column"></i>`,

    Autre:
        `<i class="fa-solid fa-layer-group"></i>`
};


// ==========================================================
// SIDEBAR
// ==========================================================

function buildSide() {

    const cats = {};
    const subs = {};


    allVideos.forEach(v => {

        const category =
            v.category ||
            "Autre";


        cats[category] =
            (cats[category] || 0) + 1;


        if (
            v.topic &&
            v.topic !== "Général"
        ) {

            subs[v.topic] =
                (subs[v.topic] || 0) + 1;

        }

    });


    const cl =
        document.getElementById(
            "catList"
        );


    if (cl) {

        cl.innerHTML = `

            <button
                class="side-btn active"
                onclick="showAll()"
            >
                ${YT_ICONS.home}

                <span class="side-txt">
                    الرئيسية
                </span>

                <span class="side-cnt">
                    ${allVideos.length}
                </span>
            </button>

            <button
                class="side-btn"
                onclick="navigate('subscriptions')"
            >
                ${YT_ICONS.subscriptions}

                <span class="side-txt">
                    الاشتراكات
                </span>
            </button>

            <div class="side-divider"></div>

            <button
                class="side-btn"
                onclick="navigate('history')"
            >
                ${YT_ICONS.history}

                <span class="side-txt">
                    السجل
                </span>
            </button>

            <button
                class="side-btn"
                onclick="navigate('liked')"
            >
                ${YT_ICONS.liked}

                <span class="side-txt">
                    عجبوني
                </span>
            </button>

            <div class="side-divider"></div>

            <div class="side-section-title">
                التصنيفات
            </div>
        `;


        Object
            .entries(cats)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .forEach(
                ([category, count]) => {

                    cl.innerHTML += `

                        <button
                            class="side-btn"
                            data-category="${escapeAttr(category)}"
                            onclick="filterCategory('${escapeJs(category)}')"
                        >

                            ${
                                CAT_ICONS[
                                    category
                                ] ||
                                CAT_ICONS.Autre
                            }

                            <span class="side-txt">
                                ${escapeHtml(category)}
                            </span>

                            <span class="side-cnt">
                                ${count}
                            </span>

                        </button>

                    `;

                }
            );

    }


    const sl =
        document.getElementById(
            "subList"
        );


    if (sl) {

        const topics =
            Object
                .entries(subs)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 15);


        if (topics.length) {

            sl.innerHTML = `
                <div class="side-divider"></div>

                <div class="side-section-title">
                    المواضيع
                </div>
            `;


            topics.forEach(
                ([topic, count]) => {

                    sl.innerHTML += `

                        <button
                            class="side-btn"
                            data-topic="${escapeAttr(topic)}"
                            onclick="filterSubHome('${escapeJs(topic)}')"
                        >

                            <i class="fa-solid fa-hashtag"></i>

                            <span class="side-txt">
                                ${escapeHtml(topic)}
                            </span>

                            <span class="side-cnt">
                                ${count}
                            </span>

                        </button>

                    `;

                }
            );

        } else {

            sl.innerHTML = "";

        }

    }


    updateStats(cats);

}


// ==========================================================
// STATS
// ==========================================================

function updateStats(cats) {

    const statV =
        document.getElementById(
            "statV"
        );

    const statC =
        document.getElementById(
            "statC"
        );

    const vCount =
        document.getElementById(
            "vCount"
        );


    if (statV) {

        statV.textContent =
            allVideos.length;

    }


    if (statC) {

        statC.textContent =
            Object.keys(cats).length;

    }


    if (vCount) {

        vCount.textContent =
            allVideos.length +
            " دورة";

    }

}


// ==========================================================
// CHIPS
// ==========================================================

function buildChips() {

    const fb =
        document.getElementById(
            "filterBar"
        );


    if (!fb) return;


    const categories =
        [
            ...new Set(
                allVideos
                    .map(v => v.category)
                    .filter(Boolean)
            )
        ];


    const labels = {

        Programmation:
            "💻 برمجة",

        Design:
            "🎨 تصميم",

        Langues:
            "🗣️ لغات",

        Marketing:
            "📈 تسويق",

        Montage:
            "🎬 مونتاج",

        Freelance:
            "💼 فريلانس",

        "Bac & Etudes":
            "📚 بكالوريا",

        Bureautique:
            "📊 مكتبية"

    };


    fb.innerHTML = `

        <button
            class="yt-chip active"
            data-chip="all"
            onclick="showAll()"
        >
            الكل
        </button>

    `;


    categories.forEach(
        category => {

            fb.innerHTML += `

                <button
                    class="yt-chip"
                    data-chip="${escapeAttr(category)}"
                    onclick="filterChipHome('${escapeJs(category)}')"
                >
                    ${
                        labels[category] ||
                        escapeHtml(category)
                    }
                </button>

            `;

        }
    );

}


// ==========================================================
// HOME
// ==========================================================

function renderHome() {

    apply();

}


// ==========================================================
// LIST RENDER
// ==========================================================

function setListAndRender(list) {

    activeList =
        Array.isArray(list)
            ? list
            : [];


    displayedCount = 0;


    const grid =
        document.getElementById(
            "grid"
        );

    const empty =
        document.getElementById(
            "empty"
        );


    if (grid) {

        grid.innerHTML = "";

    }


    if (!activeList.length) {

        if (empty) {

            empty.style.display =
                "flex";


            empty.innerHTML = `

                <div class="yt-empty">

                    <i
                        class="fa-solid fa-video-slash"
                        style="
                            font-size:70px;
                            color:#555;
                        "
                    ></i>

                    <h2>
                        ما فما حتى فيديو 🇹🇳
                    </h2>

                    <p>
                        جرّب تبدّل الفلتر ولا البحث.
                    </p>

                </div>

            `;

        }


        if (observer) {

            observer.disconnect();

        }


        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    setupInfiniteScroll();

    renderNextBatch();

}


// ==========================================================
// INFINITE SCROLL
// ==========================================================

function setupInfiniteScroll() {

    if (observer) {

        observer.disconnect();

    }


    const sentinel =
        document.getElementById(
            "sentinel"
        );


    if (!sentinel) return;


    observer =
        new IntersectionObserver(
            entries => {

                if (
                    entries[0] &&
                    entries[0].isIntersecting
                ) {

                    renderNextBatch();

                }

            },
            {
                rootMargin:
                    "500px"
            }
        );


    observer.observe(
        sentinel
    );

}


// ==========================================================
// CARD
// ==========================================================

function ytCard(v) {

    const title =
        v.title ||
        "فيديو بلا عنوان";


    const channel =
        v.channel ||
        "قناة تونسية";


    const views =
        v.views
            ? formatViews(v.views) +
              " مشاهدة"
            : "";


    const time =
        v.date
            ? timeAgo(v.date)
            : "";


    const fallbackMeta =
        [
            v.category,
            v.topic
        ]
            .filter(Boolean)
            .join(" • ");


    const meta =
        [
            views,
            time
        ]
            .filter(Boolean)
            .join(" • ") ||
        fallbackMeta;


    const duration =
        v.duration
            ? `
                <span class="yt-duration">
                    ${escapeHtml(
                        String(v.duration)
                    )}
                </span>
            `
            : "";


    const avatar =
        escapeHtml(
            channel
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "?"
        );


    const safeId =
        escapeJs(
            v.id
        );


    return `

        <article
            class="yt-card"
            data-video-id="${escapeAttr(v.id)}"
            onclick="navigate('video',{id:'${safeId}'})"
        >

            <div class="yt-thumb-wrap">

                <img
                    class="yt-thumb"
                    src="${escapeAttr(v.thumb)}"
                    alt="${escapeAttr(title)}"
                    loading="lazy"
                    decoding="async"
                    onerror="
                        if(!this.dataset.failed){
                            this.dataset.failed='1';
                            this.src='https://img.youtube.com/vi/${escapeAttr(v.id)}/hqdefault.jpg';
                        }
                    "
                >

                ${duration}

                <span class="yt-badge-tounes">
                    🇹🇳
                </span>

            </div>


            <div class="yt-card-info">

                <div class="yt-ch-avatar">
                    ${avatar}
                </div>


                <div class="yt-card-text">

                    <h3 class="yt-card-title">
                        ${escapeHtml(title)}
                    </h3>

                    <p class="yt-card-channel">
                        ${escapeHtml(channel)}
                    </p>

                    <p class="yt-card-meta">
                        ${escapeHtml(meta)}
                    </p>

                </div>


                <button
                    class="yt-card-menu"
                    onclick="event.stopPropagation();"
                    aria-label="المزيد"
                >
                    ⋮
                </button>

            </div>

        </article>

    `;

}


// ==========================================================
// RENDER BATCH
// ==========================================================

function renderNextBatch() {

    const grid =
        document.getElementById(
            "grid"
        );


    if (!grid) return;


    const batch =
        activeList.slice(
            displayedCount,
            displayedCount +
                BATCH_SIZE
        );


    if (!batch.length) {

        return;

    }


    displayedCount +=
        batch.length;


    grid.insertAdjacentHTML(
        "beforeend",
        batch
            .map(ytCard)
            .join("")
    );

}


// ==========================================================
// SHOW ALL
// ==========================================================

function showAll() {

    currentFilter = {

        cat: null,

        sub: null,

        search: ""

    };


    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        input.value = "";

    }


    document
        .querySelectorAll(
            ".side-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    document
        .querySelector(
            '#catList .side-btn'
        )
        ?.classList.add(
            "active"
        );


    document
        .querySelectorAll(
            ".yt-chip"
        )
        .forEach(
            chip =>
                chip.classList.remove(
                    "active"
                )
        );


    document
        .querySelector(
            '[data-chip="all"]'
        )
        ?.classList.add(
            "active"
        );


    navigate(
        "home"
    );

}


// ==========================================================
// FILTER CATEGORY
// ==========================================================

function filterCategory(category) {

    currentFilter.cat =
        category;

    currentFilter.sub =
        null;


    currentFilter.search =
        "";


    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        input.value = "";

    }


    document
        .querySelectorAll(
            ".side-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    document
        .querySelector(
            `.side-btn[data-category="${CSS.escape(category)}"]`
        )
        ?.classList.add(
            "active"
        );


    document
        .querySelectorAll(
            ".yt-chip"
        )
        .forEach(
            chip =>
                chip.classList.remove(
                    "active"
                )
        );


    document
        .querySelector(
            `.yt-chip[data-chip="${CSS.escape(category)}"]`
        )
        ?.classList.add(
            "active"
        );


    navigate(
        "home"
    );

}


// ==========================================================
// CHIP FILTER
// ==========================================================

function filterChipHome(category) {

    filterCategory(
        category
    );

}


// ==========================================================
// TOPIC FILTER
// ==========================================================

function filterSubHome(topic) {

    currentFilter.sub =
        topic;

    currentFilter.cat =
        null;

    currentFilter.search =
        "";


    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        input.value = "";

    }


    document
        .querySelectorAll(
            ".side-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    document
        .querySelector(
            `.side-btn[data-topic="${CSS.escape(topic)}"]`
        )
        ?.classList.add(
            "active"
        );


    document
        .querySelectorAll(
            ".yt-chip"
        )
        .forEach(
            chip =>
                chip.classList.remove(
                    "active"
                )
        );


    navigate(
        "home"
    );

}


// ==========================================================
// SEARCH
// ==========================================================

function onSearchInput() {

    clearTimeout(
        searchTimer
    );


    searchTimer =
        setTimeout(
            () => {

                const input =
                    document.getElementById(
                        "searchInput"
                    );


                currentFilter.search =
                    (
                        input?.value ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                currentFilter.cat =
                    null;

                currentFilter.sub =
                    null;


                navigate(
                    "home"
                );

            },
            250
        );

}


// ==========================================================
// FILTER ENGINE
// ==========================================================

function apply() {

    let result =
        [...allVideos];


    if (
        currentFilter.cat
    ) {

        result =
            result.filter(
                v =>
                    v.category ===
                    currentFilter.cat
            );

    }


    if (
        currentFilter.sub
    ) {

        result =
            result.filter(
                v =>
                    v.topic ===
                    currentFilter.sub
            );

    }


    if (
        currentFilter.search
    ) {

        const query =
            currentFilter.search;


        result =
            result.filter(
                v => {

                    const text = [

                        v.title,

                        v.channel,

                        v.topic,

                        v.category

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        query
                    );

                }
            );

    }


    setListAndRender(
        result
    );

}


// ==========================================================
// CATEGORY PAGE
// ==========================================================

function loadCategoryPage(
    category
) {

    const icon =
        document.getElementById(
            "catIcon"
        );


    if (icon) {

        icon.innerHTML =
            CAT_ICONS[
                category
            ] ||
            CAT_ICONS.Autre;

    }


    const title =
        document.getElementById(
            "catTitle"
        );


    if (title) {

        title.textContent =
            category;

    }


    const grid =
        document.getElementById(
            "categoryGrid"
        );


    if (grid) {

        grid.innerHTML =
            allVideos
                .filter(
                    v =>
                        v.category ===
                        category
                )
                .map(ytCard)
                .join("");

    }

}


// ==========================================================
// LIKED
// ==========================================================

function loadLikedPage() {

    if (!user) {

        openAuth();

        navigate(
            "home"
        );

        return;

    }


    const likes =
        S.g("likes") ||
        {};


    const ids =
        Object.keys(
            likes
        ).filter(
            id =>
                Array.isArray(
                    likes[id]
                ) &&
                likes[id].includes(
                    user.id
                )
        );


    renderGridPage(

        "likedGrid",

        allVideos.filter(
            v =>
                ids.includes(
                    v.id
                )
        ),

        "ما عندك حتى فيديو معجب بيه"

    );

}


// ==========================================================
// SUBSCRIPTIONS
// ==========================================================

function loadSubscriptionsPage() {

    if (!user) {

        openAuth();

        navigate(
            "home"
        );

        return;

    }


    const subscriptions =
        S.g(
            "subs_" +
            user.id
        ) ||
        [];


    renderGridPage(

        "subsGrid",

        allVideos.filter(
            v =>
                subscriptions.some(
                    channel =>
                        String(
                            v.channel
                        )
                            .toLowerCase()
                            .includes(
                                String(
                                    channel
                                )
                                    .toLowerCase()
                            )
                )
        ),

        "ما انت مشترك في حتى قناة"

    );

}


// ==========================================================
// HISTORY
// ==========================================================

function loadHistoryPage() {

    const history =
        S.g(
            "history"
        ) ||
        [];


    const list =
        history
            .map(
                id =>
                    allVideos.find(
                        v =>
                            v.id ===
                            id
                    )
            )
            .filter(Boolean);


    renderGridPage(

        "historyGrid",

        list,

        "السجل فارغ"

    );

}


// ==========================================================
// GENERIC GRID
// ==========================================================

function renderGridPage(
    gridId,
    list,
    message
) {

    const grid =
        document.getElementById(
            gridId
        );


    if (!grid) return;


    if (!list.length) {

        grid.innerHTML = `

            <div
                class="yt-empty"
                style="grid-column:1/-1"
            >

                <i
                    class="fa-solid fa-video-slash"
                    style="
                        font-size:60px;
                        color:#555;
                    "
                ></i>

                <h2>
                    ${escapeHtml(message)}
                </h2>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        list
            .map(ytCard)
            .join("");

}


// ==========================================================
// SIDEBAR
// ==========================================================

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!sidebar) return;


    if (
        window.innerWidth <=
        900
    ) {

        sidebar.classList.toggle(
            "show"
        );


        document
            .querySelector(
                ".side-backdrop"
            )
            ?.classList.toggle(
                "show",
                sidebar.classList.contains(
                    "show"
                )
            );


        return;

    }


    sidebar.classList.toggle(
        "mini"
    );


    document.body.classList.toggle(
        "sidebar-mini",
        sidebar.classList.contains(
            "mini"
        )
    );

}


// ==========================================================
// CLOSE MOBILE SIDEBAR
// ==========================================================

function closeMobileSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const backdrop =
        document.querySelector(
            ".side-backdrop"
        );


    sidebar?.classList.remove(
        "show"
    );


    backdrop?.classList.remove(
        "show"
    );

}


// ==========================================================
// UTILITIES
// ==========================================================

function formatViews(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }


    const number =
        parseInt(
            value,
            10
        );


    if (
        Number.isNaN(number)
    ) {

        return "";

    }


    if (
        number >=
        1000000
    ) {

        return (
            number /
            1000000
        ).toFixed(1) +
        "M";

    }


    if (
        number >=
        1000
    ) {

        return (
            number /
            1000
        ).toFixed(1) +
        "K";

    }


    return String(
        number
    );

}


// ==========================================================
// TIME AGO
// ==========================================================

function timeAgo(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const seconds =
        Math.floor(
            (
                Date.now() -
                date.getTime()
            ) / 1000
        );


    if (
        seconds < 60
    ) {

        return "توّا";

    }


    if (
        seconds < 3600
    ) {

        return (
            Math.floor(
                seconds / 60
            ) +
            " دقيقة"

        );

    }


    if (
        seconds < 86400
    ) {

        return (
            Math.floor(
                seconds / 3600
            ) +
            " ساعات"

        );

    }


    if (
        seconds < 2592000
    ) {

        return (
            Math.floor(
                seconds / 86400
            ) +
            " أيام"

        );

    }


    if (
        seconds < 31536000
    ) {

        return (
            Math.floor(
                seconds / 2592000
            ) +
            " أشهر"

        );

    }


    return (
        Math.floor(
            seconds / 31536000
        ) +
        " سنين"
    );

}


// ==========================================================
// HTML ESCAPING
// ==========================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttr(value) {

    return escapeHtml(
        value
    );

}


function escapeJs(value) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\n/g,
            "\\n"
        )
        .replace(
            /\r/g,
            "\\r"
        );

}


// ==========================================================
// SIDE SECTION TITLE
// ==========================================================

(function injectSidebarTitleStyle() {

    if (
        document.getElementById(
            "tt-sidebar-extra-style"
        )
    ) return;


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "tt-sidebar-extra-style";


    style.textContent = `

        .side-section-title {
            padding: 8px 14px;

            color: #777;

            font-size: 12px;
            font-weight: 700;
        }

        .side-mini {
            width: 72px !important;
        }

    `;


    document.head.appendChild(
        style
    );

})();
