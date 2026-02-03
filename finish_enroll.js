import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* ... Same config as above ... */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function completeAdminSetup() {
    const status = document.getElementById('statusMessage');

    // 1. Verify if the URL is a valid sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        // If user opened link on a different device, ask for email again
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }

        try {
            // 2. Sign the user in
            const result = await signInWithEmailLink(auth, email, window.location.href);
            const user = result.user;

            // 3. Create the SuperAdmin document in Firestore
            // This bypasses the role check because the user is now 'isSignedIn' 
            // and writing to their own UID.
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "superadmin",
                active: true,
                createdAt: serverTimestamp()
            });

            status.innerText = "SuperAdmin created successfully! Redirecting to Dashboard...";
            window.localStorage.removeItem('emailForSignIn');
            setTimeout(() => { window.location.href = "admin_dashboard.html"; }, 3000);

        } catch (error) {
            console.error("Setup completion error:", error);
            status.innerText = "Error: " + error.message;
        }
    }
}

completeAdminSetup();
