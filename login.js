import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config Here */ };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // 1. Authenticate with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Fetch User Role and Status from Firestore
        const userDoc = await getDoc(doc(db, "users", uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // 3. Check if account is active (Approved by Admin)
            if (userData.role === 'student' && !userData.active) {
                alert("Your account is pending approval by the Admin.");
                await auth.signOut();
                return;
            }

            // 4. Role-Based Redirection
            switch (userData.role) {
                case 'superadmin':
                    window.location.href = "admin.html";
                    break;
                case 'teacher':
                    window.location.href = "teacher_dashboard.html";
                    break;
                case 'student':
                    window.location.href = "student_portal.html";
                    break;
                default:
                    alert("Unauthorized role. Contact admin.");
            }
        } else {
            alert("User data not found.");
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Invalid credentials. Please try again.");
    }
});
