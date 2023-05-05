import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { initializeFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable, type Functions } from "firebase/functions";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth: Auth, db: Firestore;
let functions: Functions;

// Initialize Firebase
if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
    });

    functions = getFunctions(app);

    if (process.env.NODE_ENV === 'development') {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, "http://localhost:9099");
        connectFunctionsEmulator(functions, "localhost", 5001);
    }
}

async function fetchAllUsers() {
    const functions = getFunctions();
    const listAllUsers = httpsCallable(functions, 'listAllUsers');
    const result = await listAllUsers();
    return result.data;
}
  
async function fetchMyGroupsUsers() {
    const functions = getFunctions();
    const listMyGroupsUsers = httpsCallable(functions, 'listMyGroupsUsers');
    const result = await listMyGroupsUsers();
    return result.data;
}

// async function fetchAssignmentRequestsByGroup(groupId: string) {
//     const assignmentRequestsCollection = collection(db, 'assignmentRequests');
//     const assignmentRequests = await getDocs(query(assignmentRequestsCollection, where('group', '==', groupId)));
//     return assignmentRequests.docs.map(doc => ({ ...doc.data(), id: doc.id }));
// }

export { auth, db, functions, fetchAllUsers, fetchMyGroupsUsers }



// const groupsCollection = collection(db, 'groups');
// const groups = await getDocs(query(groupsCollection, where('private', '==', false)));
// // Create an object with group id as key and group name as value
// return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
