/**
 * Personal Finance Tracker - Dashboard Script
 */

import {
    auth,
    signOut,
    onAuthStateChanged
} from './firebase-config.js';
import { AuthAPI } from './api.js';
import {
    onDataUpdate,
    calculateTotalBalance,
    calculateTotalSavings,
    getMonthlyIncome,
    getMonthlyExpenses,
    getSpendingByCategory,
    getRecentTransactions
} from './storage.js';

const LOGIN_URL = 'login.html';

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = LOGIN_URL;
        return;
    }

    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        try {
            const profile = await AuthAPI.getProfile();
            userNameEl.textContent = profile.username || user.email;
        } catch (e) {
            userNameEl.textContent = user.displayName || user.email;
        }
    }
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = LOGIN_URL;
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

const calculateStats = () => {
    const monthlyIncome = getMonthlyIncome();
    const monthlyExpenses = getMonthlyExpenses();
    const totalBalance = calculateTotalBalance();
    const totalSavingsAmount = calculateTotalSavings();
    const spendingByCategory = getSpendingByCategory();

    return { monthlyIncome, monthlyExpenses, totalBalance, totalSavingsAmount, spendingByCategory };
};

const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
};

const updateStatsDisplay = (stats) => {
    const totalBalanceEl = document.getElementById('totalBalance');
    const monthlyIncomeEl = document.getElementById('monthlyIncome');
    const monthlyExpensesEl = document.getElementById('monthlyExpenses');
    const totalSavingsEl = document.getElementById('totalSavings');

    if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(stats.totalBalance);
    if (monthlyIncomeEl) monthlyIncomeEl.textContent = formatCurrency(stats.monthlyIncome);
    if (monthlyExpensesEl) monthlyExpensesEl.textContent = formatCurrency(stats.monthlyExpenses);
    if (totalSavingsEl) totalSavingsEl.textContent = formatCurrency(stats.totalSavingsAmount);
};

const renderCategories = (categories) => {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';

    const categoryEntries = Object.entries(categories).sort(([, a], [, b]) => b - a);

    if (categoryEntries.length === 0) {
        categoriesGrid.innerHTML = '<p>No expenses recorded this month.</p>';
        return;
    }

    categoryEntries.forEach(([name, amount]) => {
        const card = document.createElement('div');
        card.classList.add('category-card');
        card.innerHTML = `
            <p class="category-name">${name}</p>
            <p class="category-amount">${formatCurrency(amount)}</p>
        `;
        categoriesGrid.appendChild(card);
    });
};

const renderRecentTransactions = () => {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;

    transactionsList.innerHTML = '';

    const recentTransactions = getRecentTransactions(5);

    if (recentTransactions.length === 0) {
        transactionsList.innerHTML = '<p style="text-align: center; color: #718096;">No transactions recorded yet.</p>';
        return;
    }

    recentTransactions.forEach(t => {
        const item = document.createElement('div');
        item.classList.add('transaction-item', t.type);
        item.innerHTML = `
            <div class="transaction-info">
                <h4>${t.note || t.category}</h4>
                <p>${t.category} | ${new Date(t.date).toLocaleDateString()}</p>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
            </div>
        `;
        transactionsList.appendChild(item);
    });
};

const refreshDashboard = () => {
    const stats = calculateStats();
    updateStatsDisplay(stats);
    renderCategories(stats.spendingByCategory);
    renderRecentTransactions();
};

const initDashboard = () => {
    console.log('Dashboard script initialized.');

    refreshDashboard();

    onDataUpdate('transactions', () => refreshDashboard());
    onDataUpdate('savings', () => refreshDashboard());

    window.addEventListener('financeDataUpdated', refreshDashboard);
};

document.addEventListener('DOMContentLoaded', initDashboard);