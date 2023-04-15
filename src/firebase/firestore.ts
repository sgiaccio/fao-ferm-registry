import { query, where } from "firebase/firestore";
import { db } from "./index";

import { collection, doc, getDocs, setDoc } from '@firebase/firestore';

export async function requestGroupAssignment(uid: string, groupId: string) {
    const usersCollection = collection(db, 'assignementRequests');
    const docRef = doc(usersCollection);
    await setDoc(docRef, {
        user: uid,
        group: groupId,
        status: 'pending'
    });
}

export async function getAssignmentRequests(uid: string) {
    const usersCollection = collection(db, 'assignementRequests');
    const q = query(usersCollection, where("user", "==", uid));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => doc.data());
    return requests;
}

