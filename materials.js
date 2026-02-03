import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

// Load Class Name
const classSnap = await getDoc(doc(db, "classes", classId));
const subSnap = await getDoc(doc(db, "subjects", classSnap.data().subjectId));
document.getElementById('classTitle').innerText = `Share with: ${subSnap.data().name}`;

document.getElementById('materialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('uploadBtn');
    btn.disabled = true;
    btn.innerText = "Uploading...";

    const title = document.getElementById('title').value;
    const file = document.getElementById('fileInput').files[0];
    const link = document.getElementById('linkInput').value;
    let finalUrl = link || "";

    try {
        // 1. If there's a file, upload to Storage
        if (file) {
            const storageRef = ref(storage, `materials/${classId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            finalUrl = await getDownloadURL(snapshot.ref);
        }

        // 2. Save metadata to Firestore
        await addDoc(collection(db, "materials"), {
            classId: classId,
            title: title,
            fileUrl: finalUrl,
            type: file ? "file" : "link",
            createdAt: serverTimestamp()
        });

        alert("Material shared!");
        window.location.href = `teacher_dashboard.html`;
    } catch (err) {
        console.error(err);
        alert("Upload failed.");
        btn.disabled = false;
        btn.innerText = "Share with Class";
    }
});
