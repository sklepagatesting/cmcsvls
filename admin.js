import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBK-v8xtt7x0AA_btC0oE88IolgU9m5Q3E",
  authDomain: "cmcsvls.firebaseapp.com",
  projectId: "cmcsvls",
  storageBucket: "cmcsvls.firebasestorage.app",
  messagingSenderId: "973791112453",
  appId: "1:973791112453:web:728b9ac51c0f3f89955b6c",
  measurementId: "G-7KEY33ZZHE"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadPendingStudents() {
    const q = query(collection(db, "students"), where("verified", "==", false));
    const querySnapshot = await getDocs(q);
    const tableBody = document.getElementById('pendingStudentsTable');
    tableBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const student = docSnap.data();
        tableBody.innerHTML += `
            <tr class="border-b">
                <td class="px-5 py-5">${student.firstName} ${student.lastName}</td>
                <td class="px-5 py-5">${student.course}</td>
                <td class="px-5 py-5"><span class="text-orange-500 font-bold">Pending</span></td>
                <td class="px-5 py-5">
                    <button onclick="approveStudent('${student.uid}')" class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Approve</button>
                </td>
            </tr>
        `;
    });
}

window.approveStudent = async (uid) => {
    try {
        // 1. Update Student doc
        await updateDoc(doc(db, "students", uid), { verified: true });
        // 2. Update User Auth doc
        await updateDoc(doc(db, "users", uid), { active: true });
        
        alert("Student Approved!");
        loadPendingStudents();
    } catch (e) {
        console.error(e);
    }
};

loadPendingStudents();
