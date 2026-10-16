# DailySpend — Daily Expense Tracking & Budget Management System

A modern, fully functional, responsive frontend web application built using **React**, **Vite**, **React Router**, and **Browser Local Storage**. Developed as a college-level frontend project demonstrating state management, responsive UI design, modular component architecture, and client-side data persistence.

---

## 📌 Abstract

Managing personal finances is a crucial life skill, yet many students and young professionals struggle to maintain consistent records of daily expenditures and monthly savings. **DailySpend** is a web-based personal finance management system designed to empower users to manually record income and expenses, establish category-specific monthly spending limits, monitor budget utilization via real-time progress indicators, and generate tabular financial summaries. Operating completely client-side without external server dependencies, DailySpend provides instantaneous responsiveness, total privacy through browser-level isolation, and persistence across sessions using browser Local Storage.

---

## ❗ Problem Statement

Modern individuals often experience financial stress caused by untracked micro-spending, unmonitored recurring expenses, and lack of budgeting discipline. While enterprise banking applications exist, they frequently suffer from complex interfaces, intrusive advertisements, privacy concerns over bank account aggregation, and reliance on remote servers. There is a need for a lightweight, transparent, accessible, and responsive daily spending tracker that allows individuals to deliberately record their cash flows, analyze category distributions numerically, and adhere to self-imposed monthly budgets without third-party data tracking.

---

## 🎯 Project Objectives

