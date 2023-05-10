import { getDocs, getDoc, collection, writeBatch, doc, query, where, serverTimestamp, orderBy } from 'firebase/firestore/lite'
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { snakeToCamel } from '../lib/util'

import { useAuthStore } from './auth';


const projectsCollection = collection(db, 'registry')
const areaCollection = collection(db, 'areas')
const bestPracticesCollection = collection(db, 'bestPractices');

export const useProjectStore = defineStore({
    id: 'project',
    state: () => ({
        projects: [] as any[],
        id: null as string | null,
        project: null as any, // TODO type
        projectAreas: [] as any[], // TODO type
        loaded: false
    }),
    actions: {
        resetProjectState() {
            this.id = null;
            this.project = null;
            this.projectAreas = [];
            this.loaded = false;
        },
        async fetchProject(projectId: string) {
            this.loaded = false;
            const docRef = doc(db, 'registry', projectId);
            this.project = {
                project: {},
                indicators: [],
                results: {},
                ...snakeToCamel((await getDoc(docRef)).data())
            };

            // This is needed before data is transformed to the detached AOI version
            // Detach areas if present (has not been edited) and store them in a separate variable
            if (this.project.aoi) {
                this.projectAreas = this.project.aoi
                delete this.project.aoi
                this.projectAreas = [];
            } else {
                // TODO else fetch AOIs from separate collection
                const areasRef = doc(areaCollection, projectId);
                this.projectAreas = (await getDoc(areasRef)).data()?.areas || [];
            }

            this.id = projectId;

            // Use a separate flag to indicate that the project is loaded,
            // because projectAreas is never null so it cannot be used to check if all the data is loaded
            this.loaded = true
        },
        async fetchGroupOwnedProjects(groupId: string | null) {
            const authStore = useAuthStore();

            let userGroups: string[] = authStore.privileges ? Object.keys(authStore.privileges) : [];

            if (!authStore.isAdmin && userGroups.length === 0) {
                // if user is not admin and has no groups, return empty array
                return [];
            }

            let q;
            if (groupId) {
                // if a group is selected, get only the projects from that group
                q = query(projectsCollection, where('group', '==', groupId), orderBy('updateTime', 'desc'));
            } else {
                if (authStore.isAdmin) {
                    // if user is admin and no group is selected, get all the projects
                    q = query(projectsCollection, orderBy('updateTime', 'desc'));
                } else {
                    // if user is not admin, get the projects from the groups they belong to
                    q = query(projectsCollection, where('group', 'in', userGroups)), orderBy('updateTime', 'desc');                    
                }
            }

            const querySnapshot = await getDocs(q);
            this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));

            // if (authStore.isAdmin) {
            //     if (groupId) {
            //         // if user is admin and a group is selected, get only the projects from that group
            //         const q = query(projectsCollection, where('group', '==', groupId));
            //         const querySnapshot = await getDocs(q);
            //         this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
            //     } else {
            //         // if user is admin and no group is selected, get all the projects
            //         const q = query(projectsCollection);
            //         const querySnapshot = await getDocs(q);
            //        this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
            //     }
            // } else if (userGroups && userGroups.length > 0) {
            //     // if user is not admin, get the projects from the groups he has access to
            //     const q = query(projectsCollection, where('group', 'in', userGroups))
            //     // const q = query(projectsCollection, where('group', 'in', userGroups));
            //     const querySnapshot = await getDocs(q);
            //     this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));

            // } else {
            //     // if user is not admin and has no groups, return empty array
            //     this.projects = [];
            // }

            // Get related good practices
            await Promise.all(this.projects.map(async (p: any) => {
                const projectId = p.id;
                const q2 = query(bestPracticesCollection, where('projectId', '==', projectId));
                const querySnapshot2 = await getDocs(q2);
                p.nBestPractices = querySnapshot2.size;
            }));
        },
        createEmptyProject(groupId: string) {
            const projectRef = doc(projectsCollection);
            this.id = projectRef.id
            this.project = {
                group: groupId,
                project: {},
                indicators: [],
                results: {}
            }
            this.projectAreas = [];

            this.loaded = true;
        },
        canEdit() {
            const authStore = useAuthStore();

            if (authStore.isAdmin) {
                return true;
            }

            const level = authStore.privileges[this.project.group];
            if (level === 'admin') {
                return true;
            }
            if (level === 'editor' && this.project.created_by === authStore.user.uid) {
                return true
            }

            return false;
        },
        async save() {
            const authStore = useAuthStore();

            // Set project additional information
            const projectToBeSaved = {
                ...this.project,
                'updateTime': serverTimestamp()
            };

            // Use a Firestore transaction
            const batch = writeBatch(db);

            let projectRef;
            if (!projectToBeSaved['createTime']) {
                // It's a new project
                projectToBeSaved['createTime'] = serverTimestamp();
                projectToBeSaved['created_by'] = authStore.user.uid
                projectRef = doc(projectsCollection);
            }

            projectRef = doc(projectsCollection, this.id);
            batch.set(projectRef, projectToBeSaved);

            // Save areas in a separate collection
            const areasRef = doc(areaCollection, projectRef.id);
            batch.set(areasRef, { areas: this.projectAreas });

            await batch.commit();
        },
        async saveAndExit() {
            await this.save();
            this.resetProjectState();
        },
        async deleteProject(projectId: string) {
            const batch = writeBatch(db);

            // Delete project
            const projectRef = doc(db, 'registry', projectId);
            batch.delete(projectRef);

            // Delete areas
            const areasRef = doc(db, 'areas', projectId);
            batch.delete(areasRef);

            // Delete best practices
            // TODO repetition from bestpractices store
            const q = query(bestPracticesCollection, where('projectId', '==', projectId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => { batch.delete(doc.ref) });

            await batch.commit();
            // return this.fetchGroupOwnedProjects();
        }
    }
});
