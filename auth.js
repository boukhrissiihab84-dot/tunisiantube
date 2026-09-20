// ============================================================
// AUTH.JS - TunisianTube 🇹🇳
// Firebase Authentication
// ============================================================

(function () {
    "use strict";

    // ============================================================
    // Firebase Auth State
    // ============================================================

    auth.onAuthStateChanged(
        async function (firebaseUser) {

            if (firebaseUser) {

                try {

                    const doc =
                        await db
                            .collection("users")
                            .doc(firebaseUser.uid)
                            .get();

                    if (doc.exists) {

                        user = {
                            id:
                                firebaseUser.uid,

                            email:
                                firebaseUser.email ||
                                "",

                            ...doc.data()
                        };

                    } else {

                        user = {
                            id:
                                firebaseUser.uid,

                            email:
                                firebaseUser.email ||
                                "",

                            name:
                                firebaseUser.displayName ||
                                "مستخدم",

                            avatar: ""
                        };
                    }

                } catch (error) {

                    console.error(
                        "Firestore user error:",
                        error
                    );

                    user = {
                        id:
                            firebaseUser.uid,

                        email:
                            firebaseUser.email ||
                            "",

                        name:
                            firebaseUser.displayName ||
                            "مستخدم",

                        avatar: ""
                    };
                }

                // Sync settings with Firebase profile
                try {

                    const currentSettings =
                        JSON.parse(
                            localStorage.getItem(
                                "tt_settings"
                            ) || "{}"
                        );

                    currentSettings.accountName =
                        user.name || "";

                    currentSettings.accountEmail =
                        user.email || "";

                    currentSettings.avatar =
                        user.avatar || "";

                    localStorage.setItem(
                        "tt_settings",
                        JSON.stringify(
                            currentSettings
                        )
                    );

                } catch (e) {}

                if (
                    typeof S !== "undefined" &&
                    S.s
                ) {
                    S.s(
                        "user",
                        user
                    );
                }

            } else {

                user = null;

                if (
                    typeof S !== "undefined" &&
                    S.r
                ) {
                    S.r("user");
                }
            }

            renderAuth();

            // Settings UI sync
            if (
                typeof SettingsState !==
                    "undefined" &&
                SettingsState.current
            ) {

                if (user) {

                    SettingsState.current
                        .accountName =
                        user.name || "";

                    SettingsState.current
                        .accountEmail =
                        user.email || "";

                    SettingsState.current
                        .avatar =
                        user.avatar || "";

                    SettingsState.original =
                        JSON.parse(
                            JSON.stringify(
                                SettingsState.current
                            )
                        );

                    SettingsState.hasChanges =
                        false;

                    if (
                        typeof applySettingsToUI ===
                        "function"
                    ) {
                        applySettingsToUI(
                            SettingsState.current
                        );
                    }

                    if (
                        typeof applyValuesToForm ===
                        "function"
                    ) {
                        applyValuesToForm();
                    }

                    if (
                        typeof updateSaveBar ===
                        "function"
                    ) {
                        updateSaveBar();
                    }
                }
            }
        }
    );

    // ============================================================
    // Render Auth
    // ============================================================

    window.renderAuth =
        function () {

            const area =
                document.getElementById(
                    "authArea"
                );

            if (!area) return;

            if (!user) {

                area.innerHTML = `
                    <button
                        type="button"
                        class="signin-btn auth-cta"
                        onclick="openAuth()"
                    >
                        <i class="fa-solid fa-user-circle"></i>
                        <span>دخول</span>
                    </button>
                `;

                return;
            }

            const initial =
                (
                    user.name ||
                    "م"
                )[0].toUpperCase();

            const avatar =
                user.avatar || "";

            const pic = avatar
                ? `
                    <img
                        src="${avatar}"
                        alt="صورة الحساب"
                        class="avatar-img"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            border-radius:50%;
                            display:block;
                        "
                    >
                `
                : initial;

            area.innerHTML = `
                <button
                    type="button"
                    class="avatar avatar-btn"
                    id="userAvatarBtn"
                    onclick="toggleDropdown(event)"
                    title="${user.name || "مستخدم"}"
                    aria-label="حسابي"
                    style="
                        width:38px;
                        height:38px;
                        min-width:38px;
                        min-height:38px;
                        border-radius:50%;
                        border:2px solid var(--accent,#e11a24);
                        overflow:hidden;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        padding:0;
                        position:relative;
                        cursor:pointer;
                        background:#272727;
                        color:white;
                        font-weight:800;
                    "
                >
                    ${pic}
                </button>
            `;

            const ddName =
                document.getElementById(
                    "ddName"
                );

            if (ddName) {
                ddName.textContent =
                    user.name ||
                    "مستخدم";
            }

            const ddEmail =
                document.getElementById(
                    "ddEmail"
                );

            if (ddEmail) {
                ddEmail.textContent =
                    user.email ||
                    "";
            }

            const ddAvatar =
                document.getElementById(
                    "ddAvatar"
                );

            if (ddAvatar) {

                if (user.avatar) {

                    ddAvatar.innerHTML = `
                        <img
                            src="${user.avatar}"
                            alt="صورة الحساب"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                                border-radius:50%;
                            "
                        >
                    `;

                } else {

                    ddAvatar.innerHTML =
                        initial;
                }
            }
        };

    // ============================================================
    // Dropdown
    // ============================================================

    window.toggleDropdown =
        function (event) {

            if (event) {
                event.stopPropagation();
            }

            const dropdown =
                document.getElementById(
                    "dropdown"
                );

            if (!dropdown) return;

            dropdown.classList.toggle(
                "show"
            );

            dropdown.classList.toggle(
                "open"
            );
        };

    document.addEventListener(
        "click",
        function (event) {

            const dropdown =
                document.getElementById(
                    "dropdown"
                );

            const authArea =
                document.getElementById(
                    "authArea"
                );

            if (!dropdown) return;

            if (
                !dropdown.contains(
                    event.target
                ) &&
                !(
                    authArea &&
                    authArea.contains(
                        event.target
                    )
                )
            ) {

                dropdown.classList.remove(
                    "show",
                    "open"
                );
            }
        }
    );

    // ============================================================
    // Auth Modal
    // ============================================================

    window.openAuth =
        function () {

            const overlay =
                document.getElementById(
                    "authOv"
                );

            if (overlay) {
                overlay.classList.add(
                    "active"
                );
            }
        };

    window.closeAuth =
        function () {

            const overlay =
                document.getElementById(
                    "authOv"
                );

            if (overlay) {
                overlay.classList.remove(
                    "active"
                );
            }

            const error =
                document.getElementById(
                    "authError"
                );

            if (error) {
                error.textContent = "";
            }
        };

    window.toggleAuthMode =
        function () {

            isSignUp =
                !isSignUp;

            const title =
                document.getElementById(
                    "authTitle"
                );

            const button =
                document.querySelector(
                    "#authOv .btn-primary"
                );

            const nameGroup =
                document.getElementById(
                    "nameGroup"
                );

            const avatar =
                document.getElementById(
                    "signupAvatar"
                );

            const switcher =
                document.getElementById(
                    "authSwitch"
                );

            if (title) {

                title.textContent =
                    isSignUp
                        ? "إنشاء حساب"
                        : "مرحبا بيك";
            }

            if (button) {

                button.textContent =
                    isSignUp
                        ? "إنشاء الحساب"
                        : "دخول";
            }

            if (nameGroup) {

                nameGroup.style.display =
                    isSignUp
                        ? "block"
                        : "none";
            }

            if (avatar) {

                avatar.style.display =
                    isSignUp
                        ? "flex"
                        : "none";
            }

            if (switcher) {

                switcher.innerHTML =
                    isSignUp
                        ? 'عندك حساب؟ <b>ادخل من هنا</b>'
                        : 'ما عندكش حساب؟ <b>اعمل حساب</b>';
            }
        };

    // ============================================================
    // Avatar Signup Preview
    // ============================================================

    window.previewAvatar =
        function (event) {

            const file =
                event.target.files[0];

            if (!file) return;

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                return;
            }

            if (
                typeof compressAndCropImage ===
                "function"
            ) {

                compressAndCropImage(
                    file,
                    256,
                    function (dataUrl) {

                        tempAvatar =
                            dataUrl;

                        const el =
                            document.getElementById(
                                "signupAvatar"
                            );

                        if (!el) return;

                        el.innerHTML = `
                            <img
                                src="${dataUrl}"
                                style="
                                    width:100%;
                                    height:100%;
                                    object-fit:cover;
                                    border-radius:50%;
                                    position:absolute;
                                    inset:0;
                                "
                            >
                        `;
                    }
                );
            }
        };

    // ============================================================
    // Login / Signup
    // ============================================================

    window.handleAuth =
        async function () {

            const name =
                (
                    document.getElementById(
                        "authName"
                    )?.value || ""
                ).trim();

            const email =
                (
                    document.getElementById(
                        "authEmail"
                    )?.value || ""
                ).trim();

            const password =
                document.getElementById(
                    "authPass"
                )?.value || "";

            const error =
                document.getElementById(
                    "authError"
                );

            if (error) {
                error.textContent = "";
            }

            if (!email || !password) {

                if (error) {
                    error.textContent =
                        "عمّر الإيميل وكلمة السر.";
                }

                return;
            }

            if (
                password.length < 6
            ) {

                if (error) {
                    error.textContent =
                        "كلمة السر لازمها 6 حروف على الأقل.";
                }

                return;
            }

            const button =
                document.getElementById(
                    "authBtn"
                );

            if (button) {
                button.disabled = true;
            }

            try {

                if (isSignUp) {

                    if (!name) {

                        if (error) {
                            error.textContent =
                                "اكتب اسمك.";
                        }

                        return;
                    }

                    const credential =
                        await auth
                            .createUserWithEmailAndPassword(
                                email,
                                password
                            );

                    const firebaseUser =
                        credential.user;

                    const data = {

                        name:
                            name,

                        email:
                            email,

                        avatar:
                            tempAvatar || "",

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()
                    };

                    await db
                        .collection("users")
                        .doc(
                            firebaseUser.uid
                        )
                        .set(data);

                    user = {
                        id:
                            firebaseUser.uid,

                        ...data
                    };

                } else {

                    const credential =
                        await auth
                            .signInWithEmailAndPassword(
                                email,
                                password
                            );

                    const firebaseUser =
                        credential.user;

                    const doc =
                        await db
                            .collection("users")
                            .doc(
                                firebaseUser.uid
                            )
                            .get();

                    if (doc.exists) {

                        user = {
                            id:
                                firebaseUser.uid,

                            email:
                                firebaseUser.email,

                            ...doc.data()
                        };

                    } else {

                        user = {
                            id:
                                firebaseUser.uid,

                            email:
                                firebaseUser.email,

                            name:
                                "مستخدم",

                            avatar:
                                ""
                        };
                    }
                }

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

                renderAuth();

                closeAuth();

                tempAvatar = "";

            } catch (e) {

                console.error(
                    "Firebase Auth:",
                    e
                );

                if (!error) return;

                switch (e.code) {

                    case "auth/email-already-in-use":
                        error.textContent =
                            "الإيميل هذا مستعمل قبل.";
                        break;

                    case "auth/invalid-email":
                        error.textContent =
                            "الإيميل موش صحيح.";
                        break;

                    case "auth/wrong-password":
                    case "auth/invalid-credential":
                    case "auth/user-not-found":
                        error.textContent =
                            "الإيميل ولا كلمة السر غالطة.";
                        break;

                    case "auth/weak-password":
                        error.textContent =
                            "كلمة السر ضعيفة.";
                        break;

                    default:
                        error.textContent =
                            "صارت مشكلة في الدخول. عاود جرّب.";
                }

            } finally {

                if (button) {
                    button.disabled = false;
                }
            }
        };

    // ============================================================
    // Logout
    // ============================================================

    window.logOut =
        async function () {

            try {

                await auth.signOut();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );
            }

            user = null;

            if (
                typeof S !==
                "undefined" &&
                S.r
            ) {
                S.r("user");
            }

            renderAuth();

            document
                .getElementById(
                    "dropdown"
                )
                ?.classList.remove(
                    "show",
                    "open"
                );

            if (
                typeof navigate ===
                "function"
            ) {
                navigate("home");
            }
        };

})();
