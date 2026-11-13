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
const authEmailInput = document.getElementById('authEmail');
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
//Generate CAPTCHA challenge to prevent automated bot attacks
const generateCaptcha = () => {
    const numA = Math.floor(Math.random() * 9) + 1;
    const numB = Math.floor(Math.random() * 9) + 1;
    expectedCaptchaAnswer = numA + numB;
    captchaPrompt.textContent = `Security Check (CAPTCHA): What is ${numA} + ${numB}?`;
    captchaInput.value = '';
};
//Validate CAPTCHA
const validateCaptcha = () => {
    const userAnswer = Number.parseInt(captchaInput.value, 10);
    if (Number.isNaN(userAnswer) || userAnswer !== expectedCaptchaAnswer) {
        authStatus.textContent = 'Security Error: Incorrect CAPTCHA answer. Please try again.';
        authStatus.style.color = '#dc2626';
        generateCaptcha();
        return false;
    }
    return true;
};
//User Authentication
registerBtn.addEventListener('click', async () => {
    if (!validateCaptcha()) return;
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        authStatus.textContent = 'Registration successful! A verification email has been sent.';
        authStatus.style.color = '#16a34a';
        generateCaptcha();
    } catch (error) {
        authStatus.textContent = `Registration Error: ${error.message}`;
        authStatus.style.color = '#dc2626';
        generateCaptcha();
    }
});
loginBtn.addEventListener('click', async () => {
    if (!validateCaptcha()) return;
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        authStatus.textContent = 'Successfully logged in.';
        authStatus.style.color = '#16a34a';
        generateCaptcha();
    } catch (error) {
        authStatus.textContent = `Login Error: ${error.message}`;
        authStatus.style.color = '#dc2626';
        generateCaptcha();
    }
});
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        authStatus.textContent = 'Logged out successfully.';
        authStatus.style.color = '#475569';
    } catch (error) {
        authStatus.textContent = `Logout Error: ${error.message}`;
    }
});
verifyEmailBtn.addEventListener('click', async () => {
    if (!auth.currentUser) return;
    try {
        await sendEmailVerification(auth.currentUser);
        authStatus.textContent = 'Verification email sent. Please check your inbox.';
        authStatus.style.color = '#16a34a';
    } catch (error) {
        authStatus.textContent = `Verification Error: ${error.message}`;
        authStatus.style.color = '#dc2626'
    }
});
//Listener for authentication changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        authLoggedOutView.classList.add('hidden');
        authLoggedInView.classList.remove('hidden');
        commentForm.classList.remove('hidden');
        commentLoginPrompt.classList.add('hidden');
        currentUserEmail.textContent = user.email;
        emailVerifiedBadge.textContent = user.emailVerified ? 'Verified' : 'Pending Verification';
        verifyEmailBtn.classList.toggle('hidden', user.emailVerified);
    } else {
        authLoggedOutView.classList.remove('hidden');
        authLoggedInView.classList.add('hidden');
        commentForm.classList.add('hidden');
        commentLoginPrompt.classList.remove('hidden');
    }
    //Render comments
    renderComments();
});
//Save contact form submission to Firestore
contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    try {
        await addDoc(collection(db, 'inquiries'), {
            name,
            email,
            message,
            createdAt: serverTimestamp(),
        });
        inquiryStatus.textContent = 'Inquiry saved to Firebase Firestore!';
        inquiryStatus.style.color = '#16a34a';
        contactForm.reset();
    } catch (error) {
        inquiryStatus.textContent = `Failed to sen inquiry: ${error.message}`;
        inquiryStatus.style.color = '#dc2626';
    }
});
//Add a new comment to Firestore
commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const text = commentInput.value.trim();
    if (!text) return;
    try {
        await addDoc(collection(db, 'comments'), {
            uid: currentUser.uid,
            authorEmail: currentUser.email,
            text,
            isArchived: false,
            createdAt: serverTimestamp(),
            updatedAt: null,
        });
        commentInput.value = '';
    } catch(error) {
        authStatus.textContent = `Comment Post Error: ${error.message}`;
        authStatus.style.color = '#dc2626';
    }
});
//Allow authenticated users to modify their comment
const handleEditComment = async (commentId, currentText) => {
    const updatedText = window.prompt('Edit your comment:', currentText);
    if (updatedText === null || updatedText.trim() === '' || updatedText === currentText) {
        return;
    }
    try {
        const commentRef = doc(db, 'comments', commentId);
        await updateDoc (commentRef, {
            text: updatedText.trim(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        authStatus.textContent = `Update Error: ${error.message}`;
        authStatus.style.color = '#dc2626';
    }
};
//Archive comments
const handleToggleArchive = async (commentId, currentArchiveState) => {
    try {
        const commentRef = doc(db, 'comments', commentId);
        await updateDoc(commentRef, {
            isArchived: !currentArchiveState,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        authStatus.textContent = `Archive Error: ${error.message}`;
        authStatus.style.color = '#dc2626';
    }
};
//Delete Comments
const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm('Are you sure you want to permanetly delete this comment?');
    if (!confirmed) return;
    try {
        const commentRef = doc(db, 'comments', commentId);
        await deleteDoc(commentRef);
    } catch (error) {
        authStatus.textContent = `Delete Error: ${error.message}`;
        authStatus.style.color = '#dc2626';
    }
};
//Render comments
const renderComments = () => {
    commentslist.innerHTML = '';
    const filteredComments = cachedComments.filter(
        (item) => Boolean(item.isArchived) === showArchivedView,
    );
    if (filteredComments.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = showArchivedView
        ? 'No archived comments found.'
        : 'No active comments yet. Be the first to post!';
        commentslist.appendChild(emptyMsg);
        return;
    }
    filteredComments.forEach((comment) => {
        const card = document.createElement('article');
        card.className = 'comment-card';
        const meta = document.createElement('div');
        meta.className = 'comment-meta';
        const authorSpan = document.createElement('strong');
        authorSpan.textContent = comment.authorEmail;
        const timestampSpan = document.createElement('span');
        const dateStr = comment.createdAt?.toDate
        ? comment.createdAt.toDate().toLocaleString('en-NZ')
        : 'Just now';
        timestampSpan.textContent = comment.updatedAt ? `${dateStr} (Edited)` : dateStr;
        meta.appendChild(authorSpan);
        meta.appendChild(timestampSpan);
        const body = document.createElement('p');
        body.className = 'comment-body';
        body.textContent = comment.text;
        card.appendChild(meta);
        card.appendChild(body);
        //Post authentication ownership check
        if (auth.currentUser && auth.currentUser.uid === comment.uid) {
            const actions = document.createElement('div');
            actions.className = 'comment-actions';
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => handleEditComment (comment.id, comment.text));
            const archiveBtn = document.createElement('button');
            archiveBtn.type = 'button';
            archiveBtn.className = 'action-btn';
            archiveBtn.textContent = comment.isArchived ? 'Unarchive' : 'Archive';
            archiveBtn.addEventListener('click', () => (
                handleToggleArchive(comment.id, Boolean(comment.isArchived))
            ));
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => handleDeleteComment (comment.id));
            actions.appendChild(editBtn);
            actions.appendChild(archiveBtn);
            actions.appendChild(deleteBtn);
            card.appendChild(actions);
        }
        commentslist.appendChild(card);
    });
};
const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
onSnapshot (commentsQuery, (snapshot) => {
    cachedComments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
    }));
    renderComments();
});
showActiveBtn.addEventListener('click', () => {
    showArchivedView = false;
    showActiveBtn.classList.add('active-filter');
    showArchivedBtn.classList.remove('active-filter');
    renderComments();
});
showArchivedBtn.addEventListener('click', () => {
    showArchivedView = true;
    showArchivedBtn.classList.add('active-filter');
    showActiveBtn.classList.remove('active-filter');
    renderComments();
});
generateCaptcha();