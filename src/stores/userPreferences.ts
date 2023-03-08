'firebase/firestore';
import { updateDoc, getDoc, collection, doc, setDoc, addDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { useAuthStore } from './auth';


const userCollection = collection(db, "users")

interface UserPrefs {
    bpConsentAccepted?: boolean
}

export const useUserPrefsStore = defineStore('userPreferences', () => {
    // const bpDisclaimerAccepted = ref(false);
    const userPrefs = ref<UserPrefs>({});
    const darkMode = ref<boolean | undefined>();

    async function fetchUserPrefs() {
        const authStore = useAuthStore();

        if (!authStore.user) {
            userPrefs.value = {}
            return;
        }

        const docRef = doc(userCollection, authStore.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            userPrefs.value = docSnap.data();
        } else {
            userPrefs.value = {}
        }

        // this.bpDisclaimerAccepted querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));

        const darkModeSt = window.localStorage.getItem('darkMode');
        if (!darkModeSt) {
            darkMode.value = false;
            window.localStorage.setItem('darkMode', 'false');
        } else {
            darkMode.value = darkModeSt === 'true';
        }

    }

    async function acceptBpConsent() {
        const authStore = useAuthStore();
        const userRef = doc(userCollection, authStore.user!.uid);
        return setDoc(userRef, { bpConsentAccepted: true }, { merge: true }).then(() => {
            userPrefs.value.bpConsentAccepted = true;
        });
    }

    function setDarkMode(mode: boolean) {
        darkMode.value = mode;
        window.localStorage.setItem('darkMode', '' + mode);
    }

    return { userPrefs, fetchUserPrefs, acceptBpConsent, darkMode, setDarkMode }
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
