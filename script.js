/**
 * FinTrack — Personal Finance Dashboard
 * Core Application Logic (Vanilla JavaScript)
 * Production Quality, Fully Reactive, Zero Backend Required
 */

'use strict';

// =============================================================================
// 1. Category Definitions & Icons Map
// =============================================================================
const CATEGORIES = {
  Salary: { icon: '💼', color: '#10b981', defaultType: 'income' },
  Freelance: { icon: '💻', color: '#06b6d4', defaultType: 'income' },
  Food: { icon: '🍔', color: '#f59e0b', defaultType: 'expense' },
  Shopping: { icon: '🛍️', color: '#ec4899', defaultType: 'expense' },
  Travel: { icon: '✈️', color: '#3b82f6', defaultType: 'expense' },
  Bills: { icon: '💡', color: '#8b5cf6', defaultType: 'expense' },
  Entertainment: { icon: '🎬', color: '#f43f5e', defaultType: 'expense' },
  Health: { icon: '💊', color: '#14b8a6', defaultType: 'expense' },
  Education: { icon: '📚', color: '#6366f1', defaultType: 'expense' },
  Other: { icon: '📦', color: '#64748b', defaultType: 'expense' }
};

// Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'fintrack_transactions',
  BUDGET: 'fintrack_budget',
  THEME: 'fintrack_theme',
  USER: 'fintrack_user',
  NOTIFICATIONS: 'fintrack_notifications',
  AUTH_SESSION: 'fintrack_auth_session',
  USERS_DB: 'fintrack_users_db'
};

// Default registered demo accounts
const DEFAULT_USERS_DB = [
  {
    name: 'Sabari Balaji',
    email: 'demo@fintrack.app',
    password: 'password123',
    role: 'Premium Member'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'Pro Member'
  }
];

// Initial Sample Data (Applied only if localStorage is completely empty)
const SAMPLE_TRANSACTIONS = [
  {
    id: 'tx_sample_1',
    description: 'Monthly Salary Credit',
    amount: 50000,
    type: 'income',
    category: 'Salary',
    date: getRelativeDate(0),
    note: 'Tech Corp direct deposit'
  },
  {
    id: 'tx_sample_2',
    description: 'Freelance Design Sprint',
    amount: 15000,
    type: 'income',
    category: 'Freelance',
    date: getRelativeDate(-2),
    note: 'Landing page design milestone'
  },
  {
    id: 'tx_sample_3',
    description: 'Gourmet Dinner & Bistro',
    amount: 450,
    type: 'expense',
    category: 'Food',
    date: getRelativeDate(0),
    note: 'Team dinner'
  },
  {
    id: 'tx_sample_4',
    description: 'Sneakers & Running Gear',
    amount: 2500,
    type: 'expense',
    category: 'Shopping',
    date: getRelativeDate(-1),
    note: 'Weekend outlet shopping'
  },
  {
    id: 'tx_sample_5',
    description: 'Fiber Internet & Utilities',
    amount: 999,
    type: 'expense',
    category: 'Bills',
    date: getRelativeDate(-3),
    note: 'Broadband monthly bill'
  },
  {
    id: 'tx_sample_6',
    description: 'Flight Booking to Goa',
    amount: 4200,
    type: 'expense',
    category: 'Travel',
    date: getRelativeDate(-5),
    note: 'Vacation tickets'
  },
  {
    id: 'tx_sample_7',
    description: 'Health Insurance & Vitamins',
    amount: 1200,
    type: 'expense',
    category: 'Health',
    date: getRelativeDate(-6),
    note: 'Annual checkup'
  },
  {
    id: 'tx_sample_8',
    description: 'Online Course & Books',
    amount: 850,
    type: 'expense',
    category: 'Education',
    date: getRelativeDate(-8),
    note: 'System Design mastery'
  }
];

// Helper to format ISO YYYY-MM-DD dates relative to today
function getRelativeDate(dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

// =============================================================================
// 2. Application State
// =============================================================================
const state = {
  transactions: [],
  budget: 50000,
  theme: 'light',
  user: { name: 'John Doe' },
  notifications: [],
  activeView: 'dashboard',
  filters: {
    search: '',
    type: 'all',
    timeframe: 'all',
    category: 'all',
    sort: 'date-desc'
  },
  charts: {
    overviewDonut: null,
    categoryDonut: null,
    incomeVsExpense: null
  },
  deleteCandidateId: null
};

// =============================================================================
// 3. LocalStorage Helpers
// =============================================================================
function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (raw === null) {
    // Fresh install: seed sample data without overwriting
    saveTransactions(SAMPLE_TRANSACTIONS);
    return [...SAMPLE_TRANSACTIONS];
  }
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    console.error('Failed to parse transactions from localStorage', e);
    return [];
  }
}

function saveTransactions(data) {
  state.transactions = data;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data));
}

function loadBudget() {
  const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
  if (raw === null) {
    saveBudget(50000);
    return 50000;
  }
  const val = parseFloat(raw);
  return isNaN(val) ? 50000 : val;
}

function saveBudget(amount) {
  state.budget = amount;
  localStorage.setItem(STORAGE_KEYS.BUDGET, amount.toString());
}

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved) return saved;
  // Fallback to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function saveTheme(theme) {
  state.theme = theme;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  document.body.setAttribute('data-theme', theme);
  updateThemeToggleLabels();
  // Refresh chart themes
  updateAllCharts();
}

// User & Authentication Helpers
function getUsersDB() {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(DEFAULT_USERS_DB));
  return DEFAULT_USERS_DB;
}

function saveUsersDB(users) {
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
}

function getAuthSession() {
  const local = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  const session = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (session) {
    try {
      return JSON.parse(session);
    } catch (e) {}
  }
  return null;
}

function setAuthSession(sessionData, remember = true) {
  const data = JSON.stringify(sessionData);
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, data);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, data);
  }
}

function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

function loadUser() {
  const session = getAuthSession();
  if (session && session.user) {
    return session.user;
  }
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return { name: 'Sabari Balaji', email: 'demo@fintrack.app', role: 'Premium Member' };
}

function saveUser(user) {
  state.user = { ...state.user, ...user };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
  const session = getAuthSession();
  if (session && session.user) {
    session.user = { ...session.user, ...user };
    const remember = Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_SESSION));
    setAuthSession(session, remember);
  }
  updateUserProfileDisplay();
}

function checkAuthState() {
  const session = getAuthSession();
  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');

  if (session && session.user) {
    state.user = session.user;
    if (authScreen) authScreen.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    updateUserProfileDisplay();
    updateHeader();
    return true;
  } else {
    if (authScreen) authScreen.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
    return false;
  }
}

function performLogin(user, remember = true) {
  const sessionData = {
    user: {
      name: user.name || 'FinTrack User',
      email: user.email || 'demo@fintrack.app',
      role: user.role || 'Member'
    },
    loginTime: new Date().toISOString()
  };
  setAuthSession(sessionData, remember);
  state.user = sessionData.user;
  saveUser(state.user);

  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');

  if (authScreen) authScreen.classList.add('hidden');
  if (appContainer) appContainer.classList.remove('hidden');

  updateUserProfileDisplay();
  updateHeader();
  refreshAll();
  renderNotifications();
  showToast(`Welcome back, ${state.user.name}!`, 'success');
}

