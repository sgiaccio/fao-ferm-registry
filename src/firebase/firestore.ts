import { query, serverTimestamp, where, collection, doc, getDocs, setDoc } from 'firebase/firestore/lite';
import { db } from './index';
import { snakeToCamel } from '@/lib/util';
import type { Menu, RecursiveMenu } from '@/components/project/menus';


/**
 * Request to join a group
 * @param uid
 * @param groupId
 * @param reasons
 * TODO: check if the user is already a member of the group
 * TODO: check if the user has already requested to join the group
*/
export async function requestGroupAssignment(uid: string, groupId: string, reasons: string, email: string) {
    if (!uid || !groupId || !reasons || !email) {
        throw new Error("Missing uid or groupId or reasons");
    }

    const usersCollection = collection(db, "assignementRequests");
    const docRef = doc(usersCollection);
    await setDoc(docRef, {
        userId: uid,
        email,
        groupId,
        // TODO status should be set in the backend. Checking that it's 'pending' in firestore.rules anyway
        reasons,
        status: 'pending',
        createTime: serverTimestamp(),
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

export async function submitNewGroup(formData: any) {
    // TODO check if the data is valid

    const newGroupRequests = collection(db, "newGroupRequests");
    const docRef = doc(newGroupRequests);
    await setDoc(docRef, {
        ...formData,
        private: false,
        createTime: serverTimestamp()
    });
}

async function getGroups() {
    const groupsCollection = collection(db, "groups");
    const groups = await getDocs(query(groupsCollection));
    return groups.docs;
}

export async function fetchAllGroupNames(): Promise<{ [key: string]: string }> {
    // Create an object with group id as key and group name as value
    const groupDocs = await getGroups();
    return groupDocs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
}

export async function fetchAllGroups(): Promise<{ [key: string]: string }> {
    // Create an object with group id as key and group data as value
    const groupDocs = await getGroups();
    return groupDocs.reduce((prev, current) => ({ ...prev, [current.id]: current.data() }), {});
}

export async function fetchPublicGroups() {
    // hide private groups - for now private groups are only used to hide them from the list of the groups proposed for the user to join
    const groupsCollection = collection(db, 'groups');
    const groups = await getDocs(query(groupsCollection, where('private', '==', false)));
    // Create an object with group id as key and group name as value
    return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data() }), {});
}

export async function fetchSubmittedProjects(groupIds: string[]) {
    if (!groupIds || groupIds.length === 0) {
        return [];
    }
    const projectsCollection = collection(db, "registry");
    // fetch the projects that belong to the groups that the user is a member of and that are published
    const projects = await getDocs(query(projectsCollection,
        where("group", "in", groupIds),
        where("status", "==", "submitted")));
    return projects.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
}

export async function fetchAllSubmittedProjects() {
    const projectsCollection = collection(db, "registry");
    const projects = await getDocs(query(projectsCollection, where("status", "==", "submitted")));
    return projects.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
}

function memoize<T extends (...args: any[]) => Promise<any>>(fn: T): (...x: Parameters<T>) => Promise<ReturnType<T>> {
    const cache: { [key: string]: any } = {};
    return function (...x: Parameters<T>): Promise<ReturnType<T>> {
        const args = JSON.stringify(x);

        if (!cache[args]) {
            cache[args] = fn.apply(undefined, x).catch((err: any) => {
                delete cache[args]; // remove from cache if promise was rejected
                throw err; // re-throw the error so it can be handled downstream
            });
        }

        return cache[args]
    }
}

export const getGaulLevel0 = memoize(async () => {
    const gaulCollection = collection(db, "gaul");
    const level0AreasDocs = await getDocs(query(gaulCollection));
    return level0AreasDocs.docs.map(doc => ({ value: doc.id, label: doc.data().name })).sort((a, b) => a.label.localeCompare(b.label));
});


export const getGaulLevel1 = memoize(async (admin0: string) => {
    const gaulCollection = collection(db, "gaul", admin0, "children");
    const level1AreasDocs = await getDocs(query(gaulCollection));
    return level1AreasDocs.docs.map(doc => ({ value: doc.id, label: doc.data().name })).sort((a, b) => a.label.localeCompare(b.label));
});

export const getGaulLevel2 = memoize(async (admin0: string, admin2: string) => {
    const gaulCollection = collection(db, "gaul", admin0, "children", admin2, "children");
    const level2AreasDocs = await getDocs(query(gaulCollection));
    return level2AreasDocs.docs.map(doc => ({ value: doc.id, label: doc.data().name })).sort((a, b) => a.label.localeCompare(b.label));
});

export async function getMenus(): Promise<{ [key: string]: (Menu | RecursiveMenu) }> {
    const menusCollection = collection(db, "menus");
    return (await getDocs(query(menusCollection))).docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().items }), {});
};

// export const getMenu = memoize(async (id) => {
//     const menusCollection = collection(db, "menus", id);
//     return getDocs(query(menusCollection));
// });
