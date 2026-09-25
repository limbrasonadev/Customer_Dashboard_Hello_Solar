/**
 * ============================================================================
 * HELLO SOLAR CUSTOMER PORTAL — SHARED DATA LOADER MODULE
 * Decoupled data-loading layer for browser-native fetch() of JSON datasets.
 * Keeps data fetching strictly separated from UI rendering so backend engineers
 * can easily swap static JSON sources for live REST/GraphQL APIs.
 * ============================================================================
 */

(function (window) {
    "use strict";

    const DATA_BASE_PATH = "assets/data";
    const FETCH_TIMEOUT_MS = 3500;

    /**
     * Browser-native fetch with timeout and error trapping.
     * Handles local file:/// CORS restrictions and network dropouts gracefully.
     */
    async function fetchJson(endpoint) {
        try {
            const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
            const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;

            const url = endpoint.startsWith("http") || endpoint.startsWith("/")
                ? endpoint
                : `${DATA_BASE_PATH}/${endpoint}`;

            const response = await fetch(url, {
                cache: "no-cache",
                signal: controller ? controller.signal : undefined
            });

            if (timer) clearTimeout(timer);

            if (!response.ok) {
                console.warn(`[DataLoader] HTTP ${response.status} fetching ${url}`);
                return null;
            }

            return await response.json();
        } catch (err) {
            console.warn(`[DataLoader] Fetch failed for ${endpoint} (likely file:/// protocol or offline):`, err.message);
            return null;
        }
    }

    /**
     * Assemble separate domain JSON records into unified package structures
     * matching the portal's presentation and calculation contracts.
     */
    function assemblePackage(system, telemetryMap, paymentsMap, savingsMap, equipmentMap, warrantiesMap) {
        if (!system || !system.id) return null;
        const id = system.id;

        const telem = telemetryMap.get(id) || null;
        const pay = paymentsMap.get(id) || null;
        const save = savingsMap.get(id) || null;
        const equip = equipmentMap.get(id) || null;
        const warr = warrantiesMap.get(id) || null;

        return {
            id: system.id,
            accountNo: system.accountNo || "",
            name: system.name || "Solar Package",
            shortLabel: system.shortLabel || system.name || "",
            capacity: system.capacity || (system.capacityKw ? `${system.capacityKw} kW` : "5.4 kW"),
            capacityKw: typeof system.capacityKw === "number" ? system.capacityKw : parseFloat(system.capacity || "5.4"),
            location: system.location || "",
            status: system.status || "Online · Normal",
            installerAcceptanceStatus: system.installerAcceptanceStatus || "pending",
            systemType: system.systemType || "Residential Hybrid",
            hasBattery: system.hasBattery !== false,
            installationDate: system.installationDate || "",
            notice: system.notice || "",

            // Hardware & Specifications (from equipment.json)
            panelsCount: equip && equip.panels ? equip.panels.count : 12,
            panelsModel: equip && equip.panels ? equip.panels.model : "Trina Solar Vertex S+ 450W",
            inverterModel: equip && equip.inverter ? equip.inverter.model : "Solis 5kW Hybrid Inverter",
            batteryCapacity: equip && equip.battery ? equip.battery.model : (system.hasBattery ? "10 kWh Lithium-ion Reserve" : "None (Grid-Tie Architecture)"),
            inverterSerial: (equip && equip.inverter && equip.inverter.serialNumber) || (warr && warr.inverterSerial) || "SOLIS-5K-202503-8891",
            equipment: equip,

            // Warranties (from warranties.json)
            warranties: warr ? warr.warranties : null,
            assignedInstaller: warr ? warr.assignedInstaller : null,

            // Live Telemetry (from telemetry.json)
            telemetry: telem ? {
                status: telem.status || "live",
                lastUpdated: telem.lastUpdated || new Date().toISOString(),
                baseSolar: typeof telem.solarKw === "number" ? telem.solarKw : 0,
                baseHome: typeof telem.homeKw === "number" ? telem.homeKw : 0,
                baseBattery: typeof telem.batteryKw === "number" ? telem.batteryKw : 0,
                batterySoc: telem.batterySoc,
                pvStrings: telem.pvStrings || "",
                gridSync: telem.gridSync || "",
                inverterTemp: telem.inverterTemp || (telem.inverterTempC ? `${telem.inverterTempC}°C` : "Normal"),
                gridStatus: telem.gridStatus || "",
                backupReady: telem.backupReady !== false,
                backupStatusText: telem.backupStatusText || (system.hasBattery ? "Backup Ready" : "Battery not included")
            } : null,

            // Energy & Savings (from savings.json)
            energy: save ? {
                hasReadings: save.hasReadings !== false,
                todayGenerated: save.todayGenerated || (save.todayGeneratedKwh ? `${save.todayGeneratedKwh} kWh` : "0 kWh"),
                billSaved: save.billSaved || (save.estimatedMonthlySavings ? `₱${save.estimatedMonthlySavings.toLocaleString()}` : "₱0"),
                savingsPeriod: save.savingsPeriod || "This month",
                batteryReserve: save.batteryReserve || (save.batteryReserveKwh ? `${save.batteryReserveKwh} kWh` : (system.hasBattery ? "10 kWh" : "Battery not included")),
                batterySoc: save.batterySoc,
                backupHours: save.backupHours ? `${save.backupHours} hrs` : (system.hasBattery ? "18 hrs" : "Not supported"),
                chart: save.chart || null,
                breakdown: save.breakdown || null,
                ecoImpact: save.ecoImpact || { trees: "0", co2Kg: "0" }
            } : null,

            // Payments (from payments.json)
            payments: pay ? {
                hasBills: pay.hasBills !== false,
                term: pay.planTerm || "5-Year Lease-to-Own",
                termBadge: pay.termBadge || "5-Year Term",
                standing: pay.standing || "Good",
                standingMeta: pay.standingMeta || "Account up to date",
                currentBillRef: pay.currentBillRef || system.accountNo,
                schedule: Array.isArray(pay.schedule) ? pay.schedule : []
            } : {
                hasBills: false,
                term: "Pending Setup",
                termBadge: "Pending Assessment",
                standing: "Pending Billing",
                standingMeta: "No billing records generated yet for this new installation",
                currentBillRef: system.accountNo,
                schedule: []
            },

            // Installation Progression & Crew (defaults preserved)
            install: {
                hasInstallation: true,
                phase: system.status.includes("Pending") ? "In Progress" : "Completed",
                phaseStatusText: system.status.includes("Pending") ? "Stage 4 of 5" : "Commissioned",
                phaseMeta: system.status.includes("Pending") ? "Active grid synchronization" : "Active rooftop generation",
                completionPct: system.status.includes("Pending") ? 60 : 100,
                milestonesAchieved: system.status.includes("Pending") ? "3 of 5 milestones achieved" : "5 of 5 milestones achieved",
                nextMilestone: system.status.includes("Pending") ? "Grid Sync" : "Routine Maintenance",
                assignedTeam: (warr && warr.assignedInstaller) ? {
                    name: warr.assignedInstaller.name,
                    initials: "CV",
                    role: warr.assignedInstaller.role,
                    phone: warr.assignedInstaller.phone,
                    note: "Assigned project lead for installation craftsmanship and warranty support."
                } : null,
                milestones: []
            },

            // Support Context
            support: {
                hasSupport: true,
                leadTechnician: (warr && warr.assignedInstaller && warr.assignedInstaller.name) || "Carlos Villanueva",
                leadPhone: (warr && warr.assignedInstaller && warr.assignedInstaller.phone) || "+63 917 555 0101",
                leadContact: (warr && warr.assignedInstaller && warr.assignedInstaller.phone) || "+63 917 555 0101",
                tickets: []
            }
        };
    }

    /**
     * DataLoader API
     */
    const DataLoader = {
        fetchJson,

        loadAccounts: () => fetchJson("accounts.json"),
        loadSystems: () => fetchJson("systems.json"),
        loadTelemetry: () => fetchJson("telemetry.json"),
        loadPayments: () => fetchJson("payments.json"),
        loadSavings: () => fetchJson("savings.json"),
        loadEquipment: () => fetchJson("equipment.json"),
        loadWarranties: () => fetchJson("warranties.json"),
        loadFaqs: () => fetchJson("faqs.json"),

        /**
         * Loads all modular JSON files and builds comprehensive portal datasets.
         * Returns { customer, packages, faqs }
         */
        async loadAll() {
            // Check for user-defined custom dataset in localStorage first (persisted editability)
            const storedCustom = localStorage.getItem("hello_solar_customer_custom_dataset");
            if (storedCustom) {
                try {
                    const parsed = JSON.parse(storedCustom);
                    if (parsed && Array.isArray(parsed.packages) && parsed.packages.length > 0) {
                        return {
                            customer: parsed.customer || null,
                            packages: parsed.packages,
                            faqs: parsed.faqs || []
                        };
                    }
                } catch (e) {
                    console.warn("[DataLoader] Failed to parse custom stored dataset:", e);
                }
            }

            // Fetch modular JSON files concurrently
            const [
                accountsRes,
                systemsRes,
                telemetryRes,
                paymentsRes,
                savingsRes,
                equipmentRes,
                warrantiesRes,
                faqsRes
            ] = await Promise.all([
                fetchJson("accounts.json"),
                fetchJson("systems.json"),
                fetchJson("telemetry.json"),
                fetchJson("payments.json"),
                fetchJson("savings.json"),
                fetchJson("equipment.json"),
                fetchJson("warranties.json"),
                fetchJson("faqs.json")
            ]);

            // If modular systems file is successfully loaded:
            if (Array.isArray(systemsRes) && systemsRes.length > 0) {
                const telemetryMap = new Map((Array.isArray(telemetryRes) ? telemetryRes : []).map(t => [t.systemId, t]));
                const paymentsMap = new Map((Array.isArray(paymentsRes) ? paymentsRes : []).map(p => [p.systemId, p]));
                const savingsMap = new Map((Array.isArray(savingsRes) ? savingsRes : []).map(s => [s.systemId, s]));
                const equipmentMap = new Map((Array.isArray(equipmentRes) ? equipmentRes : []).map(e => [e.systemId, e]));
                const warrantiesMap = new Map((Array.isArray(warrantiesRes) ? warrantiesRes : []).map(w => [w.systemId, w]));

                const assembledPackages = systemsRes
                    .map(sys => assemblePackage(sys, telemetryMap, paymentsMap, savingsMap, equipmentMap, warrantiesMap))
                    .filter(Boolean);

                // Select primary account for session customer profile
                const primaryAccount = Array.isArray(accountsRes) && accountsRes.length > 0
                    ? accountsRes[0]
                    : null;

                return {
                    customer: primaryAccount,
                    packages: assembledPackages,
                    faqs: Array.isArray(faqsRes) ? faqsRes : []
                };
            }

            // Fallback to legacy customer.json if modular files failed (e.g. offline / CORS)
            const legacyData = await fetchJson("customer.json");
            if (legacyData && Array.isArray(legacyData.packages) && legacyData.packages.length > 0) {
                return {
                    customer: legacyData.customer || null,
                    packages: legacyData.packages,
                    faqs: legacyData.faqs || []
                };
            }

            // Return null so consumer knows to rely on in-memory defaults
            return null;
        }
    };

    // Expose to window namespace
    window.HelloSolarDataLoader = DataLoader;

})(typeof window !== "undefined" ? window : this);