function performLogout() {
  clearAuthSession();
  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');

  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown) profileDropdown.classList.remove('show');

  if (appContainer) appContainer.classList.add('hidden');
  if (authScreen) {
    authScreen.classList.remove('hidden');
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) loginPassword.value = '';
    hideAuthAlert();
  }
  showToast('Signed out successfully.', 'info');
}

function showAuthAlert(message) {
  const alertEl = document.getElementById('authAlert');
  const textEl = document.getElementById('authAlertText');
  if (alertEl && textEl) {
    textEl.textContent = message;
    alertEl.classList.remove('hidden');
  }
}

function hideAuthAlert() {
  const alertEl = document.getElementById('authAlert');
  if (alertEl) alertEl.classList.add('hidden');
}

function loadNotifications() {
  const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return [
    { id: '1', message: 'Welcome to FinTrack dashboard!', time: 'Just now', unread: true },
    { id: '2', message: 'Sample financial accounts initialized.', time: '1m ago', unread: true }
  ];
}

function saveNotifications(notifs) {
  state.notifications = notifs;
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  renderNotifications();
}

function addNotification(message) {
  const newNotif = {
    id: Date.now().toString(),
    message,
    time: 'Just now',
    unread: true
  };
  state.notifications.unshift(newNotif);
  if (state.notifications.length > 15) state.notifications.pop();
  saveNotifications(state.notifications);
}

// =============================================================================
// 4. Formatting Utilities
// =============================================================================
function formatCurrency(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return dateStr;
}

function getRelativeDateLabel(dateStr) {
  const todayStr = getRelativeDate(0);
  const yesterdayStr = getRelativeDate(-1);
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return formatDate(dateStr);
}

// =============================================================================
// 5. Calculations Engine
// =============================================================================
function calculateTotals(transactions = state.transactions) {
  let income = 0;
  let expenses = 0;

  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    if (t.type === 'income') {
      income += amount;
    } else if (t.type === 'expense') {
      expenses += amount;
    }
  });

  const balance = income - expenses;
  const savings = Math.max(0, balance);
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

  return {
    income,
    expenses,
    balance,
    savings,
    savingsRate
  };
}

function calculateCategoryExpenses(transactions = state.transactions) {
  const categoryMap = {};
  
  // Initialize all known categories with 0
  Object.keys(CATEGORIES).forEach(cat => {
    categoryMap[cat] = 0;
  });

  transactions.forEach(t => {
    if (t.type === 'expense') {
      const amount = Number(t.amount) || 0;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
    }
  });

  return categoryMap;
}

function calculateMonthlyComparison(transactions = state.transactions) {
  // Aggregate by Month-Year for past 6 months
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Current month & 5 preceding months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyData[key] = { income: 0, expense: 0, monthIndex: d.getMonth(), year: d.getFullYear() };
  }

  transactions.forEach(t => {
    if (!t.date) return;
    const parts = t.date.split('-');
    if (parts.length < 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const key = `${monthNames[month]} ${year.toString().slice(-2)}`;
    
    if (monthlyData[key]) {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        monthlyData[key].income += amount;
      } else {
        monthlyData[key].expense += amount;
      }
    }
  });

  return monthlyData;
}

// =============================================================================
// 6. UI Renderers
// =============================================================================

