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

export async function getMyNewGroupRequests() {
    const f = httpsCallable(functions, 'getMyNewGroupRequests');
    const result = await f();

    return result.data;
}

export async function approveNewGroupRequest(requestId: string) {
    const f = httpsCallable(functions, 'approveNewGroupRequest');
    const result = await f({ requestId });

    return result.data;
}

export async function rejectNewGroupRequest(requestId: string) {
    const f = httpsCallable(functions, 'rejectNewGroupRequest');
    const result = await f({ requestId });

    return result.data;
}

export async function handleSupportRequest(firstName: string, lastName: string, email: string, message: string) {
    if (!firstName || !lastName || !email || !message) {
        throw new Error('Missing required fields');
    }

    const f = httpsCallable(functions, 'handleSupportRequest');
    return f({ firstName, lastName, email, message });
}

export async function getAllUsers() {
    const functions = getFunctions();
    const listAllUsers = httpsCallable(functions, 'listAllUsers');
    const result = await listAllUsers();
    return result.data;
}

export async function getAdminGroupsUsers() {
    const functions = getFunctions();
    const listAdminGroupsUsers = httpsCallable(functions, 'listAdminGroupsUsers');
    const result = await listAdminGroupsUsers();
    return result.data;
}

// export async function getMyGroupsUsers() {
//     const functions = getFunctions();
//     const listMyGroupsUsers = httpsCallable(functions, 'listMyGroupsUsers');
//     const result = await listMyGroupsUsers();
//     return result.data;
// }

export async function submitForReview(projectId: string) {
    const functions = getFunctions();
    const submitForReview = httpsCallable(functions, 'submitProject');
    const result = await submitForReview({ projectId });
    return result.data;
}

export async function publishProject(projectId: string) {
    const functions = getFunctions();
    // const publishProject = httpsCallable(functions, 'publishProject');
    const publishProject = httpsCallable(functions, 'publishAndVersionProject');
    const result = await publishProject({ projectId });
    return result.data;
}

export async function rejectProject(projectId: string, reason: string) {
    const functions = getFunctions();
    const rejectProject = httpsCallable(functions, 'rejectProject');
    const result = await rejectProject({ projectId, reason });
    return result.data;
}

export async function getPolygonZonalStats(polygonId: string, stats: string, options: any) {
    const functions = getFunctions();
    const getPolygonZonalStats = httpsCallable(functions, 'getPolygonZonalStats');
    const result = await getPolygonZonalStats({ polygonId, stats, options });
    return result.data;
}

// export async function deleteAllProjectAreas(projectId: string) {
//     const functions = getFunctions();
//     const deleteAllProjectAreas = httpsCallable(functions, 'deleteAllProjectAreas');
//     const result = await deleteAllProjectAreas({ projectId });
//     return result.data;
// }

export async function getIntersectingCountries(uuids: string[]): Promise<Set<string>> {
    const functions = getFunctions();
    const callGetIntersectingCountries = httpsCallable(functions, 'getIntersectingCountries');

    try {
        const result = await callGetIntersectingCountries({ uuids });
        return new Set(result.data as string[]);
    } catch (error) {
        console.error('Error fetching intersecting countries:', error);
        throw error;
    }
}

export async function getGroupEditors(groupId: string) {
    const functions = getFunctions();
    const listGroupEditors = httpsCallable(functions, 'listGroupEditors');
    const result = await listGroupEditors({ groupId });
    return result.data;
}

export async function addProjectCollaboator(projectId: string, uid: string) {
    const functions = getFunctions();
    const addProjectCollaboator = httpsCallable(functions, 'addProjectCollaborator');
    const result = await addProjectCollaboator({ projectId, uid });
    return result.data;
}

export async function saveProjectCollaborators(projectId: string, collaboratorsUids: string[]) {
    const functions = getFunctions();
    const saveProjectCollaborators = httpsCallable(functions, 'saveProjectCollaborators');
    return saveProjectCollaborators({ projectId, collaboratorsUids });
}

export async function getProjectAreas(projectId: string) {
    const functions = getFunctions();
    const getProjectAreas = httpsCallable(functions, 'getProjectAreas');
    const result = await getProjectAreas({ projectId });
    return result.data;
}

export async function createNewProjectVersion(projectId: string) {
    const reviseProject = httpsCallable(functions, 'reviseProject');
    const result = await reviseProject({ projectId });
    return result.data;
}

export async function makeCoverPhoto(projectId: string, filePath: string) {
    const functions = getFunctions();
    const makeCoverPhoto = httpsCallable(functions, 'makeCoverPhoto');
    const result = await makeCoverPhoto({ projectId, filePath });
    return result.data;
}

export async function getAllProjectAreasGeoJson(projectId: string, uuids: string[]) {
    const functions = getFunctions();
    const getAllProjectAreasGeoJson = httpsCallable(functions, 'getAllProjectAreasGeoJson');
    const result = await getAllProjectAreasGeoJson({ projectId, uuids });
    return result.data;
}
