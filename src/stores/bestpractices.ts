import { getDocs, getDoc, collection, doc, setDoc, addDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { useAuthStore } from './auth';
import { useProjectStore } from './project';

const bestPracticesCollection = collection(db, 'bestPractices');
const areaCollection = collection(db, "areas")

const authStore = useAuthStore();
// const privileges = useAuthStore().privileges;
// console.log(privileges);

const newBestPractice = {
    implementationSteps: [
        { step: {} }
    ]};

export const useBestPracticesStore = defineStore({
    id: 'bestPractices',
    state: () => ({
        id: null as string | null,
        bestPractice: null as any, // TODO type
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
            // querySnapshot.docs;

            return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        },
        async fetchProjectBestPractices(projectId: string) {
            const q = query(bestPracticesCollection, where('projectId', '==', projectId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        },
        async fetchBestPractice(id: string) {
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
        async saveBestPractice() {
            const batch = writeBatch(db);

            const toBeSaved = { ...this.bestPractice, lastModified: serverTimestamp() }
            let bpRef;
            if (this.id) {
                bpRef = doc(bestPracticesCollection, this.id);
                // await setDoc(doc(db, 'bestPractices', this.id), toBeSaved);
            } else {
                toBeSaved.created = serverTimestamp();
                toBeSaved.created_by = authStore.user.uid
                const projectStore = useProjectStore();
                await projectStore.fetchProject(this.bestPractice.projectId)
                // TODO check if projectId is not in bestPractice first!

                toBeSaved.group = projectStore.project.group;
                console.log(toBeSaved);
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

            // Reset state
            this.id = this.bestPractice = null;
            this.projectAreas = null;
            this.bestPracticeAreaIdxs = [];
        },
        async createEmptyBestPractice(projectId: string) {
            this.id = null;
            this.bestPractice = { ...newBestPractice, projectId };
            await this.fetchProjectAreas(projectId);
        }
    }
});

// (defn get-all-projects []
//     (.then (getDocs (query registry-collection))
//            (fn [query-snapshot]
//              ;; (doall (map #(.data %) (.-docs query-snapshot)))
//              ^js/Array (.-docs query-snapshot))))
  
/*
(defn get-user-accessible-projects
    "Returns a list of records accessible by the current user (either public or belonging to one of his groups)"
    []
    (let [user-groups (-> @privileges keys clj->js)
          q           (query registry-collection (where "group" "in" user-groups))
          group-owned (getDocs q)
          user-owned  (query registry-collection (where "created_by" "==" @userid))
          public      (get-public-projects)]
      (.then (js/Promise.all #js [group-owned user-owned public])
             (fn [[g u p]]
               ;; Deduplicate results from the two queries
               (let [duplicates (concat (vec p) (vec ^js/Array (.-docs u)) (vec ^js/Array (.-docs g)))
                     t (into {} (map #(-> [(.-id %) %]) duplicates))]
                 (vals t))))))
  */
