/**
 * ==========================================================================
 * HELLO SOLAR CUSTOMER — AUTHENTICATION SYSTEM
 * Client-side credential verification, account registry, & session management
 * Allows manipulating/adding accounts so users can register and log in
 * ==========================================================================
 */

(function () {
    "use strict";

    // --------------------------------------------------------------------------
    // 1. DEFAULT CUSTOMER ACCOUNTS (JSON)
    // Developers can edit or add pre-configured customer accounts here:
    // --------------------------------------------------------------------------
    const DEFAULT_ACCOUNTS = [
        {
            accountNo: "HS-89421",
            email: "customer@hellosolar.ph",
            username: "customer",
            password: "password123",
            name: "Juan Dela Cruz",
            phone: "+63 917 123 4567",
            status: "Online",
            systemSize: "5.4 kW",
            installationDate: "January 15, 2024",
            panelsCount: 14,
            panelsModel: "Canadian Solar 410W HiKu",
            inverterModel: "Growatt 5kW Hybrid Inverter",
            batteryCapacity: "10 kWh Lithium-ion Reserve",
            address: "142 Palm Avenue, Ayala Alabang, Muntinlupa City",
            inverterSerial: "GW-5K-2024-8841",
            plan: "5-Year Lease-to-Own",
            nextDue: "Oct 1, 2026",
            nextAmount: "₱9,067",
            role: "Solar Customer",
            installerName: "Carlos Villanueva",
            installerPhone: "+63 917 555 0101",
            preferredPayment: "gcash",
            paymentAccount: "0917 123 4567",
            avatarUrl: null
        },
        {
            accountNo: "HS-72301",
            email: "maria.santos@gmail.com",
            username: "maria",
            password: "password123",
            name: "Maria Santos",
            phone: "+63 918 765 4321",
            status: "Online",
            systemSize: "6.8 kW",
            installationDate: "March 10, 2024",
            panelsCount: 16,
            panelsModel: "Trina Solar Vertex S+ 420W",
            inverterModel: "Solis 6kW Hybrid Inverter",
            batteryCapacity: "12 kWh Lithium-ion Reserve",
            address: "Quezon City, Metro Manila",
            inverterSerial: "SOLIS-6K-2024-7230",
            plan: "5-Year Amortization",
            nextDue: "Oct 5, 2026",
            nextAmount: "₱11,250",
            role: "Solar Customer",
            installerName: "Carlos Villanueva",
            installerPhone: "+63 917 555 0101",
            preferredPayment: "maya",
            paymentAccount: "0918 765 4321",
            avatarUrl: null
        }
    ];

    const STORAGE_KEY = "hello_solar_customer_accounts";
    const SESSION_KEY = "hello_solar_logged_in";
    const USER_KEY = "hello_solar_user";

    // --------------------------------------------------------------------------
    // 2. ACCOUNT STORAGE & RETRIEVAL
    // --------------------------------------------------------------------------
    function getAccounts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    // Combine default accounts with stored accounts (avoiding duplicate email/accountNo)
                    const merged = [...DEFAULT_ACCOUNTS];
                    parsed.forEach(acc => {
                        const exists = merged.some(item =>
                            (item.email && acc.email && item.email.toLowerCase() === acc.email.toLowerCase()) ||
                            (item.accountNo && acc.accountNo && item.accountNo.toLowerCase() === acc.accountNo.toLowerCase()) ||
                            (item.username && acc.username && item.username.toLowerCase() === acc.username.toLowerCase())
                        );
                        if (!exists) {
                            merged.push(acc);
                        }
                    });
                    return merged;
                }
            }
        } catch (e) {
            console.warn("Could not read customer accounts from localStorage:", e);
        }

        // Initialize store with default accounts if empty
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        } catch (e) {
            // ignore
        }
        return [...DEFAULT_ACCOUNTS];
    }

    function saveAccount(newAccount) {
        try {
            const accounts = getAccounts();
            // Check if email already exists
            const emailClean = (newAccount.email || "").trim().toLowerCase();
            const exists = accounts.some(acc => (acc.email || "").toLowerCase() === emailClean);
            if (exists) {
                return { success: false, message: "An account with this email already exists." };
            }

            accounts.push(newAccount);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
            return { success: true, account: newAccount };
        } catch (e) {
            console.error("Error saving customer account:", e);
            return { success: false, message: "Storage error. Could not save account." };
        }
    }

    // --------------------------------------------------------------------------
    // 3. AUTHENTICATION (CREDENTIAL VERIFICATION)
    // --------------------------------------------------------------------------
    function authenticate(identifier, password) {
        const accounts = getAccounts();
        const cleanId = (identifier || "").trim().toLowerCase();
        const cleanPass = password || "";

        if (!cleanId || !cleanPass) {
            return null;
        }

        return accounts.find(acc => {
            const matchEmail = acc.email && acc.email.toLowerCase() === cleanId;
            const matchAccountNo = acc.accountNo && acc.accountNo.toLowerCase() === cleanId;
            const matchUser = acc.username && acc.username.toLowerCase() === cleanId;
            const matchPass = acc.password === cleanPass;

            return (matchEmail || matchAccountNo || matchUser) && matchPass;
        }) || null;
    }

    // --------------------------------------------------------------------------
    // 4. SESSION MANAGEMENT
    // --------------------------------------------------------------------------
    function setSession(account) {
        localStorage.setItem(SESSION_KEY, "true");
        // Store user profile for dashboard personalization
        localStorage.setItem(USER_KEY, JSON.stringify(account));
    }

    function isAuthenticated() {
        return localStorage.getItem(SESSION_KEY) === "true";
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = "login.html";
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.replace("login.html");
            return false;
        }
        return true;
    }

    // --------------------------------------------------------------------------
    // 5. EXPOSE GLOBALLY (window.HelloSolarAuth)
    // --------------------------------------------------------------------------
    window.HelloSolarAuth = {
        DEFAULT_ACCOUNTS,
        getAccounts,
        saveAccount,
        authenticate,
        setSession,
        isAuthenticated,
        logout,
        requireAuth
    };

})();
