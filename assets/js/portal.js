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
        paymentAccount: "+63 917 555 0199"
    };

    // --------------------------------------------------------------------------
    // 2. CUSTOMER DATA STORE HELPERS
    // --------------------------------------------------------------------------
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

        const initials = customer.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word.charAt(0).toUpperCase())
            .join("");

        profileAvatarEls.forEach(el => {
            el.textContent = initials || "HS";
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
        const currentFile = currentPath.split("/").pop() || "dashboard.html";
        const bottomNavItems = document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item");
        bottomNavItems.forEach(item => {
            const href = item.getAttribute("href");
            if (href && !href.startsWith("#")) {
                const target = href.toLowerCase().split("/").pop();
                if (target === currentFile || (currentFile === "" && target === "dashboard.html")) {
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
                            <div class="profile-modal-avatar" id="modalProfileAvatar">JD</div>
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
            const modalAccountNo = document.getElementById("modalAccountNo");
            const modalAccountCopyBtn = document.getElementById("modalAccountCopyBtn");
            const profileResetPassBtn = document.getElementById("profileResetPassBtn");
            const modalChipSystem = document.getElementById("modalChipSystem");
            const modalChipInverter = document.getElementById("modalChipInverter");
            const modalChipBattery = document.getElementById("modalChipBattery");
            const modalChipInstaller = document.getElementById("modalChipInstaller");

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

                const initials = (customer.name || "HS")
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(word => word.charAt(0).toUpperCase())
                    .join("");

                if (modalProfileAvatar) modalProfileAvatar.textContent = initials || "HS";

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
                        paymentAccount: newPaymentAccount
                    };

                    setCustomer(updated);
                    initUserDisplay();
                    updatePaymentsPagePreferred();
                    closeModal();

                    showToast("Profile Updated", `Saved! Your preferred payment method is set to ${getPaymentDisplayName(selectedMethod)}.`);
                });
            }

            // Update payments page on initial load if present
            updatePaymentsPagePreferred();

            profileModalInstance = { openModal, closeModal };
            return profileModalInstance;
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
        toast: showToast
    };

    // Auto-init on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        // If current page is NOT login or signup, enforce authentication
        const path = window.location.pathname.toLowerCase();
        const isAuthPage = path.endsWith("login.html") || path.endsWith("signup.html") || path.endsWith("index.html");

        if (!isAuthPage) {
            if (!requireAuth()) return;
        }

        initUserDisplay();
        initNavigation();
        initProfileSettings();
    });
})();
