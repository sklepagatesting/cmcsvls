import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, sendSignInLinkToEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBK-v8xtt7x0AA_btC0oE88IolgU9m5Q3E",
    authDomain: "cmcsvls.firebaseapp.com",
    projectId: "cmcsvls",
    storageBucket: "cmcsvls.firebasestorage.app",
    messagingSenderId: "973791112453",
    appId: "1:973791112453:web:728b9ac51c0f3f89955b6c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if a SuperAdmin already exists in the system
async function checkExistingAdmin() {
    try {
        const q = query(collection(db, "users"), where("role", "==", "superadmin"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            document.getElementById('statusMessage').innerText = "System already initialized. Redirecting...";
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
        } else {
            document.getElementById('statusMessage').classList.add('hidden');
            document.getElementById('setupCard').classList.remove('hidden');
        }
    } catch (error) {
        console.error("Setup Check Error:", error);
        document.getElementById('statusMessage').innerText = "Database Error: " + error.message;
    }
}

document.getElementById('setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const btn = document.getElementById('sendBtn');

    const actionCodeSettings = {
        // This must match the page where you handle the logic below
        url: window.location.origin + '/finish_enroll.html', 
        handleCodeInApp: true,
    };

    try {
        btn.disabled = true;
        btn.innerText = "Sending...";
        
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        
        alert("Success! Magic link sent to " + email);
        btn.innerText = "Link Sent!";
    } catch (error) {
        alert("Auth Error: " + error.message);
        btn.disabled = false;
        btn.innerText = "Send Authentication Link";
    }
});

checkExistingAdmin();
