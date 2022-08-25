import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { collection, getDocs, query, where } from "firebase/firestore"; 


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


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


// const querySnapshot = await getDocs(collection(db, "registry"));
// querySnapshot.forEach((doc) => {
//   console.log(`${doc.id} => ${doc.data()}`);
// });


const querySnapshot = await getDocs(query(collection(db, "registry"), where("public", "==", "true")))
// querySnapshot.forEach((doc) => {
//   console.log(`${doc.id} => ${doc.data()}`);
// });

// (defn get-public-projects []
//     (.then (getDocs (query registry-collection (where "public" "==" true)))
//            (fn [query-snapshot]
//             ;;  (doall (map #(.data %) (.-docs query-snapshot)))
//              ^js/Array (.-docs query-snapshot))))
  

// (defn get-all-projects []
//     (.then (getDocs (query registry-collection))
//            (fn [query-snapshot]
//              ;; (doall (map #(.data %) (.-docs query-snapshot)))
//              ^js/Array (.-docs query-snapshot))))
