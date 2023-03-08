import { getDocs, getDoc, collection, doc, setDoc, addDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { useAuthStore } from './auth';
import { useProjectStore } from './project';

import type BestPractice from '../lib/bestpractice';


const bestPracticesCollection = collection(db, 'bestPractices');
const areaCollection = collection(db, "areas")

const authStore = useAuthStore();  

const newBestPractice = {
    implementationSteps: [
        { step: {} }
    ]
};

export const useBestPracticesStore = defineStore({
    id: 'bestPractices',
    state: () => ({
        id: null as string | null,
        bestPractice: null as BestPractice | null,
        projectAreas: null as any, // TODO use the ones in project store?
        bestPracticeAreaIdxs: []
    }),
    actions: {
        async fetchOwnedBestPractices() {
            // if (authStore.isAdmin) {
            //     const fsDocs = await getDocs(bestPracticesCollection);
            //     return fsDocs.docs
            // } else {
            //     // TODO
            //     const fsDocs = await getDocs(bestPracticesCollection);
            //     return fsDocs.docs;
            // }

            const userGroups = Object.keys(authStore.privileges);

            const q = query(bestPracticesCollection, where('group', 'in', userGroups));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        },
        async fetchProjectBestPractices(projectId: string) {
            const q = query(bestPracticesCollection, where('projectId', '==', projectId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        },
        async fetch(id: string) {
            const docRef = doc(db, 'bestPractices', id);
            this.bestPractice = (await getDoc(docRef)).data();
            this.id = id;

            if (this.bestPractice.projectId) {
                let t = [];
                await this.fetchProjectAreas(this.bestPractice.projectId);
                for (let i = 0; i < this.projectAreas.length; i++) {
                    const area = this.projectAreas[i];
                    const obj = Object.entries(area)[0][1];
                    if (obj.bestPractices && obj.bestPractices[this.id]) {
                        t.push(i);
                    }
                }
                this.bestPracticeAreaIdxs = t;
            }
        },
        async fetchProjectAreas(projectId: string) {
            const areasRef = doc(areaCollection, projectId);
            this.projectAreas = (await getDoc(areasRef)).data()?.areas || [];
        },

        async save() {
            const batch = writeBatch(db);

            const toBeSaved = { ...this.bestPractice, lastModified: serverTimestamp() }
            let bpRef;
            if (this.id) {
                bpRef = doc(bestPracticesCollection, this.id);
            } else {
                toBeSaved.created = serverTimestamp();
                toBeSaved.created_by = authStore.user.uid
                const projectStore = useProjectStore();
                await projectStore.fetchProject(this.bestPractice.projectId)
                // TODO check if projectId is not in bestPractice first!

                toBeSaved.group = projectStore.project.group;

                bpRef = doc(bestPracticesCollection);
                this.id = bpRef.id;
            }
            batch.set(bpRef, toBeSaved);

            // Add best practice ids to project areas - they are saved in a separate collection
            const projectAreasCopy = JSON.parse(JSON.stringify(this.projectAreas));
            projectAreasCopy.forEach((area, i) => {
                const obj = Object.entries(area)[0][1]; // unique object attribute
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
            const areasRef = doc(areaCollection, this.bestPractice.projectId);
            batch.set(areasRef, { areas: projectAreasCopy });
                        
            await batch.commit();
        },

        resetBestPracticeState() {
            this.id = this.bestPractice = null;
            this.projectAreas = null;
            this.bestPracticeAreaIdxs = [];
        },

        // async saveAndExit() {
        //     await this.save();
        //     this.resetBestPracticeState();
        // },

        async createEmpty(projectId: string) {
            this.id = null;
            this.bestPractice = { ...newBestPractice, projectId };
            await this.fetchProjectAreas(projectId);
        },

        async submit(id: string) {
            const bpRef = doc(bestPracticesCollection, id);
            setDoc(bpRef, { status: 'submitted' }, { merge: true });
        },
        
        async canSetStatus(newStatus: 'draft' | 'submitted' | 'published') {
            // Global administrators can do whatever they want
            if (authStore.isAdmin) {
                return newStatus === 'submitted' && (!this.bestPractice.status || this.bestPractice.status === 'draft');
                // TODO add other conditions
            }

            const projectStore = useProjectStore();
            try {
                await projectStore.fetchProject(this.bestPractice.projectId);
                const level = authStore.privileges[projectStore.project.group];

                // Group administrators can do whatever they want in their group
                if (level === 'admin') {
                    return newStatus === 'submitted' && (!this.bestPractice.status || this.bestPractice.status === 'draft');
                    // TODO add other conditions
                }

                // Editors can only change from draft to submitted
                if (level === 'editor' && projectStore.project.created_by === authStore.user!.uid) {
                    return newStatus === 'submitted' && (!this.bestPractice.status || this.bestPractice.status === 'draft');
                    // TODO add other conditions
                }
            } catch (e) {
                alert("Error in checking privileges for this record");
            }
            return false;
        }
    }
});
