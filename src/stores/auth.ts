import { defineStore } from "pinia";

import {
    signOut,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    GoogleAuthProvider,
    signInWithPopup,
    type User,
} from "firebase/auth";

import { db, auth } from "@/firebase";

import { httpsCallable } from "firebase/functions";

import { collection, query, getDocs, where, documentId } from "firebase/firestore/lite";

import router from '@/router';

import { functions } from '../firebase'


const provider = new GoogleAuthProvider();

// const baseUrl = process.env.NODE_ENV === 'development'
//     ? 'http://localhost:5173'
//     : 'http://ferm.fao.org';

const baseUrl = import.meta.env.VITE_BASE_URL;

const actionCodeSettings = {
    url: baseUrl,
    handleCodeInApp: true,
};

//   auth.onAuthStateChanged(async user => {
//     if (user === null) {
//         //
//     } else {
//         debugger;
//         // this.user = user;
//         // TODO repetition
//         const idToken = await user.getIdTokenResult();
//         if (idToken) {
//             // this.isAdmin = idToken.claims.admin as unknown as boolean,
//             // this.privileges = idToken.claims.privileges || {}
//         }

//         await router.isReady();
//         if (router.currentRoute.value.path === "/login") {
//             // router.push(this.returnUrl); // TODO
//         }

//         // get user groups
//         // const groupIds = Object.keys(this.privileges);

//         const groupsCollection = collection(db, 'groups');
//         const setUserGroups = getDocs(query(groupsCollection, where(documentId(), 'in', groupIds)))
//             .then(groups => {
//                 // this.userGroups = groups
//                 // this.userGroups = groups.docs.reduce((prev, current) =>
//                 //     ({ ...prev, [current.id]: current.data().name }), {});
//             });

//         // TODO fetch user preferences in parallel

//         await setUserGroups
//         // TODO await for user pref
//     }
//     // this.authLoaded = true;
// });

export const useAuthStore = defineStore({
    id: "auth",
    state: () => ({
        authLoaded: false,
        uid: null as string | null,
        user: null as User | null,
        isAdmin: false,
        isGroupAdmin: false,
        privileges: {},
        userGroups: {},
        returnUrl: '/'
    }),
    actions: {
        async signInWithEmail(email: string) {
            actionCodeSettings.url = baseUrl + this.returnUrl;
            await sendSignInLinkToEmail(auth, email, actionCodeSettings)
            window.localStorage.setItem('emailForSignIn', email);
        },
        async logout() {
            // const auth = getAuth();
            await signOut(auth);

            this.user = null;
            this.uid = null;
            this.isAdmin = false;
            this.isGroupAdmin = false;
            this.privileges = {};
            this.authLoaded = false;
            
            await router.push('/');
        },
        async setUserData(user: User | null) {
            if (user === null) {
                // console.debug('User is null');
            } else {
                this.user = user;
                this.uid = user.uid;

                // Get user privileges
                const idToken = await user.getIdTokenResult(true);
                if (idToken) {
                    this.isAdmin = idToken.claims.admin as unknown as boolean,
                        this.privileges = idToken.claims.privileges as any || {};

                    this.isGroupAdmin = Object.values(this.privileges).some((priv: any) => priv === 'admin');
                }

                // await router.isReady();
                // if (router.currentRoute.value.path === "/login") {
                //     this.authLoaded = true;
                //     router.push(this.returnUrl);
                // }

                // Get user group names
                const groupIds = Object.keys(this.privileges);
                const groupsCollection = collection(db, 'groups');

                // Set user groups
                if (groupIds.length) {
                    await getDocs(query(groupsCollection, where(documentId(), 'in', groupIds)))
                        .then(groups => {
                            // this.userGroups = groups
                            this.userGroups = groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
                        });

                    // TODO fetch user preferences in parallel
                }
            }
            this.authLoaded = true;
        },
        async fetchUser() {
            // const auth = getAuth();
            // auth.onAuthStateChanged(async user => { this.setUserData(user); });

            if (isSignInWithEmailLink(auth, window.location.href)) {
                // Additional state parameters can also be passed via URL.
                // This can be used to continue the user's intended action before triggering
                // the sign-in operation.
                // Get the email if available. This should be available if the user completes
                // the flow on the same device where they started it.
                let email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    // User opened the link on a different device. To prevent session fixation
                    // attacks, ask the user to provide the associated email again. For example:
                    email = window.prompt('Please provide your email for confirmation');
                }
                // The client SDK will parse the code from the link for you.
                await signInWithEmailLink(auth, email!, window.location.href)
                    .then(async (result) => {
                        // Clear email from storage.
                        window.localStorage.removeItem('emailForSignIn');
                        // You can access the new user via result.user
                        // Additional user info profile not available via:
                        // result.additionalUserInfo.profile == null
                        // You can check if the user is new or existing:
                        // result.additionalUserInfo.isNewUser

                        // const user = result.user;
                        // console.log(user);
                        // await this.setUserData(user);

                        // TODO handle continueUrl
                        // const queryString = window.location.search;
                        // const urlParams = new URLSearchParams(queryString);
                        // let continueUrl = urlParams.get('continueUrl');
                        // if (!continueUrl || continueUrl.includes('login')) {
                        //     continueUrl = '/';
                        // }
                        // await this.setUserData(result.user);
                    }).catch(error => {
                        alert('Some error occurred: ' + error.code);
                        // Some error occurred, you can inspect the code: error.code
                        // Common errors could be invalid email and invalid or expired OTPs.
                    });
            }

            return new Promise((resolve, reject) => {
                // const auth = getAuth();
                auth.onAuthStateChanged(async user => {
                    await this.setUserData(user)
                    resolve(user);
                }, () => reject(''))
            });
        },

        async fetchAllGroups() {
            const groupsCollection = collection(db, 'groups');
            const groups = await getDocs(query(groupsCollection));
            // Create an object with group id as key and group name as value
            return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
        },

        // async fetchPublicGroups() {
        //     // hide private groups - for now private groups are only used to hide them from the list of the groups proposed for the user to join
        //     const groupsCollection = collection(db, 'groups');
        //     const groups = await getDocs(query(groupsCollection, where('private', '==', false)));
        //     // Create an object with group id as key and group name as value
        //     return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
        // },


        async signInWithGoogle() {
            await signInWithPopup(auth, provider);

            // This is a repetition from main.ts
            // It is needed because we are using a popup so the page is not laaded again
            // Will find a better way to do this
            await this.fetchUser();
            await router.isReady();
            // if (router.currentRoute.value.path === "/login") {
            this.authLoaded = true;
            await router.push(this.returnUrl);
            // }
        },

        async signUp(email: string, fullName: string) {
            try {
                const signUp = httpsCallable(functions, 'signUp');
                await signUp({ email, fullName });
                window.localStorage.setItem('emailForSignIn', email);
            } catch (error: any) {
                console.error(error.details?.code);
                throw error.details?.code ? Error(error.details.code, { cause: error }) : error;
            }
        }
    }
});
