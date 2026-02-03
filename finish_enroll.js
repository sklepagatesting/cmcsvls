// Inside your completeSignIn function
const result = await signInWithEmailLink(auth, email, window.location.href);
const user = result.user;

// Check if this user already exists in Firestore
const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);

if (!userSnap.exists()) {
    // This is a NEW user
    await setDoc(userRef, {
        email: email,
        role: "student", // Default for everyone
        active: false    // Admin must flip this to true
    });
} else {
    // If Admin pre-created the teacher record, just update the UID
    // Or simply let them in if the record is already fully set up
}