// Update Header Details
function updateHeader() {
  const now = new Date();
  const hours = now.getHours();
  let greetingTime = 'morning';
  if (hours >= 12 && hours < 17) greetingTime = 'afternoon';
  else if (hours >= 17) greetingTime = 'evening';

  const greetingEl = document.getElementById('greetingText');
  if (greetingEl) {
    const name = state.user.name || 'User';
    greetingEl.textContent = `Good ${greetingTime}, ${name} 👋`;
  }

  const dateBadgeEl = document.getElementById('currentDateBadge');
  if (dateBadgeEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateBadgeEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

// Update User Profile Displays
function updateUserProfileDisplay() {
  const name = state.user.name || 'John Doe';
  const email = state.user.email || 'demo@fintrack.app';
  const role = state.user.role || 'Premium Member';

  const sidebarName = document.getElementById('sidebarUserName');
  if (sidebarName) sidebarName.textContent = name;

  const sidebarRole = document.getElementById('sidebarUserRole');
  if (sidebarRole) sidebarRole.textContent = email;

  // Compute initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'U';

  const sidebarAvatar = document.getElementById('sidebarUserAvatar');
  if (sidebarAvatar) sidebarAvatar.textContent = initials;

  const headerAvatar = document.querySelector('.header-avatar-initials');
  if (headerAvatar) headerAvatar.textContent = initials;

  const dropdownName = document.getElementById('dropdownUserName');
  if (dropdownName) dropdownName.textContent = name;

  const dropdownEmail = document.getElementById('dropdownUserEmail');
  if (dropdownEmail) dropdownEmail.textContent = email;

  const settingsEmail = document.getElementById('settingsUserEmailDisplay');
  if (settingsEmail) settingsEmail.textContent = email;

  const profileInput = document.getElementById('settingsUserNameInput');
  if (profileInput) profileInput.value = name;
}

// Update Top Metric Summary Cards
function renderSummaryCards() {
  const totals = calculateTotals();

  // 1. Total Balance
  const balanceEl = document.getElementById('totalBalanceAmount');
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(totals.balance);
    if (totals.balance < 0) {
      balanceEl.classList.add('text-expense');
    } else {
      balanceEl.classList.remove('text-expense');
    }
  }

  // 2. Total Income
  const incomeEl = document.getElementById('totalIncomeAmount');
  if (incomeEl) incomeEl.textContent = formatCurrency(totals.income);

  // 3. Total Expenses
  const expensesEl = document.getElementById('totalExpensesAmount');
  if (expensesEl) expensesEl.textContent = formatCurrency(totals.expenses);

  // 4. Savings
  const savingsEl = document.getElementById('savingsAmount');
  if (savingsEl) savingsEl.textContent = formatCurrency(totals.savings);

  const savingsRateBadge = document.getElementById('savingsRateBadge');
  if (savingsRateBadge) {
    savingsRateBadge.textContent = `${totals.savingsRate}%`;
  }

  // Nav transactions count badge
  const navBadge = document.getElementById('transactionsCountBadge');
  if (navBadge) {
    navBadge.textContent = state.transactions.length.toString();
  }
}

// Update Monthly Budget Section
function renderBudgetSection() {
  const budget = state.budget;
  const totals = calculateTotals();
  const spent = totals.expenses;
  const remaining = Math.max(0, budget - spent);
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const cappedPercentage = Math.min(100, percentage);

  // Update labels
  const budgetLimitEl = document.getElementById('budgetLimitVal');
  if (budgetLimitEl) budgetLimitEl.textContent = formatCurrency(budget);

  const budgetSpentEl = document.getElementById('budgetSpentVal');
  if (budgetSpentEl) budgetSpentEl.textContent = formatCurrency(spent);

  const budgetRemEl = document.getElementById('budgetRemainingVal');
  if (budgetRemEl) {
    budgetRemEl.textContent = formatCurrency(remaining);
    if (spent > budget) {
      budgetRemEl.textContent = `-₹${(spent - budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      budgetRemEl.classList.remove('text-income');
      budgetRemEl.classList.add('text-expense');
    } else {
      budgetRemEl.classList.remove('text-expense');
      budgetRemEl.classList.add('text-income');
    }
  }

  // Status computation: Safe, Warning, Almost reached, Exceeded
  let statusClass = 'status-safe';
  let statusLabel = `Safe (${percentage.toFixed(0)}%)`;

  if (percentage >= 100) {
    statusClass = 'status-exceeded';
    statusLabel = `Exceeded (${percentage.toFixed(0)}%)`;
  } else if (percentage >= 80) {
    statusClass = 'status-almost';
    statusLabel = `Almost Reached (${percentage.toFixed(0)}%)`;
  } else if (percentage >= 60) {
    statusClass = 'status-warning';
    statusLabel = `Warning (${percentage.toFixed(0)}%)`;
  }

  const progressBar = document.getElementById('budgetProgressBar');
  if (progressBar) {
    progressBar.style.width = `${cappedPercentage}%`;
    progressBar.className = `budget-progress-bar ${statusClass}`;
  }

  const statusPill = document.getElementById('budgetStatusPill');
  if (statusPill) {
    statusPill.textContent = statusLabel;
    statusPill.className = `budget-status-pill ${statusClass}`;
  }

  const pctText = document.getElementById('budgetPercentageText');
  if (pctText) {
    pctText.textContent = `${percentage.toFixed(1)}% of budget used`;
  }

  // Settings input synchronization
  const settingsInput = document.getElementById('settingsBudgetInput');
  if (settingsInput) settingsInput.value = budget;
  
  const quickInput = document.getElementById('quickBudgetInput');
  if (quickInput) quickInput.value = budget;
}

// Render Recent 5 Transactions on Dashboard
function renderRecentTransactions() {
  const container = document.getElementById('recentTxnsList');
  if (!container) return;

  // Sort by date newest
  const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="padding: 24px;">
        <span style="font-size: 2rem;">💳</span>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">No transactions recorded yet.</p>
        <button class="btn btn-primary btn-sm" onclick="openAddTransactionModal()" style="margin-top: 10px;">
          Add Transaction
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(t => {
    const cat = CATEGORIES[t.category] || CATEGORIES.Other;
    const isIncome = t.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-income' : 'text-expense';

    return `
      <div class="recent-txn-row">
        <div class="recent-txn-left">
          <div class="category-emoji-box" title="${t.category}">
            ${cat.icon}
          </div>
          <div class="recent-txn-info">
            <span class="recent-txn-desc">${escapeHtml(t.description)}</span>
            <span class="recent-txn-meta">${t.category} &bull; ${getRelativeDateLabel(t.date)}</span>
          </div>
        </div>
        <div class="recent-txn-amount ${amountClass}">
          ${sign}${formatCurrency(t.amount)}
        </div>
      </div>
    `;
  }).join('');
}

// Render Main Transactions Table & Mobile Cards
function renderTransactionsLedger() {
  const tableBody = document.getElementById('transactionsTableBody');
  const mobileList = document.getElementById('mobileTransactionsList');
  const emptyState = document.getElementById('transactionsEmptyState');
  const resultsCount = document.getElementById('resultsCountText');
  const filteredIncomeText = document.getElementById('filteredIncomeText');
  const filteredExpenseText = document.getElementById('filteredExpenseText');

  if (!tableBody || !mobileList) return;

  const filtered = getFilteredTransactions();

  // Subtotals
  const totals = calculateTotals(filtered);
  if (resultsCount) {
    resultsCount.textContent = `Showing ${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`;
  }
  if (filteredIncomeText) filteredIncomeText.textContent = formatCurrency(totals.income);
  if (filteredExpenseText) filteredExpenseText.textContent = formatCurrency(totals.expenses);

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    mobileList.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  // Desktop Table Rows
  tableBody.innerHTML = filtered.map(t => {
    const cat = CATEGORIES[t.category] || CATEGORIES.Other;
    const isIncome = t.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-income' : 'text-expense';
    const typeBadgeClass = isIncome ? 'income' : 'expense';

    return `
      <tr data-id="${t.id}">
        <td>
          <div class="txn-col-main">
            <div class="category-emoji-box" style="width: 36px; height: 36px; font-size: 1.1rem;">
              ${cat.icon}
            </div>
            <div class="txn-col-info">
              <span class="txn-description">${escapeHtml(t.description)}</span>
              ${t.note ? `<span class="txn-note">${escapeHtml(t.note)}</span>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="category-pill">
            <span>${cat.icon}</span>
            <span>${t.category}</span>
          </span>
        </td>
        <td class="text-muted" style="font-size: 0.85rem;">
          ${formatDate(t.date)}
        </td>
        <td>
          <span class="type-pill ${typeBadgeClass}">
            ${t.type}
          </span>
        </td>
        <td class="text-right">
          <span class="txn-amount-val ${amountClass}">
            ${sign}${formatCurrency(t.amount)}
          </span>
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="action-icon-btn edit-btn" onclick="openEditModal('${t.id}')" title="Edit transaction" aria-label="Edit transaction">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button class="action-icon-btn delete-btn" onclick="openDeleteModal('${t.id}')" title="Delete transaction" aria-label="Delete transaction">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Mobile Cards
  mobileList.innerHTML = filtered.map(t => {
    const cat = CATEGORIES[t.category] || CATEGORIES.Other;
    const isIncome = t.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-income' : 'text-expense';

    return `
      <div class="mobile-txn-card" data-id="${t.id}">
        <div class="mobile-txn-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="category-emoji-box" style="width: 36px; height: 36px; font-size: 1.1rem;">
              ${cat.icon}
            </div>
            <div>
              <span class="txn-description" style="display: block;">${escapeHtml(t.description)}</span>
              <span class="category-pill" style="margin-top: 4px; padding: 2px 8px; font-size: 0.72rem;">
                ${t.category}
              </span>
            </div>
          </div>
          <div class="txn-amount-val ${amountClass}">
            ${sign}${formatCurrency(t.amount)}
          </div>
        </div>

        ${t.note ? `<div class="txn-note" style="padding: 4px 8px; background: var(--bg-card); border-radius: 4px;">${escapeHtml(t.note)}</div>` : ''}

        <div class="mobile-txn-footer">
          <span class="text-muted" style="font-size: 0.78rem;">${formatDate(t.date)}</span>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick="openEditModal('${t.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${t.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Get Filtered & Sorted Transactions
function getFilteredTransactions() {
  let list = [...state.transactions];
  const { search, type, timeframe, category, sort } = state.filters;

  // Search filter (description & category)
  if (search.trim() !== '') {
    const q = search.trim().toLowerCase();
    list = list.filter(t => 
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q))
    );
  }

  // Type filter
  if (type !== 'all') {
    list = list.filter(t => t.type === type);
  }

  // Category filter
  if (category !== 'all') {
    list = list.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  // Timeframe filter
  if (timeframe !== 'all') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeframe === 'today') {
      const todayStr = getRelativeDate(0);
      list = list.filter(t => t.date === todayStr);
    } else if (timeframe === 'week') {
      // Within last 7 days
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      list = list.filter(t => {
        const d = new Date(t.date);
        return d >= sevenDaysAgo && d <= new Date();
      });
    } else if (timeframe === 'month') {
      // Same month & year
      const curYear = today.getFullYear();
      const curMonth = today.getMonth();
      list = list.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      });
    }
  }

  // Sorting
  list.sort((a, b) => {
    if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sort === 'amount-desc') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    if (sort === 'amount-asc') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
    return 0;
  });

  return list;
}

