'firebase/firestore';
import { updateDoc, getDoc, collection, doc, setDoc, addDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { useAuthStore } from './auth';


const userCollection = collection(db, "users")

// institution: "",
// ecosystem: false,
// flagship: false,
// partner: false,
// other: false,
// other_text: "",
// purpose: "",

interface RegistrationData {
    institution: string,
    ecosystem: boolean,
    flagship: boolean,
    partner: boolean,
    other: boolean,
    other_text: string,
    purpose: string,
}

interface UserPrefs {
    bpConsentAccepted?: boolean,
    registrationData?: RegistrationData
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

        // Set dark mode, get it from local storage if it exists
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

    async function register(registrationData: RegistrationData) {
        const authStore = useAuthStore();
        const userRef = doc(userCollection, authStore.user!.uid);

        return setDoc(userRef, { registrationData }, { merge: true }).then(() => {
            // TODO this is not needed, we just need to know if the user has registered
            userPrefs.value.registrationData = registrationData;
        });
    }
    
    function setDarkMode(mode: boolean) {
        darkMode.value = mode;
        window.localStorage.setItem('darkMode', '' + mode);
    }

    return { userPrefs, fetchUserPrefs, acceptBpConsent, register, darkMode, setDarkMode };
});
