/**
 * Shared Data Storage Module - Firestore Integration
 */

import {
    auth,
    db,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    onAuthStateChanged
} from './firebase-config.js';

let transactionsCache = [];
let savingsGoalsCache = [];
let currentUserId = null;

let transactionsUnsubscribe = null;
let savingsUnsubscribe = null;

let onTransactionsUpdate = null;
let onSavingsUpdate = null;

function initializeStorage() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            setupRealtimeListeners();
        } else {
            currentUserId = null;
            cleanupListeners();
            transactionsCache = [];
            savingsGoalsCache = [];
        }
    });
}

function setupRealtimeListeners() {
    if (!currentUserId) return;

    const transactionsRef = collection(db, 'users', currentUserId, 'transactions');
    const transactionsQuery = query(transactionsRef, orderBy('date', 'desc'));

    transactionsUnsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
        transactionsCache = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        triggerDataUpdate('transactions');
    }, (error) => {
        console.error('Transactions listener error:', error);
    });

    const savingsRef = collection(db, 'users', currentUserId, 'savingsGoals');
    const savingsQuery = query(savingsRef, orderBy('created_at', 'desc'));

    savingsUnsubscribe = onSnapshot(savingsQuery, (snapshot) => {
        savingsGoalsCache = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        triggerDataUpdate('savings');
    }, (error) => {
        console.error('Savings listener error:', error);
    });
}

function cleanupListeners() {
    if (transactionsUnsubscribe) {
        transactionsUnsubscribe();
        transactionsUnsubscribe = null;
    }
    if (savingsUnsubscribe) {
        savingsUnsubscribe();
        savingsUnsubscribe = null;
    }
}

function onDataUpdate(type, callback) {
    if (type === 'transactions') {
        onTransactionsUpdate = callback;
    } else if (type === 'savings') {
        onSavingsUpdate = callback;
    }
}

function triggerDataUpdate(type) {
    if (type === 'transactions' && onTransactionsUpdate) {
        onTransactionsUpdate(transactionsCache);
    } else if (type === 'savings' && onSavingsUpdate) {
        onSavingsUpdate(savingsGoalsCache);
    }
    window.dispatchEvent(new CustomEvent('financeDataUpdated', { detail: { type } }));
}

const loadTransactions = () => {
    return [...transactionsCache];
};

const addTransaction = async (transaction) => {
    if (!currentUserId) throw new Error('Not authenticated');

    const transactionsRef = collection(db, 'users', currentUserId, 'transactions');
    const newTransaction = {
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        category: transaction.category,
        date: transaction.date,
        note: transaction.note || '',
        created_at: new Date(),
        updated_at: new Date()
    };

    const docRef = await addDoc(transactionsRef, newTransaction);
    return { id: docRef.id, ...newTransaction };
};

const updateTransaction = async (id, updates) => {
    if (!currentUserId) throw new Error('Not authenticated');

    const docRef = doc(db, 'users', currentUserId, 'transactions', id);
    await updateDoc(docRef, {
        ...updates,
        updated_at: new Date()
    });
};

const deleteTransaction = async (id) => {
    if (!currentUserId) throw new Error('Not authenticated');

    const docRef = doc(db, 'users', currentUserId, 'transactions', id);
    await deleteDoc(docRef);
};

const loadSavingsGoals = () => {
    return [...savingsGoalsCache];
};

const addSavingsGoal = async (goal) => {
    if (!currentUserId) throw new Error('Not authenticated');

    const goalsRef = collection(db, 'users', currentUserId, 'savingsGoals');
    const newGoal = {
        name: goal.name,
        target_amount: parseFloat(goal.targetAmount),
        current_savings: parseFloat(goal.currentSavings),
        created_at: new Date(),
        updated_at: new Date()
    };

    const docRef = await addDoc(goalsRef, newGoal);
    return { id: docRef.id, ...newGoal };
};

const updateSavingsGoal = async (id, updates) => {
    if (!currentUserId) throw new Error('Not authenticated');

    const docRef = doc(db, 'users', currentUserId, 'savingsGoals', id);

    const updateData = { updated_at: new Date() };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.targetAmount !== undefined) updateData.target_amount = parseFloat(updates.targetAmount);
    if (updates.currentSavings !== undefined) updateData.current_savings = parseFloat(updates.currentSavings);

    await updateDoc(docRef, updateData);
};

const deleteSavingsGoal = async (id) => {
    if (!currentUserId) throw new Error('Not authenticated');

    const docRef = doc(db, 'users', currentUserId, 'savingsGoals', id);
    await deleteDoc(docRef);
};

const calculateTotalBalance = () => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactionsCache.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else if (t.type === 'expense') {
            totalExpenses += t.amount;
        }
    });

    return totalIncome - totalExpenses;
};

const calculateTotalSavings = () => {
    return savingsGoalsCache.reduce((sum, goal) => sum + (goal.current_savings || 0), 0);
};

const getCurrentMonthTransactions = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return transactionsCache.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
    });
};

const getMonthlyIncome = () => {
    const monthTransactions = getCurrentMonthTransactions();
    return monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
};

const getMonthlyExpenses = () => {
    const monthTransactions = getCurrentMonthTransactions();
    return monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
};

const getSpendingByCategory = () => {
    const monthTransactions = getCurrentMonthTransactions();
    const spending = {};

    monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        });

    return spending;
};

const getRecentTransactions = (limit = 5) => {
    return transactionsCache
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
};

const isAuthenticated = () => {
    return currentUserId !== null;
};

const getCurrentUserId = () => {
    return currentUserId;
};

initializeStorage();

export {
    initializeStorage,
    onDataUpdate,
    isAuthenticated,
    getCurrentUserId,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadSavingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    calculateTotalBalance,
    calculateTotalSavings,
    getCurrentMonthTransactions,
    getMonthlyIncome,
    getMonthlyExpenses,
    getSpendingByCategory,
    getRecentTransactions
};
