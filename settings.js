// ============================================================
// SETTINGS.JS - TunisianTube 🇹🇳
// Settings Pro + Firebase Account Security + Avatar
// ============================================================

(function () {
    "use strict";

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

    // ============================================================
    // Helpers
    // ============================================================

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function readSettings() {
        try {
            const raw = JSON.parse(
                localStorage.getItem(SETTINGS_KEY) || "{}"
            );

            return Object.keys(DEFAULT_SETTINGS).reduce(function (out, key) {
                out[key] =
                    raw[key] !== undefined
                        ? raw[key]
                        : DEFAULT_SETTINGS[key];

                return out;
            }, {});
        } catch (e) {
            return clone(DEFAULT_SETTINGS);
        }
    }

    function setToggle(id, state) {
        const el = document.getElementById(id);
        if (!el) return;

        el.classList.toggle("active", !!state);
        el.classList.toggle("on", !!state);

        el.setAttribute(
            "aria-checked",
            state ? "true" : "false"
        );
    }

    function renderAvatar(el, url) {
        if (!el) return;

        if (!url) {
            el.innerHTML =
                '<i class="fa-solid fa-user"></i>';
            return;
        }

        el.innerHTML =
            '<img src="' +
            url +
            '" alt="صورة الحساب" ' +
            'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">';
    }

    function showToast(message, type) {
        document
            .querySelectorAll(".settings-toast")
            .forEach(function (x) {
                x.remove();
            });

        const toast = document.createElement("div");

        toast.className =
            "settings-toast" +
            (type === "error" ? " error" : "");

        toast.innerHTML =
            '<i class="fa-solid ' +
            (type === "error"
                ? "fa-circle-xmark"
                : "fa-circle-check") +
            '"></i><span></span>';

        toast.querySelector("span").textContent = message;

        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        setTimeout(function () {
            toast.classList.remove("show");

            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 2500);
    }

    window.showToast = showToast;

    // ============================================================
    // Settings State
    // ============================================================

    const SettingsState = {

        original: {},
        current: {},
        hasChanges: false,

        init: function () {
            this.original = readSettings();
            this.current = clone(this.original);
            this.hasChanges = false;

            applySettingsToUI(this.current);
            applyValuesToForm();
            updateSaveBar();
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

            applySettingsToUI(this.current);
            updateSaveBar();
        },

        discard: function () {

            this.current = clone(this.original);
            this.hasChanges = false;

            applySettingsToUI(this.current);
            applyValuesToForm();
            updateSaveBar();

            showToast(
                "تم إلغاء التغييرات",
                "success"
            );
        },

        save: async function () {

            return await saveSettingsPro();
        }
    };

    window.SettingsState = SettingsState;
    window.SettingsManager = SettingsState;

    // ============================================================
    // UI
    // ============================================================

    function syncThemeIcon() {

        const theme =
            document.documentElement.getAttribute(
                "data-theme"
            ) || "dark";

        const btn =
            document.getElementById("themeBtn");

        if (!btn) return;

        btn.innerHTML =
            theme === "dark"
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
    }

    function applySettingsToUI(settings) {

        const s =
            settings ||
            SettingsState.current ||
            DEFAULT_SETTINGS;

        document.documentElement.setAttribute(
            "data-theme",
            s.theme || "dark"
        );

        const accent =
            s.themeColor ||
            DEFAULT_SETTINGS.themeColor;

        document.documentElement.style.setProperty(
            "--accent",
            accent
        );

        document.documentElement.style.setProperty(
            "--accent-soft",
            accent + "26"
        );

        document.documentElement.style.setProperty(
            "--yt-accent",
            accent
        );

        document.body.classList.toggle(
            "compact-mode",
            !!s.compactMode
        );

        document.body.classList.toggle(
            "reduce-motion",
            !!s.reduceMotion
        );

        syncThemeIcon();

        // Toggles
        setToggle(
            "t-pro-dark",
            s.theme === "dark"
        );

        setToggle(
            "t-pro-auto",
            !!s.autoplay
        );

        setToggle(
            "t-pro-autoplay",
            !!s.autoplay
        );

        setToggle(
            "t-pro-compact",
            !!s.compactMode
        );

        setToggle(
            "t-pro-animation",
            !!s.reduceMotion
        );

        setToggle(
            "t-pro-notif-new",
            !!s.notifNew
        );

        setToggle(
            "t-pro-notif-email",
            !!s.notifEmail
        );

        setToggle(
            "t-pro-priv-likes",
            !!s.privateLikes
        );

        setToggle(
            "t-pro-incognito",
            !!s.incognito
        );

        setToggle(
            "t-pro-datasaver",
            !!s.dataSaver
        );

        // Avatar
        renderAvatar(
            document.getElementById(
                "accAvatarWrapPro"
            ),
            s.avatar
        );

        renderAvatar(
            document.getElementById(
                "ddAvatar"
            ),
            s.avatar
        );

        // Dropdown
        const ddName =
            document.getElementById("ddName");

        if (ddName) {
            ddName.textContent =
                s.accountName ||
                "مستخدم";
        }

        const ddEmail =
            document.getElementById("ddEmail");

        if (ddEmail) {
            ddEmail.textContent =
                s.accountHandle ||
                s.accountEmail ||
                "";
        }

        // Header avatar
        const headerAvatar =
            document.querySelector(
                "#authArea img.avatar-img"
            );

        if (
            headerAvatar &&
            s.avatar
        ) {
            headerAvatar.src = s.avatar;
        }
    }

    window.applySettingsToUI =
        applySettingsToUI;

    // ============================================================
    // Form
    // ============================================================

    function applyValuesToForm() {

        const s =
            SettingsState.current ||
            DEFAULT_SETTINGS;

        const values = {
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

        Object.keys(values).forEach(function (id) {

            const el =
                document.getElementById(id);

            if (!el) return;

            el.value =
                values[id] == null
                    ? ""
                    : String(values[id]);
        });

        setToggle(
            "t-pro-dark",
            s.theme === "dark"
        );

        setToggle(
            "t-pro-auto",
            s.autoplay
        );

        setToggle(
            "t-pro-autoplay",
            s.autoplay
        );

        setToggle(
            "t-pro-compact",
            s.compactMode
        );

        setToggle(
            "t-pro-animation",
            s.reduceMotion
        );

        setToggle(
            "t-pro-notif-new",
            s.notifNew
        );

        setToggle(
            "t-pro-notif-email",
            s.notifEmail
        );

        setToggle(
            "t-pro-priv-likes",
            s.privateLikes
        );

        setToggle(
            "t-pro-incognito",
            s.incognito
        );

        setToggle(
            "t-pro-datasaver",
            s.dataSaver
        );

        renderAvatar(
            document.getElementById(
                "accAvatarWrapPro"
            ),
            s.avatar
        );
    }

    window.applyValuesToForm =
        applyValuesToForm;

    function bindFormListeners() {

        const fields = {

            accNamePro: "accountName",
            accHandlePro: "accountHandle",
            accBioPro: "accountBio",

            channelNamePro: "channelName",
            channelBioPro: "channelBio",
            channelCatPro: "channelCategory",
            channelLinkPro: "channelLink",
            channelSocialPro: "channelSocial",

            langSelectPro: "language",
            qualitySelectPro: "quality",
            prefQualityPro: "quality",
            fontSelectPro: "fontSize",
            prefSpeedPro: "playbackSpeed",
            startPagePro: "startPage"
        };

        Object.keys(fields).forEach(function (id) {

            const el =
                document.getElementById(id);

            if (
                !el ||
                el.dataset.settingsBound === "1"
            ) {
                return;
            }

            el.dataset.settingsBound = "1";

            const update = function () {

                SettingsState.update(
                    fields[id],
                    el.value
                );
            };

            el.addEventListener(
                "input",
                update
            );

            el.addEventListener(
                "change",
                update
            );
        });
    }

    window.bindFormListeners =
        bindFormListeners;

    // ============================================================
    // Theme
    // ============================================================

    window.forceToggleTheme =
        function () {

            const current =
                SettingsState.current.theme ||
                "dark";

            SettingsState.update(
                "theme",
                current === "dark"
                    ? "light"
                    : "dark"
            );
        };

    window.toggleTheme =
        window.forceToggleTheme;

    // ============================================================
    // Toggles
    // ============================================================

    window.toggleSetPro =
        function (key) {

            if (
                key === "dark" ||
                key === "theme"
            ) {
                forceToggleTheme();
                return;
            }

            const map = {

                auto: "autoplay",
                autoplay: "autoplay",
                compactMode: "compactMode",
                reduceMotion: "reduceMotion",
                notifNew: "notifNew",
                notifEmail: "notifEmail",
                privateLikes: "privateLikes",
                incognito: "incognito",
                dataSaver: "dataSaver"
            };

            const stateKey = map[key];

            if (!stateKey) return;

            SettingsState.update(
                stateKey,
                !SettingsState.current[stateKey]
            );
        };

    // ============================================================
    // Colors
    // ============================================================

    window.changeThemeColor =
        function (color, btn) {

            document
                .querySelectorAll(".color-dot")
                .forEach(function (x) {
                    x.classList.remove("active");
                });

            if (btn) {
                btn.classList.add("active");
            }

            SettingsState.update(
                "themeColor",
                color
            );
        };

    window.setLangPro =
        function (value) {
            SettingsState.update(
                "language",
                value
            );
        };

    window.setQualityPro =
        function (value) {
            SettingsState.update(
                "quality",
                value
            );
        };

    window.setFontSizePro =
        function (value) {
            SettingsState.update(
                "fontSize",
                value
            );
        };

    // ============================================================
    // Avatar
    // ============================================================

    window.forceAvatarChange =
        function (event) {

            const file =
                event &&
                event.target &&
                event.target.files
                    ? event.target.files[0]
                    : null;

            if (!file) return;

            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                showToast(
                    "اختار صورة صحيحة 🇹🇳",
                    "error"
                );

                event.target.value = "";
                return;
            }

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                showToast(
                    "الصورة كبيرة برشا، أقصى حاجة 5MB",
                    "error"
                );

                event.target.value = "";
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function (e) {

                    const img =
                        new Image();

                    img.onload =
                        function () {

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            const size = 256;

                            canvas.width = size;
                            canvas.height = size;

                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );

                            const scale =
                                Math.max(
                                    size / img.width,
                                    size / img.height
                                );

                            const width =
                                img.width * scale;

                            const height =
                                img.height * scale;

                            const x =
                                (size - width) / 2;

                            const y =
                                (size - height) / 2;

                            ctx.drawImage(
                                img,
                                x,
                                y,
                                width,
                                height
                            );

                            const dataUrl =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.82
                                );

                            SettingsState.update(
                                "avatar",
                                dataUrl
                            );

                            showToast(
                                "الصورة تبدلت، اضغط حفظ باش تتسجل",
                                "success"
                            );
                        };

                    img.src =
                        e.target.result;
                };

            reader.readAsDataURL(file);
        };

    window.changeAccPicPro =
        window.forceAvatarChange;

    // ============================================================
    // Settings Tabs
    // ============================================================

    window.forceOpenSettingsTab =
        function (tabId, btn) {

            document
                .querySelectorAll(
                    ".settings-pane-pro"
                )
                .forEach(function (pane) {

                    pane.classList.remove(
                        "active"
                    );

                    pane.style.display =
                        "none";
                });

            document
                .querySelectorAll(
                    ".tab-btn-pro"
                )
                .forEach(function (b) {

                    b.classList.remove(
                        "active"
                    );
                });

            const target =
                document.getElementById(
                    "set-pro-" + tabId
                );

            if (target) {

                target.classList.add(
                    "active"
                );

                target.style.display =
                    "block";
            }

            if (btn) {
                btn.classList.add(
                    "active"
                );
            }

            applyValuesToForm();
            bindFormListeners();
        };

    window.openSettingsTab =
        window.forceOpenSettingsTab;

    window.forceGoSettings =
        function (tab) {

            if (
                typeof navigate ===
                "function"
            ) {
                navigate("settings");
            }

            setTimeout(function () {

                const aliases = {

                    account: "profile",
                    channel: "profile",
                    preferences: "appearance"
                };

                const target =
                    aliases[tab] || tab;

                const btn =
                    document.querySelector(
                        '.tab-btn-pro[data-tab="' +
                        target +
                        '"]'
                    );

                if (btn) {
                    forceOpenSettingsTab(
                        target,
                        btn
                    );
                }

            }, 100);
        };

    // ============================================================
    // Firebase Account Security
    // ============================================================

    function getFirebaseUser() {

        if (
            typeof auth === "undefined" ||
            !auth
        ) {
            return null;
        }

        return auth.currentUser || null;
    }

    function getErrorMessage(error) {

        if (!error) {
            return "صارت مشكلة، عاود جرّب.";
        }

        switch (error.code) {

            case "auth/wrong-password":
            case "auth/invalid-credential":
                return "كلمة السر الحالية غالطة.";

            case "auth/requires-recent-login":
                return "يلزمك تعاود تأكد من هويتك قبل التغيير.";

            case "auth/email-already-in-use":
                return "الإيميل هذا مستعمل بحساب آخر.";

            case "auth/invalid-email":
                return "الإيميل موش صحيح.";

            case "auth/weak-password":
                return "كلمة السر الجديدة ضعيفة.";

            case "auth/operation-not-allowed":
                return "التغيير هذا موش مفعّل في Firebase.";

            default:
                return "صارت مشكلة: " +
                    (error.message || "عاود جرّب.");
        }
    }

    async function reauthenticate(currentPassword) {

        const firebaseUser =
            getFirebaseUser();

        if (!firebaseUser) {
            throw new Error(
                "ما فماش حساب مسجل."
            );
        }

        if (!firebaseUser.email) {
            throw new Error(
                "الحساب هذا ما عندوش إيميل."
            );
        }

        const credential =
            firebase.auth.EmailAuthProvider.credential(
                firebaseUser.email,
                currentPassword
            );

        await firebaseUser
            .reauthenticateWithCredential(
                credential
            );

        return firebaseUser;
    }

    // ============================================================
    // Inject Security UI
    // ============================================================

    function createSecurityUI() {

        const pane =
            document.getElementById(
                "set-pro-profile"
            );

        if (!pane) return;

        if (
            document.getElementById(
                "tt-security-box"
            )
        ) {
            return;
        }

        const box =
            document.createElement("div");

        box.id =
            "tt-security-box";

        box.style.cssText = `
            margin-top:28px;
            padding:22px;
            border:1px solid #303030;
            border-radius:14px;
            background:rgba(255,255,255,.025);
        `;

        box.innerHTML = `

            <div style="
                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:20px;
            ">
                <i class="fa-solid fa-shield-halved"
                   style="color:var(--accent,#e11a24)"></i>

                <div>
                    <h3 style="margin:0">
                        أمان الحساب
                    </h3>

                    <p style="
                        margin:5px 0 0;
                        color:#888;
                        font-size:12px;
                    ">
                        بدّل الإيميل وكلمة السر متاعك بأمان
                    </p>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">
                    الإيميل الجديد
                </label>

                <input
                    id="ttNewEmail"
                    class="form-input"
                    type="email"
                    autocomplete="email"
                    placeholder="الإيميل الجديد"
                >
            </div>

            <div class="form-group">
                <label class="form-label">
                    كلمة السر الحالية
                </label>

                <input
                    id="ttCurrentPassword"
                    class="form-input"
                    type="password"
                    autocomplete="current-password"
                    placeholder="كلمة السر الحالية"
                >
            </div>

            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:12px;
            ">

                <div class="form-group">
                    <label class="form-label">
                        كلمة السر الجديدة
                    </label>

                    <input
                        id="ttNewPassword"
                        class="form-input"
                        type="password"
                        autocomplete="new-password"
                        placeholder="6 حروف على الأقل"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label">
                        تأكيد كلمة السر
                    </label>

                    <input
                        id="ttConfirmPassword"
                        class="form-input"
                        type="password"
                        autocomplete="new-password"
                        placeholder="عاود اكتبها"
                    >
                </div>

            </div>

            <div id="ttSecurityError"
                 style="
                    display:none;
                    margin-top:12px;
                    padding:10px 12px;
                    border-radius:8px;
                    background:rgba(220,38,38,.1);
                    color:#ff6b6b;
                    font-size:13px;
                 ">
            </div>

            <button
                type="button"
                id="ttSecuritySave"
                style="
                    margin-top:8px;
                    border:0;
                    border-radius:9px;
                    padding:11px 18px;
                    background:var(--accent,#e11a24);
                    color:white;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                <i class="fa-solid fa-lock"></i>
                حفظ تغييرات الأمان
            </button>
        `;

        pane.appendChild(box);

        document
            .getElementById("ttSecuritySave")
            .addEventListener(
                "click",
                saveSecurityChanges
            );
    }

    // ============================================================
    // Save Security
    // ============================================================

    async function saveSecurityChanges() {

        const newEmail =
            (
                document.getElementById(
                    "ttNewEmail"
                )?.value || ""
            ).trim();

        const currentPassword =
            document.getElementById(
                "ttCurrentPassword"
            )?.value || "";

        const newPassword =
            document.getElementById(
                "ttNewPassword"
            )?.value || "";

        const confirmPassword =
            document.getElementById(
                "ttConfirmPassword"
            )?.value || "";

        const errorBox =
            document.getElementById(
                "ttSecurityError"
            );

        const button =
            document.getElementById(
                "ttSecuritySave"
            );

        if (errorBox) {
            errorBox.style.display =
                "none";

            errorBox.textContent = "";
        }

        const wantsEmail =
            newEmail.length > 0;

        const wantsPassword =
            newPassword.length > 0 ||
            confirmPassword.length > 0;

        if (
            !wantsEmail &&
            !wantsPassword
        ) {
            showToast(
                "اكتب تغيير تحب تعملو الأول.",
                "error"
            );
            return;
        }

        if (!currentPassword) {

            showSecurityError(
                "اكتب كلمة السر الحالية."
            );

            return;
        }

        if (
            wantsEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(newEmail)
        ) {

            showSecurityError(
                "الإيميل الجديد موش صحيح."
            );

            return;
        }

        if (wantsPassword) {

            if (newPassword.length < 6) {

                showSecurityError(
                    "كلمة السر الجديدة لازمها 6 حروف على الأقل."
                );

                return;
            }

            if (
                newPassword !==
                confirmPassword
            ) {

                showSecurityError(
                    "كلمتي السر موش كيف كيف."
                );

                return;
            }
        }

        const firebaseUser =
            getFirebaseUser();

        if (!firebaseUser) {

            showSecurityError(
                "يلزمك تكون داخل للحساب."
            );

            return;
        }

        try {

            if (button) {
                button.disabled = true;
                button.style.opacity = ".6";
            }

            await reauthenticate(
                currentPassword
            );

            // Email
            if (wantsEmail) {

                await firebaseUser.updateEmail(
                    newEmail
                );

                SettingsState.update(
                    "accountEmail",
                    newEmail
                );

                if (typeof user !== "undefined" && user) {
                    user.email = newEmail;
                }
            }

            // Password
            if (wantsPassword) {

                await firebaseUser.updatePassword(
                    newPassword
                );
            }

            // Firestore
            if (
                typeof db !== "undefined" &&
                db &&
                typeof user !== "undefined" &&
                user &&
                user.id
            ) {

                const firestoreUpdate = {};

                if (wantsEmail) {
                    firestoreUpdate.email =
                        newEmail;
                }

                if (
                    SettingsState.current
                        .accountName
                ) {
                    firestoreUpdate.name =
                        SettingsState.current
                            .accountName;
                }

                if (
                    Object.keys(
                        firestoreUpdate
                    ).length
                ) {

                    await db
                        .collection("users")
                        .doc(user.id)
                        .update(
                            firestoreUpdate
                        );
                }
            }

            if (
                typeof user !== "undefined" &&
                user
            ) {
                if (wantsEmail) {
                    user.email = newEmail;
                }

                if (
                    SettingsState.current
                        .accountName
                ) {
                    user.name =
                        SettingsState.current
                            .accountName;
                }

                if (
                    typeof S !== "undefined" &&
                    S.s
                ) {
                    S.s("user", user);
                }
            }

            const emailInput =
                document.getElementById(
                    "accEmailPro"
                );

            if (
                emailInput &&
                wantsEmail
            ) {
                emailInput.value =
                    newEmail;
            }

            document.getElementById(
                "ttNewEmail"
            ).value = "";

            document.getElementById(
                "ttCurrentPassword"
            ).value = "";

            document.getElementById(
                "ttNewPassword"
            ).value = "";

            document.getElementById(
                "ttConfirmPassword"
            ).value = "";

            if (
                typeof renderAuth ===
                "function"
            ) {
                renderAuth();
            }

            showToast(
                "تم تحديث أمان الحساب بنجاح ✅",
                "success"
            );

        } catch (error) {

            console.error(
                "Security update error:",
                error
            );

            showSecurityError(
                getErrorMessage(error)
            );

        } finally {

            if (button) {
                button.disabled = false;
                button.style.opacity = "1";
            }
        }
    }

    function showSecurityError(message) {

        const box =
            document.getElementById(
                "ttSecurityError"
            );

        if (!box) return;

        box.textContent = message;
        box.style.display = "block";
    }

    // ============================================================
    // Main Save
    // ============================================================

    window.saveSettingsPro =
        async function () {

            if (!SettingsState.hasChanges) {

                showToast(
                    "ما فما حتى تغيير جديد.",
                    "success"
                );

                return true;
            }

            try {

                // Firebase user profile
                if (
                    typeof user !== "undefined" &&
                    user &&
                    user.id &&
                    typeof db !== "undefined" &&
                    db
                ) {

                    const profile = {
                        name:
                            SettingsState.current
                                .accountName ||
                            user.name ||
                            "",

                        avatar:
                            SettingsState.current
                                .avatar ||
                            "",

                        email:
                            SettingsState.current
                                .accountEmail ||
                            user.email ||
                            ""
                    };

                    await db
                        .collection("users")
                        .doc(user.id)
                        .set(
                            profile,
                            {
                                merge: true
                            }
                        );

                    user.name =
                        profile.name;

                    user.avatar =
                        profile.avatar;

                    user.email =
                        profile.email;

                    if (
                        typeof S !==
                            "undefined" &&
                        S.s
                    ) {
                        S.s(
                            "user",
                            user
                        );
                    }
                }

                localStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(
                        SettingsState.current
                    )
                );

                SettingsState.original =
                    clone(
                        SettingsState.current
                    );

                SettingsState.hasChanges =
                    false;

                applySettingsToUI(
                    SettingsState.current
                );

                applyValuesToForm();

                updateSaveBar();

                if (
                    typeof renderAuth ===
                    "function"
                ) {
                    renderAuth();
                }

                showToast(
                    "تم حفظ التغييرات بنجاح ✅",
                    "success"
                );

                return true;

            } catch (error) {

                console.error(
                    "Settings save error:",
                    error
                );

                showToast(
                    "صارت مشكلة في الحفظ: " +
                    getErrorMessage(error),
                    "error"
                );

                return false;
            }
        };

    window.discardSettingsPro =
        function () {
            SettingsState.discard();
        };

    window.resetSettingsPro =
        function () {

            if (
                !confirm(
                    "متأكد تحب ترجع الإعدادات الكل للوضع الأصلي؟"
                )
            ) {
                return;
            }

            SettingsState.current =
                clone(
                    DEFAULT_SETTINGS
                );

            SettingsState.hasChanges =
                true;

            applySettingsToUI(
                SettingsState.current
            );

            applyValuesToForm();

            updateSaveBar();
        };

    // ============================================================
    // Save Bar
    // ============================================================

    function updateSaveBar() {

        const bar =
            document.getElementById(
                "settingsSaveBar"
            ) ||
            document.getElementById(
                "save-bar"
            );

        if (!bar) return;

        bar.classList.toggle(
            "show",
            !!SettingsState.hasChanges
        );
    }

    window.updateSaveBar =
        updateSaveBar;

    // ============================================================
    // History / Likes / Reset
    // ============================================================

    window.clearHistoryPro =
        function () {

            if (
                !confirm(
                    "متأكد باش تمسح السجل الكل؟"
                )
            ) {
                return;
            }

            localStorage.removeItem(
                "tt_history"
            );

            localStorage.removeItem(
                "history"
            );

            showToast(
                "تم مسح السجل 🧹",
                "success"
            );

            if (
                typeof loadHistoryPage ===
                "function"
            ) {
                loadHistoryPage();
            }
        };

    window.clearLikesPro =
        function () {

            if (
                !confirm(
                    "متأكد باش تمسح الفيديوهات اللي عملتلهم إعجاب؟"
                )
            ) {
                return;
            }

            localStorage.removeItem(
                "tt_likes"
            );

            localStorage.removeItem(
                "likes"
            );

            showToast(
                "تم مسح الإعجابات ❤️",
                "success"
            );
        };

    window.resetAllAppDataPro =
        function () {

            if (
                !confirm(
                    "⚠️ متأكد؟ باش يتمسح كل شيء من الجهاز!"
                )
            ) {
                return;
            }

            localStorage.clear();
            sessionStorage.clear();

            location.reload();
        };

    // ============================================================
    // Compatibility
    // ============================================================

    window.saveAccountPro =
        window.saveSettingsPro;

    window.saveChannelPro =
        window.saveSettingsPro;

    // ============================================================
    // Init
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            createSecurityUI();

            // الإيميل الحالي readonly
            const email =
                document.getElementById(
                    "accEmailPro"
                );

            if (email) {
                email.disabled = true;
            }

            if (
                typeof SettingsState !==
                "undefined"
            ) {
                SettingsState.init();
                bindFormListeners();
            }
        }
    );

})();
