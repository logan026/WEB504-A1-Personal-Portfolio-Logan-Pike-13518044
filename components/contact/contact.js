//Link to our contact form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); //Stop the page reloading
        alert('Thank you for reaching out! Your message has been sent / simulated successfully!');
        contactForm.reset(); //Start fresh form
    });
};
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
const firebaseConfig = {
  apiKey: "AIzaSyDSZzpF8nzGp4wDk3t_prwalIIr4Y9krhA",
  authDomain: "logan-pike-portfolio.firebaseapp.com",
  projectId: "logan-pike-portfolio",
  storageBucket: "logan-pike-portfolio.firebasestorage.app",
  messagingSenderId: "407491189448",
  appId: "1:407491189448:web:026ebacd11d96b69e8a3fd"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
//Application Status
let expectedCaptchaAnswer = 0;
let showArchivedView = false;
let cachedComments = [];
//DOM Elements
const contactForm = document.getElementById('contactForm');
const inquiryStatus = document.getElementById('inquiryStatus');
const authLoggedOutView = document.getElementById('authLoggedOutView');
const authLoggedInView = document.getElementById('authLoggedInView');
const authEmailInput = document.getElementById('authEmaiil');
const authPasswordInput = document.getElementById('authPassword');
const captchaPrompt = document.getElementById('captchaPrompt');
const captchaInput = document.getElementById('captchaInput');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const verifyEmailBtn = document.getElementById('verifyEmailBtn');
const currentUserEmail = document.getElementById('currentUserEmail');
const emailVerifiedBadge = document.getElementById('emailVerifiedBadge');
const authStatus = document.getElementById('authStatus');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentLoginPrompt = document.getElementById('commentLoginPrompt');
const commentslist = document.getElementById('commentsList');
const showActiveBtn = document.getElementById('showActiveBtn');
const showArchivedBtn = document.getElementById('showArchivedBtn');