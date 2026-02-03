import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. Register Teacher Account
document.getElementById('teacherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('teacherEmail').value;
    const pass = document.getElementById('teacherPass').value;
    const name = document.getElementById('teacherName').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const uid = userCredential.user.uid;

        // Create in 'users' collection
        await setDoc(doc(db, "users", uid), { email, role: "teacher", active: true });
        
        // Create in 'teachers' collection
        await setDoc(doc(db, "teachers", uid), { uid, name, assignedClasses: [] });

        alert("Teacher Registered!");
        loadDropdowns();
    } catch (err) { alert(err.message); }
});

// 2. Create Class Bridge
document.getElementById('classForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const classData = {
        subjectId: document.getElementById('selectSubject').value,
        teacherId: document.getElementById('selectTeacher').value,
        schoolYear: document.getElementById('schoolYear').value,
        semester: document.getElementById('semester').value
    };

    try {
        await addDoc(collection(db, "classes"), classData);
        alert("Class Created Successfully!");
    } catch (err) { console.error(err); }
});

// Load Dropdowns
async function loadDropdowns() {
    const subSelect = document.getElementById('selectSubject');
    const teaSelect = document.getElementById('selectTeacher');

    // Fetch Subjects
    const subSnap = await getDocs(collection(db, "subjects"));
    subSelect.innerHTML = subSnap.docs.map(d => `<option value="${d.id}">${d.data().name}</option>`).join('');

    // Fetch Teachers
    const teaSnap = await getDocs(collection(db, "teachers"));
    teaSelect.innerHTML = teaSnap.docs.map(d => `<option value="${d.id}">${d.data().name}</option>`).join('');
}

loadDropdowns();
