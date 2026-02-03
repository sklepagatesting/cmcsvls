import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

// Grade Conversion Logic
function convertToCollegeGrade(num) {
    if (num < 75) return { grade: 5.0, remarks: "Failed" };
    if (num >= 98) return { grade: 1.0, remarks: "Excellent" };
    if (num >= 95) return { grade: 1.25, remarks: "Very Good" };
    if (num >= 92) return { grade: 1.5, remarks: "Very Good" };
    if (num >= 89) return { grade: 1.75, remarks: "Good" };
    if (num >= 86) return { grade: 2.0, remarks: "Good" };
    if (num >= 83) return { grade: 2.25, remarks: "Satisfactory" };
    if (num >= 80) return { grade: 2.5, remarks: "Satisfactory" };
    if (num >= 77) return { grade: 2.75, remarks: "Fair" };
    return { grade: 3.0, remarks: "Passing" };
}

async function initGrades() {
    const classSnap = await getDoc(doc(db, "classes", classId));
    const subSnap = await getDoc(doc(db, "subjects", classSnap.data().subjectId));
    document.getElementById('classTitle').innerText = subSnap.data().name;

    const enrollQuery = query(collection(db, "enrollments"), where("classId", "==", classId));
    const enrollSnap = await getDocs(enrollQuery);
    const listBody = document.getElementById('gradeList');

    for (const enrollment of enrollSnap.docs) {
        const studentId = enrollment.data().studentId;
        const sSnap = await getDoc(doc(db, "students", studentId));
        const s = sSnap.data();

        listBody.innerHTML += `
            <tr class="border-b">
                <td class="p-4 font-medium">${s.firstName} ${s.lastName}</td>
                <td class="p-4">
                    <input type="number" data-uid="${studentId}" class="grade-input w-20 border-2 p-1 rounded" min="0" max="100">
                </td>
                <td class="p-4 font-bold text-blue-700" id="equiv-${studentId}">-</td>
                <td class="p-4 text-sm" id="rem-${studentId}">-</td>
            </tr>
        `;
    }

    // Add event listeners for real-time conversion
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const uid = e.target.dataset.uid;
            if (!isNaN(val)) {
                const res = convertToCollegeGrade(val);
                document.getElementById(`equiv-${uid}`).innerText = res.grade.toFixed(2);
                document.getElementById(`rem-${uid}`).innerText = res.remarks;
            }
        });
    });
}

document.getElementById('saveGrades').addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.grade-input');
    try {
        for (const input of inputs) {
            const uid = input.dataset.uid;
            const numVal = parseFloat(input.value);
            const res = convertToCollegeGrade(numVal);

            // Use setDoc with a composite ID to avoid duplicate grade entries for the same class
            await setDoc(doc(db, "grades", `${classId}_${uid}`), {
                classId,
                studentId: uid,
                numericGrade: numVal,
                collegeGrade: res.grade,
                remarks: res.remarks,
                updatedAt: serverTimestamp()
            });
        }
        alert("Grades saved successfully!");
        window.location.href = "teacher_dashboard.html";
    } catch (err) { console.error(err); }
});

initGrades();
