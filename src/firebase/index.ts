import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { initializeFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore/lite';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
;

let auth: Auth, db: Firestore;
let functions: Functions;
let functionsEuropeWest3: Functions;
let storage: FirebaseStorage;
let analytics: any;

// Initialize Firebase
if (!getApps().length) {
    const app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    });

    // Only use analytics in production
    if (import.meta.env.MODE === 'production') {
        analytics = getAnalytics(app);
    }
    db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
    });

    auth = getAuth(app);
    functions = getFunctions(app);
    functionsEuropeWest3 = getFunctions(app, 'europe-west3'); // ideally all functions should be in EuropeWest3
    storage = getStorage(app);

    if (process.env.NODE_ENV === 'development') {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFunctionsEmulator(functions, 'localhost', 5001);
        connectFunctionsEmulator(functionsEuropeWest3, 'localhost', 5001);
        connectStorageEmulator(storage, 'localhost', 9199);
    }
}

export { auth, db, functions, functionsEuropeWest3, storage, analytics };
