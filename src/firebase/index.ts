import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


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

const auth = getAuth(app)

export { auth }