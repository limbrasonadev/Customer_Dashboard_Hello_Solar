# Hello Solar Customer Portal — Data Architecture Reference

This directory contains the sample dataset for the **Hello Solar Customer Portal**, organized by domain purpose to clearly communicate data contracts to backend developers and facilitate seamless API transition.

---

## 1. Directory Structure

```text
assets/data/
├── accounts.json          # Customer identity and preferences
├── systems.json           # Solar system packages linked to accounts
├── telemetry.json         # Real-time power flow and inverter telemetry snapshots
├── payments.json          # Financing terms, standing, and amortization schedules
├── savings.json           # Energy yield, savings estimates, generation curves, eco metrics
├── equipment.json         # Hardware specifications (PV panels, inverters, batteries)
├── warranties.json        # Warranty coverage terms, duration, and assigned installers
├── faqs.json              # Knowledge base frequently asked questions
├── notifications_seed.json# System & account notifications event feed
├── customer.json          # Consolidated legacy schema source for backwards compatibility
└── README.md              # This documentation file
```

---

## 2. File Specifications & Schema

### 2.1 `accounts.json`
* **Purpose**: Customer identity, contact details, and account-level payment settings.
* **Pages Using It**: All pages (via topbar and user profile modal), `login.html`, `signup.html`.
* **Primary Key**: `accountNo` (e.g., `"HS-88219"`).
* **Key Fields**:
  * `accountNo` *(string)*: Unique customer account ID.
  * `name` *(string)*: Full customer name.
  * `email` *(string)*: Registered email address.
  * `phone` *(string)*: Philippine mobile number (`+63 9xx...`).
  * `address` *(string)*: Installation / billing street address.
  * `role` *(string)*: Customer permission level (`"Solar Customer"`).
  * `preferredPayment` *(string)*: Default settlement channel (`"gcash"`, `"maya"`, `"bdo"`, `"card"`).
  * `paymentAccount` *(string)*: Settlement account or phone reference.
  * `avatarUrl` *(string|null)*: Base64 data URI or remote photo URL.
  * `linkedSystemIds` *(array of strings)*: System IDs associated with this customer.
* **Security Rule**: No passwords, tokens, or private credentials are stored in JSON.

---

### 2.2 `systems.json`
* **Purpose**: Master inventory of solar system packages linked to customer accounts.
* **Pages Using It**: `mysystem.html` (multi-system grid and switcher), `energy.html`, `payments.html`, `install-status.html`, `support.html`.
* **Primary Key**: `id` (e.g., `"pkg-home-5k4"`).
* **Foreign Key**: `accountNo` → references `accounts.json`.
* **Key Fields**:
  * `id` *(string)*: Unique stable system package identifier.
  * `accountNo` *(string)*: Linked customer service account.
  * `name` *(string)*: Friendly display title (e.g., `"Home Primary"`).
  * `shortLabel` *(string)*: Abbreviated label for selectors (e.g., `"Home — 5.4 kW"`).
  * `capacityKw` *(number)*: Peak DC nameplate capacity in kilowatts (`5.4`).
  * `location` *(string)*: Installation municipality/province.
  * `status` *(string)*: Operational status (`"Online · Normal"`, `"Setup Pending"`).
  * `systemType` *(string)*: System architecture category (`"Residential Hybrid"`).
  * `hasBattery` *(boolean)*: Whether battery storage hardware is installed.
  * `installationDate` *(string)*: ISO date (`"2025-03-15"`).

---

