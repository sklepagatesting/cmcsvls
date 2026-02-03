// Inside your finish_enroll.js completeSignIn() function
const urlParams = new URLSearchParams(window.location.search);
const isInitialSetup = urlParams.get('init') === 'true';

const result = await signInWithEmailLink(auth, email, window.location.href);
const user = result.user;

const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);

if (!userSnap.exists()) {
    await setDoc(userRef, {
        email: email,
        // IF coming from setup page, make superadmin, otherwise student
        role: isInitialSetup ? "superadmin" : "student",
        active: isInitialSetup ? true : false
    });
    
    alert(isInitialSetup ? "SuperAdmin Created!" : "Enrollment Pending.");
    window.location.href = isInitialSetup ? "admin.html" : "login.html";
}
