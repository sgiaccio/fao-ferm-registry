import { getDocs, getDoc, collection, doc, setDoc, addDoc, query, where } from "firebase/firestore"
import { defineStore } from "pinia";

import { db } from "../firebase";

import { useAuthStore } from './auth';

// const projectsCollection = collection(db, "projects")

// function fetchProject(id: string) {
//     const docRef = doc(db, "registry", id)
// }

// let document;

const bestPracticesCollection = collection(db, "bestPractices");
// const privileges = useAuthStore().privileges;
// console.log(privileges);

export const useBestPracticesStore = defineStore({
    id: 'bestPractices',
    state: () => ({
        id: null as string | null,
        bestPractice: null as any // TODO
    }),
    actions: {
        async fetchOwnedBestPractices() {
            const store = useAuthStore();
            
            if (store.isAdmin) {
                const asdf = await getDocs(bestPracticesCollection);
                return asdf.docs
            } else if (true) {
                // TODO
                const fsDocs = await getDocs(bestPracticesCollection);
                return fsDocs.docs;
            }

            // const q = query(bestPracticesCollection, "");
        },
        async fetchBestPractice(id: string) {
            const docRef = doc(db, 'bestPractices', id);
            this.bestPractice = (await getDoc(docRef)).data();
            this.id = id
            // return this.bestPractice;
        },
        async saveBestPractice() {
            if (this.id) {
                await setDoc(doc(db, 'bestPractices', this.id), this.bestPractice);
            } else {
                await addDoc(bestPracticesCollection, this.bestPractice);
            }
        },
        createEmptyDoc() {
            this.id = null;
            this.bestPractice = {};
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