### 2.3 `telemetry.json`
* **Purpose**: Live inverter sensor snapshots and 5-node energy flow state.
* **Pages Using It**: `mysystem.html` (Live Telemetry section & animated power flow diagram), `energy.html`.
* **Foreign Key**: `systemId` → references `systems.json.id`.
* **Key Fields**:
  * `systemId` *(string)*: Target solar system ID.
  * `status` *(string)*: Connection health (`"live"`, `"pending"`, `"offline"`).
  * `lastUpdated` *(string)*: ISO 8601 UTC timestamp.
  * `solarKw` *(number)*: Current solar panel generation in kW (`3.85`).
  * `homeKw` *(number)*: Current household electricity draw in kW (`1.95`).
  * `batteryKw` *(number)*: Current battery charge (positive) / discharge (negative) in kW (`1.25`).
  * `batterySoc` *(number|null)*: Battery State of Charge percentage (`0`–`100`, or `null` if grid-tied only).
  * `pvStrings` *(string)*: String DC voltages (e.g., `"PV1: 342V · PV2: 338V"`).
  * `gridSync` *(string)*: Grid AC voltage and frequency (e.g., `"231.8 V · 60.0 Hz"`).
  * `inverterTempC` *(number|null)*: Inverter internal temperature in Celsius.
  * `gridStatus` *(string)*: Utility grid locking status.
  * `backupReady` *(boolean)*: Critical circuit emergency backup readiness.

---

### 2.4 `payments.json`
* **Purpose**: Amortization schedules, monthly installment status, and billing callouts.
* **Pages Using It**: `payments.html` (Billing history, amortization ledger, proof submission), `mysystem.html` (Payment Status compact summary button).
* **Foreign Key**: `systemId` → references `systems.json.id`.
* **Key Fields**:
  * `hasBills` *(boolean)*: `true` if active billing schedule exists; `false` if pending commissioning.
  * `planTerm` *(string)*: Financing arrangement (e.g., `"5-Year Lease-to-Own"`).
  * `totalInstallments` *(number)*: Total contracted months (`60`).
  * `standing` *(string)*: Customer credit standing (`"Good"`, `"Due Soon"`, `"Overdue"`, `"Pending Billing"`).
  * `currency` *(string)*: Currency code (`"PHP"`).
  * `monthlyInstallmentAmount` *(number)*: Monthly payment amount (`9067`).
  * `schedule` *(array)*: Installment records:
    * `id` *(string)*: Bill reference ID (e.g., `"bill-88219-05"`).
    * `period` *(string)*: Billing period label (e.g., `"May 2026"`).
    * `dueDate` *(string)*: ISO date (`"2026-05-01"`).
    * `amount` *(number)*: Numeric amount in PHP (`9067`).
    * `status` *(string)*: Settlement status (`"Paid"`, `"Due Soon"`, `"Upcoming"`, `"Overdue"`).
    * `receiptId` *(string|null)*: Official receipt number if paid.

---

### 2.5 `savings.json`
* **Purpose**: Solar production metrics, historical generation curves, and bill savings estimates.
* **Pages Using It**: `mysystem.html` (Estimated Savings button), `energy.html`.
* **Foreign Key**: `systemId` → references `systems.json.id`.
* **Key Fields**:
  * `todayGeneratedKwh` *(number)*: Energy generated today in kWh (`7.1`).
  * `estimatedMonthlySavings` *(number)*: Estimated monthly utility bill savings in PHP (`3650`).
  * `batteryReserveKwh` *(number|null)*: Usable battery storage in kWh (`10.0` or `null`).
  * `backupHours` *(number|null)*: Estimated backup duration under critical load (`18`).
  * `chart` *(object)*: Production curves for `today`, `week`, and `month`:
    * `values` *(array of numbers)*: Generation values in kWh.
    * `labels` *(array of strings)*: Time interval labels.
  * `breakdownPercent` *(object)*: Self-consumption allocation (`solarDirect`, `batteryStorage`, `gridExport`).
  * `ecoImpact` *(object)*: `treesEquivalent` *(number)* and `co2AvoidedKg` *(number)*.

---

### 2.6 `equipment.json`
* **Purpose**: Detailed technical hardware specifications for panels, inverter, and battery reserve.
* **Pages Using It**: `energy.html` (Equipment Specs & Warranty page), `mysystem.html` (Hardware at a glance).
* **Foreign Key**: `systemId` → references `systems.json.id`.
* **Key Fields**:
  * `panels` *(object)*: `model`, `count`, `totalRatingKw`, `cellTechnology`, `layout`, `strings`.
  * `inverter` *(object)*: `model`, `serialNumber`, `type`, `ratedPowerKw`, `gridSync`, `cooling`.
  * `battery` *(object)*: `included` *(boolean)*, `model`, `capacityKwh`, `chemistry`, `usableCapacity`, `coupling`, `backupCapability`.

