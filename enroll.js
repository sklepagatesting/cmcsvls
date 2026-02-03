import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    // PASTE YOUR CONFIG HERE
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const course = document.getElementById('course').value;

    // 1. Basic Password Validation
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        // 2. Create User in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 3. Create permissions record in 'users' collection
        await setDoc(doc(db, "users", uid), {
            email: email,
            role: "student", // Default role
            active: false,   // Must be set to true by Admin
            createdAt: serverTimestamp()
        });

        // 4. Create student profile in 'students' collection
        await setDoc(doc(db, "students", uid), {
            firstName: firstName,
            lastName: lastName,
            course: course,
            yearLevel: 1,
            verified: false,
            uid: uid
        });

        alert("Enrollment Submitted! Please wait for Admin approval before logging in.");
        window.location.href = "login.html";

    } catch (error) {
        console.error("Enrollment Error:", error);
        alert(error.message);
    }
});
