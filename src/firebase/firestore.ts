import { query, where } from "firebase/firestore";
import { db } from "./index";

import { collection, doc, getDocs, setDoc } from '@firebase/firestore';

export async function requestGroupAssignment(uid: string, groupId: string, reasons: string) {
    if (!uid || !groupId) {
        throw new Error('Missing uid or groupId');
    }

    const usersCollection = collection(db, 'assignementRequests');
    const docRef = doc(usersCollection);
    await setDoc(docRef, {
        user: uid,
        group: groupId,
        status: 'pending', // TODO status should be set in the backend
        reasons: reasons
    });
}

export async function getAssignmentRequests(uid: string) {
    const usersCollection = collection(db, 'assignementRequests');
    const q = query(usersCollection, where("user", "==", uid));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => doc.data());
    return requests;
}

export async function submitNewInstitution(institution: string, userId: string) {
    if (!institution || !userId) {
        throw new Error('Missing institution or userId');
    }

    const newInstitution = {
        name: institution,
        user: userId,
        status: 'pending'
    };
    const institutionsCollection = collection(db, 'proposedInstitutions');
    const docRef = doc(institutionsCollection);
    await setDoc(docRef, newInstitution);
}
