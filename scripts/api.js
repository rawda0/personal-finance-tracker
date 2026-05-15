/**
 * API Client Module
 */

import { apiRequest } from './firebase-config.js';

const AuthAPI = {
    createProfile: (profile) => apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(profile)
    }),

    getProfile: () => apiRequest('/api/auth/profile'),

    updateProfile: (updates) => apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
    }),

    verifyToken: () => apiRequest('/api/auth/verify')
};

const TransactionsAPI = {
    getAll: () => apiRequest('/api/transactions'),

    get: (id) => apiRequest(`/api/transactions/${id}`),

    create: (transaction) => apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction)
    }),

    update: (id, updates) => apiRequest(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    }),

    delete: (id) => apiRequest(`/api/transactions/${id}`, {
        method: 'DELETE'
    })
};

const SavingsAPI = {
    getAll: () => apiRequest('/api/savings'),

    get: (id) => apiRequest(`/api/savings/${id}`),

    create: (goal) => apiRequest('/api/savings', {
        method: 'POST',
        body: JSON.stringify(goal)
    }),

    update: (id, updates) => apiRequest(`/api/savings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    }),

    delete: (id) => apiRequest(`/api/savings/${id}`, {
        method: 'DELETE'
    })
};

export { AuthAPI, TransactionsAPI, SavingsAPI };
