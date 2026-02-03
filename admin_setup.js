import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, sendSignInLinkToEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkExistingAdmin() {
    const q = query(collection(db, "users"), where("role", "==", "superadmin"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Admin already exists! Redirect to login
        document.getElementById('statusMessage').innerText = "System already initialized. Redirecting...";
        setTimeout(() => { window.location.href = "login.html"; }, 2000);
    } else {
        // Show the setup form
        document.getElementById('statusMessage').classList.add('hidden');
        document.getElementById('setupCard').classList.remove('hidden');
    }
}

document.getElementById('setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const btn = document.getElementById('sendBtn');

    const actionCodeSettings = {
        // Points to the finish page we created earlier
        url: window.location.origin + '/finish_enroll.html?init=true', 
        handleCodeInApp: true,
    };

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        alert("Link sent! Check your inbox to complete SuperAdmin setup.");
        btn.disabled = true;
        btn.innerText = "Check your email...";
    } catch (error) {
        alert(error.message);
    }
});

checkExistingAdmin();
