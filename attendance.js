import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config Here */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

// Set default date to today
document.getElementById('attendanceDate').valueAsDate = new Date();

async function initAttendance() {
    if (!classId) return alert("No Class ID provided.");

    // 1. Load Class Info
    const classSnap = await getDoc(doc(db, "classes", classId));
    if (classSnap.exists()) {
        const subSnap = await getDoc(doc(db, "subjects", classSnap.data().subjectId));
        document.getElementById('classTitle').innerText = subSnap.data().name;
    }

    // 2. Fetch Enrolled Students
    const enrollQuery = query(collection(db, "enrollments"), where("classId", "==", classId));
    const enrollSnap = await getDocs(enrollQuery);
    
    const listBody = document.getElementById('studentList');
    listBody.innerHTML = "";

    for (const enrollment of enrollSnap.docs) {
        const studentId = enrollment.data().studentId;
        const studentSnap = await getDoc(doc(db, "students", studentId));
        const s = studentSnap.data();

        listBody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 font-medium">${s.firstName} ${s.lastName}</td>
                <td class="p-3 text-center">
                    <select data-uid="${studentId}" class="status-select border p-1 rounded">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </td>
            </tr>
        `;
    }
}

document.getElementById('saveAttendance').addEventListener('click', async () => {
    const date = document.getElementById('attendanceDate').value;
    const selects = document.querySelectorAll('.status-select');
    
    try {
        for (const select of selects) {
            await addDoc(collection(db, "attendance"), {
                classId: classId,
                studentId: select.dataset.uid,
                date: date,
                status: select.value,
                recordedAt: serverTimestamp()
            });
        }
        alert("Attendance saved successfully!");
        window.location.href = "teacher_dashboard.html";
    } catch (err) {
        console.error(err);
        alert("Error saving attendance.");
    }
});

initAttendance();
