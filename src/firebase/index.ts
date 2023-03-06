import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { initializeFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";


const firebaseConfig = {
    apiKey: "AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M",
    authDomain: "fao-ferm.firebaseapp.com",
    projectId: "fao-ferm",
    storageBucket: "fao-ferm.appspot.com",
    messagingSenderId: "1081330009070",
    appId: "1:1081330009070:web:bdfbf7c72821c9be1784ff"
};

let auth: Auth, db: Firestore;
let functions;

// Initialize Firebase
if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
    });

    functions = getFunctions(app);

    if (process.env.NODE_ENV === 'development') {
        // connectFirestoreEmulator(db, 'localhost', 8080);
        // connectAuthEmulator(auth, "http://localhost:9099");
        // connectFunctionsEmulator(functions, "localhost", 5001);
    }
}

async function fetchAllUsers() {
    const functions = getFunctions();
    const listAllUsers = httpsCallable(functions, 'listAllUsers');
    const result = await listAllUsers();
    return result.data;
}

// (defn get-groups []
//     (.then (getDocs (query groups-collection))
//            (fn [query-snapshot]
//              ^js/Array (.-docs query-snapshot))))
  
export { auth, db, fetchAllUsers }
