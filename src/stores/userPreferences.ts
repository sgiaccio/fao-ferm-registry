import { getDoc, collection, doc, setDoc } from 'firebase/firestore/lite';
import { db } from '../firebase';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { useAuthStore } from './auth';


const userCollection = collection(db, 'users')

export interface RegistrationData {
    name: string,
    purpose: string,
}

interface UserPrefs {
    bpConsentAccepted?: boolean,
    registrationData?: RegistrationData,
    previewModalSeen?: boolean,
}

export const useUserPrefsStore = defineStore('userPreferences', () => {
    const userPrefs = ref<UserPrefs>({
        previewModalSeen: localStorage.getItem('previewModalSeen') === 'true',
    });

    async function fetchUserPrefs() {
        const authStore = useAuthStore();

        if (!authStore.user) {
            userPrefs.value = {}
            return;
        }

        const docRef = doc(userCollection, authStore.user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                // userPrefs.value = docSnap.data();
                userPrefs.value = { ...userPrefs.value, ...docSnap.data() };
            }
        } catch (error) {
            // Document does not exist - it will be created when the user completes the registration form
            console.error(error.code);
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

        try {
            await setDoc(userRef, { registrationData }, { merge: true });
            userPrefs.value.registrationData = registrationData;
        } catch (e) {
            alert("Error writing registration data: " + e);
        }
    }

    // TODO - this should be in a separate module as userPrefs only contains the active user data
    async function getRegistrationData(userId: string) {
        const userRef = doc(userCollection, userId);
        const document = await getDoc(userRef);
        if (document.exists()) {
            return document.data()?.registrationData;
        } else {
            return null;
        }
    }

    function setPreviewModalSeen() {
        userPrefs.value.previewModalSeen = true;
        localStorage.setItem('previewModalSeen', 'true');
    }

    return {
        userPrefs,
        fetchUserPrefs,
        acceptBpConsent,
        register,
        getRegistrationData,
        setPreviewModalSeen
    };
});
