/**
 * Personal Finance Tracker - Login Page Script
 */

import {
    auth,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from './firebase-config.js';

const DASHBOARD_URL = 'dashboard.html';
const REGISTER_URL = 'register.html';

const loginForm = document.getElementById('loginForm');
const registerLink = document.getElementById('registerLink');
const errorMessage = document.getElementById('errorMessage');
const loginButton = document.getElementById('loginButton');

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function setLoading(loading) {
    if (loginButton) {
        loginButton.disabled = loading;
        loginButton.textContent = loading ? 'Signing in...' : 'Login';
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = DASHBOARD_URL;
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideError();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login error:', error);

            switch (error.code) {
                case 'auth/user-not-found':
                    showError('No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    showError('Incorrect password.');
                    break;
                case 'auth/invalid-email':
                    showError('Invalid email address.');
                    break;
                case 'auth/too-many-requests':
                    showError('Too many failed attempts. Please try again later.');
                    break;
                case 'auth/invalid-credential':
                    showError('Invalid email or password.');
                    break;
                default:
                    showError(error.message || 'Login failed. Please try again.');
            }
            setLoading(false);
        }
    });
}

if (registerLink) {
    registerLink.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = REGISTER_URL;
    });
}