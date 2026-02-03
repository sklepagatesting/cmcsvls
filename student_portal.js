import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config Here */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadStudentData(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

async function loadStudentData(uid) {
    // 1. Load Student Profile
    const studentDoc = await getDoc(doc(db, "students", uid));
    if (studentDoc.exists()) {
        const s = studentDoc.data();
        document.getElementById('studentName').innerText = `${s.firstName} ${s.lastName}`;
        document.getElementById('studentDetails').innerText = `${s.course} - Year ${s.yearLevel}`;
    }

    // 2. Load Enrolled Classes via Enrollments collection
    const enrollQ = query(collection(db, "enrollments"), where("studentId", "==", uid));
    const enrollSnap = await getDocs(enrollQ);
    const container = document.getElementById('enrolledClasses');
    container.innerHTML = '';

    for (const enrollDoc of enrollSnap.docs) {
        const classId = enrollDoc.data().classId;
        
        // Fetch Class Details
        const classSnap = await getDoc(doc(db, "classes", classId));
        if (classSnap.exists()) {
            const cData = classSnap.data();
            
            // Fetch Subject Name
            const subDoc = await getDoc(doc(db, "subjects", cData.subjectId));
            const subName = subDoc.exists() ? subDoc.data().name : "Unknown Subject";
            
            // Fetch Teacher Name
            const teachDoc = await getDoc(doc(db, "teachers", cData.teacherId));
            const teachName = teachDoc.exists() ? teachDoc.data().name : "TBA";

            container.innerHTML += `
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <h4 class="text-lg font-bold text-indigo-900 mb-1">${subName}</h4>
                    <p class="text-sm text-gray-600 mb-4">Instructor: ${teachName}</p>
                    <button onclick="viewClassroom('${classId}')" 
                            class="w-full bg-indigo-50 text-indigo-700 py-2 rounded font-semibold hover:bg-indigo-100 transition">
                        Enter Classroom
                    </button>
                </div>
            `;
        }
    }
}

window.viewClassroom = (classId) => {
    window.location.href = `student_classroom.html?classId=${classId}`;
};

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
