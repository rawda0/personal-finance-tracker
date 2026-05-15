/**
 * Personal Finance Tracker - Savings Page Script
 */

import {
    auth,
    signOut,
    onAuthStateChanged
} from './firebase-config.js';
import { AuthAPI } from './api.js';
import {
    onDataUpdate,
    loadSavingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal
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

const renderGoals = () => {
    const goals = loadSavingsGoals();
    const listContainer = document.getElementById('goalsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (goals.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #718096;">No savings goals set yet. Use the form above to create one!</p>';
        return;
    }

    goals.forEach(goal => {
        const targetAmount = goal.target_amount || goal.targetAmount || 0;
        const currentSavings = goal.current_savings || goal.currentSavings || 0;

        const progress = Math.min(100, (currentSavings / targetAmount) * 100);
        const progressWidth = `${progress.toFixed(2)}%`;
        const remainingAmount = targetAmount - currentSavings;
        const goalStatus = progress >= 100 ? 'Achieved!' : `Remaining: ${formatCurrency(remainingAmount)}`;

        const item = document.createElement('div');
        item.classList.add('goal-item');
        item.innerHTML = `
            <div class="goal-header">
                <h3>${goal.name}</h3>
                <div class="goal-actions">
                    <button class="action-btn add-btn" data-goal-id="${goal.id}" data-action="add" title="Add money">+</button>
                    <button class="action-btn remove-btn" data-goal-id="${goal.id}" data-action="remove" title="Remove money">−</button>
                    <button class="action-btn edit-btn" data-goal-id="${goal.id}" data-action="edit" title="Edit goal">✎</button>
                    <button class="action-btn delete-btn" data-goal-id="${goal.id}" data-action="delete" title="Delete goal">X</button>
                </div>
            </div>
            
            <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${progressWidth};"></div>
            </div>

            <div class="goal-stats">
                <div>Target: ${formatCurrency(targetAmount)}</div>
                <div class="saved">Saved: ${formatCurrency(currentSavings)}</div>
            </div>

            <p style="font-size: 0.85rem; margin-top: 0.5rem; color: ${progress >= 100 ? '#48bb78' : '#718096'};">
                ${goalStatus}
            </p>
        `;
        listContainer.appendChild(item);
    });

    attachActionButtonListeners();
};

const handleMoneyAdjustment = async (goalId, action) => {
    const goals = loadSavingsGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) {
        console.error('Goal not found');
        return;
    }

    const currentSavings = goal.current_savings || goal.currentSavings || 0;
    const actionText = action === 'add' ? 'Add money to' : 'Remove money from';
    const amount = prompt(`${actionText} "${goal.name}":\n\nEnter amount:`, '0.00');

    if (amount === null) {
        return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
        console.error('Invalid amount entered');
        return;
    }

    let newSavings;
    if (action === 'add') {
        newSavings = currentSavings + numAmount;
    } else {
        if (numAmount > currentSavings) {
            alert(`Cannot remove ${formatCurrency(numAmount)}. Current savings: ${formatCurrency(currentSavings)}`);
            return;
        }
        newSavings = currentSavings - numAmount;
    }

    try {
        await updateSavingsGoal(goalId, { currentSavings: newSavings });
        console.log(`${actionText} goal: ${formatCurrency(numAmount)}`);
    } catch (error) {
        console.error('Error updating goal:', error);
        alert('Failed to update savings. Please try again.');
    }
};

const handleEditGoal = async (goalId) => {
    const goals = loadSavingsGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) {
        console.error('Goal not found');
        return;
    }

    const targetAmount = goal.target_amount || goal.targetAmount || 0;
    const currentSavings = goal.current_savings || goal.currentSavings || 0;

    const newName = prompt('Edit goal name:', goal.name);
    if (newName === null) return;

    const newTarget = prompt('Edit target amount:', targetAmount);
    if (newTarget === null) return;

    const newCurrent = prompt('Edit current savings:', currentSavings);
    if (newCurrent === null) return;

    const parsedTarget = parseFloat(newTarget);
    const parsedCurrent = parseFloat(newCurrent);

    if (!newName.trim() || isNaN(parsedTarget) || parsedTarget <= 0 || isNaN(parsedCurrent) || parsedCurrent < 0) {
        alert('Invalid input. Please check your entries.');
        return;
    }

    try {
        await updateSavingsGoal(goalId, {
            name: newName.trim(),
            targetAmount: parsedTarget,
            currentSavings: parsedCurrent
        });
        console.log('Goal updated successfully.');
    } catch (error) {
        console.error('Error updating goal:', error);
        alert('Failed to update goal. Please try again.');
    }
};

const handleDeleteGoal = async (goalId) => {
    const goals = loadSavingsGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) {
        console.error('Goal not found');
        return;
    }

    const confirmDel = confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`);
    if (!confirmDel) return;

    try {
        await deleteSavingsGoal(goalId);
        console.log('Goal deleted successfully.');
    } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
    }
};

const attachActionButtonListeners = () => {
    const buttons = document.querySelectorAll('.goal-item .action-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = e.target.dataset.goalId;
            const action = e.target.dataset.action;

            if (action === 'add' || action === 'remove') {
                handleMoneyAdjustment(goalId, action);
            } else if (action === 'edit') {
                handleEditGoal(goalId);
            } else if (action === 'delete') {
                handleDeleteGoal(goalId);
            }
        });
    });
};

const handleGoalSubmit = async (e) => {
    e.preventDefault();

    const form = document.getElementById('savingsGoalForm');

    const nameInput = form.querySelector('#goalName');
    const targetInput = form.querySelector('#targetAmount');
    const currentInput = form.querySelector('#currentSavings');

    const name = nameInput.value.trim();
    const targetAmount = parseFloat(targetInput.value);
    const currentSavings = parseFloat(currentInput.value);

    if (!name || isNaN(targetAmount) || targetAmount <= 0 || isNaN(currentSavings) || currentSavings < 0) {
        console.error('Invalid input for savings goal.');
        alert('Please fill in all fields correctly.');
        return;
    }

    try {
        await addSavingsGoal({
            name: name,
            targetAmount: targetAmount,
            currentSavings: currentSavings
        });

        form.reset();
        console.log('New goal created.');
    } catch (error) {
        console.error('Error creating goal:', error);
        alert('Failed to create goal. Please try again.');
    }
};

const initSavingsPage = () => {
    console.log('Savings script initialized.');

    const goalForm = document.getElementById('savingsGoalForm');

    if (goalForm) {
        goalForm.addEventListener('submit', handleGoalSubmit);
    }

    renderGoals();

    onDataUpdate('savings', () => renderGoals());
};

document.addEventListener('DOMContentLoaded', initSavingsPage);