1. **Manual Financial Logging:** Provide an intuitive, validated interface for entering daily income and expenses categorized by purpose (Salary, Freelance, Food, Travel, Bills, etc.).
2. **Budget Adherence & Early Warnings:** Enable users to define overall and category-wise spending limits for any given month, calculating real consumption and providing visual alert warnings before or when budgets are exceeded.
3. **Multi-Criteria Transaction Inspection:** Offer multi-faceted searching, filtering by type/category/month, and four-way sorting to inspect past financial events.
4. **Purely Numerical Financial Analytics:** Supply structured tabular summaries, period-over-period comparisons, and downloadable CSV reports without relying on heavy chart libraries or fabricated numbers.
5. **Robust Account Isolation:** Provide client-side demo authentication that ensures multiple user profiles registered in the same browser have strictly separated financial datasets and preferences.
6. **Modern, Accessible, and Responsive Design:** Deliver a clean dashboard with desktop sidebar, mobile drawer, light/dark theme toggles, and Indian Rupee (₹) currency localization.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Library** | React 19 | Component-driven architecture using functional components and hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`) |
| **Build Tool & Bundler** | Vite 8 | Ultra-fast development server with Hot Module Replacement (HMR) and optimized rollup production bundling |
| **Routing** | React Router DOM v7 | Declarative client-side routing, protected navigation guards, and public redirects |
| **State Persistence** | Browser Local Storage | Client-side persistent key-value store maintaining user-scoped datasets |
| **Iconography** | Lucide React | Minimalist, accessible vector icons for finance and dashboard navigation |
| **Styling & Theme** | CSS3 & Custom Variables | Responsive CSS design system with light/dark theme tokens, cards, modals, and progress bars |
| **Data Export** | Native Blob & CSV API | Pure client-side CSV spreadsheet generation and automatic browser download |

> **Note on Constraints:** In strict adherence to project requirements, **no chart libraries (such as Recharts or Chart.js)**, **no external backends (Firebase, Node servers, databases)**, and **no AI/paid APIs** are used. Budget utilization is visualized strictly through semantic progress bars.

---

## 📂 Project Folder Structure

```text
Project DailySpend/
├── public/
├── src/
│   ├── components/
│   │   ├── BudgetCard.jsx           # Monthly budget card with progress bar & alerts
│   │   ├── DeleteConfirmModal.jsx   # Accessible confirmation dialog modal
│   │   ├── EmptyState.jsx           # Clean zero-state fallback graphics & actions
│   │   ├── Navbar.jsx               # Top header with mobile hamburger & theme toggle
│   │   ├── Sidebar.jsx              # Responsive navigation sidebar & user info
│   │   ├── SummaryCard.jsx          # KPI cards (Income, Expense, Balance, Savings)
│   │   ├── Toast.jsx                # Toast feedback notification toast container
│   │   ├── TransactionForm.jsx      # Validated manual income/expense input form
│   │   └── TransactionModal.jsx     # Modal wrapper for editing transactions
│   ├── context/
│   │   ├── AuthContext.jsx          # Authentication state, login, signup, session
│   │   └── FinanceContext.jsx       # Financial state, CRUD actions, live computations
│   ├── layouts/
│   │   └── MainLayout.jsx           # App layout wrapper with sidebar, nav, and body
│   ├── pages/
│   │   ├── AddTransaction.jsx       # Dedicated page to record new transactions
│   │   ├── Budget.jsx               # Monthly overall & category budget management
│   │   ├── Dashboard.jsx            # KPI summary cards, month summary, recent activity
│   │   ├── Login.jsx                # Login page with validation and disclaimer
│   │   ├── Reports.jsx              # Tabular summaries, breakdowns, and CSV export
│   │   ├── Settings.jsx             # Profile, password, currency, theme, data reset
│   │   ├── Signup.jsx               # Account registration with duplicate prevention
│   │   └── TransactionHistory.jsx   # Filterable, searchable, sortable ledger
│   ├── styles/
│   │   └── index.css                # Global stylesheet, CSS tokens, light/dark themes
│   ├── utils/
│   │   ├── exportCsv.js             # Client-side CSV generation & download utility
│   │   ├── formatters.js            # Currency (₹, $, €, £), date, and category helpers
│   │   └── storage.js               # Safe Local Storage read/write with user isolation
│   ├── App.jsx                      # Route definitions, guards, and context nesting
│   └── main.jsx                     # Application entry point and DOM mounting
├── .gitignore                       # Git ignore rules for node_modules and builds
├── index.html                       # HTML5 template with Google Fonts & metadata
├── package.json                     # Project dependencies and script definitions
└── README.md                        # Comprehensive project documentation
```

---

## 🚀 Modules Implemented

### 1. Authentication Module (`Login.jsx`, `Signup.jsx`, `AuthContext.jsx`)
- Client-side demo account registration with full name, email, and password.
- Form validation rejecting empty fields, malformed emails, and short passwords (< 6 chars).
- Password and confirm password matching checks.
- Duplicate email prevention across registered accounts.
- Password visibility toggle (Show/Hide).
- Persistent user session in Local Storage.
- Route protection redirecting unauthenticated visitors to `/login`.

### 2. Dashboard Module (`Dashboard.jsx`)
- **Four Primary Metric Cards:**
  1. **Total Income:** Sum of all manual income records.
  2. **Total Expenses:** Sum of all manual expense records.
  3. **Current Balance:** Total Income − Total Expenses.
  4. **Total Savings:** Net accumulated balance.
- **Current Month Overview:** Income, expenses, and net surplus for the ongoing month.
- **Monthly Budget Snapshot:** Live progress bar displaying current month's spending vs. budget limit.
- **Recent Activity Ledger:** Last 5 transactions with color-coded type badges, edit/delete actions.
- **Clean Zero States:** Helpful initial prompt when no transactions exist. No fabricated data.

### 3. Add & Edit Transaction Module (`AddTransaction.jsx`, `TransactionForm.jsx`)
- Manual transaction recording for both **Income** and **Expense** flows.
- Dynamic category selection based on transaction type:
  - *Income Categories:* Salary, Allowance, Scholarship, Freelance, Other.
  - *Expense Categories:* Food, Travel, Shopping, Education, Bills, Entertainment, Healthcare, Other.
- Numerical validation ensuring amount is greater than zero ($> 0$).
- Date picker defaulting to current date with optional descriptive notes.
- In-place modal editing of existing transactions without leaving the page.
- Immediate update to dashboard figures and budget limits upon saving.

### 4. Transaction History Module (`TransactionHistory.jsx`)
- Complete historical ledger presented in a clean table format.
- Real-time text search across transaction titles and optional notes.
- Multi-dimensional filters:
  - Filter by type (All / Income Only / Expense Only).
  - Filter by category (Food, Travel, Bills, etc.).
  - Filter by specific calendar month.
- Four-way sorting: Newest First, Oldest First, Highest Amount, Lowest Amount.
- Clear Filters reset action.
- Actionable Delete Confirmation dialog preventing accidental data loss.
- **CSV Export:** Generates and downloads a `.csv` file containing filtered records.

### 5. Monthly Budget Management Module (`Budget.jsx`, `BudgetCard.jsx`)
- Set overall monthly spending budget limits.
- Set category-specific monthly spending limits (e.g., Food: ₹6,000, Travel: ₹2,000).
- Month picker to plan and review budgets across any historical or upcoming month.
- Dynamic computation of actual spending derived strictly from manual expense entries.
- Three-stage visual progress bars:
  - 🟢 **Safe (< 75%):** Spending within comfortable limits.
  - 🟡 **Warning (75% – 99%):** Spending approaching budget ceiling.
  - 🔴 **Danger (≥ 100%):** Budget exceeded, displaying warning alert with overspend amount.
- Edit and delete options for each budget item.

### 6. Reports & Financial Summary Module (`Reports.jsx`)
- **Strictly Tabular & Numerical:** Absolutely zero chart or graph libraries.
- Month selector for period-specific reporting.
- High-level metric highlights: Total Income, Total Expenses, Net Surplus/Deficit, Highest Single Expense.
- **Category-wise Expense Breakdown Table:** Category, transaction count, total spent, and share percentage (%).
- **Category-wise Income Breakdown Table:** Source, transaction count, total earned, and share percentage (%).
- **Multi-Month Comparison Table:** Historical review of all recorded months with savings rates.
- **Export Report to CSV:** Exports the period summary and itemized records to an official CSV report file.

### 7. Profile & Settings Module (`Settings.jsx`)
- Profile information display with live full name editing.
- Local password update facility requiring confirmation of current password.
- Currency preference selector with instant formatting updates:
  - Indian Rupee (`INR ₹`) — Default
  - US Dollar (`USD $`)
  - Euro (`EUR €`)
  - British Pound (`GBP £`)
- Theme preference switch: **Light Mode** and **Dark Mode**.
- Account data management:
  - **Clear All Transactions:** Clears all transaction history for the logged-in user with confirmation.
  - **Delete Account:** Completely erases user profile, transactions, budgets, and settings.
- Explicit Educational Disclaimer concerning client-side Local Storage persistence.

---

## 🔒 Local Storage Architecture & Data Isolation

To prevent data contamination when multiple users register on the same computer, DailySpend utilizes a strictly scoped key namespace:

```text
LocalStorage Keys:
├── dailyspend_users              -> Array of all registered user credentials & metadata
├── dailyspend_session            -> Current active session { userId, name, email }
├── dailyspend_transactions_{id}  -> User-specific manual transaction array
├── dailyspend_budgets_{id}       -> User-specific monthly budget array
└── dailyspend_settings_{id}      -> User-specific preferences (currency, theme)
```

- Each user's data is partitioned by their unique `user_{timestamp}_{random}` ID.
- Logging in as User A guarantees zero visibility or leakage of User B's records.
- Logging out clears only the active session token; transaction data remains safely persisted for subsequent logins.

---

## ⚠️ Security Disclaimer & Limitations

> [!WARNING]
> **Educational Demonstration Notice:**
> DailySpend is developed as an educational frontend web application. User authentication and financial transactions are stored entirely in unencrypted client-side browser Local Storage.
> - Do not enter real-world bank credentials, production passwords, or sensitive financial information.
> - Local Storage is bound to the specific browser and machine used; clearing browser cache or running in Incognito mode will reset or remove stored records.

---

## 💻 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or later recommended; tested on v24)
- npm (Node Package Manager)

### Step 1: Clone or Navigate to the Workspace
```bash
git clone <repository-url>
cd "Project DailySpend"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` (or the URL shown in the terminal).

### Step 4: Build for Production
To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🧪 Verification & Testing Checklist

The system was verified against all 20 quality requirements:

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| 1 | User Registration | Valid details create account and store in Local Storage | ✅ Passed |
| 2 | Duplicate Email Prevention | Rejects duplicate email registration with clear message | ✅ Passed |
| 3 | Demo User Login | Authenticates correct credentials and redirects to Dashboard | ✅ Passed |
| 4 | Invalid Credentials | Rejects incorrect password or unknown email | ✅ Passed |
| 5 | Logout | Destroys active session without deleting saved records | ✅ Passed |
| 6 | Add Income Transaction | Records income with positive amount, updates balance | ✅ Passed |
| 7 | Add Expense Transaction | Records expense with positive amount, updates balance | ✅ Passed |
| 8 | Amount Validation | Rejects $\le 0$, non-numeric, or missing amounts | ✅ Passed |
| 9 | Dashboard Computations | Income, Expense, Balance, and Savings calculate accurately | ✅ Passed |
| 10 | Browser Refresh Persistence | All records and settings remain intact after page reload | ✅ Passed |
| 11 | Edit & Delete Transactions | In-place modal edit and delete with confirmation dialog | ✅ Passed |
| 12 | Search, Filter & Sort | Works simultaneously across text, category, month, and sorting | ✅ Passed |
| 13 | Monthly Budget Calculation | Computes spent amount strictly from actual month expenses | ✅ Passed |
| 14 | Budget Warnings | Progress bar switches to amber at 75% and red banner at 100% | ✅ Passed |
| 15 | Numerical Reports | Displays exact category breakdowns and highest expense | ✅ Passed |
| 16 | Account Data Isolation | User A cannot view, modify, or delete User B's records | ✅ Passed |
| 17 | Empty State Displays | Displays clean zero-state messages when no records exist | ✅ Passed |
| 18 | Navigation Links & Buttons | All sidebar, header, form, modal, and action buttons work | ✅ Passed |
| 19 | Responsive Layout | Fluid sidebar/drawer and responsive tables on desktop & mobile | ✅ Passed |
| 20 | Zero Chart Libraries | Strictly no charts, graphs, or canvas elements used | ✅ Passed |

---

## 📷 Screenshots Guide

When submitting for project evaluation or hosting on GitHub, capture screenshots of the running application and place them in an `assets/screenshots/` folder:

1. **Dashboard Overview:** `assets/screenshots/dashboard.png` (Showing 4 KPI cards and recent entries)
2. **Transaction History & Filters:** `assets/screenshots/transactions.png` (Showing search, filters, and table)
3. **Monthly Budget Management:** `assets/screenshots/budget.png` (Showing progress bars and alerts)
4. **Financial Reports:** `assets/screenshots/reports.png` (Showing category and monthly summary tables)
5. **Dark Mode Interface:** `assets/screenshots/dark_mode.png` (Showing sleek dark theme)

---

## 📤 Uploading to GitHub

Follow these steps to upload this project to your GitHub account:

```bash
# 1. Initialize git in the project root (if not already initialized)
git init

# 2. Stage all project files (node_modules is excluded by .gitignore)
git add .

# 3. Create your initial commit
git commit -m "feat: complete DailySpend expense tracking and budget management system"

# 4. Set the main branch
git branch -M main

# 5. Add your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/your-username/DailySpend.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 Repository Link Placeholder

- **GitHub Repository:** `https://github.com/your-username/DailySpend`
- **Developer:** Smruti Mohapatra
- **Project Type:** College Frontend Development Submission
- **License:** MIT License
