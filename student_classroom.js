import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

onAuthStateChanged(auth, (user) => {
    if (user && classId) {
        loadClassroomData(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

async function loadClassroomData(studentUid) {
    // 1. Get Subject Name
    const classSnap = await getDoc(doc(db, "classes", classId));
    const subSnap = await getDoc(doc(db, "subjects", classSnap.data().subjectId));
    document.getElementById('navSubject').innerText = subSnap.data().name;

    // 2. Fetch Grade (Specific to this student and class)
    const gradeDoc = await getDoc(doc(db, "grades", `${classId}_${studentUid}`));
    if (gradeDoc.exists()) {
        document.getElementById('collegeGrade').innerText = gradeDoc.data().collegeGrade.toFixed(2);
        document.getElementById('gradeRemarks').innerText = gradeDoc.data().remarks;
    }

    // 3. Fetch Attendance Summary
    const attQ = query(collection(db, "attendance"), where("classId", "==", classId), where("studentId", "==", studentUid));
    const attSnap = await getDocs(attQ);
    let counts = { Present: 0, Absent: 0, Late: 0 };
    attSnap.forEach(doc => { counts[doc.data().status]++; });
    document.getElementById('countP').innerText = counts.Present;
    document.getElementById('countA').innerText = counts.Absent;
    document.getElementById('countL').innerText = counts.Late;

    // 4. Fetch Materials
    const matQ = query(collection(db, "materials"), where("classId", "==", classId));
    const matSnap = await getDocs(matQ);
    const matList = document.getElementById('materialsList');
    matList.innerHTML = matSnap.empty ? '<p class="text-gray-400">No materials uploaded yet.</p>' : '';
    
    matSnap.forEach(doc => {
        const m = doc.data();
        matList.innerHTML += `
            <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                <div>
                    <p class="font-bold text-gray-700">${m.title}</p>
                    <p class="text-xs text-gray-400 uppercase">${m.type}</p>
                </div>
                <a href="${m.fileUrl}" target="_blank" class="text-indigo-600 font-semibold hover:underline">View</a>
            </div>
        `;
    });
}