// Render Analytics View
function renderAnalyticsView() {
  const totals = calculateTotals();
  const catExpenses = calculateCategoryExpenses();

  // Top Category
  let topCat = '—';
  let topCatAmount = 0;
  Object.entries(catExpenses).forEach(([cat, amt]) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCat = cat;
    }
  });

  const topCatEl = document.getElementById('analyticsTopCategory');
  if (topCatEl) topCatEl.textContent = topCat;

  const topCatAmtEl = document.getElementById('analyticsTopCategoryAmount');
  if (topCatAmtEl) topCatAmtEl.textContent = `${formatCurrency(topCatAmount)} spent`;

  // Average Transaction
  const avgTxnEl = document.getElementById('analyticsAvgTxn');
  if (avgTxnEl) {
    const count = state.transactions.length;
    const avg = count > 0 ? (totals.income + totals.expenses) / count : 0;
    avgTxnEl.textContent = formatCurrency(avg);
  }

  // Savings rate
  const savRateEl = document.getElementById('analyticsSavingsRate');
  if (savRateEl) savRateEl.textContent = `${totals.savingsRate}%`;

  // Count
  const countEl = document.getElementById('analyticsTotalCount');
  if (countEl) countEl.textContent = state.transactions.length.toString();

  // Category Breakdown Details list
  const catDetails = document.getElementById('categoryBreakdownDetails');
  if (catDetails) {
    const entries = Object.entries(catExpenses)
      .filter(([_, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      catDetails.innerHTML = '<p class="text-muted" style="text-align:center; padding:12px;">No expense data available.</p>';
    } else {
      catDetails.innerHTML = entries.map(([cat, amt]) => {
        const catInfo = CATEGORIES[cat] || CATEGORIES.Other;
        const pct = totals.expenses > 0 ? ((amt / totals.expenses) * 100).toFixed(1) : 0;
        return `
          <div class="cat-breakdown-row">
            <div class="cat-breakdown-left">
              <span>${catInfo.icon}</span>
              <span>${cat}</span>
              <span class="cat-breakdown-percent">(${pct}%)</span>
            </div>
            <div class="cat-breakdown-amount text-expense">
              ${formatCurrency(amt)}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Cash flow summary strip
  const cashFlowEl = document.getElementById('cashFlowSummaryBox');
  if (cashFlowEl) {
    cashFlowEl.innerHTML = `
      <div>
        <div class="text-muted" style="font-size: 0.78rem;">Total Inflow</div>
        <div class="text-income" style="font-weight: 700; font-size: 1.1rem;">+${formatCurrency(totals.income)}</div>
      </div>
      <div>
        <div class="text-muted" style="font-size: 0.78rem;">Total Outflow</div>
        <div class="text-expense" style="font-weight: 700; font-size: 1.1rem;">-${formatCurrency(totals.expenses)}</div>
      </div>
      <div>
        <div class="text-muted" style="font-size: 0.78rem;">Net Cash Position</div>
        <div style="font-weight: 700; font-size: 1.1rem; color: ${totals.balance >= 0 ? 'var(--income)' : 'var(--expense)'};">
          ${totals.balance >= 0 ? '+' : ''}${formatCurrency(totals.balance)}
        </div>
      </div>
    `;
  }
}

// Render Categories Grid Page
function renderCategoriesPage() {
  const container = document.getElementById('categoriesCardsGrid');
  if (!container) return;

  const catExpenses = calculateCategoryExpenses();
  const totals = calculateTotals();
  const maxSpend = Math.max(...Object.values(catExpenses), 1);

  container.innerHTML = Object.entries(CATEGORIES).map(([catName, info]) => {
    const spent = catExpenses[catName] || 0;
    // Count transactions in this category
    const count = state.transactions.filter(t => t.category === catName).length;
    const barPct = Math.min(100, (spent / maxSpend) * 100);

    return `
      <div class="category-overview-card">
        <div class="cat-card-header">
          <div class="cat-icon-badge">${info.icon}</div>
          <span class="cat-card-count">${count} transaction${count === 1 ? '' : 's'}</span>
        </div>
        <div>
          <h4 class="cat-card-title">${catName}</h4>
          <span class="cat-card-total ${spent > 0 ? 'text-expense' : 'text-muted'}">${formatCurrency(spent)}</span>
        </div>
        <div class="cat-card-bar-wrap">
          <div class="cat-card-bar" style="width: ${barPct}%; background-color: ${info.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Notifications
function renderNotifications() {
  const listEl = document.getElementById('notificationsList');
  const badgeEl = document.getElementById('notifBadge');
  if (!listEl) return;

  const unreadCount = state.notifications.filter(n => n.unread).length;
  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.classList.add('has-unread');
    } else {
      badgeEl.classList.remove('has-unread');
    }
  }

  if (state.notifications.length === 0) {
    listEl.innerHTML = '<p class="text-muted" style="text-align: center; padding: 12px; font-size: 0.82rem;">No notifications.</p>';
    return;
  }

  listEl.innerHTML = state.notifications.map(n => `
    <div class="notif-item">
      <div style="font-size: 1.1rem;">🔔</div>
      <div>
        <p style="color: var(--text-main); font-weight: 500;">${escapeHtml(n.message)}</p>
        <span class="notif-time">${n.time}</span>
      </div>
    </div>
  `).join('');
}

// =============================================================================
// 7. Interactive Chart.js Initializers & Updaters
// =============================================================================
function isDarkMode() {
  return document.body.getAttribute('data-theme') === 'dark';
}

function getChartColors() {
  const dark = isDarkMode();
  return {
    textColor: dark ? '#94a3b8' : '#64748b',
    gridColor: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    tooltipBg: dark ? '#1e293b' : '#0f172a'
  };
}

function updateOverviewDonutChart() {
  const canvas = document.getElementById('overviewDonutChart');
  const emptyPlaceholder = document.getElementById('overviewChartEmptyState');
  if (!canvas || typeof Chart === 'undefined') return;

  const catExpenses = calculateCategoryExpenses();
  const labels = [];
  const data = [];
  const colors = [];

  Object.entries(catExpenses).forEach(([cat, amt]) => {
    if (amt > 0) {
      labels.push(cat);
      data.push(amt);
      colors.push(CATEGORIES[cat] ? CATEGORIES[cat].color : '#6366f1');
    }
  });

  if (data.length === 0) {
    canvas.classList.add('hidden');
    if (emptyPlaceholder) emptyPlaceholder.classList.remove('hidden');
    if (state.charts.overviewDonut) {
      state.charts.overviewDonut.destroy();
      state.charts.overviewDonut = null;
    }
    return;
  }

  canvas.classList.remove('hidden');
  if (emptyPlaceholder) emptyPlaceholder.classList.add('hidden');

  const { textColor } = getChartColors();

  if (state.charts.overviewDonut) {
    state.charts.overviewDonut.data.labels = labels;
    state.charts.overviewDonut.data.datasets[0].data = data;
    state.charts.overviewDonut.data.datasets[0].backgroundColor = colors;
    state.charts.overviewDonut.options.plugins.legend.labels.color = textColor;
    state.charts.overviewDonut.update();
  } else {
    state.charts.overviewDonut = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
            }
          }
        },
        cutout: '72%'
      }
    });
  }
}

