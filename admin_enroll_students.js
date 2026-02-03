import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config Here */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initEnrollmentPage() {
    const studentSelect = document.getElementById('studentSelect');
    const classSelect = document.getElementById('classSelect');

    // 1. Fetch only Verified Students
    const studentQ = query(collection(db, "students"), where("verified", "==", true));
    const studentSnap = await getDocs(studentQ);
    studentSelect.innerHTML = '<option value="">-- Choose Student --</option>';
    studentSnap.forEach(snap => {
        const s = snap.data();
        studentSelect.innerHTML += `<option value="${snap.id}">${s.firstName} ${s.lastName} (${s.course})</option>`;
    });

    // 2. Fetch Classes and their associated Subject names
    const classSnap = await getDocs(collection(db, "classes"));
    classSelect.innerHTML = '<option value="">-- Choose Class --</option>';
    
    for (const classDoc of classSnap.docs) {
        const c = classDoc.data();
        // Get Subject Name for the label
        const subDoc = await getDoc(doc(db, "subjects", c.subjectId));
        const subName = subDoc.exists() ? subDoc.data().name : "Unknown Subject";
        
        classSelect.innerHTML += `<option value="${classDoc.id}">${subName} | ${c.schoolYear} (Sem ${c.semester})</option>`;
    }
}

document.getElementById('enrollStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('studentSelect').value;
    const classId = document.getElementById('classSelect').value;

    try {
        await addDoc(collection(db, "enrollments"), {
            studentId: studentId,
            classId: classId,
            status: "active",
            enrolledAt: serverTimestamp()
        });

        alert("Student successfully enrolled in the class!");
        e.target.reset();
    } catch (err) {
        console.error("Enrollment error:", err);
        alert("Failed to enroll student.");
    }
});

initEnrollmentPage();
