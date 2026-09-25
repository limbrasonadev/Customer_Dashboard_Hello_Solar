/**
 * HELLO SOLAR CUSTOMER PORTAL — CORE SCRIPT
 * Manages Auth Guard, Customer Data Store, Mobile Navigation, and Realistic Demo Feedback.
 */

(function () {
    "use strict";

    // --------------------------------------------------------------------------
    // 1. DEFAULT DEMO CUSTOMER STATE
    // --------------------------------------------------------------------------
    const DEFAULT_CUSTOMER = {
        name: "Juan Dela Cruz",
        email: "juan.delacruz@hellosolar.ph",
        phone: "+63 917 555 0199",
        accountNo: "HS-88219",
        status: "Online",
        systemSize: "4.82 kW",
        installationDate: "March 15, 2025",
        panelsCount: 12,
        panelsModel: "Trina Solar Vertex S+ 420W",
        inverterModel: "Solis 5kW Hybrid Inverter",
        batteryCapacity: "10 kWh Lithium-ion Reserve",
        address: "142 Solar Crest Way, Quezon City, Metro Manila",
        inverterSerial: "SOLIS-5K-202503-8891",
        plan: "5-Year Amortization",
        nextDue: "Sep 1, 2026",
        nextAmount: "₱9,067",
        role: "Solar Customer",
        installerName: "Carlos Villanueva",
        installerPhone: "+63 917 555 0101",
        preferredPayment: "gcash",
        paymentAccount: "+63 917 555 0199",
        avatarUrl: null
    };

    // --------------------------------------------------------------------------
    // 2. CUSTOMER DATA STORE HELPERS
    // --------------------------------------------------------------------------
    function getInitials(name) {
        if (!name || typeof name !== "string" || !name.trim()) return "HS";
        const clean = name.trim();
        const capitals = clean.match(/[A-Z]/g);
        if (capitals && capitals.length >= 2) {
            return capitals.slice(0, 2).join("");
        }
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "HS";
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return parts.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join("");
    }

    function getCustomer() {
        const stored = localStorage.getItem("hello_solar_user");
        if (!stored) {
            return { ...DEFAULT_CUSTOMER };
        }

        try {
            const parsed = JSON.parse(stored);
            if (typeof parsed === "object" && parsed !== null) {
                return { ...DEFAULT_CUSTOMER, ...parsed };
            }
            if (typeof parsed === "string") {
                return { ...DEFAULT_CUSTOMER, name: parsed };
            }
        } catch {
            // If stored as a plain string rather than JSON
            return { ...DEFAULT_CUSTOMER, name: stored };
        }

        return { ...DEFAULT_CUSTOMER };
    }

    function setCustomer(data) {
        if (typeof data === "string") {
            localStorage.setItem("hello_solar_user", data);
        } else {
            localStorage.setItem("hello_solar_user", JSON.stringify(data));
        }

        // Synchronize with stored account list if available
        try {
            const raw = localStorage.getItem("hello_solar_customer_accounts");
            if (raw && typeof data === "object" && data !== null) {
                const accounts = JSON.parse(raw);
                if (Array.isArray(accounts)) {
                    const idx = accounts.findIndex(a =>
                        (a.email && data.email && a.email.toLowerCase() === data.email.toLowerCase()) ||
                        (a.accountNo && data.accountNo && a.accountNo === data.accountNo)
                    );
                    if (idx !== -1) {
                        accounts[idx] = { ...accounts[idx], ...data };
                        localStorage.setItem("hello_solar_customer_accounts", JSON.stringify(accounts));
                    }
                }
            }
        } catch (e) {
            console.warn("Could not sync account to hello_solar_customer_accounts", e);
        }
    }

    // --------------------------------------------------------------------------
    // 3. AUTHENTICATION GUARD
    // --------------------------------------------------------------------------
    function isAuthenticated() {
        return localStorage.getItem("hello_solar_logged_in") === "true";
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.replace("login.html");
            return false;
        }
        return true;
    }

    function logout() {
        localStorage.removeItem("hello_solar_logged_in");
        localStorage.removeItem("hello_solar_user");
        window.location.href = "login.html";
    }

    // --------------------------------------------------------------------------
    // 4. UI INITIALIZATION: USER INFO, DATES, ACTIVE LINKS
    // --------------------------------------------------------------------------
    function initUserDisplay() {
        const customer = getCustomer();

        // Target profile elements across desktop topbar & mobile views
        const profileNameEls = document.querySelectorAll("#profileName, .profile-name");
        const profileAvatarEls = document.querySelectorAll("#profileAvatar, .profile-avatar");
        const customerNameEls = document.querySelectorAll("#customerName, .customer-name");

        profileNameEls.forEach(el => {
            el.textContent = customer.name;
        });

        customerNameEls.forEach(el => {
            el.textContent = customer.name;
        });

        const initials = getInitials(customer.name);

        profileAvatarEls.forEach(el => {
            if (customer.avatarUrl) {
                el.innerHTML = `<img src="${customer.avatarUrl}" alt="${customer.name}" class="avatar-img">`;
            } else {
                el.textContent = initials || "HS";
            }
            el.setAttribute("title", customer.name);
        });

        // Initialize date display
        const dateDisplays = document.querySelectorAll("#dateDisplay, #currentDate, .date-display");
        if (dateDisplays.length > 0) {
            const today = new Date();
            const formatted = today.toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            dateDisplays.forEach(el => {
                el.textContent = formatted;
            });
        }
    }

    // --------------------------------------------------------------------------
    // 5. MOBILE DRAWER & BOTTOM NAV CONTROLLER
    // --------------------------------------------------------------------------
    function initNavigation() {
        const sidebar = document.getElementById("sidebar");
        const mobileMenuButton = document.getElementById("mobileMenuButton");
        const mobileBackdrop = document.getElementById("mobileBackdrop");
        const menuIcon = document.getElementById("menuIcon");
        const logoutButtons = document.querySelectorAll("#logoutButton, .logout-button");

        // Logout handlers
        logoutButtons.forEach(btn => {
            btn.addEventListener("click", event => {
                event.preventDefault();
                logout();
            });
        });

        if (!sidebar || !mobileMenuButton) return;

        function openMenu() {
            sidebar.classList.add("open");
            if (mobileBackdrop) mobileBackdrop.classList.add("visible");
            mobileMenuButton.setAttribute("aria-expanded", "true");
            mobileMenuButton.setAttribute("aria-label", "Close navigation");
            document.body.style.overflow = "hidden";

            if (menuIcon) {
                menuIcon.innerHTML = `
                    <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
                    <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
                `;
            }
        }

        function closeMenu() {
            sidebar.classList.remove("open");
            if (mobileBackdrop) mobileBackdrop.classList.remove("visible");
            mobileMenuButton.setAttribute("aria-expanded", "false");
            mobileMenuButton.setAttribute("aria-label", "Open navigation");
            document.body.style.overflow = "";

            if (menuIcon) {
                menuIcon.innerHTML = `
                    <line x1="4" y1="6" x2="20" y2="6" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="4" y1="12" x2="20" y2="12" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="4" y1="18" x2="20" y2="18" stroke-width="1.8" stroke-linecap="round"/>
                `;
            }
        }

        mobileMenuButton.addEventListener("click", () => {
            if (sidebar.classList.contains("open")) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (mobileBackdrop) {
            mobileBackdrop.addEventListener("click", closeMenu);
        }

        // Close when any sidebar link is clicked on mobile
        document.querySelectorAll(".sidebar .nav-link").forEach(link => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Close on Escape key
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && sidebar.classList.contains("open")) {
                closeMenu();
            }
        });

        // Auto close if viewport resized to desktop
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768 && sidebar.classList.contains("open")) {
                closeMenu();
            }
        });

        // Wire bottom nav menu trigger if present
        const bottomMenuBtn = document.getElementById("bottomNavMenuBtn");
        if (bottomMenuBtn) {
            bottomMenuBtn.addEventListener("click", event => {
                event.preventDefault();
                if (sidebar.classList.contains("open")) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }

        // Wire bottom nav profile trigger if present
        const bottomNavProfileBtn = document.getElementById("bottomNavProfileBtn");
        if (bottomNavProfileBtn) {
            bottomNavProfileBtn.addEventListener("click", event => {
                event.preventDefault();
                if (window.HelloSolar && window.HelloSolar.openProfileSettings) {
                    window.HelloSolar.openProfileSettings();
                }
            });
        }

        // Synchronize active states for mobile bottom nav items based on URL
        const currentPath = window.location.pathname.toLowerCase();
        const currentFile = currentPath.split("/").pop() || "mysystem.html";
        const bottomNavItems = document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item");
        bottomNavItems.forEach(item => {
            const href = item.getAttribute("href");
            if (href && !href.startsWith("#")) {
                const target = href.toLowerCase().split("/").pop();
                if (target === currentFile || (currentFile === "" && (target === "mysystem.html" || target === "my-system.html")) || (currentFile === "mysystem.html" && target === "mysystem.html")) {
                    item.classList.add("active");
                    item.setAttribute("aria-current", "page");
                } else {
                    item.classList.remove("active");
                    item.removeAttribute("aria-current");
                }
            }
        });
    }

    // --------------------------------------------------------------------------
    // 6. REALISTIC DEMO FEEDBACK (TOAST SYSTEM)
    // --------------------------------------------------------------------------
    let toastTimeout = null;

    function showToast(title, message, duration = 4500) {
        let toastEl = document.getElementById("portalToast");

        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.id = "portalToast";
            toastEl.className = "portal-toast";
            toastEl.setAttribute("role", "status");
            toastEl.setAttribute("aria-live", "polite");
            toastEl.innerHTML = `
                <div class="portal-toast-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                </div>
                <div class="portal-toast-content">
                    <div class="portal-toast-title" id="portalToastTitle">Notice</div>
                    <div class="portal-toast-message" id="portalToastMessage">Action completed.</div>
                </div>
            `;
            document.body.appendChild(toastEl);
        }

        const titleEl = document.getElementById("portalToastTitle");
        const msgEl = document.getElementById("portalToastMessage");

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;

        toastEl.classList.add("visible");

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove("visible");
        }, duration);
    }

    // --------------------------------------------------------------------------
    // 7. PROFILE SETTINGS CONTROLLER (EASY & SIMPLE UX)
    // --------------------------------------------------------------------------
    let profileModalInstance = null;

    function getPaymentLabel(method) {
        switch (method) {
            case "gcash":
                return "GCash Mobile Number";
            case "maya":
                return "Maya Mobile Number";
            case "bdo":
                return "Bank Account / Depositor Name";
            case "card":
                return "Cardholder Name (Auto-Debit)";
            default:
                return "Payment Mobile Number or Account Reference";
        }
    }

    function getPaymentPlaceholder(method) {
        switch (method) {
            case "gcash":
            case "maya":
                return "+63 917 555 0199";
            case "bdo":
                return "Account name or ref (e.g. Juan Dela Cruz)";
            case "card":
                return "Name as printed on Visa / Mastercard";
            default:
                return "Account reference";
        }
    }

    function getPaymentDisplayName(method) {
        switch (method) {
            case "gcash":
                return "GCash";
            case "maya":
                return "Maya";
            case "bdo":
                return "BDO Bank Transfer";
            case "card":
                return "Credit / Debit Card";
            default:
                return "GCash";
        }
    }

    function updatePaymentsPagePreferred() {
        const customer = getCustomer();
        const preferred = (customer.preferredPayment || "gcash").toLowerCase();
        const boxes = document.querySelectorAll(".payment-method-box");

        boxes.forEach(box => {
            box.classList.remove("preferred-channel");
            const existingBadge = box.querySelector(".preferred-channel-badge");
            if (existingBadge) existingBadge.remove();
        });

        if (boxes.length >= 2) {
            if (preferred === "gcash" || preferred === "maya") {
                boxes[0].classList.add("preferred-channel");
                const badge = document.createElement("span");
                badge.className = "preferred-channel-badge";
                badge.innerHTML = `★ Preferred Method (${getPaymentDisplayName(preferred)})`;
                boxes[0].insertBefore(badge, boxes[0].firstChild);
            } else if (preferred === "bdo") {
                boxes[1].classList.add("preferred-channel");
                const badge = document.createElement("span");
                badge.className = "preferred-channel-badge";
                badge.innerHTML = `★ Preferred Method (BDO Bank)`;
                boxes[1].insertBefore(badge, boxes[1].firstChild);
            } else if (preferred === "card") {
                boxes[0].classList.add("preferred-channel");
                const badge = document.createElement("span");
                badge.className = "preferred-channel-badge";
                badge.innerHTML = `★ Preferred Method (Card Auto-Debit)`;
                boxes[0].insertBefore(badge, boxes[0].firstChild);
            }
        }
    }

    function initProfileSettings() {
        let modalEl = document.getElementById("profileSettingsModal");

        if (!modalEl) {
            modalEl = document.createElement("div");
            modalEl.id = "profileSettingsModal";
            modalEl.className = "profile-modal-backdrop";
            modalEl.setAttribute("role", "dialog");
            modalEl.setAttribute("aria-modal", "true");
            modalEl.setAttribute("aria-labelledby", "profileModalTitle");
            modalEl.innerHTML = `
                <div class="profile-modal">
                    <!-- Header -->
                    <div class="profile-modal-header">
                        <div class="profile-modal-user">
                            <div class="profile-avatar-wrapper">
                                <div class="profile-modal-avatar" id="modalProfileAvatar" title="Click to upload profile photo">JD</div>
                                <button type="button" class="avatar-edit-badge" id="avatarUploadBadge" title="Upload profile picture" aria-label="Upload photo">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                </button>
                                <input type="file" id="profileAvatarFileInput" accept="image/*" style="display: none;">
                            </div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <h2 class="profile-modal-title" id="profileModalTitle">My Profile & Settings</h2>
                                    <span class="badge badge-online" style="font-size: 11px; padding: 2px 8px;">Active Customer</span>
                                </div>
                                <div class="profile-modal-sub" style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                                    <span id="modalCustomerName">Juan Dela Cruz</span>
                                    <span>·</span>
                                    <button type="button" class="profile-copy-badge" id="modalAccountCopyBtn" title="Click to copy Solar Account ID">
                                        <span id="modalAccountNo">HS-88219</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="avatar-actions-row">
                                    <button type="button" class="avatar-action-btn" id="uploadPhotoTextBtn">Upload photo</button>
                                    <span id="avatarActionSeparator" style="font-size: 11px; color: var(--gray-400); display: none;">·</span>
                                    <button type="button" class="avatar-action-btn remove" id="removePhotoBtn" style="display: none;">Remove photo</button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="profile-modal-close" id="closeProfileModalBtn" aria-label="Close Profile Settings">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <!-- Clean, Simple Modal Body -->
                    <div class="profile-modal-body">
                        <!-- SECTION 1: Personal Contact Details -->
                        <div class="profile-section">
                            <div class="profile-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Contact Information
                            </div>
                            <div class="profile-field-row">
                                <div class="form-group">
                                    <label class="form-label" for="profileInputName">Full Name</label>
                                    <input class="form-input" id="profileInputName" type="text" placeholder="Full Name" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="profileInputPhone">Mobile Phone</label>
                                    <input class="form-input" id="profileInputPhone" type="tel" placeholder="+63 917 555 0199" required>
                                </div>
                            </div>
                            <div class="profile-field-row">
                                <div class="form-group">
                                    <label class="form-label" for="profileInputEmail">Email Address</label>
                                    <input class="form-input" id="profileInputEmail" type="email" placeholder="name@email.com" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="profileInputPlan">Financing & Plan</label>
                                    <input class="form-input" id="profileInputPlan" type="text" readonly style="background: var(--gray-100); cursor: default; font-weight: 600; color: var(--navy);">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="profileInputAddress">Installation Address</label>
                                <input class="form-input" id="profileInputAddress" type="text" placeholder="House/Street, Barangay, City">
                            </div>
                        </div>

                        <!-- SECTION 2: Preferred Payment Method -->
                        <div class="profile-section">
                            <div class="profile-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                                Preferred Payment Method
                            </div>
                            <p class="profile-section-desc">Select your preferred channel for monthly solar amortization receipts:</p>
                            
                            <div class="payment-selector-grid" id="paymentMethodSelector">
                                <label class="payment-option-card selected" data-method="gcash">
                                    <input type="radio" name="preferredPayment" value="gcash" class="payment-radio" checked>
                                    <div class="payment-option-inner">
                                        <div class="payment-option-header">
                                            <span class="payment-badge-pill gcash-pill">GCash</span>
                                            <span class="payment-check-circle">✓</span>
                                        </div>
                                        <div class="payment-option-title">GCash e-Wallet</div>
                                        <div class="payment-option-desc">Fast mobile QR or send money</div>
                                    </div>
                                </label>

                                <label class="payment-option-card" data-method="maya">
                                    <input type="radio" name="preferredPayment" value="maya" class="payment-radio">
                                    <div class="payment-option-inner">
                                        <div class="payment-option-header">
                                            <span class="payment-badge-pill maya-pill">Maya</span>
                                            <span class="payment-check-circle">✓</span>
                                        </div>
                                        <div class="payment-option-title">Maya Digital Wallet</div>
                                        <div class="payment-option-desc">Scan to pay or Maya transfer</div>
                                    </div>
                                </label>

                                <label class="payment-option-card" data-method="bdo">
                                    <input type="radio" name="preferredPayment" value="bdo" class="payment-radio">
                                    <div class="payment-option-inner">
                                        <div class="payment-option-header">
                                            <span class="payment-badge-pill bdo-pill">BDO / Bank</span>
                                            <span class="payment-check-circle">✓</span>
                                        </div>
                                        <div class="payment-option-title">BDO Bank Transfer</div>
                                        <div class="payment-option-desc">InstaPay or Over-the-counter</div>
                                    </div>
                                </label>

                                <label class="payment-option-card" data-method="card">
                                    <input type="radio" name="preferredPayment" value="card" class="payment-radio">
                                    <div class="payment-option-inner">
                                        <div class="payment-option-header">
                                            <span class="payment-badge-pill card-pill">Card</span>
                                            <span class="payment-check-circle">✓</span>
                                        </div>
                                        <div class="payment-option-title">Credit / Debit Card</div>
                                        <div class="payment-option-desc">Visa or Mastercard Auto-Debit</div>
                                    </div>
                                </label>
                            </div>

                            <div class="form-group" style="margin-top: 4px;">
                                <label class="form-label" for="profilePaymentAccount" id="profilePaymentAccountLabel">GCash Mobile Number</label>
                                <input class="form-input" id="profilePaymentAccount" type="text" placeholder="+63 917 555 0199">
                                <span style="font-size: 11px; color: var(--gray-400); margin-top: 4px; display: block;">Used as reference for verified receipt uploads.</span>
                            </div>
                        </div>

                        <!-- SECTION 3: Password & Security -->
                        <div class="profile-section">
                            <div class="profile-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                Password & Security
                            </div>
                            <div class="profile-security-box">
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: var(--navy);">Customer Portal Password</div>
                                    <div style="font-size: 12px; color: var(--gray-500); margin-top: 2px;">Need to update your password or secure your account?</div>
                                </div>
                                <button type="button" class="btn btn-outline btn-sm" id="profileResetPassBtn" style="white-space: nowrap; font-size: 12px; padding: 6px 14px; font-weight: 600;">
                                    Send Reset Link
                                </button>
                            </div>
                        </div>

                        <!-- SECTION 4: System Hardware At A Glance -->
                        <div class="profile-hardware-summary">
                            <div class="profile-section-title" style="font-size: 12.5px; color: var(--gray-600); margin-bottom: 8px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path></svg>
                                System Hardware At A Glance
                            </div>
                            <div class="simple-chips-row">
                                <div class="simple-chip">
                                    <span class="simple-chip-k">System</span>
                                    <span class="simple-chip-v" id="modalChipSystem">4.82 kW Hybrid</span>
                                </div>
                                <div class="simple-chip">
                                    <span class="simple-chip-k">Inverter</span>
                                    <span class="simple-chip-v" id="modalChipInverter">Solis 5kW Dual</span>
                                </div>
                                <div class="simple-chip">
                                    <span class="simple-chip-k">Battery</span>
                                    <span class="simple-chip-v" id="modalChipBattery">10 kWh Reserve</span>
                                </div>
                                <div class="simple-chip">
                                    <span class="simple-chip-k">Installer</span>
                                    <span class="simple-chip-v" id="modalChipInstaller">Carlos V.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="profile-modal-footer">
                        <button type="button" class="btn btn-outline btn-sm" id="modalLogoutBtn" style="color: var(--red); border-color: #fecaca;">
                            Logout
                        </button>
                        <div style="display: flex; gap: 10px;">
                            <button type="button" class="btn btn-outline btn-sm" id="cancelProfileBtn">Close</button>
                            <button type="button" class="btn btn-primary btn-sm" id="saveProfileBtn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
        }

        const closeBtn = document.getElementById("closeProfileModalBtn");
        const cancelBtn = document.getElementById("cancelProfileBtn");
        const saveBtn = document.getElementById("saveProfileBtn");
        const modalLogoutBtn = document.getElementById("modalLogoutBtn");
        const nameInput = document.getElementById("profileInputName");
        const emailInput = document.getElementById("profileInputEmail");
        const phoneInput = document.getElementById("profileInputPhone");
        const planInput = document.getElementById("profileInputPlan");
        const addressInput = document.getElementById("profileInputAddress");
        const paymentAccountInput = document.getElementById("profilePaymentAccount");
        const paymentAccountLabel = document.getElementById("profilePaymentAccountLabel");
        const modalCustomerName = document.getElementById("modalCustomerName");
        const modalProfileAvatar = document.getElementById("modalProfileAvatar");
        const avatarUploadBadge = document.getElementById("avatarUploadBadge");
        const profileAvatarFileInput = document.getElementById("profileAvatarFileInput");
        const uploadPhotoTextBtn = document.getElementById("uploadPhotoTextBtn");
        const removePhotoBtn = document.getElementById("removePhotoBtn");
        const avatarActionSeparator = document.getElementById("avatarActionSeparator");
        const modalAccountNo = document.getElementById("modalAccountNo");
        const modalAccountCopyBtn = document.getElementById("modalAccountCopyBtn");
        const profileResetPassBtn = document.getElementById("profileResetPassBtn");
        const modalChipSystem = document.getElementById("modalChipSystem");
        const modalChipInverter = document.getElementById("modalChipInverter");
        const modalChipBattery = document.getElementById("modalChipBattery");
        const modalChipInstaller = document.getElementById("modalChipInstaller");

        let currentAvatarUrl = null;

        function updateAvatarDisplay() {
            if (!modalProfileAvatar) return;
            if (currentAvatarUrl) {
                modalProfileAvatar.innerHTML = `<img src="${currentAvatarUrl}" alt="Profile Avatar" class="avatar-img">`;
                if (removePhotoBtn) removePhotoBtn.style.display = "inline-block";
                if (avatarActionSeparator) avatarActionSeparator.style.display = "inline-block";
                if (uploadPhotoTextBtn) uploadPhotoTextBtn.textContent = "Change photo";
            } else {
                const currentName = (nameInput && nameInput.value.trim()) || (getCustomer().name) || "Customer";
                modalProfileAvatar.textContent = getInitials(currentName);
                if (removePhotoBtn) removePhotoBtn.style.display = "none";
                if (avatarActionSeparator) avatarActionSeparator.style.display = "none";
                if (uploadPhotoTextBtn) uploadPhotoTextBtn.textContent = "Upload photo";
            }
        }

        // Real-time name input listener: updates both name heading and avatar initials if no custom photo
        if (nameInput) {
            nameInput.addEventListener("input", () => {
                const val = nameInput.value.trim();
                if (modalCustomerName) {
                    modalCustomerName.textContent = val || "Customer";
                }
                if (!currentAvatarUrl && modalProfileAvatar) {
                    modalProfileAvatar.textContent = getInitials(val);
                }
            });
        }

        // Photo upload handling
        function triggerPhotoPicker() {
            if (profileAvatarFileInput) {
                profileAvatarFileInput.click();
            }
        }

        if (modalProfileAvatar) {
            modalProfileAvatar.addEventListener("click", triggerPhotoPicker);
        }
        if (avatarUploadBadge) {
            avatarUploadBadge.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerPhotoPicker();
            });
        }
        if (uploadPhotoTextBtn) {
            uploadPhotoTextBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerPhotoPicker();
            });
        }

        if (profileAvatarFileInput) {
            profileAvatarFileInput.addEventListener("change", (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                    showToast("Invalid Image", "Please select a valid image file (JPG, PNG, WebP).");
                    profileAvatarFileInput.value = "";
                    return;
                }

                const reader = new FileReader();
                reader.onload = (uploadEvent) => {
                    const img = new Image();
                    img.onload = () => {
                        // Canvas scale down to max 256x256 to conserve storage
                        const canvas = document.createElement("canvas");
                        const maxSize = 256;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxSize) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            }
                        } else {
                            if (height > maxSize) {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);

                        currentAvatarUrl = canvas.toDataURL("image/jpeg", 0.88);
                        updateAvatarDisplay();
                        showToast("Photo Preview", "Profile photo loaded! Click 'Save Profile' to apply changes.");
                    };
                    img.src = uploadEvent.target.result;
                };
                reader.readAsDataURL(file);
                profileAvatarFileInput.value = "";
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                currentAvatarUrl = null;
                updateAvatarDisplay();
                showToast("Photo Removed", "Reverted to initials avatar. Click 'Save Profile' to save.");
            });
        }

        // Payment Option Cards Interaction
        const optionCards = modalEl.querySelectorAll(".payment-option-card");
        optionCards.forEach(card => {
            card.addEventListener("click", () => {
                const method = card.dataset.method;
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;

                optionCards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");

                if (paymentAccountLabel) {
                    paymentAccountLabel.textContent = getPaymentLabel(method);
                }
                if (paymentAccountInput) {
                    paymentAccountInput.placeholder = getPaymentPlaceholder(method);
                }
            });
        });

        function openModal() {
            const customer = getCustomer();
            currentAvatarUrl = customer.avatarUrl || null;

            if (nameInput) nameInput.value = customer.name || "";
            if (emailInput) emailInput.value = customer.email || "";
            if (phoneInput) phoneInput.value = customer.phone || "";
            if (planInput) planInput.value = customer.plan || "5-Year Amortization";
            if (addressInput) addressInput.value = customer.address || "142 Solar Crest Way, Quezon City, Metro Manila";
            if (modalCustomerName) modalCustomerName.textContent = customer.name || "Customer";
            if (modalAccountNo) modalAccountNo.textContent = customer.accountNo || "HS-88219";

            if (modalChipSystem) modalChipSystem.textContent = customer.systemSize ? `${customer.systemSize} Hybrid` : "4.82 kW Hybrid";
            if (modalChipInverter) modalChipInverter.textContent = customer.inverterModel ? customer.inverterModel.replace(" Inverter", "") : "Solis 5kW Dual";
            if (modalChipBattery) modalChipBattery.textContent = customer.batteryCapacity ? customer.batteryCapacity.replace(" Lithium-ion Reserve", " Reserve") : "10 kWh Reserve";
            if (modalChipInstaller) modalChipInstaller.textContent = customer.installerName || "Carlos V.";

            const selectedMethod = (customer.preferredPayment || "gcash").toLowerCase();
            const targetRadio = modalEl.querySelector(`input[name="preferredPayment"][value="${selectedMethod}"]`);
            if (targetRadio) {
                targetRadio.checked = true;
            }

            optionCards.forEach(c => {
                if (c.dataset.method === selectedMethod) {
                    c.classList.add("selected");
                } else {
                    c.classList.remove("selected");
                }
            });

            if (paymentAccountLabel) {
                paymentAccountLabel.textContent = getPaymentLabel(selectedMethod);
            }
            if (paymentAccountInput) {
                paymentAccountInput.value = customer.paymentAccount || customer.phone || "";
                paymentAccountInput.placeholder = getPaymentPlaceholder(selectedMethod);
            }

            updateAvatarDisplay();

            modalEl.classList.add("visible");
            document.body.style.overflow = "hidden";
            if (nameInput) nameInput.focus();
        }

        // Copy Solar Account ID button
        if (modalAccountCopyBtn) {
            modalAccountCopyBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const acc = (modalAccountNo && modalAccountNo.textContent) || "HS-88219";
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(acc).then(() => {
                        showToast("Account ID Copied", `${acc} copied to your clipboard.`);
                    }).catch(() => {
                        showToast("Solar Account ID", acc);
                    });
                } else {
                    showToast("Solar Account ID", acc);
                }
            });
        }

        // Reset Password Link button
        if (profileResetPassBtn) {
            profileResetPassBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const custEmail = (emailInput && emailInput.value.trim()) || getCustomer().email || "your registered email";
                showToast("Password Reset Link Sent", `Security instructions sent to ${custEmail}. Please check your inbox.`);
            });
        }

        function closeModal() {
            modalEl.classList.remove("visible");
            document.body.style.overflow = "";
        }

        // Attach to all profile triggers across the portal
        const profileTriggers = document.querySelectorAll(".profile, .profile-avatar, #profileAvatar, #profileName");
        profileTriggers.forEach(el => {
            el.setAttribute("title", "Click to open Profile & Settings");
            el.setAttribute("tabindex", "0");
            el.setAttribute("role", "button");
            el.setAttribute("aria-haspopup", "dialog");
            el.addEventListener("click", event => {
                event.preventDefault();
                openModal();
            });
            el.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openModal();
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

        modalEl.addEventListener("click", event => {
            if (event.target === modalEl) {
                closeModal();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && modalEl.classList.contains("visible")) {
                closeModal();
            }
        });

        if (modalLogoutBtn) {
            modalLogoutBtn.addEventListener("click", () => {
                closeModal();
                logout();
            });
        }

        // Save Profile Changes
        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                const currentCustomer = getCustomer();
                const newName = (nameInput && nameInput.value.trim()) || currentCustomer.name;
                const newEmail = (emailInput && emailInput.value.trim()) || currentCustomer.email;
                const newPhone = (phoneInput && phoneInput.value.trim()) || currentCustomer.phone;
                const newAddress = (addressInput && addressInput.value.trim()) || currentCustomer.address;

                const checkedRadio = modalEl.querySelector('input[name="preferredPayment"]:checked');
                const selectedMethod = checkedRadio ? checkedRadio.value : (currentCustomer.preferredPayment || "gcash");
                const newPaymentAccount = (paymentAccountInput && paymentAccountInput.value.trim()) || currentCustomer.paymentAccount || newPhone;

                const updated = {
                    ...currentCustomer,
                    name: newName,
                    email: newEmail,
                    phone: newPhone,
                    address: newAddress,
                    preferredPayment: selectedMethod,
                    paymentAccount: newPaymentAccount,
                    avatarUrl: currentAvatarUrl
                };

                setCustomer(updated);
                initUserDisplay();
                updatePaymentsPagePreferred();
                closeModal();

                showToast("Profile Updated", `Saved! Profile details and profile photo updated successfully.`);
            });
        }

        // Update payments page on initial load if present
        updatePaymentsPagePreferred();

        profileModalInstance = { openModal, closeModal };
        return profileModalInstance;
    }

    // --------------------------------------------------------------------------
    // 7. MULTI-SYSTEM LINKED PACKAGES REPOSITORY & DATA STORE
    // Note: Marked sample datasets for multi-package demonstration
    // --------------------------------------------------------------------------
    const LINKED_PACKAGES = [
        {
            id: "pkg-home-5k4",
            installerAcceptanceStatus: "accepted",
            name: "Home Primary",
            shortLabel: "Home — 5.4 kW",
            capacity: "5.4 kW",
            location: "Quezon City · HS-88219",
            accountNo: "HS-88219",
            status: "Online · Normal",
            notice: "Demo dataset for primary residential hybrid solar system",
            telemetry: {
                baseSolar: 3.85,
                baseHome: 1.95,
                baseBattery: 1.25,
                batterySoc: 92,
                pvStrings: "PV1: 342V · PV2: 338V",
                gridSync: "231.8 V · 60.0 Hz",
                inverterTemp: "41.2°C (Optimal)",
                gridStatus: "Luzon Grid Locked · PF 0.99"
            },
            energy: {
                hasReadings: true,
                todayGenerated: "7.1 kWh",
                billSaved: "₱3,650",
                savingsPeriod: "This month",
                batteryReserve: "10 kWh",
                batterySoc: 92,
                backupHours: "18 hrs",
                chart: {
                    today: {
                        values: [0, 1.1, 2.4, 4.2, 6.4, 7.2, 6.5, 5.1, 3.3, 1.5, 0.4],
                        labels: ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
                        maxLabel: "8 kWh"
                    },
                    week: {
                        values: [4.1, 5.8, 6.4, 7.2, 5.9, 7.6, 6.8],
                        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        maxLabel: "8 kWh"
                    },
                    month: {
                        values: [12, 15, 17, 14, 19, 18, 21, 20, 24, 22, 26, 25],
                        labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "30", "31"],
                        maxLabel: "30 kWh"
                    }
                },
                breakdown: {
                    solarDirect: "64%",
                    batteryStorage: "26%",
                    gridExport: "10%"
                },
                ecoImpact: {
                    trees: "14",
                    co2Kg: "312"
                }
            },
            payments: {
                hasBills: true,
                nextPaymentAmount: "₱9,067",
                nextDueDate: "October 15, 2026",
                currentDueDate: "October 15, 2026",
                status: "Paid",
                statusBadgeClass: "badge-paid",
                statusBadgeText: "Paid",
                term: "5 Years",
                termBadge: "5-Year Term",
                paidInstallments: "4 of 60",
                totalPaid: "₱36,268",
                standing: "Good",
                standingMeta: "Account up to date",
                currentBillPeriod: "Sep 2026 (Current)",
                currentBillDue: "Sep 1, 2026",
                currentBillRef: "HS-88219-0926",
                schedule: [
                    { period: "May 2026", due: "May 1, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱9,067", receiptId: "REC-88219-05" },
                    { period: "Jun 2026", due: "Jun 1, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱9,067", receiptId: "REC-88219-06" },
                    { period: "Jul 2026", due: "Jul 1, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱9,067", receiptId: "REC-88219-07" },
                    { period: "Aug 2026", due: "Aug 1, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱9,067", receiptId: "REC-88219-08" },
                    { period: "Sep 2026", due: "Sep 1, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱9,067", receiptId: "REC-88219-09" },
                    { period: "Oct 2026", due: "Oct 15, 2026", status: "Upcoming", badgeClass: "badge-upcoming", amount: "₱9,067", receiptId: null }
                ]
            },
            install: {
                hasInstallation: true,
                phase: "Completed",
                phaseStatusText: "Commissioned",
                phaseMeta: "Active rooftop generation",
                completionPct: 100,
                milestonesAchieved: "5 of 5 milestones achieved",
                nextMilestone: "Routine Maintenance",
                nextMilestoneMeta: "Annual inspection",
                targetCompletion: "Aug 15, 2025",
                targetCompletionMeta: "Fully energized",
                milestones: [
                    { num: "1", title: "1. Site Assessment & Engineering Survey", status: "Completed", badgeClass: "badge-paid", desc: "Roof structural audit, solar irradiation modeling, and electrical panel inspection completed.", date: "Completed March 1, 2025" },
                    { num: "2", title: "2. Solar PV Panels Installed", status: "Completed", badgeClass: "badge-paid", desc: "12x Trina Solar 450W Monocrystalline modules mounted and DC wired.", date: "Completed March 10, 2025" },
                    { num: "3", title: "3. Inverter & Battery Storage Setup", status: "Completed", badgeClass: "badge-paid", desc: "Solis 5kW hybrid inverter, 10 kWh battery enclosure, and ATS backup switch mounted.", date: "Completed March 15, 2025" },
                    { num: "4", title: "4. Utility Grid Connection (Net Metering)", status: "Completed", badgeClass: "badge-paid", desc: "Utility bi-directional meter testing and distribution utility coordination completed.", date: "Completed April 20, 2025" },
                    { num: "5", title: "5. Final Commissioning & Handover", status: "Completed", badgeClass: "badge-paid", desc: "Final safety commissioning, net-metering sign-off, and customer handover completed.", date: "Completed May 2, 2025" }
                ],
                assignedTeam: {
                    name: "Carlos Villanueva",
                    initials: "CV",
                    role: "Certified Solar Master Installer",
                    phone: "+63 917 555 0101",
                    note: "Carlos managed your Quezon City rooftop installation and utility coordination. You can message him directly or call dispatch."
                },
                hardwareSpecs: "12x Trina Solar 450W Panels · Solis 5kW Hybrid Inverter · 10 kWh Lithium Battery"
            },
            support: {
                hasSupport: true,
                leadTechnician: "Carlos Villanueva",
                leadPhone: "+63 917 555 0101",
                leadContact: "+63 917 555 0101 (Carlos)",
                tickets: [
                    { id: "HS-SR-8120", subject: "Annual Inverter Efficiency & Panel Inspection", status: "Resolved", date: "July 12, 2026", category: "Routine Maintenance" },
                    { id: "HS-SR-7091", subject: "Wi-Fi Datalogger Reconnection Assistance", status: "Closed", date: "May 4, 2026", category: "Monitoring Gateway" }
                ]
            }
        },
        {
            id: "pkg-villa-10k8",
            installerAcceptanceStatus: "accepted",
            name: "Tagaytay Villa",
            shortLabel: "Villa — 10.8 kW",
            capacity: "10.8 kW",
            location: "Tagaytay · HS-94021",
            accountNo: "HS-94021",
            status: "Online · Normal",
            notice: "Demo dataset for commercial/residential hybrid system",
            telemetry: {
                baseSolar: 7.42,
                baseHome: 3.10,
                baseBattery: 2.80,
                batterySoc: 100,
                pvStrings: "PV1: 380V · PV2: 376V",
                gridSync: "230.5 V · 60.0 Hz",
                inverterTemp: "39.8°C (Optimal)",
                gridStatus: "Southern Grid Locked · PF 0.99"
            },
            energy: {
                hasReadings: true,
                todayGenerated: "14.8 kWh",
                billSaved: "₱7,840",
                savingsPeriod: "This month",
                batteryReserve: "20 kWh",
                batterySoc: 100,
                backupHours: "36 hrs",
                chart: {
                    today: {
                        values: [0, 2.3, 5.1, 8.4, 12.8, 14.5, 13.2, 10.1, 6.7, 3.1, 0.8],
                        labels: ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
                        maxLabel: "16 kWh"
                    },
                    week: {
                        values: [9.2, 12.4, 13.8, 15.1, 12.0, 15.6, 14.8],
                        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        maxLabel: "18 kWh"
                    },
                    month: {
                        values: [25, 29, 34, 30, 42, 38, 45, 41, 49, 44, 52, 50],
                        labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "30", "31"],
                        maxLabel: "60 kWh"
                    }
                },
                breakdown: {
                    solarDirect: "58%",
                    batteryStorage: "30%",
                    gridExport: "12%"
                },
                ecoImpact: {
                    trees: "32",
                    co2Kg: "680"
                }
            },
            payments: {
                hasBills: true,
                nextPaymentAmount: "₱17,450",
                nextDueDate: "October 20, 2026",
                currentDueDate: "October 20, 2026",
                status: "Paid",
                statusBadgeClass: "badge-paid",
                statusBadgeText: "Paid",
                term: "5 Years",
                termBadge: "5-Year Term",
                paidInstallments: "8 of 60",
                totalPaid: "₱139,600",
                standing: "Good",
                standingMeta: "All installments paid on time",
                currentBillPeriod: "Sep 2026 (Current)",
                currentBillDue: "Sep 20, 2026",
                currentBillRef: "HS-94021-0926",
                schedule: [
                    { period: "Jun 2026", due: "Jun 20, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱17,450", receiptId: "REC-94021-06" },
                    { period: "Jul 2026", due: "Jul 20, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱17,450", receiptId: "REC-94021-07" },
                    { period: "Aug 2026", due: "Aug 20, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱17,450", receiptId: "REC-94021-08" },
                    { period: "Sep 2026", due: "Sep 20, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱17,450", receiptId: "REC-94021-09" },
                    { period: "Oct 2026", due: "Oct 20, 2026", status: "Upcoming", badgeClass: "badge-upcoming", amount: "₱17,450", receiptId: null }
                ]
            },
            install: {
                hasInstallation: true,
                phase: "Completed",
                phaseStatusText: "Commissioned",
                phaseMeta: "100% capacity energized",
                completionPct: 100,
                milestonesAchieved: "5 of 5 milestones achieved",
                nextMilestone: "Quarterly Thermal Scan",
                nextMilestoneMeta: "Scheduled Q4",
                targetCompletion: "Jan 20, 2026",
                targetCompletionMeta: "Utility grid active",
                milestones: [
                    { num: "1", title: "1. Site Assessment & Engineering Survey", status: "Completed", badgeClass: "badge-paid", desc: "Structural load calculations for ceramic tile roof completed.", date: "Completed Nov 12, 2025" },
                    { num: "2", title: "2. Solar PV Panels Installed", status: "Completed", badgeClass: "badge-paid", desc: "24x Canadian Solar 450W Monocrystalline panels mounted with anodized rails.", date: "Completed Nov 28, 2025" },
                    { num: "3", title: "3. Inverter & Battery Storage Setup", status: "Completed", badgeClass: "badge-paid", desc: "Deye 10kW hybrid inverter and dual 10 kWh battery rack installed.", date: "Completed Dec 10, 2025" },
                    { num: "4", title: "4. Utility Grid Connection (Net Metering)", status: "Completed", badgeClass: "badge-paid", desc: "Meralco bi-directional meter installed and net-metering tariff enabled.", date: "Completed Jan 12, 2026" },
                    { num: "5", title: "5. Final Commissioning & Handover", status: "Completed", badgeClass: "badge-paid", desc: "System performance verified at 10.8 kW peak output.", date: "Completed Jan 20, 2026" }
                ],
                assignedTeam: {
                    name: "Engr. Alex Rivera",
                    initials: "AR",
                    role: "Senior Electrical Engineer & Partner",
                    phone: "+63 917 555 0199",
                    note: "Engr. Rivera supervises the Tagaytay high-capacity hybrid solar installation and remote performance tuning."
                },
                hardwareSpecs: "24x Canadian Solar 450W Panels · Deye 10kW Hybrid Inverter · Dual 10 kWh Battery Rack"
            },
            support: {
                hasSupport: true,
                leadTechnician: "Engr. Alex Rivera",
                leadPhone: "+63 917 555 0199",
                leadContact: "+63 917 555 0199 (Engr. Rivera)",
                tickets: [
                    { id: "HS-SR-9104", subject: "Net-Metering Bi-Directional Tariff Verification", status: "Resolved", date: "Feb 18, 2026", category: "Billing / Net-Metering" }
                ]
            }
        },
        {
            id: "pkg-farm-3k6",
            installerAcceptanceStatus: "accepted",
            name: "Batangas Farmhouse",
            shortLabel: "Farmhouse — 3.6 kW",
            capacity: "3.6 kW",
            location: "Lipa, Batangas · HS-77310",
            accountNo: "HS-77310",
            status: "Online · Normal",
            notice: "Demo dataset for in-progress provincial installation",
            telemetry: {
                baseSolar: 2.45,
                baseHome: 1.60,
                baseBattery: 0.60,
                batterySoc: 68,
                pvStrings: "PV1: 310V · PV2: 305V",
                gridSync: "229.2 V · 60.0 Hz",
                inverterTemp: "43.5°C (Optimal)",
                gridStatus: "Batangas Co-op Grid · PF 0.98"
            },
            energy: {
                hasReadings: true,
                todayGenerated: "4.6 kWh",
                billSaved: "₱2,410",
                savingsPeriod: "This month",
                batteryReserve: "5 kWh",
                batterySoc: 68,
                backupHours: "10 hrs",
                chart: {
                    today: {
                        values: [0, 0.8, 1.6, 2.7, 3.4, 3.6, 3.2, 2.5, 1.7, 0.8, 0.2],
                        labels: ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
                        maxLabel: "5 kWh"
                    },
                    week: {
                        values: [2.9, 3.8, 4.1, 4.6, 3.5, 4.8, 4.2],
                        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        maxLabel: "6 kWh"
                    },
                    month: {
                        values: [8, 9, 11, 10, 13, 12, 14, 13, 15, 14, 16, 15],
                        labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "30", "31"],
                        maxLabel: "20 kWh"
                    }
                },
                breakdown: {
                    solarDirect: "72%",
                    batteryStorage: "20%",
                    gridExport: "8%"
                },
                ecoImpact: {
                    trees: "9",
                    co2Kg: "185"
                }
            },
            payments: {
                hasBills: true,
                nextPaymentAmount: "₱6,200",
                nextDueDate: "September 30, 2026",
                currentDueDate: "September 30, 2026",
                status: "Unpaid",
                statusBadgeClass: "badge-unpaid",
                statusBadgeText: "Due Soon",
                term: "3 Years",
                termBadge: "3-Year Term",
                paidInstallments: "2 of 36",
                totalPaid: "₱12,400",
                standing: "Due Soon",
                standingMeta: "Bill due on September 30, 2026",
                currentBillPeriod: "Sep 2026 (Current)",
                currentBillDue: "Sep 30, 2026",
                currentBillRef: "HS-77310-0926",
                schedule: [
                    { period: "Jul 2026", due: "Jul 30, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱6,200", receiptId: "REC-77310-07" },
                    { period: "Aug 2026", due: "Aug 30, 2026", status: "Paid", badgeClass: "badge-paid", amount: "₱6,200", receiptId: "REC-77310-08" },
                    { period: "Sep 2026", due: "Sep 30, 2026", status: "Due Soon", badgeClass: "badge-due", amount: "₱6,200", receiptId: null },
                    { period: "Oct 2026", due: "Oct 30, 2026", status: "Upcoming", badgeClass: "badge-upcoming", amount: "₱6,200", receiptId: null }
                ]
            },
            install: {
                hasInstallation: true,
                phase: "In Progress",
                phaseStatusText: "Stage 4 of 5",
                phaseMeta: "Active grid synchronization",
                completionPct: 60,
                milestonesAchieved: "3 of 5 milestones achieved",
                nextMilestone: "Grid Sync",
                nextMilestoneMeta: "Batelec connection scheduled",
                targetCompletion: "Sep 30, 2026",
                targetCompletionMeta: "Estimated final inspection",
                milestones: [
                    { num: "1", title: "1. Site Assessment & Engineering Survey", status: "Completed", badgeClass: "badge-paid", desc: "Farmhouse roof pitch and battery location surveyed.", date: "Completed July 1, 2026" },
                    { num: "2", title: "2. Solar PV Panels Installed", status: "Completed", badgeClass: "badge-paid", desc: "8x Longi 450W panels mounted on metal roof structure.", date: "Completed July 15, 2026" },
                    { num: "3", title: "3. Inverter & Battery Storage Setup", status: "Completed", badgeClass: "badge-paid", desc: "Growatt 3.6kW inverter and 5 kWh lithium battery installed.", date: "Completed August 2, 2026" },
                    { num: "4", title: "4. Utility Grid Connection (Net Metering)", status: "In Progress", badgeClass: "badge-upcoming", desc: "Batelec II distribution transformer connection and testing in progress.", date: "Current Stage · Estimated 5-7 days" },
                    { num: "5", title: "5. Final Safety Inspection & Handover", status: "Scheduled", badgeClass: "badge-neutral", desc: "Final electrical engineering safety certification and customer walk-through.", date: "Target: September 30, 2026" }
                ],
                assignedTeam: {
                    name: "Marco Bautista",
                    initials: "MB",
                    role: "Lead Installation Field Specialist",
                    phone: "+63 917 555 8921",
                    note: "Marco is currently coordinating the Batangas local cooperative utility interconnection and testing."
                },
                hardwareSpecs: "8x Longi 450W Panels · Growatt 3.6kW Inverter · 5 kWh Battery"
            },
            support: {
                hasSupport: true,
                leadTechnician: "Marco Bautista",
                leadPhone: "+63 917 555 8921",
                leadContact: "+63 917 555 8921 (Marco)",
                tickets: [
                    { id: "HS-SR-9488", subject: "Pre-Commissioning Utility Meter Inspection Schedule", status: "In Progress", date: "Aug 24, 2026", category: "Utility Grid Connection" }
                ]
            }
        },
        {
            id: "pkg-biz-6k0",
            installerAcceptanceStatus: "pending",
            name: "Business Annex",
            shortLabel: "Business — 6.0 kW",
            capacity: "6.0 kW",
            location: "Pasig City · HS-10492",
            accountNo: "HS-10492",
            status: "Setup Pending",
            notice: "Demo dataset for freshly linked account with missing / pending data",
            telemetry: null,
            energy: {
                hasReadings: false,
                todayGenerated: null,
                billSaved: null,
                savingsPeriod: null,
                batteryReserve: null,
                batterySoc: null,
                backupHours: null,
                chart: null,
                breakdown: null,
                ecoImpact: null
            },
            payments: {
                hasBills: false,
                nextPaymentAmount: null,
                nextDueDate: null,
                currentDueDate: null,
                status: "Pending Billing",
                statusBadgeClass: "badge-neutral",
                statusBadgeText: "Pending Billing",
                term: "Pending Setup",
                termBadge: "Pending Assessment",
                paidInstallments: "0 of 0",
                totalPaid: "₱0",
                standing: "Pending Billing",
                standingMeta: "No billing records generated yet for this new installation",
                currentBillPeriod: null,
                currentBillDue: null,
                currentBillRef: "HS-10492",
                schedule: []
            },
            install: {
                hasInstallation: true,
                phase: "Scheduled",
                phaseStatusText: "Stage 1 of 5",
                phaseMeta: "Site assessment scheduled",
                completionPct: 10,
                milestonesAchieved: "0 of 5 milestones achieved",
                nextMilestone: "Site Survey",
                nextMilestoneMeta: "Pending contractor dispatch",
                targetCompletion: "November 15, 2026",
                targetCompletionMeta: "Target commissioning",
                milestones: [
                    { num: "1", title: "1. Site Assessment & Engineering Survey", status: "Scheduled", badgeClass: "badge-neutral", desc: "Structural assessment and panel layout design scheduled.", date: "Scheduled for October 5, 2026" },
                    { num: "2", title: "2. Solar PV Panels Installed", status: "Pending", badgeClass: "badge-neutral", desc: "Awaiting engineering review approval.", date: "Pending Stage 1" },
                    { num: "3", title: "3. Inverter & Battery Storage Setup", status: "Pending", badgeClass: "badge-neutral", desc: "Hardware dispatch scheduled upon approval.", date: "Pending Stage 2" },
                    { num: "4", title: "4. Utility Grid Connection (Net Metering)", status: "Pending", badgeClass: "badge-neutral", desc: "Distribution utility application to follow.", date: "Pending Stage 3" },
                    { num: "5", title: "5. Final Commissioning & Handover", status: "Pending", badgeClass: "badge-neutral", desc: "Target completion Q4 2026.", date: "Pending Stage 4" }
                ],
                assignedTeam: {
                    name: "Hello Solar Dispatch Team",
                    initials: "HS",
                    role: "Project Engineering Coordinator",
                    phone: "+63 2 8888 0100",
                    note: "Your project engineering lead will be assigned upon site inspection sign-off."
                },
                hardwareSpecs: "Specifications pending on-site electrical audit"
            },
            support: {
                hasSupport: true,
                leadTechnician: "Hello Solar Dispatch",
                leadPhone: "+63 2 8888 0100",
                leadContact: "+63 2 8888 0100 (Central Dispatch)",
                tickets: []
            }
        }
    ];

    // Dynamic aggregation engine for packages
    function enrichPackageMetrics(pkg) {
        if (!pkg) return pkg;

        // 1. Dynamic payments calculations
        if (pkg.payments && Array.isArray(pkg.payments.schedule)) {
            let totalPaidSum = 0;
            let paidCount = 0;
            let activeDueItem = null;

            pkg.payments.schedule.forEach(item => {
                // Accept both the modular JSON fields and the legacy display fields.
                item.due = item.due ?? item.dueDate ?? "—";
                item.amount = item.formattedAmount ?? item.amount;
                const num = parseFloat(String(item.amount ?? "").replace(/[^0-9.]/g, "")) || 0;
                if (item.status === "Paid") {
                    totalPaidSum += num;
                    paidCount++;
                } else if (!activeDueItem && (item.status === "Due Soon" || item.status === "Upcoming" || item.status === "Overdue" || item.status === "Unpaid")) {
                    activeDueItem = item;
                }
            });

            pkg.payments.paidInstallments = `${paidCount} of ${pkg.payments.schedule.length}`;
            pkg.payments.totalPaid = `₱${totalPaidSum.toLocaleString()}`;

            if (activeDueItem) {
                pkg.payments.nextPaymentAmount = activeDueItem.amount;
                pkg.payments.nextDueDate = activeDueItem.due;
                pkg.payments.currentDueDate = activeDueItem.due;
                pkg.payments.status = activeDueItem.status;
                pkg.payments.currentBillPeriod = activeDueItem.period;
                if (activeDueItem.status === "Due Soon") {
                    pkg.payments.statusBadgeClass = "badge-due";
                    pkg.payments.statusBadgeText = "Due Soon";
                } else if (activeDueItem.status === "Overdue") {
                    pkg.payments.statusBadgeClass = "badge-overdue";
                    pkg.payments.statusBadgeText = "Overdue";
                } else {
                    pkg.payments.statusBadgeClass = "badge-upcoming";
                    pkg.payments.statusBadgeText = "Upcoming";
                }
            } else if (paidCount === pkg.payments.schedule.length && paidCount > 0) {
                pkg.payments.status = "Paid";
                pkg.payments.statusBadgeClass = "badge-paid";
                pkg.payments.statusBadgeText = "Paid";
                pkg.payments.nextPaymentAmount = "₱0";
                pkg.payments.nextDueDate = "None Due";
            }
        }

        // 2. Dynamic install milestone progression
        if (pkg.install && Array.isArray(pkg.install.milestones)) {
            const total = pkg.install.milestones.length;
            const completed = pkg.install.milestones.filter(m => m.status === "Completed").length;
            pkg.install.completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
            pkg.install.milestonesAchieved = `${completed} of ${total} milestones achieved`;
        }

        // 3. Technical Solar & Battery accuracy
        if (pkg.hasBattery === false) {
            if (pkg.energy) {
                pkg.energy.batteryReserve = "Battery not included";
                pkg.energy.batterySoc = null;
                pkg.energy.backupHours = "Not supported";
            }
            if (pkg.telemetry) {
                pkg.telemetry.batterySoc = null;
                pkg.telemetry.baseBattery = 0;
                pkg.telemetry.backupReady = false;
                pkg.telemetry.backupStatusText = "Battery not included";
            }
        }

        return pkg;
    }

    // Apply enrichments to base packages
    LINKED_PACKAGES.forEach(p => enrichPackageMetrics(p));

    let activePackagesStore = [...LINKED_PACKAGES];
    let cachedFaqs = [];

    // Asynchronous JSON dataset loader
    async function loadCustomerDatasetAsync() {
        const storedCustom = localStorage.getItem("hello_solar_customer_custom_dataset");
        if (storedCustom) {
            try {
                const parsed = JSON.parse(storedCustom);
                if (parsed && Array.isArray(parsed.packages) && parsed.packages.length > 0) {
                    activePackagesStore = parsed.packages.map(p => enrichPackageMetrics(p));
                    if (Array.isArray(parsed.faqs)) cachedFaqs = parsed.faqs;
                    window.dispatchEvent(new CustomEvent("helloSolarDataLoaded", { detail: { packages: activePackagesStore, faqs: cachedFaqs } }));
                    return { packages: activePackagesStore, faqs: cachedFaqs };
                }
            } catch (e) {
                console.warn("[Portal] Error parsing stored custom dataset:", e);
            }
        }

        // 1. First try shared DataLoader module (browser-native fetch of purpose-organized JSON)
        let loaded = null;
        if (window.HelloSolarDataLoader && typeof window.HelloSolarDataLoader.loadAll === "function") {
            try {
                loaded = await window.HelloSolarDataLoader.loadAll();
            } catch (e) {
                console.warn("[Portal] DataLoader.loadAll error:", e);
            }
        }

        if (loaded && Array.isArray(loaded.packages) && loaded.packages.length > 0) {
            activePackagesStore = loaded.packages.map(p => enrichPackageMetrics(p));
            if (Array.isArray(loaded.faqs)) cachedFaqs = loaded.faqs;
            if (loaded.customer && typeof loaded.customer === "object") {
                const existingCust = getCustomer();
                // User-saved localStorage modifications strictly take precedence over default JSON values
                setCustomer({ ...loaded.customer, ...existingCust });
            }
            window.dispatchEvent(new CustomEvent("helloSolarDataLoaded", { detail: { packages: activePackagesStore, faqs: cachedFaqs } }));
            return { packages: activePackagesStore, faqs: cachedFaqs };
        }

        // 2. Direct fetch fallback for legacy customer.json
        try {
            const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
            const res = await fetch("assets/data/customer.json", {
                cache: "no-cache",
                signal: controller ? controller.signal : undefined
            });
            if (timeoutId) clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.packages) && data.packages.length > 0) {
                    activePackagesStore = data.packages.map(p => enrichPackageMetrics(p));
                    if (Array.isArray(data.faqs)) cachedFaqs = data.faqs;
                    if (data.customer && typeof data.customer === "object") {
                        const existingCust = getCustomer();
                        setCustomer({ ...data.customer, ...existingCust });
                    }
                    window.dispatchEvent(new CustomEvent("helloSolarDataLoaded", { detail: { packages: activePackagesStore, faqs: cachedFaqs } }));
                    return { packages: activePackagesStore, faqs: cachedFaqs };
                }
            }
        } catch (err) {
            console.warn("[Portal] Automated fetch of customer dataset failed (likely file:/// protocol or offline). Operating in offline mode.", err);
        }

        return { packages: activePackagesStore, faqs: cachedFaqs };
    }

    function getLinkedPackages() {
        return activePackagesStore;
    }

    function getFaqs() {
        return cachedFaqs;
    }

    // Genuinely user-scoped storage key
    function getCustomerIdentifier() {
        const customer = getCustomer();
        return customer.accountNo || customer.email || (customer.name ? customer.name.replace(/\s+/g, '_').toLowerCase() : 'default_customer');
    }

    function getActivePackageStorageKey() {
        return `hello_solar_active_package_id:${getCustomerIdentifier()}`;
    }

    function getActivePackageId() {
        const key = getActivePackageStorageKey();
        const stored = localStorage.getItem(key);
        const pkgs = getLinkedPackages();
        if (stored && pkgs.some(p => p.id === stored)) {
            return stored;
        }
        // Fallback to first available package
        return pkgs.length > 0 ? pkgs[0].id : LINKED_PACKAGES[0].id;
    }

    function setActivePackageId(id) {
        const pkgs = getLinkedPackages();
        if (pkgs.some(p => p.id === id)) {
            const key = getActivePackageStorageKey();
            localStorage.setItem(key, id);
            // Also maintain legacy fallback for backwards compatibility
            localStorage.setItem("hello_solar_active_package_id", id);

            const selectedPkg = getActivePackage();
            window.dispatchEvent(new CustomEvent("helloSolarPackageChanged", {
                detail: { packageId: id, package: selectedPkg }
            }));
            return true;
        }
        return false;
    }

    function getActivePackage() {
        const id = getActivePackageId();
        const pkgs = getLinkedPackages();
        return pkgs.find(p => p.id === id) || pkgs[0] || LINKED_PACKAGES[0];
    }

    // --------------------------------------------------------------------------
    // 7B. UNFINISHED INPUT DRAFT & DIRTY CHECK PROTECTION
    // --------------------------------------------------------------------------
    let formDirtyCheckFn = null;

    function registerDirtyCheck(fn) {
        formDirtyCheckFn = fn;
    }

    function unregisterDirtyCheck() {
        formDirtyCheckFn = null;
    }

    function requestPackageSwitch(targetPackageId, onConfirmed) {
        if (targetPackageId === getActivePackageId()) return;

        if (typeof formDirtyCheckFn === "function") {
            const reason = formDirtyCheckFn();
            if (reason) {
                const proceed = window.confirm(
                    `You have unsaved changes (${reason}). Switching to another solar system will discard your draft for this system.\n\nDo you want to continue?`
                );
                if (!proceed) return;
            }
        }

        const success = setActivePackageId(targetPackageId);
        if (success && typeof onConfirmed === "function") {
            onConfirmed(getActivePackage());
        }
    }

    // --------------------------------------------------------------------------
    // 7C. SHARED REUSABLE PACKAGE SELECTOR COMPONENT
    // Automatically renders button, dropdown, keyboard controls, and checkmarks
    // --------------------------------------------------------------------------
    function renderPackageSelectorComponent(container, options = {}) {
        if (!container) return;

        const currentPkg = getActivePackage();
        const packages = getLinkedPackages();

        container.innerHTML = `
            <div class="package-selector" id="packageSelector">
                <button type="button" class="package-selector-btn" id="packageSelectorBtn"
                    aria-haspopup="listbox" aria-expanded="false" aria-controls="packageDropdownMenu">
                    <span class="package-btn-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/>
                        </svg>
                    </span>
                    <span class="package-btn-content">
                        <span class="package-btn-label">System</span>
                        <span class="package-btn-name" id="selectedPackageName"></span>
                    </span>
                    <svg class="package-dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="package-dropdown-menu" id="packageDropdownMenu" role="listbox" aria-label="Available solar packages" tabindex="-1">
                    <div class="package-dropdown-header">
                        <span>Linked Solar Systems</span>
                    </div>
                    <div class="package-items-list" id="packageItemsList" role="presentation">
                    </div>
                    <div class="package-dropdown-footer">
                        <button type="button" class="package-add-account-btn" id="openAddAccountBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <span>+ Add Account</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const btn = container.querySelector("#packageSelectorBtn");
        const menu = container.querySelector("#packageDropdownMenu");
        const list = container.querySelector("#packageItemsList");
        const addBtn = container.querySelector("#openAddAccountBtn");
        container.querySelector("#selectedPackageName").textContent = currentPkg
            ? (currentPkg.shortLabel || currentPkg.name) : "Select system";

        function renderItems() {
            if (!list) return;
            list.innerHTML = "";
            const activeId = getActivePackageId();

            packages.forEach(pkg => {
                const item = document.createElement("div");
                const isSelected = pkg.id === activeId;
                item.className = "package-item" + (isSelected ? " selected" : "");
                item.setAttribute("role", "option");
                item.setAttribute("aria-selected", isSelected ? "true" : "false");
                item.setAttribute("tabindex", "0");
                item.setAttribute("data-package-id", pkg.id);

                item.innerHTML = `
                    <div class="package-item-main">
                        <div class="package-item-top">
                            <span class="package-item-title">${pkg.name}</span>
                            <span class="package-item-capacity">${pkg.capacity}</span>
                        </div>
                        <div class="package-item-meta">
                            <span class="package-item-location">${pkg.location}</span>
                        </div>
                    </div>
                    <div class="package-item-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                `;

                function selectThis() {
                    requestPackageSwitch(pkg.id, (switchedPkg) => {
                        close();
                        const labelEl = container.querySelector("#selectedPackageName");
                        if (labelEl) labelEl.textContent = switchedPkg.shortLabel || switchedPkg.name;
                        renderItems();

                        showToast(
                            "Package Switched",
                            `Viewing ${switchedPkg.name} (${switchedPkg.capacity}) · ${switchedPkg.location.split('·')[0].trim()}`
                        );

                        if (typeof options.onPackageChanged === "function") {
                            options.onPackageChanged(switchedPkg);
                        }
                    });
                }

                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    selectThis();
                });

                item.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectThis();
                    } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        const next = item.nextElementSibling;
                        if (next && next.classList.contains("package-item")) next.focus();
                    } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        const prev = item.previousElementSibling;
                        if (prev && prev.classList.contains("package-item")) prev.focus();
                        else if (btn) btn.focus();
                    } else if (e.key === "Escape") {
                        close();
                        if (btn) btn.focus();
                    }
                });

                list.appendChild(item);
            });
        }

        function open() {
            menu.classList.add("open");
            btn.setAttribute("aria-expanded", "true");
            renderItems();
            const selectedItem = menu.querySelector(".package-item.selected") || menu.querySelector(".package-item");
            if (selectedItem) setTimeout(() => selectedItem.focus(), 50);
        }

        function close() {
            menu.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        }

        function toggle() {
            if (menu.classList.contains("open")) close();
            else open();
        }

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggle();
        });

        btn.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
            } else if (e.key === "Escape") {
                close();
            }
        });

        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                close();
                openAddAccountModal();
            });
        }

        renderItems();
    }

    // Modal dialog for "+ Add Account"
    function openAddAccountModal() {
        let modal = document.getElementById("globalAddAccountModalBackdrop");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "globalAddAccountModalBackdrop";
            modal.className = "package-modal-backdrop";
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-modal", "true");
            modal.setAttribute("aria-labelledby", "globalAddAccountTitle");
            modal.innerHTML = `
                <div class="package-modal">
                    <div class="package-modal-header">
                        <div class="package-modal-title-wrap">
                            <div class="package-modal-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="package-modal-title" id="globalAddAccountTitle">Link Additional Solar System</h3>
                                <p class="package-modal-subtitle">Connect another Hello Solar property or service account</p>
                            </div>
                        </div>
                        <button type="button" class="package-modal-close-btn" id="closeGlobalAddAccountModal" aria-label="Close modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="package-modal-body">
                        <p class="package-modal-desc">
                            Manage residential rooftop solar arrays, vacation homes, and commercial installations in one seamless portal.
                        </p>
                        <div class="package-modal-field">
                            <label for="globalServiceAccountId">Service Account Number or System Serial #</label>
                            <input type="text" id="globalServiceAccountId" placeholder="e.g. HS-102948" autocomplete="off">
                            <span class="package-field-hint">Located on your Hello Solar installation contract or monthly statement.</span>
                        </div>
                        <div class="package-modal-notice">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span>Multi-system account linking is in customer preview mode. In production, an OTP is dispatched to the account holder's registered mobile phone.</span>
                        </div>
                    </div>
                    <div class="package-modal-footer">
                        <button type="button" class="btn btn-outline" id="cancelGlobalAddAccountBtn">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submitGlobalAddAccountBtn">Link System</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeBtn = modal.querySelector("#closeGlobalAddAccountModal");
            const cancelBtn = modal.querySelector("#cancelGlobalAddAccountBtn");
            const submitBtn = modal.querySelector("#submitGlobalAddAccountBtn");
            const input = modal.querySelector("#globalServiceAccountId");

            function closeModal() {
                modal.classList.remove("open");
                if (input) input.value = "";
            }

            closeBtn.addEventListener("click", closeModal);
            cancelBtn.addEventListener("click", closeModal);
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });

            submitBtn.addEventListener("click", () => {
                const val = input ? input.value.trim() : "";
                closeModal();
                showToast(
                    "Account Linking In Preview",
                    val ? `Account "${val}" noted. Linking will be verified when multi-system service launches.` : "Multi-system service account linking will be supported in the next system update."
                );
            });
        }

        modal.classList.add("open");
        const inputEl = modal.querySelector("#globalServiceAccountId");
        if (inputEl) setTimeout(() => inputEl.focus(), 100);
    }

    // --------------------------------------------------------------------------
    // 8. EXPOSE GLOBAL PORTAL API
    // --------------------------------------------------------------------------
    window.HelloSolar = {
        getCustomer,
        setCustomer,
        isAuthenticated,
        requireAuth,
        logout,
        initUserDisplay,
        initNavigation,
        initProfileSettings,
        openProfileSettings: () => {
            if (!profileModalInstance) {
                profileModalInstance = initProfileSettings();
            }
            if (profileModalInstance) {
                profileModalInstance.openModal();
            }
        },
        loadCustomerDataset: loadCustomerDatasetAsync,
        getFaqs,
        enrichPackageMetrics,
        toast: showToast,
        getLinkedPackages,
        getActivePackageId,
        setActivePackageId,
        getActivePackage,
        initPackageSelector: renderPackageSelectorComponent,
        requestPackageSwitch,
        registerDirtyCheck,
        unregisterDirtyCheck,
        openAddAccountModal,
        dataLoader: window.HelloSolarDataLoader || null
    };

    // Auto-init on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", async () => {
        // If current page is NOT login or signup, enforce authentication
        const path = window.location.pathname.toLowerCase();
        const isAuthPage = path.endsWith("login.html") || path.endsWith("signup.html") || path.endsWith("index.html");

        if (!isAuthPage) {
            if (!requireAuth()) return;
        }

        // Initialize user display & navigation
        initUserDisplay();
        initNavigation();
        initProfileSettings();

        // Load authoritative JSON dataset
        await loadCustomerDatasetAsync();

        // Auto-mount package selector into any dedicated slot
        const selectorSlots = document.querySelectorAll(".package-selector-slot, #pagePackageSelector");
        selectorSlots.forEach(slot => {
            if (!slot.querySelector(".package-selector")) {
                renderPackageSelectorComponent(slot);
            }
        });
    });
})();