function updateAnalyticsCharts() {
  const catCanvas = document.getElementById('categoryExpenseChart');
  const compCanvas = document.getElementById('incomeVsExpenseChart');
  if (typeof Chart === 'undefined') return;

  const { textColor, gridColor } = getChartColors();

  // 1. Detailed Category Doughnut
  if (catCanvas) {
    const catExpenses = calculateCategoryExpenses();
    const labels = [];
    const data = [];
    const colors = [];

    Object.entries(catExpenses).forEach(([cat, amt]) => {
      if (amt > 0) {
        labels.push(cat);
        data.push(amt);
        colors.push(CATEGORIES[cat] ? CATEGORIES[cat].color : '#6366f1');
      }
    });

    if (state.charts.categoryDonut) {
      state.charts.categoryDonut.data.labels = labels;
      state.charts.categoryDonut.data.datasets[0].data = data;
      state.charts.categoryDonut.data.datasets[0].backgroundColor = colors;
      state.charts.categoryDonut.options.plugins.legend.labels.color = textColor;
      state.charts.categoryDonut.update();
    } else {
      state.charts.categoryDonut = new Chart(catCanvas, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 10,
                color: textColor,
                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
              }
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
              }
            }
          }
        }
      });
    }
  }

  // 2. Income vs Expense Bar Chart
  if (compCanvas) {
    const monthlyData = calculateMonthlyComparison();
    const labels = Object.keys(monthlyData);
    const incomeData = labels.map(k => monthlyData[k].income);
    const expenseData = labels.map(k => monthlyData[k].expense);

    if (state.charts.incomeVsExpense) {
      state.charts.incomeVsExpense.data.labels = labels;
      state.charts.incomeVsExpense.data.datasets[0].data = incomeData;
      state.charts.incomeVsExpense.data.datasets[1].data = expenseData;
      state.charts.incomeVsExpense.options.scales.x.ticks.color = textColor;
      state.charts.incomeVsExpense.options.scales.x.grid.color = gridColor;
      state.charts.incomeVsExpense.options.scales.y.ticks.color = textColor;
      state.charts.incomeVsExpense.options.scales.y.grid.color = gridColor;
      state.charts.incomeVsExpense.options.plugins.legend.labels.color = textColor;
      state.charts.incomeVsExpense.update();
    } else {
      state.charts.incomeVsExpense = new Chart(compCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Income',
              data: incomeData,
              backgroundColor: '#10b981',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Expenses',
              data: expenseData,
              backgroundColor: '#ef4444',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                color: textColor,
                font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
              }
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: val => '₹' + val.toLocaleString('en-IN')
              }
            }
          }
        }
      });
    }
  }
}

function updateAllCharts() {
  updateOverviewDonutChart();
  updateAnalyticsCharts();
}

// Refresh all UI elements reactively
function refreshAll() {
  updateHeader();
  renderSummaryCards();
  renderBudgetSection();
  renderRecentTransactions();
  renderTransactionsLedger();
  renderAnalyticsView();
  renderCategoriesPage();
  updateAllCharts();
}

// =============================================================================
// 8. Navigation & View Routing
// =============================================================================
function switchView(viewName) {
  state.activeView = viewName;

  // Update navigation button active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Switch view containers
  const viewMap = {
    dashboard: 'viewDashboard',
    transactions: 'viewTransactions',
    analytics: 'viewAnalytics',
    categories: 'viewCategories',
    settings: 'viewSettings'
  };

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetId = viewMap[viewName];
  if (targetId) {
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.classList.add('active');
  }

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update charts if switching to analytics or dashboard
  setTimeout(() => {
    if (viewName === 'analytics' || viewName === 'dashboard') {
      updateAllCharts();
    }
  }, 100);
}

// Mobile Sidebar handlers
function openMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
}

// =============================================================================
// 9. Toast Notification System
// =============================================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '🔔'}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger smooth entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after 3.8 seconds
  const autoRemoveTimer = setTimeout(() => {
    dismissToast(toast);
  }, 3800);

  // Manual dismiss
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoRemoveTimer);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  toast.classList.remove('show');
  toast.style.opacity = '0';
  setTimeout(() => {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
  }, 300);
}

// =============================================================================
// 10. Modals Management (Add, Edit, Delete, Budget)
// =============================================================================
function openAddTransactionModal(presetType = 'expense') {
  const modal = document.getElementById('addTxnModal');
  const form = document.getElementById('addTxnForm');
  if (!modal || !form) return;

  form.reset();
  clearFormErrors('add');

  // Set default date to today
  document.getElementById('addTxnDate').value = getRelativeDate(0);

  // Select appropriate type radio
  const radios = form.querySelectorAll('input[name="addTxnType"]');
  radios.forEach(r => {
    r.checked = r.value === presetType;
  });

  modal.classList.add('active');
  document.getElementById('addTxnDesc').focus();
}

function closeAddTransactionModal() {
  const modal = document.getElementById('addTxnModal');
  if (modal) modal.classList.remove('active');
}

function openEditModal(txnId) {
  const t = state.transactions.find(x => x.id === txnId);
  if (!t) return;

  const modal = document.getElementById('editTxnModal');
  const form = document.getElementById('editTxnForm');
  if (!modal || !form) return;

  clearFormErrors('edit');

  document.getElementById('editTxnId').value = t.id;
  document.getElementById('editTxnDesc').value = t.description;
  document.getElementById('editTxnAmount').value = t.amount;
  document.getElementById('editTxnDate').value = t.date;
  document.getElementById('editTxnCategory').value = t.category;
  document.getElementById('editTxnNote').value = t.note || '';

  const radios = form.querySelectorAll('input[name="editTxnType"]');
  radios.forEach(r => {
    r.checked = r.value === t.type;
  });

  modal.classList.add('active');
  document.getElementById('editTxnDesc').focus();
}

function closeEditModal() {
  const modal = document.getElementById('editTxnModal');
  if (modal) modal.classList.remove('active');
}

