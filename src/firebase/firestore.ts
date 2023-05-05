import { query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./index";

import { collection, doc, getDocs, setDoc } from '@firebase/firestore';

// import { getAuth } from "firebase/auth";

import { functions } from './index';
import { httpsCallable } from "firebase/functions";



export async function requestGroupAssignment(uid: string, groupId: string, userName: string, email: string, reasons: string) {
    if (!uid || !groupId) {
        throw new Error('Missing uid or groupId');
    }

    const usersCollection = collection(db, 'assignementRequests');
    const docRef = doc(usersCollection);
    await setDoc(docRef, {
        userId: uid,
        groupId: groupId,
        // userEmail: email,
        // userName: userName,
        // TODO status should be set in the backend. Checking that it's 'pending' in firestore.rules anyway
        status: 'pending',
        reasons: reasons,
        createTime: serverTimestamp()
    });
}

/**
 * Get the list of groups that the user has requested to be assigned to
 * @param userId
 */
export async function getUserAssignmentRequests(uid: string) {
    const usersCollection = collection(db, 'assignementRequests');
    const q = query(usersCollection, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => doc.data());

    return requests;
}

// async function fetchAllUsers() {
//     const functions = getFunctions();
//     const listAllUsers = httpsCallable(functions, 'listAllUsers');
//     const result = await listAllUsers();
//     return result.data;
// }


export async function getMyGroupsAssigmentRequests() {
    const f = httpsCallable(functions, 'getMyGroupsAssigmentRequests');
    const result = await f();

    return result.data;
}
    
export async function handleGroupAssignmentRequest(requestId: string, newStatus: 'accepted' | 'rejected') {
    const f = httpsCallable(functions, 'handleGroupAssignmentRequest');
    const result = await f({ requestId, status: newStatus });

    return result.data;
}

// name: '',
// type: '',
// otherType: '',
// unDecade: null,
// isa: {
//     partner: false,
//     actor: false,
//     flagship: false
// }

export async function submitNewInstitution(formData: any) {
    // check if the data is valid
    // TODO

    const newGroupRequests = collection(db, 'newGroupRequests');
    const docRef = doc(newGroupRequests);
    await setDoc(docRef, formData);
}
