/**
 * Firebase Client-Side Configuration
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
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
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBal9QR0OSl03gL_LhzSZy-MvPbW0mzj_g",
    authDomain: "personal-finance-tracker-ae902.firebaseapp.com",
    projectId: "personal-finance-tracker-ae902",
    storageBucket: "personal-finance-tracker-ae902.firebasestorage.app",
    messagingSenderId: "488990183428",
    appId: "1:488990183428:web:b5b441e4952e133fd9a551"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const API_BASE_URL = 'http://localhost:8000';

async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
}

async function apiRequest(endpoint, options = {}) {
    const token = await getIdToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

export {
    app,
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
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
    serverTimestamp,
    getIdToken,
    apiRequest,
    API_BASE_URL
};
