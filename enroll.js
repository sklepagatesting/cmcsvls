import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

document.getElementById('enrollForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Collect Data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const studentData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        studentId: document.getElementById('studentId').value,
        birthday: document.getElementById('birthday').value,
        gender: document.getElementById('gender').value,
        course: document.getElementById('course').value,
        yearLevel: document.getElementById('yearLevel').value,
        address: document.getElementById('address').value,
        role: "student",
        verified: false, // Must be approved by Admin
        status: "enrolled",
        createdAt: serverTimestamp()
    };

    try {
        // 2. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Create User Document in 'users' collection
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: "student",
            active: false // Critical for MVP: cannot login until true
        });

        // 4. Create Student Document in 'students' collection
        await setDoc(doc(db, "students", user.uid), {
            uid: user.uid,
            ...studentData
        });

        alert("Enrollment submitted! Please wait for Admin approval.");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Error during enrollment:", error);
        alert(error.message);
    }
});
