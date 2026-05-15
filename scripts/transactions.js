/**
 * Personal Finance Tracker - Transactions Page Script
 */

import {
    auth,
    signOut,
    onAuthStateChanged
} from './firebase-config.js';
import { AuthAPI } from './api.js';
import {
    onDataUpdate,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    calculateTotalBalance
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

const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
};

const renderTransactions = () => {
    const transactions = loadTransactions();
    const listContainer = document.getElementById('allTransactionsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (transactions.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #718096;">No transactions recorded yet.</p>';
        return;
    }

    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(t => {
        const item = document.createElement('div');
        item.classList.add('transaction-item', t.type);
        const sign = t.type === 'income' ? '+' : '-';

        item.innerHTML = `
            <div class="transaction-info">
                <h4>${t.category}</h4>
                <p>${new Date(t.date).toLocaleDateString()}</p>
                ${t.note ? `<p class="transaction-note">${t.note}</p>` : ''}
            </div>
            <div class="transaction-actions">
                <div class="transaction-amount ${t.type}">
                    ${sign} ${formatCurrency(t.amount)}
                </div>
                <button class="action-btn edit-btn" data-id="${t.id}" title="Edit">✎</button>
                <button class="action-btn delete-btn" data-id="${t.id}" title="Delete">X</button>
            </div>
        `;
        listContainer.appendChild(item);

        item.querySelector('.edit-btn').addEventListener('click', () => openEditModal(t));
        item.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(t.id));
    });
};

const openEditModal = async (transaction) => {
    const amount = prompt(`Edit amount (current: ${transaction.amount}):`, transaction.amount);
    if (amount === null) return;

    const newAmount = parseFloat(amount);
    if (isNaN(newAmount) || newAmount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    if (transaction.type === 'expense') {
        const allTransactions = loadTransactions();
        let totalIncome = 0;
        let totalExpenses = 0;

        allTransactions.forEach(t => {
            if (t.id !== transaction.id) {
                if (t.type === 'income') {
                    totalIncome += t.amount;
                } else if (t.type === 'expense') {
                    totalExpenses += t.amount;
                }
            }
        });

        const availableBalance = totalIncome - totalExpenses;
        if (newAmount > availableBalance) {
            alert('Insufficient Funds! The new expense amount exceeds your available balance.');
            return;
        }
    }

    const category = prompt(`Edit category (current: ${transaction.category}):`, transaction.category);
    if (category === null) return;

    const dateStr = prompt(`Edit date (YYYY-MM-DD, current: ${transaction.date}):`, transaction.date);
    if (dateStr === null) return;

    const note = prompt(`Edit note (current: ${transaction.note}):`, transaction.note);

    try {
        await updateTransaction(transaction.id, {
            amount: newAmount,
            category: category || transaction.category,
            date: dateStr || transaction.date,
            note: note || ''
        });
        console.log(`Transaction ${transaction.id} updated.`);
    } catch (error) {
        console.error('Error updating transaction:', error);
        alert('Failed to update transaction. Please try again.');
    }
};

const confirmDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            await deleteTransaction(id);
            console.log(`Transaction ${id} deleted.`);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction. Please try again.');
        }
    }
};

const handleTransactionSubmit = async (e, type, form) => {
    e.preventDefault();

    const prefix = type;
    const amountInput = form.querySelector(`#${prefix}Amount`);
    const categoryInput = form.querySelector(`#${prefix}Category`);
    const dateInput = form.querySelector(`#${prefix}Date`);
    const noteInput = form.querySelector(`#${prefix}Note`);

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const note = noteInput ? noteInput.value : '';

    if (isNaN(amount) || amount <= 0 || !category || !date) {
        console.error(`Invalid input for ${type} transaction.`);
        alert('Please fill in all required fields.');
        return;
    }

    if (type === 'expense') {
        const currentBalance = calculateTotalBalance();
        if (amount > currentBalance) {
            alert('Insufficient Funds! You do not have enough balance to make this expense.');
            return;
        }
    }

    try {
        await addTransaction({
            type: type,
            amount: amount,
            category: category,
            date: date,
            note: note
        });

        form.reset();
        console.log(`New ${type} added.`);
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction. Please try again.');
    }
};

const initTransactionsPage = () => {
    console.log('Transactions script initialized.');

    const incomeForm = document.getElementById('incomeForm');
    const expenseForm = document.getElementById('expenseForm');

    if (incomeForm) {
        incomeForm.addEventListener('submit', (e) => {
            handleTransactionSubmit(e, 'income', incomeForm);
        });
    }

    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            handleTransactionSubmit(e, 'expense', expenseForm);
        });
    }

    renderTransactions();

    onDataUpdate('transactions', () => renderTransactions());
};

document.addEventListener('DOMContentLoaded', initTransactionsPage);