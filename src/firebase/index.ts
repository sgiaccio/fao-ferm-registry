import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey:            "AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M",
    authDomain:        "fao-ferm.firebaseapp.com",
    projectId:         "fao-ferm",
    storageBucket:     "fao-ferm.appspot.com",
    messagingSenderId: "1081330009070",
    appId:             "1:1081330009070:web:bdfbf7c72821c9be1784ff"
};

// Initialize Firebase
let app, auth: Auth, db: Firestore;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

export { auth, db }
