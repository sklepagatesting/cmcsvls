import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config Here */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- COURSE LOGIC ---
document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('courseName').value,
        totalYears: document.getElementById('totalYears').value,
        createdAt: serverTimestamp()
    };
    try {
        await addDoc(collection(db, "courses"), data);
        alert("Course Added!");
        e.target.reset();
        loadCourseDropdown();
    } catch (err) { console.error(err); }
});

// --- SUBJECT LOGIC ---
document.getElementById('subjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('subjName').value,
        units: document.getElementById('subjUnits').value,
        courseId: document.getElementById('subjCourseId').value,
        yearLevel: document.getElementById('subjYear').value,
        semester: document.getElementById('subjSem').value
    };
    try {
        await addDoc(collection(db, "subjects"), data);
        alert("Subject Added!");
        e.target.reset();
    } catch (err) { console.error(err); }
});

// Load courses into the dropdown for Subject creation
async function loadCourseDropdown() {
    const dropdown = document.getElementById('subjCourseId');
    const querySnapshot = await getDocs(collection(db, "courses"));
    dropdown.innerHTML = '<option value="">Select Course</option>';
    querySnapshot.forEach((doc) => {
        dropdown.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
}

loadCourseDropdown();
