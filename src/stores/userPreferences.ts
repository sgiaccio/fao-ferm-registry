import { getDocs, getDoc, collection, doc, setDoc, addDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { useAuthStore } from './auth';

const userCollection = collection(db, "users")

const authStore = useAuthStore();

export const useUserPrefsStore = defineStore({
    id: 'userPreferences',
    state: () => ({
        bpDisclaimerAccepted: null as boolean | null,
    }),
    actions: {
        async fetchUser() {
            const docRef = doc(userCollection, authStore.user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
            } else {
                // doc.data() will be undefined in this case
                // console.log("No such document!");
                // TODO?
            }

            // this.bpDisclaimerAccepted querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        },
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
