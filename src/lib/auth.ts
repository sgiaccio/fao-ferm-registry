import { initializeApp } from "firebase/app"

import {
    getAuth,
    signInWithEmailAndPassword,
    // onAuthStateChanged,
    // signOut,
    // sendPasswordResetEmail,
    // sendEmailVerification
} from "firebase/auth";

// import {
//     getFunctions,
//     httpsCallable,
//     connectFunctionsEmulator
// } from "firebase/functions";

// import {
//     getFirestore,
//     collection,
//     doc,
//     setDoc
// } from "firebase/firestore/lite"

const firebaseConfig = {
    apiKey:            "AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M",
    authDomain:        "fao-ferm.firebaseapp.com",
    projectId:         "fao-ferm",
    storageBucket:     "fao-ferm.appspot.com",
    messagingSenderId: "1081330009070",
    appId:             "1:1081330009070:web:bdfbf7c72821c9be1784ff"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth()
// const functions = getFunctions()


async function getIdToken() {
    return auth.currentUser?.getIdTokenResult();
}
auth.onAuthStateChanged((user) => {
    console.log("AuthStateChanged");
    console.log(user);
})
export function onAuthStateChanged(fn: (user: any) => undefined) {
    auth.onAuthStateChanged(fn)
}

export async function authenticateUser(email: string, password: string): Promise<string | null> {
    try {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        return credentials.user.uid;
    } catch(e) {
        alert("Error logging in"); // TODO better message
        return null;
    }
}

export async function logout() {
    await auth.signOut();
}

// (defn logout []
//     (-> (signOut auth)
//         (.then #(reset! userid nil))
//         (.catch #(js/alert "Error logging out"))))
  
export async function getUserAccessPrivileges(): Promise<{ admin: boolean, privileges: object}> {
    const idToken = await getIdToken();
    if (idToken) {
        return {
            admin: idToken.claims.admin as unknown as boolean,
            privileges: idToken.claims.privileges as object || {}
        }
    }
    throw Error("Not logged in");
}
