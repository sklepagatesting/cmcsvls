import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config Here */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadTeacherClasses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

async function loadTeacherClasses(teacherUid) {
    const classListContainer = document.getElementById('classList');
    
    // 1. Query 'classes' where teacherId matches current user
    const q = query(collection(db, "classes"), where("teacherId", "==", teacherUid));
    const querySnapshot = await getDocs(q);
    
    classListContainer.innerHTML = '';

    if (querySnapshot.empty) {
        classListContainer.innerHTML = `<p class="text-gray-500 col-span-full">No classes assigned yet.</p>`;
        return;
    }

    for (const classDoc of querySnapshot.docs) {
        const classData = classDoc.data();
        
        // 2. Fetch Subject details to get the Name
        const subjectDoc = await getDoc(doc(db, "subjects", classData.subjectId));
        const subjectName = subjectDoc.exists() ? subjectDoc.data().name : "Unknown Subject";

        // 3. Render Card
        classListContainer.innerHTML += `
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <h3 class="text-xl font-bold text-blue-900 mb-1">${subjectName}</h3>
                <p class="text-sm text-gray-500 mb-4">${classData.schoolYear} | Sem ${classData.semester}</p>
                
                <div class="flex gap-2">
                    <button onclick="manageAttendance('${classDoc.id}')" class="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700">Attendance</button>
                    <button onclick="manageGrades('${classDoc.id}')" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">Grades</button>
                </div>
            </div>
        `;
    }
}

// Navigation helpers
window.manageAttendance = (classId) => { window.location.href = `attendance.html?classId=${classId}`; };
window.manageGrades = (classId) => { window.location.href = `grades.html?classId=${classId}`; };

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
