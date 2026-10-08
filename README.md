# 💰 FinTrack — Personal Finance Dashboard

[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)](#tech-stack)
[![Visualizations](https://img.shields.io/badge/Charts-Chart.js%20v4-success)](#interactive-charts--visualizations)
[![Storage](https://img.shields.io/badge/Storage-Client--Side%20LocalStorage-orange)](#data-storage--privacy)
[![License](https://img.shields.io/badge/License-MIT-purple)](#license)

**FinTrack** is a modern, high-performance personal finance dashboard application engineered with pure Vanilla web technologies. It empowers users to monitor their cashflow, analyze spending patterns with interactive visual charts, set monthly budget limits, and manage daily transactions with bank-grade privacy.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security Portal
- **Split-Screen Showcase**: Executive presentation with real-time analytics badges, client-side encryption assurances, and live volume metrics.
- **Tabbed Authentication**: Seamless switching between **Sign In** and **Create Account**.
- **⚡ One-Click Demo Access**: Instant access to an active demo account pre-populated with realistic finances.
- **Password Strength Analyzer**: Real-time password evaluation meter (*Too Short*, *Weak*, *Good*, *Strong*).
- **Show / Hide Password**: Interactive toggle with SVG eye icon.
- **Session Persistence**: Configurable "Remember Me" session tracking via `localStorage` and `sessionStorage`.
- **Multi-Location Sign Out**: Direct logout controls available in:
  - Sidebar user footer pill
  - Header profile dropdown menu
  - Settings view under **Account & Security**

### 📊 2. Financial Overview & Analytics
- **Live Metric Cards**: Total Balance, Total Income, Total Expenses, and Net Savings with automatic month-over-month calculation.
- **Interactive Visualizations (Chart.js)**:
  - **Income vs. Expense Breakdown**: Donut chart with category shares.
  - **Monthly Cashflow Trend**: Multi-month comparative bar & line charts.
  - **Dynamic Theme Synchronization**: Charts automatically adapt their palettes to Light and Dark modes.

### 💳 3. Transaction Management Ledger
- **Full CRUD Support**: Add, Edit, and Delete transactions.
- **Multi-Category Tagging**: Salary, Freelance, Food & Dining, Shopping, Housing, Utilities, Transportation, Entertainment, Health, and Education.
- **Advanced Filtering & Search**:
  - Real-time text search by description or note.
  - Filter by transaction type (Income / Expense).
  - Filter by category and timeframe (This Month, Last 30 Days, This Year).
  - Sort by Date (newest/oldest) and Amount (highest/lowest).

### 🎯 4. Smart Monthly Budgeting
- **Monthly Target Settings**: Set and modify overall spending limits.
- **Visual Utilization Bar**: Color-coded progress bar with automated alert states (normal, warning at 80%, critical when exceeding limit).
- **Quick-Set Budget Modal**: Convenient shortcut button right on the dashboard.

### 🌗 5. Design System & User Preferences
- **Dark & Light Mode**: Seamless theme toggling with zero flash of unstyled content.
- **Personalized Header & Profile**: Displays user initials, custom display name, and dynamic time-of-day greeting (*"Good morning, Sabari Balaji 👋"*).
- **Toast Notifications**: Non-intrusive feedback toasts for all user actions (added, updated, deleted, theme changed).

---

## 📁 Project Structure

The project follows a clean **3-file architecture**:

```
FinTrack/
├── index.html       # Single-page HTML structure (Login portal & Dashboard shell)
├── style.css        # Complete CSS design system, themes, and animations
├── script.js        # Core JavaScript application logic, state, and Chart.js integration
└── README.md        # Project documentation
```

### File Breakdown:
- **`index.html`**: Contains the semantic markup for the login portal (`#authScreen`), mobile sidebar, top header, all view panels (Dashboard, Transactions, Analytics, Categories, Settings), transaction modals, and notification containers.
- **`style.css`**: Defines CSS design tokens, HSL color palettes, responsive typography (Plus Jakarta Sans), layout grids, glassmorphism effects, theme variables, and mobile media queries.
- **`script.js`**: Controls authentication state, local database seeding, CRUD operations, Chart.js instances, budget calculations, and view routing.

---

## 🚀 Getting Started

### Prerequisites
FinTrack requires **no build tools, bundlers, or package managers** (zero `npm install` needed). It runs directly in any modern web browser.

### Running Locally

#### Method 1: Direct File Launch
Double-click `index.html` to open it in your browser (Chrome, Edge, Safari, Firefox).

#### Method 2: Local HTTP Server (Recommended)
Using Python:
```bash
# Navigate to the FinTrack directory
cd FinTrack

# Start a local HTTP server
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

---

## 🔑 Demo Login Credentials

You can test the application with pre-configured demo credentials or click the instant button:

| Field | Demo Credential |
| :--- | :--- |
| **Email** | `demo@fintrack.app` |
| **Password** | `password123` |
| **Instant** | Click **⚡ One-Click Demo Access** on the sign-in card |

> You can also click **Create Account** to register a new user profile with your own name and email.

---

## 🛡️ Data Storage & Privacy

- All user profiles, authentication sessions, transactions, budgets, and theme preferences are stored **locally** in your browser via the `localStorage` API.
- **100% Client-Side**: No sensitive financial figures or credentials are transmitted to any external server or third-party service.
- You can reset sample data or clear all transactions at any time inside the **Settings** view under **Data Management**.

---

## 🛠️ Tech Stack

- **Markup**: HTML5 (Semantic, Accessible ARIA standards)
- **Styling**: Vanilla CSS3 (Custom Properties, Flexbox, CSS Grid, Glassmorphism)
- **Scripting**: Modern Vanilla JavaScript (ES6+ Modules, async state, event delegation)
- **Charts**: [Chart.js](https://www.chartjs.org/) via CDN
- **Fonts**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
