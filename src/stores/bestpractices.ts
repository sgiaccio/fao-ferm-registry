import {
    getDocs,
    getDoc,
    collection,
    collectionGroup,
    doc,
    setDoc,
    query,
    where,
    serverTimestamp,
    writeBatch,
    FieldValue,
} from 'firebase/firestore/lite';
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { useAuthStore } from './auth';
import { useProjectStore } from './project';

import type BestPractice from '../lib/bestpractice';

interface BestPracticeForSave extends BestPractice {
    lastModified: FieldValue;
    created?: FieldValue;
    created_by?: string;
}

// const bestPracticesCollection = collection(db, 'bestPractices');

// This function returns the reference to the bestPractices subcollection for a given projectId
function bestPracticesSubcollection(projectId: string) {
    return collection(db, `registry/${projectId}/bestPractices`);
}
const bestPracticesCollectionGroup = collectionGroup(db, 'bestPractices');
const areaCollection = collection(db, 'areas');

const authStore = useAuthStore();

const newBestPractice = {
    implementationSteps: [{ step: {} }],
    status: 'draft',
};

export const useBestPracticesStore = defineStore({
    id: 'bestPractices',
    state: () => ({
        id: null as string | null,
        bestPractice: null as BestPractice | null,
        projectId: null as string | null,
        projectAreas: null as any, // TODO use the ones in project store?
        bestPracticeAreaIdxs: [] as number[],
    }),
    actions: {
        resetBestPracticesState() {
            this.id = null;
            this.bestPractice = null;
            this.projectAreas = null;
            this.bestPracticeAreaIdxs = [];
        },
        // async fetchOwnedBestPractices() {
        //     // if (authStore.isAdmin) {
        //     //     const fsDocs = await getDocs(bestPracticesCollection);
        //     //     return fsDocs.docs
        //     // } else {
        //     //     // TODO
        //     //     const fsDocs = await getDocs(bestPracticesCollection);
        //     //     return fsDocs.docs;
        //     // }

        //     let q;
        //     if (authStore.isAdmin) {
        //         q = query(bestPracticesCollection);
        //         // const fsDocs = await getDocs(bestPracticesCollection);
        //         // return fsDocs.docs
        //     } else {
        //         const userGroups = Object.keys(authStore.privileges);
        //         q = query(bestPracticesCollection, where('group', 'in', userGroups));
        //     }

        //     const querySnapshot = await getDocs(q);
        //     return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        // },
        async fetchOwnedBestPractices() {
            let bestPracticeGroupQuery;

            if (authStore.isAdmin) {
                bestPracticeGroupQuery = query(bestPracticesCollectionGroup);
            } else {
                const userGroups = Object.keys(authStore.privileges);
                bestPracticeGroupQuery = query(
                    bestPracticesCollectionGroup,
                    where('group', 'in', userGroups),
                );
            }

            const bestPracticeSnapshot = await getDocs(bestPracticeGroupQuery);
            return bestPracticeSnapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
            }));
        },

        // async fetchProjectBestPractices(projectId: string) {
        //     const q = query(bestPracticesCollection, where('projectId', '==', projectId));
        //     const querySnapshot = await getDocs(q);
        //     return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        // },
        async fetchProjectBestPractices(projectId: string) {
            const q = query(bestPracticesSubcollection(projectId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
            }));
        },

        // async fetch_(id: string) {
        //     const docRef = doc(db, 'bestPractices', id);
        //     this.bestPractice = (await getDoc(docRef)).data();
        //     this.id = id;

        //     if (this.bestPractice.projectId) {
        //         let t = [];
        //         await this.fetchProjectAreas(this.bestPractice.projectId);
        //         for (let i = 0; i < this.projectAreas.length; i++) {
        //             const area = this.projectAreas[i];
        //             const obj = Object.entries(area)[0][1];
        //             if (obj.bestPractices && obj.bestPractices[this.id]) {
        //                 t.push(i);
        //             }
        //         }
        //         this.bestPracticeAreaIdxs = t;
        //     }
        // },
        async fetch(projectId: string, bestPracticeId: string) {
            const docRef = doc(
                bestPracticesSubcollection(projectId),
                bestPracticeId,
            );
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                this.bestPractice = docSnapshot.data() as BestPractice;
                this.id = bestPracticeId;
                this.projectId = projectId;

                if (projectId) {
                    await this.fetchProjectAreas(projectId);
                    this.bestPracticeAreaIdxs = this.projectAreas
                        .map((area: any, index: number) => {
                            const obj: any = Object.values(area)[0];
                            return this.id && obj.bestPractices?.[this.id]
                                ? index
                                : null;
                        })
                        .filter((i: any) => i !== null);
                }
            } else {
                console.error(
                    `No document found with projectId ${projectId} and bestPracticeId ${bestPracticeId}`,
                );
            }
        },

        async fetchProjectAreas(projectId: string) {
            const areasDocRef = doc(areaCollection, projectId);
            this.projectAreas = (await getDoc(areasDocRef)).data()?.areas || [];
        },

        async save() {
            if (!authStore.user) {
                return;
            }

            if (!this.projectId) {
                console.error('No projectId set');
                return;
            }

            if (!this.bestPractice) {
                console.error('No bestPractice set');
                return;
            }

            const batch = writeBatch(db);

            try {
                const toBeSaved: BestPracticeForSave = {
                    ...this.bestPractice,
                    lastModified: serverTimestamp(),
                };
                let bpRef;
                if (this.id) {
                    // it's an existing best practice
                    bpRef = doc(
                        bestPracticesSubcollection(this.projectId),
                        this.id,
                    );
                } else {
                    // it's a new best practice
                    toBeSaved.created = serverTimestamp();
                    toBeSaved.created_by = authStore.user.uid;
                    const projectStore = useProjectStore();
                    await projectStore.fetchProject(this.projectId);

                    // group is not needed anymore as it's in the parent document
                    // toBeSaved.group = projectStore.project.group;

                    bpRef = doc(bestPracticesSubcollection(this.projectId));
                    this.id = bpRef.id;
                }
                batch.set(bpRef, toBeSaved);

                // Add best practice ids to project areas - they are saved in a separate collection
                const projectAreasCopy = JSON.parse(
                    JSON.stringify(this.projectAreas),
                );
                projectAreasCopy.forEach((area: any, i: number) => {
                    const obj: any = Object.values(area)[0];
                    if (!obj) return;
                    if (this.bestPracticeAreaIdxs?.includes(i)) {
                        if (!obj.bestPractices) obj.bestPractices = {};
                        obj.bestPractices[this.id!] = true;
                    } else {
                        if (obj.bestPractices) {
                            delete obj.bestPractices[this.id!];
                        }
                    }
                });

                // Save areas in a separate collection
                const areasRef = doc(areaCollection, this.projectId);
                batch.set(areasRef, { areas: projectAreasCopy });

                await batch.commit();
            } catch (e) {
                console.error(e);
                alert('Error in saving best practice');
            }
        },

        resetBestPracticeState() {
            this.id = this.bestPractice = null;
            this.projectAreas = null;
            this.bestPracticeAreaIdxs = [];
            this.projectId = null;
        },

        // async saveAndExit() {
        //     await this.save();
        //     this.resetBestPracticeState();
        // },

        async createEmpty(projectId: string) {
            this.id = null;
            this.projectId = projectId;
            this.bestPractice = {
                ...newBestPractice,
                projectId: projectId,
            };
            await this.fetchProjectAreas(projectId);
        },

        async submit(id: string) {
            if (!this.projectId) {
                console.error('No projectId set');
                return;
            }
            const bpRef = doc(bestPracticesSubcollection(this.projectId), id);
            setDoc(bpRef, { status: 'submitted' }, { merge: true });
        },

        async canSetStatus(newStatus: 'draft' | 'submitted' | 'published') {
            if (!this.bestPractice) {
                console.error('No bestPractice set');
                return false;
            }

            if (!this.projectId) {
                console.error('No projectId set');
                return false;
            }

            // Global administrators can do whatever they want
            if (authStore.isAdmin) {
                return (
                    newStatus === 'submitted' &&
                    (!this.bestPractice.status ||
                        this.bestPractice.status === 'draft')
                );
                // TODO add other conditions
            }

            const projectStore = useProjectStore();
            try {
                await projectStore.fetchProject(this.projectId);
                const level = authStore.privileges[projectStore.project.group];
                // Group administrators can do whatever they want in their group
                if (level === 'admin') {
                    return (
                        newStatus === 'submitted' &&
                        (!this.bestPractice.status ||
                            this.bestPractice.status === 'draft')
                    );
                    // TODO add other conditions
                }

                // Editors can only change from draft to submitted
                if (
                    level === 'editor' &&
                    projectStore.project.created_by === authStore.user!.uid
                ) {
                    return (
                        newStatus === 'submitted' &&
                        (!this.bestPractice.status ||
                            this.bestPractice.status === 'draft')
                    );
                    // TODO add other conditions
                }
            } catch (e) {
                alert('Error in checking privileges for this record');
            }
            return false;
        },
    },
});