---

### 2.7 `warranties.json`
* **Purpose**: Warranty terms, equipment serial numbers, and certified installer assignments.
* **Pages Using It**: `energy.html` (Warranty Coverage section).
* **Foreign Key**: `systemId` → references `systems.json.id`.
* **Key Fields**:
  * `inverterSerial` *(string)*: Hardware serial number.
  * `assignedInstaller` *(object)*: `name`, `role`, `phone`.
  * `warranties` *(object)*: Coverage objects for `panels`, `inverter`, `battery`, and `workmanship`:
    * `termText` *(string)*: Formatted duration pill (e.g., `"25-Year Performance · 12-Year Product"`).
    * `warrantyYears` *(number)*: Numerical duration in years.
    * `summary` *(string)*: Clear coverage explanation.

---

### 2.8 `faqs.json`
* **Purpose**: Customer knowledge base questions and answers.
* **Pages Using It**: `support.html`.
* **Key Fields**:
  * `id` *(string)*: Unique FAQ identifier (`"faq-1"`).
  * `question` *(string)*: The inquiry heading.
  * `answer` *(string)*: The authoritative answer text.

---

## 3. Data Relationships Diagram

```
[accounts.json]
   accountNo (PK)
       │
       │ 1:N
       ▼
[systems.json] ──────────── id (PK) / accountNo (FK)
                               │
       ┌───────────────────────┼───────────────────────┬───────────────────────┐
       ▼                       ▼                       ▼                       ▼
[telemetry.json]        [payments.json]         [savings.json]         [equipment.json]
systemId (FK)           systemId (FK)           systemId (FK)          systemId (FK)
                                                                               │
                                                                               ▼
                                                                       [warranties.json]
                                                                       systemId (FK)
```

---

## 4. Shared Data Loading & Future API Integration

Data loading is isolated in [assets/js/data-loader.js](file:///c:/Users/Jboii/Desktop/Hello%20Solar/Hello_Solar_Customer/assets/js/data-loader.js) under the `window.HelloSolarDataLoader` namespace.

### How it Works Today:
1. When served over HTTP/HTTPS, `HelloSolarDataLoader.loadAll()` loads these JSON files via native `fetch()`.
2. Loaded entities are assembled and enriched into active packages.
3. If local filesystem `file:///` restrictions prevent fetching, the loader falls back gracefully to built-in default structures.
4. User mutations in `localStorage` (`hello_solar_user`, active package preference, payment proofs) are preserved non-destructively and are never overwritten by static defaults.

### Future Backend API Connection Points:
When transitioning to a live backend REST or GraphQL service, backend engineers can simply update the data-loading layer in `assets/js/data-loader.js` without touching HTML layouts or CSS:

| Resource | Current JSON Path | Recommended Backend API Route |
|---|---|---|
| Customer Accounts | `assets/data/accounts.json` | `GET /api/v1/customer/profile` |
| Solar Systems | `assets/data/systems.json` | `GET /api/v1/customer/systems` |
| Live Telemetry | `assets/data/telemetry.json` | `GET /api/v1/systems/:id/telemetry` or WebSocket |
| Billing & Payments | `assets/data/payments.json` | `GET /api/v1/systems/:id/payments` |
| Energy & Savings | `assets/data/savings.json` | `GET /api/v1/systems/:id/savings` |
| Equipment Specs | `assets/data/equipment.json` | `GET /api/v1/systems/:id/equipment` |
| Warranties | `assets/data/warranties.json` | `GET /api/v1/systems/:id/warranties` |
| Support FAQs | `assets/data/faqs.json` | `GET /api/v1/support/faqs` |
