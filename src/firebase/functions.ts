import { httpsCallable, getFunctions } from "firebase/functions";
import { functions } from ".";

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

export async function handleSupportRequest(firstName: string, lastName: string, email: string, message: string) {
    if (!firstName || !lastName || !email || !message) {
        throw new Error('Missing required fields');
    }

    const f = httpsCallable(functions, 'handleSupportRequest');
    return f({ firstName, lastName, email, message });
}

export async function fetchAllUsers() {
    const functions = getFunctions();
    const listAllUsers = httpsCallable(functions, 'listAllUsers');
    const result = await listAllUsers();
    return result.data;
}
  
export async function fetchMyGroupsUsers() {
    const functions = getFunctions();
    const listMyGroupsUsers = httpsCallable(functions, 'listMyGroupsUsers');
    const result = await listMyGroupsUsers();
    return result.data;
}

export async function submitForReview(projectId: string) {
    const functions = getFunctions();
    const submitForReview = httpsCallable(functions, 'submitProject');
    const result = await submitForReview({ projectId });
    return result.data;
}

export async function publishProject(projectId: string) {
    const functions = getFunctions();
    const submitForReview = httpsCallable(functions, 'publishProject');
    const result = await submitForReview({ projectId });
    return result.data;
}

export async function rejectProject(projectId: string, reason: string) {
    const functions = getFunctions();
    const rejectProject = httpsCallable(functions, 'rejectProject');
    const result = await rejectProject({ projectId, reason });
    return result.data;
}
