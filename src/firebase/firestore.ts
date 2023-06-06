import { query, serverTimestamp, where, collection, doc, getDocs, setDoc } from "firebase/firestore/lite";
import { db } from "./index";
import { snakeToCamel } from "@/lib/util";


export async function requestGroupAssignment(uid: string, groupId: string, userName: string, email: string, reasons: string) {
    if (!uid || !groupId) {
        throw new Error("Missing uid or groupId");
    }

    const usersCollection = collection(db, "assignementRequests");
    const docRef = doc(usersCollection);
    await setDoc(docRef, {
        userId: uid,
        groupId: groupId,
        // userEmail: email,
        // userName: userName,
        // TODO status should be set in the backend. Checking that it's 'pending' in firestore.rules anyway
        status: "pending",
        reasons: reasons,
        createTime: serverTimestamp()
    });
}

/**
 * Get the list of groups that the user has requested to be assigned to
 * @param userId
 */
export async function getUserAssignmentRequests(uid: string) {
    const usersCollection = collection(db, "assignementRequests");
    const q = query(usersCollection, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => doc.data());

    return requests;
}

export async function submitNewInstitution(formData: any) {
    // check if the data is valid
    // TODO

    const newGroupRequests = collection(db, "newGroupRequests");
    const docRef = doc(newGroupRequests);
    await setDoc(docRef, formData);
}


export async function fetchAllGroups(): Promise<{ [key: string]: string }> {
    const groupsCollection = collection(db, "groups");
    const groups = await getDocs(query(groupsCollection));
    // Create an object with group id as key and group name as value
    return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
}

export async function fetchPublicGroups() {
    // hide private groups - for now private groups are only used to hide them from the list of the groups proposed for the user to join
    const groupsCollection = collection(db, "groups");
    const groups = await getDocs(query(groupsCollection, where("private", "==", false)));
    // Create an object with group id as key and group name as value
    return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
}

export async function fetchSubmittedProjects(groupIds: string[]) {
    if (!groupIds || groupIds.length === 0) {
        return [];
    }
    const projectsCollection = collection(db, "registry");
    // fetch the projects that belong to the groups that the user is a member of and that are published
    const projects = await getDocs(query(projectsCollection,
        // where("group", "in", groupIds),
        where("status", "==", "submitted")));
    return projects.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
}