function openDeleteModal(txnId) {
  const t = state.transactions.find(x => x.id === txnId);
  if (!t) return;

  state.deleteCandidateId = txnId;
  const modal = document.getElementById('deleteTxnModal');
  const targetInfo = document.getElementById('deleteTargetInfo');

  if (targetInfo) {
    const isIncome = t.type === 'income';
    targetInfo.innerHTML = `
      <div><strong>${escapeHtml(t.description)}</strong> (${t.category})</div>
      <div style="margin-top: 4px; color: ${isIncome ? 'var(--income)' : 'var(--expense)'}; font-size: 1.1rem; font-weight: 800;">
        ${isIncome ? '+' : '-'}${formatCurrency(t.amount)}
      </div>
      <div class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">Date: ${formatDate(t.date)}</div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
  state.deleteCandidateId = null;
  const modal = document.getElementById('deleteTxnModal');
  if (modal) modal.classList.remove('active');
}

function openSetBudgetModal() {
  const modal = document.getElementById('setBudgetModal');
  const input = document.getElementById('quickBudgetInput');
  if (input) input.value = state.budget;
  if (modal) modal.classList.add('active');
  if (input) input.focus();
}

function closeSetBudgetModal() {
  const modal = document.getElementById('setBudgetModal');
  if (modal) modal.classList.remove('active');
}

// Clear Validation Errors
function clearFormErrors(prefix) {
  const descErr = document.getElementById(`${prefix}DescError`);
  const amtErr = document.getElementById(`${prefix}AmountError`);
  const dateErr = document.getElementById(`${prefix}DateError`);
  const catErr = document.getElementById(`${prefix}CategoryError`);

  if (descErr) descErr.textContent = '';
  if (amtErr) amtErr.textContent = '';
  if (dateErr) dateErr.textContent = '';
  if (catErr) catErr.textContent = '';

  const form = document.getElementById(`${prefix}TxnForm`);
  if (form) {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }
}

// =============================================================================
// 11. Form Validation & Submissions
// =============================================================================

// Handle Add Transaction Submit
function handleAddTransactionSubmit(e) {
  e.preventDefault();
  clearFormErrors('add');

  const descInput = document.getElementById('addTxnDesc');
  const amountInput = document.getElementById('addTxnAmount');
  const dateInput = document.getElementById('addTxnDate');
  const catSelect = document.getElementById('addTxnCategory');
  const noteInput = document.getElementById('addTxnNote');
  const typeRadio = document.querySelector('input[name="addTxnType"]:checked');

  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = catSelect.value;
  const note = noteInput.value.trim();
  const type = typeRadio ? typeRadio.value : 'expense';

  let hasError = false;

  if (!description) {
    document.getElementById('addDescError').textContent = 'Please provide a transaction description.';
    descInput.classList.add('is-invalid');
    hasError = true;
  }

  if (isNaN(amount) || amount <= 0) {
    document.getElementById('addAmountError').textContent = 'Please enter a valid positive amount.';
    amountInput.classList.add('is-invalid');
    hasError = true;
  }

  if (!date) {
    document.getElementById('addDateError').textContent = 'Please select a transaction date.';
    dateInput.classList.add('is-invalid');
    hasError = true;
  }

  if (!category) {
    document.getElementById('addCategoryError').textContent = 'Please select a valid category.';
    catSelect.classList.add('is-invalid');
    hasError = true;
  }

  if (hasError) return;

  const newTxn = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    description,
    amount,
    type,
    category,
    date,
    note
  };

  state.transactions.unshift(newTxn);
  saveTransactions(state.transactions);

  closeAddTransactionModal();
  refreshAll();
  showToast('Transaction added successfully.', 'success');
  addNotification(`Added transaction "${description}" (${formatCurrency(amount)})`);
}

// Handle Edit Transaction Submit
function handleEditTransactionSubmit(e) {
  e.preventDefault();
  clearFormErrors('edit');

  const id = document.getElementById('editTxnId').value;
  const descInput = document.getElementById('editTxnDesc');
  const amountInput = document.getElementById('editTxnAmount');
  const dateInput = document.getElementById('editTxnDate');
  const catSelect = document.getElementById('editTxnCategory');
  const noteInput = document.getElementById('editTxnNote');
  const typeRadio = document.querySelector('input[name="editTxnType"]:checked');

  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = catSelect.value;
  const note = noteInput.value.trim();
  const type = typeRadio ? typeRadio.value : 'expense';

  let hasError = false;

  if (!description) {
    document.getElementById('editDescError').textContent = 'Please provide a transaction description.';
    descInput.classList.add('is-invalid');
    hasError = true;
  }

  if (isNaN(amount) || amount <= 0) {
    document.getElementById('editAmountError').textContent = 'Please enter a valid positive amount.';
    amountInput.classList.add('is-invalid');
    hasError = true;
  }

  if (!date) {
    document.getElementById('editDateError').textContent = 'Please select a date.';
    dateInput.classList.add('is-invalid');
    hasError = true;
  }

  if (!category) {
    document.getElementById('editCategoryError').textContent = 'Please select a category.';
    catSelect.classList.add('is-invalid');
    hasError = true;
  }

  if (hasError) return;

  const index = state.transactions.findIndex(x => x.id === id);
  if (index !== -1) {
    state.transactions[index] = {
      ...state.transactions[index],
      description,
      amount,
      type,
      category,
      date,
      note
    };
    saveTransactions(state.transactions);
    closeEditModal();
    refreshAll();
    showToast('Transaction updated successfully.', 'success');
    addNotification(`Updated transaction "${description}"`);
  }
}

// Confirm Delete Transaction
function handleConfirmDelete() {
  if (!state.deleteCandidateId) return;

  const target = state.transactions.find(x => x.id === state.deleteCandidateId);
  const desc = target ? target.description : 'item';

  state.transactions = state.transactions.filter(x => x.id !== state.deleteCandidateId);
  saveTransactions(state.transactions);

  closeDeleteModal();
  refreshAll();
  showToast('Transaction deleted.', 'warning');
  addNotification(`Deleted transaction "${desc}"`);
}

// Budget Form Submission
function handleSaveBudget(amount) {
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid budget amount.', 'error');
    return;
  }
  saveBudget(amount);
  renderBudgetSection();
  showToast('Budget updated successfully.', 'success');
  addNotification(`Monthly budget adjusted to ${formatCurrency(amount)}`);
}

// =============================================================================
// 12. Theme Switching Logic
// =============================================================================
function toggleTheme() {
  const newTheme = state.theme === 'dark' ? 'light' : 'dark';
  saveTheme(newTheme);
  showToast(`Switched to ${newTheme} mode.`, 'info');
}

function updateThemeToggleLabels() {
  const isDark = state.theme === 'dark';
  const label = document.getElementById('themeLabelText');
  if (label) {
    label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  }
}

// =============================================================================
// 13. Security / Helper Sanitizers
// =============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// =============================================================================
// 14. Event Listeners Setup
// =============================================================================
function attachEventListeners() {
  // Navigation tabs
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (view) switchView(view);
    });
  });

  // Logo returns to dashboard
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('dashboard');
    });
  }

  // Mobile sidebar controls
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileSidebar);

  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileSidebar);

  const backdrop = document.getElementById('sidebarBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

  // Theme toggles
  const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');
  if (sidebarThemeToggle) sidebarThemeToggle.addEventListener('click', toggleTheme);

  const headerThemeToggle = document.getElementById('headerThemeToggle');
  if (headerThemeToggle) headerThemeToggle.addEventListener('click', toggleTheme);

  // Notifications dropdown toggle
  const notifBtn = document.getElementById('notificationBtn');
  const notifDropdown = document.getElementById('notificationsDropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
      // Mark as read
      state.notifications.forEach(n => n.unread = false);
      saveNotifications(state.notifications);
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('active');
      }
    });
  }

  const clearNotifsBtn = document.getElementById('clearNotifsBtn');
  if (clearNotifsBtn) {
    clearNotifsBtn.addEventListener('click', () => {
      saveNotifications([]);
      showToast('Notifications cleared.', 'info');
    });
  }

  // Header Add Transaction button
  const headerAddBtn = document.getElementById('headerAddTxnBtn');
  if (headerAddBtn) {
    headerAddBtn.addEventListener('click', () => openAddTransactionModal('expense'));
  }

  const txnPageAddBtn = document.getElementById('txnPageAddBtn');
  if (txnPageAddBtn) {
    txnPageAddBtn.addEventListener('click', () => openAddTransactionModal('expense'));
  }

  const emptyAddBtn = document.getElementById('emptyAddBtn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => openAddTransactionModal('expense'));
  }

  // Profile button in header toggles account dropdown
  const profileBtn = document.getElementById('headerProfileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    });

    const dropdownSettingsBtn = document.getElementById('dropdownSettingsBtn');
    if (dropdownSettingsBtn) {
      dropdownSettingsBtn.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        switchView('settings');
      });
    }

    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    if (dropdownLogoutBtn) {
      dropdownLogoutBtn.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        performLogout();
      });
    }
  }

  // Dashboard buttons
  const viewAllTxnsBtn = document.getElementById('viewAllTxnsBtn');
  if (viewAllTxnsBtn) {
    viewAllTxnsBtn.addEventListener('click', () => switchView('transactions'));
  }

  const viewFullAnalyticsBtn = document.getElementById('viewFullAnalyticsBtn');
  if (viewFullAnalyticsBtn) {
    viewFullAnalyticsBtn.addEventListener('click', () => switchView('analytics'));
  }

  // Quick Action Buttons
  const qaAddExpense = document.getElementById('qaAddExpense');
  if (qaAddExpense) qaAddExpense.addEventListener('click', () => openAddTransactionModal('expense'));

  const qaAddIncome = document.getElementById('qaAddIncome');
  if (qaAddIncome) qaAddIncome.addEventListener('click', () => openAddTransactionModal('income'));

  const qaSetBudget = document.getElementById('qaSetBudget');
  if (qaSetBudget) qaSetBudget.addEventListener('click', openSetBudgetModal);

  const editBudgetQuickBtn = document.getElementById('editBudgetQuickBtn');
  if (editBudgetQuickBtn) editBudgetQuickBtn.addEventListener('click', openSetBudgetModal);

  const qaViewAnalytics = document.getElementById('qaViewAnalytics');
  if (qaViewAnalytics) qaViewAnalytics.addEventListener('click', () => switchView('analytics'));

  // Modals close buttons
  const closeAddBtn = document.getElementById('closeAddTxnModalBtn');
  const cancelAddBtn = document.getElementById('cancelAddTxnBtn');
  if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddTransactionModal);
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddTransactionModal);

  const closeEditBtn = document.getElementById('closeEditTxnModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditTxnBtn');
  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  const cancelDeleteBtn = document.getElementById('cancelDeleteTxnBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteTxnBtn');
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  const closeBudgetBtn = document.getElementById('closeSetBudgetModalBtn');
  const cancelBudgetBtn = document.getElementById('cancelQuickBudgetBtn');
  if (closeBudgetBtn) closeBudgetBtn.addEventListener('click', closeSetBudgetModal);
  if (cancelBudgetBtn) cancelBudgetBtn.addEventListener('click', closeSetBudgetModal);

  // Close modals on clicking overlay backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });
      if (notifDropdown) notifDropdown.classList.remove('active');
      closeMobileSidebar();
    }
  });

  // Forms submissions
  const addForm = document.getElementById('addTxnForm');
  if (addForm) addForm.addEventListener('submit', handleAddTransactionSubmit);

  const editForm = document.getElementById('editTxnForm');
  if (editForm) editForm.addEventListener('submit', handleEditTransactionSubmit);

  const quickBudgetForm = document.getElementById('quickBudgetForm');
  if (quickBudgetForm) {
    quickBudgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(document.getElementById('quickBudgetInput').value);
      handleSaveBudget(val);
      closeSetBudgetModal();
    });
  }

  const settingsBudgetForm = document.getElementById('settingsBudgetForm');
  if (settingsBudgetForm) {
    settingsBudgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(document.getElementById('settingsBudgetInput').value);
      handleSaveBudget(val);
    });
  }

  const profileForm = document.getElementById('settingsProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('settingsUserNameInput').value.trim();
      if (newName) {
        saveUser({ name: newName });
        updateHeader();
        showToast('Profile name updated.', 'success');
      }
    });
  }

  // Data management settings actions
  const loadSampleBtn = document.getElementById('loadSampleDataBtn');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      saveTransactions(SAMPLE_TRANSACTIONS);
      saveBudget(50000);
      refreshAll();
      showToast('Sample data reset successfully.', 'success');
      addNotification('Sample data reloaded.');
    });
  }

  const clearAllBtn = document.getElementById('clearAllDataBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
        saveTransactions([]);
        refreshAll();
        showToast('All transaction records cleared.', 'warning');
        addNotification('All transactions cleared.');
      }
    });
  }

  // Transactions Page Search & Filter Controls
  const searchInput = document.getElementById('txnSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      if (clearSearchBtn) {
        if (e.target.value.length > 0) {
          clearSearchBtn.classList.remove('hidden');
        } else {
          clearSearchBtn.classList.add('hidden');
        }
      }
      renderTransactionsLedger();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.filters.search = '';
      clearSearchBtn.classList.add('hidden');
      renderTransactionsLedger();
    });
  }

  const typeFilter = document.getElementById('typeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      renderTransactionsLedger();
    });
  }

  const timeFilter = document.getElementById('timeFilter');
  if (timeFilter) {
    timeFilter.addEventListener('change', (e) => {
      state.filters.timeframe = e.target.value;
      renderTransactionsLedger();
    });
  }

  const catFilter = document.getElementById('categoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderTransactionsLedger();
    });
  }

  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      renderTransactionsLedger();
    });
  }

  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      state.filters = {
        search: '',
        type: 'all',
        timeframe: 'all',
        category: 'all',
        sort: 'date-desc'
      };
      if (searchInput) searchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
      if (typeFilter) typeFilter.value = 'all';
      if (timeFilter) timeFilter.value = 'all';
      if (catFilter) catFilter.value = 'all';
      if (sortFilter) sortFilter.value = 'date-desc';
      renderTransactionsLedger();
      showToast('Filters reset.', 'info');
    });
  }
}

// Expose openEditModal and openDeleteModal globally for inline table click handlers
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.openAddTransactionModal = openAddTransactionModal;

// =============================================================================
// 15. Application Bootstrapper
// =============================================================================
// 15. Authentication Event Listeners
// =============================================================================
function initAuthEventListeners() {
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotPassForm = document.getElementById('forgotPassForm');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  const authDivider = document.getElementById('authDivider');
  const demoAccessBox = document.getElementById('demoAccessBox');
  const socialLoginGrid = document.getElementById('socialLoginGrid');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const backToSignInBtn = document.getElementById('backToSignInBtn');
  const authAlertClose = document.getElementById('authAlertClose');
  const quickDemoLoginBtn = document.getElementById('quickDemoLoginBtn');
  const authThemeToggle = document.getElementById('authThemeToggle');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
  const settingsSwitchAccountBtn = document.getElementById('settingsSwitchAccountBtn');

  // Tab switching: Sign In
  if (tabSignIn && tabSignUp) {
    tabSignIn.addEventListener('click', () => {
      tabSignIn.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.classList.remove('active');
      tabSignUp.setAttribute('aria-selected', 'false');

      if (signInForm) signInForm.classList.remove('hidden');
      if (signUpForm) signUpForm.classList.add('hidden');
      if (forgotPassForm) forgotPassForm.classList.add('hidden');

      if (authDivider) authDivider.classList.remove('hidden');
      if (demoAccessBox) demoAccessBox.classList.remove('hidden');
      if (socialLoginGrid) socialLoginGrid.classList.remove('hidden');

      if (authTitle) authTitle.textContent = 'Welcome back';
      if (authSubtitle) authSubtitle.textContent = 'Enter your credentials to access your financial dashboard.';
      hideAuthAlert();
    });

    // Tab switching: Create Account
    tabSignUp.addEventListener('click', () => {
      tabSignUp.classList.add('active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.classList.remove('active');
      tabSignIn.setAttribute('aria-selected', 'false');

      if (signUpForm) signUpForm.classList.remove('hidden');
      if (signInForm) signInForm.classList.add('hidden');
      if (forgotPassForm) forgotPassForm.classList.add('hidden');

      if (authDivider) authDivider.classList.remove('hidden');
      if (demoAccessBox) demoAccessBox.classList.remove('hidden');
      if (socialLoginGrid) socialLoginGrid.classList.remove('hidden');

      if (authTitle) authTitle.textContent = 'Create your account';
      if (authSubtitle) authSubtitle.textContent = 'Join FinTrack to track, optimize and grow your personal finances.';
      hideAuthAlert();
    });
  }

  // Forgot Password trigger
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      if (signInForm) signInForm.classList.add('hidden');
      if (signUpForm) signUpForm.classList.add('hidden');
      if (forgotPassForm) forgotPassForm.classList.remove('hidden');

      if (authDivider) authDivider.classList.add('hidden');
      if (demoAccessBox) demoAccessBox.classList.add('hidden');
      if (socialLoginGrid) socialLoginGrid.classList.add('hidden');

      if (authTitle) authTitle.textContent = 'Reset your password';
      if (authSubtitle) authSubtitle.textContent = 'Enter your registered email to receive recovery instructions.';
      hideAuthAlert();
    });
  }

  if (backToSignInBtn && tabSignIn) {
    backToSignInBtn.addEventListener('click', () => {
      tabSignIn.click();
    });
  }

  if (authAlertClose) {
    authAlertClose.addEventListener('click', hideAuthAlert);
  }

  // Password visibility toggle buttons
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (targetInput.type === 'password') {
        targetInput.type = 'text';
        if (eyeOpen) eyeOpen.classList.add('hidden');
        if (eyeClosed) eyeClosed.classList.remove('hidden');
      } else {
        targetInput.type = 'password';
        if (eyeOpen) eyeOpen.classList.remove('hidden');
        if (eyeClosed) eyeClosed.classList.add('hidden');
      }
    });
  });

  // Password strength meter on registration
  const regPassInput = document.getElementById('registerPassword');
  const step1 = document.getElementById('barStep1');
  const step2 = document.getElementById('barStep2');
  const step3 = document.getElementById('barStep3');
  const strengthText = document.getElementById('passStrengthText');

  if (regPassInput && step1 && step2 && step3 && strengthText) {
    regPassInput.addEventListener('input', () => {
      const val = regPassInput.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
      if (val.length >= 10 && /[^A-Za-z0-9]/.test(val)) score++;

      // Reset steps
      step1.style.backgroundColor = '';
      step2.style.backgroundColor = '';
      step3.style.backgroundColor = '';

      if (score === 0) {
        strengthText.textContent = val.length === 0 ? 'Password strength' : 'Too short';
        strengthText.style.color = 'var(--text-subtle)';
      } else if (score === 1) {
        step1.style.backgroundColor = 'var(--expense)';
        strengthText.textContent = 'Weak';
        strengthText.style.color = 'var(--expense)';
      } else if (score === 2) {
        step1.style.backgroundColor = 'var(--warning)';
        step2.style.backgroundColor = 'var(--warning)';
        strengthText.textContent = 'Good';
        strengthText.style.color = 'var(--warning)';
      } else {
        step1.style.backgroundColor = 'var(--income)';
        step2.style.backgroundColor = 'var(--income)';
        step3.style.backgroundColor = 'var(--income)';
        strengthText.textContent = 'Strong 💪';
        strengthText.style.color = 'var(--income)';
      }
    });
  }

  // Handle Sign In submission
  if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      const rememberCheckbox = document.getElementById('loginRememberMe');

      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const password = passwordInput ? passwordInput.value : '';
      const remember = rememberCheckbox ? rememberCheckbox.checked : true;

      if (!email || !password) {
        showAuthAlert('Please enter both email and password.');
        return;
      }

      const users = getUsersDB();
      const existingUser = users.find(u => u.email.toLowerCase() === email);

      if (existingUser) {
        if (existingUser.password === password) {
          hideAuthAlert();
          performLogin(existingUser, remember);
          return;
        } else {
          showAuthAlert('Incorrect password. Try demo123 or password123.');
          return;
        }
      }

      // Friendly fallback: if demo credentials or valid format
      if (email === 'demo@fintrack.app' || password === 'password123' || password.length >= 6) {
        hideAuthAlert();
        const fallbackName = email.split('@')[0].replace(/[._-]/g, ' ');
        const capName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
        performLogin({ name: capName, email: email, role: 'Member' }, remember);
      } else {
        showAuthAlert('Account not found. Sign up or use One-Click Demo Access.');
      }
    });
  }

  // Handle Sign Up submission
  if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('registerName');
      const emailInput = document.getElementById('registerEmail');
      const passwordInput = document.getElementById('registerPassword');
      const confirmInput = document.getElementById('registerConfirmPassword');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const password = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmInput ? confirmInput.value : '';

      if (password.length < 6) {
        showAuthAlert('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        showAuthAlert('Passwords do not match. Please re-enter.');
        return;
      }

      const users = getUsersDB();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showAuthAlert('An account with this email already exists. Please sign in.');
        return;
      }

      const newUser = {
        name: name,
        email: email,
        password: password,
        role: 'Premium Member'
      };

      users.push(newUser);
      saveUsersDB(users);
      hideAuthAlert();
      performLogin(newUser, true);
    });
  }

  // Handle Forgot Password submission
  if (forgotPassForm) {
    forgotPassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const forgotEmail = document.getElementById('forgotEmail');
      const email = forgotEmail ? forgotEmail.value : 'your email';
      showToast(`Recovery link sent to ${email} (Demo simulation).`, 'info');
      if (tabSignIn) tabSignIn.click();
    });
  }

  // Quick Demo Access One-Click Button
  if (quickDemoLoginBtn) {
    quickDemoLoginBtn.addEventListener('click', () => {
      hideAuthAlert();
      performLogin({
        name: 'Sabari Balaji',
        email: 'demo@fintrack.app',
        role: 'Premium Member'
      }, true);
    });
  }

  // Social SSO Buttons (Mock Instant Verification)
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      performLogin({ name: 'Google User', email: 'user@gmail.com', role: 'Google Verified' }, true);
    });
  }

  const githubBtn = document.getElementById('githubLoginBtn');
  if (githubBtn) {
    githubBtn.addEventListener('click', () => {
      performLogin({ name: 'GitHub Developer', email: 'dev@github.com', role: 'Developer' }, true);
    });
  }

  const appleBtn = document.getElementById('appleLoginBtn');
  if (appleBtn) {
    appleBtn.addEventListener('click', () => {
      performLogin({ name: 'Apple User', email: 'user@icloud.com', role: 'Apple Verified' }, true);
    });
  }

  // Auth screen theme toggle
  if (authThemeToggle) {
    authThemeToggle.addEventListener('click', toggleTheme);
  }

  // Sidebar and Settings logout buttons
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', performLogout);
  }

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', performLogout);
  }

  if (settingsSwitchAccountBtn) {
    settingsSwitchAccountBtn.addEventListener('click', performLogout);
  }
}

// =============================================================================
// 16. Application Bootstrapper
// =============================================================================
function initApp() {
  // Load theme from localStorage
  state.theme = loadTheme();
  document.body.setAttribute('data-theme', state.theme);
  updateThemeToggleLabels();

  // Attach all user interactions & auth event listeners
  attachEventListeners();
  initAuthEventListeners();

  // Check auth session
  const isAuthenticated = checkAuthState();

  if (isAuthenticated) {
    state.budget = loadBudget();
    state.transactions = loadTransactions();
    state.notifications = loadNotifications();
    updateUserProfileDisplay();
    refreshAll();
    renderNotifications();
  } else {
    // Populate transactions in state so they are ready upon login
    state.budget = loadBudget();
    state.transactions = loadTransactions();
    state.notifications = loadNotifications();
  }
}

// Launch on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
