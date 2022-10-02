import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth"
import { initializeFirestore, Firestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey:            "AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M",
    authDomain:        "fao-ferm.firebaseapp.com",
    projectId:         "fao-ferm",
    storageBucket:     "fao-ferm.appspot.com",
    messagingSenderId: "1081330009070",
    appId:             "1:1081330009070:web:bdfbf7c72821c9be1784ff"
};

// Initialize Firebase
let auth: Auth, db: Firestore;

if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
    });
    // db = getFirestore(app);
}

export { auth, db }

