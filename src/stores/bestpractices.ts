import { getDocs, getDoc, collection, doc, setDoc, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { useAuthStore } from './auth';

const bestPracticesCollection = collection(db, 'bestPractices');
const areaCollection = collection(db, "areas")
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
        bestPractice: null as any, // TODO
        projectAreas: null as any // TODO use the ones in project store?
    }),
    actions: {
        async fetchOwnedBestPractices() {
            const authStore = useAuthStore();
            
            if (authStore.isAdmin) {
                const fsDocs = await getDocs(bestPracticesCollection);
                return fsDocs.docs
            } else if (true) {
                // TODO
                const fsDocs = await getDocs(bestPracticesCollection);
                return fsDocs.docs;
            }
        },
        async fetchBestPractice(id: string) {
            const docRef = doc(db, 'bestPractices', id);
            this.bestPractice = (await getDoc(docRef)).data();
            this.id = id;

            if (this.bestPractice.projectId) {
                this.fetchProjectAreas(this.bestPractice.projectId);
            }
        },
        async fetchProjectAreas(projectId: string) {
            const areasRef = doc(areaCollection, projectId);
            this.projectAreas = (await getDoc(areasRef)).data()?.areas || [];
        },
        async saveBestPractice() {
            const toBeSaved = { ...this.bestPractice, lastModified: serverTimestamp() }
            if (this.id) {
                await setDoc(doc(db, 'bestPractices', this.id), toBeSaved);
            } else {
                toBeSaved.created = serverTimestamp();
                await addDoc(bestPracticesCollection, toBeSaved);
            }

            // Reset state
            this.id = this.bestPractice = null;
        },
        createEmptyBestPractice(projectId: string) {
            this.id = null;
            this.bestPractice = { ...newBestPractice, projectId };
            this.fetchProjectAreas(projectId);
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
