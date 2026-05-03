// scripts/seedAdmin.js
// Run this with "node scripts/seedAdmin.js"
// Note: You will need to install 'firebase' separately if you run this outside the Expo environment,
// or use the firebase-admin SDK. Since this is a one-time utility, we'll use a simple node script
// that explains how it would be structured for the user to run.

/*
To run this script:
1. Ensure you are in a Node environment.
2. Install firebase: npm install firebase
3. Replace the config if necessary.
*/

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyC7YToioK8NsaAhpx5LBvwJL14WlQQQXrU",
    authDomain: "universe-19eae.firebaseapp.com",
    projectId: "universe-19eae",
    storageBucket: "universe-19eae.appspot.com",
    messagingSenderId: "788889906721",
    appId: "1:788889906721:web:8d9f9ead158a3f9a293d60"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedSuperiorAdmin = async () => {
    const adminUID = "SUPERIOR_ADMIN_ID_123"; // This should be the UID from Firebase Auth if already created, or a unique ID if manually managed

    const adminData = {
        uid: adminUID,
        fullName: "Superior Admin",
        username: "@admin",
        email: "admin@college.edu",
        role: "admin",
        adminStatus: "superior",
        createdAt: new Date().toISOString(),
        bio: "System Superior Administrator",
        profilePic: `https://ui-avatars.com/api/?name=Admin&background=E026FF&color=fff&size=256`
    };

    try {
        await setDoc(doc(db, "users", adminUID), adminData);
        console.log("✅ Superior Admin seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
};

seedSuperiorAdmin();
