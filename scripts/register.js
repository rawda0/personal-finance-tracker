/**
 * Personal Finance Tracker - Registration Page Script
 */

import {
    auth,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from './firebase-config.js';
import { AuthAPI } from './api.js';

const LOGIN_URL = 'login.html';
const DASHBOARD_URL = 'dashboard.html';

const registerForm = document.getElementById('registerForm');
const loginLink = document.getElementById('loginLink');
const errorMessage = document.getElementById('errorMessage');
const registerButton = document.getElementById('registerButton');

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
    if (registerButton) {
        registerButton.disabled = loading;
        registerButton.textContent = loading ? 'Creating account...' : 'Register';
    }
}

async function createUserProfile(user, username) {
    try {
        await AuthAPI.createProfile({
            username: username,
            email: user.email
        });
    } catch (error) {
        console.error('Failed to create user profile:', error);
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = DASHBOARD_URL;
    }
});

if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideError();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !password || !confirmPassword) {
            showError('Please fill out all fields.');
            return;
        }

        if (username.length < 2) {
            showError('Username must be at least 2 characters.');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential.user, username);
        } catch (error) {
            console.error('Registration error:', error);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    showError('An account with this email already exists.');
                    break;
                case 'auth/invalid-email':
                    showError('Invalid email address.');
                    break;
                case 'auth/weak-password':
                    showError('Password is too weak. Use at least 6 characters.');
                    break;
                default:
                    showError(error.message || 'Registration failed. Please try again.');
            }
            setLoading(false);
        }
    });
}

if (loginLink) {
    loginLink.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = LOGIN_URL;
    });
}