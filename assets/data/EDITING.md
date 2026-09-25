# Customer Portal Data Reference (`customer.json`)

This document details the schema, allowed values, referential relationships, and reload workflow for `assets/data/customer.json`, the authoritative data source for the **Hello Solar Customer Portal**.

---

## 1. Overview & File Location

- **File Path**: `assets/data/customer.json`
- **Format**: Standard UTF-8 JSON
- **Role**: Authoritative data source for the customer profile, linked multi-system packages, real-time telemetry snapshots, generation curves, payment schedules, milestone timelines, and shared FAQs.
- **Dynamic Aggregations**: KPI summary metrics (total paid, paid installments count, remaining balance, savings estimates, milestone completion percentages) are **dynamically computed** in JavaScript from individual records—never hardcoded.

---

## 2. Schema Structure & Sections

### 2.1 `customer` (Object)
Customer account identity and payment preference context.

| Field | Type | Description / Constraints | Example |
|---|---|---|---|
| `name` | string | Full customer name | `"Juan Dela Cruz"` |
| `email` | string | Registered account email | `"juan.delacruz@hellosolar.ph"` |
| `phone` | string | Contact phone/mobile number | `"+63 917 555 0199"` |
| `accountNo` | string | Primary Hello Solar customer account ID | `"HS-88219"` |
| `address` | string | Customer residential or business address | `"142 Solar Crest Way, Quezon City"` |
| `preferredPayment` | string | Preferred settlement channel (`"gcash"`, `"maya"`, `"bdo"`) | `"gcash"` |
| `paymentAccount` | string | Masked mobile or account number | `"+63 917 555 0199"` |

> [!NOTE]
> Passwords and sensitive personal credentials are never stored in public JSON.

---

### 2.2 `packages` (Array of Objects)
Solar system packages linked to the authenticated customer. Multiple systems of the same capacity or model are differentiated by unique, stable `id` and `accountNo` identifiers.

| Field | Type | Required | Description / Constraints |
|---|---|---|---|
| `id` | string | Yes | Unique package ID (e.g. `"pkg-home-5k4"`). |
| `name` | string | Yes | System display title (e.g. `"Home Primary"`). |
| `shortLabel` | string | Yes | Compact label for selectors (e.g. `"Home — 5.4 kW"`). |
| `capacity` | string | Yes | Peak system capacity in kilowatts (`kW`). |
| `location` | string | Yes | City or site location identifier. |
| `accountNo` | string | Yes | Service account or contract ID (e.g. `"HS-88219"`). |
| `status` | string | Yes | Operational status (`"Online · Normal"`, `"Setup Pending"`, `"Maintenance"`). |
| `systemType` | string | Yes | System architecture (e.g. `"Residential Hybrid"`, `"Commercial Grid-Tied (Battery Not Included)"`). |
| `hasBattery` | boolean | Yes | `true` if battery storage is included; `false` if standard grid-tied. |
| `panelsCount` | number | Yes | Total installed PV modules. |
| `panelsModel` | string | Yes | PV panel manufacturer and wattage. |
| `inverterModel` | string | Yes | Inverter brand and rated power. |
| `batteryCapacity` | string | Yes | Nominal storage capacity or `"None (Grid-Tie Architecture)"`. |
| `inverterSerial` | string | Yes | Equipment hardware serial number. |
| `telemetry` | object / null | No | Live inverter metrics snapshot (or `null` if setup pending). |
| `energy` | object | Yes | Generation curves, battery metrics, and environmental impact. |
| `payments` | object | Yes | Financing terms, amortization schedule, and receipts. |
| `install` | object | Yes | 5-milestone progression timeline, dates, and crew lead. |
| `support` | object | Yes | System-specific support tickets and lead technician contact. |

---

### 2.3 Solar & Energy Conventions

- **Power**: Expressed in **kilowatts (`kW`)**.
- **Energy**: Expressed in **kilowatt-hours (`kWh`)**.
- **Battery & Backup**:
  - If `hasBattery: false`, the UI displays **"Battery not included"** and does not show false battery percentages or backup readiness.
  - If `hasBattery: true`, backup readiness reflects actual battery State of Charge (`batterySoc`) and configuration.

---

### 2.4 `faqs` (Array of Objects)
Shared customer knowledge base answers. Kept separate from system-specific records.

---

## 3. Reloading Changes & Offline Handling

1. **Local HTTP / Static Hosting**:
   When served over HTTP/HTTPS, `portal.js` automatically loads `assets/data/customer.json` using `fetch()`.
2. **Direct `file:///` Access**:
   When opened directly from a local filesystem where CORS restricts local JSON fetches, `portal.js` falls back safely to its embedded baseline dataset and allows loading custom JSON files via the user settings modal.
# Installer acceptance on dashboard model cards

Set `installerAcceptanceStatus` on each model in `systems.json` (or each package
in a custom dataset / legacy `customer.json`) to `"pending"` or `"accepted"`.
Pending, missing, and unknown values show an orange Pending badge beneath the
activation badge and block opening the model card with mouse, keyboard, or a live
details URL. Accepted models retain the existing activation and live-details flow.
Acceptance is independent of telemetry, installer assignment, and activation.
Newly linked accounts start pending. An installer/backend integration must supply
the accepted value and reload the dataset; customers cannot grant acceptance.

