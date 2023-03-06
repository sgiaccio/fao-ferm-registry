import { defineStore } from "pinia";

// import { auth } from '../firebase'
import {
    signOut,
    getAuth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    type User,
    getRedirectResult
} from "firebase/auth";
import { collection, query, getDocs, where, documentId } from "firebase/firestore";


import router from '@/router';

import { db } from '../firebase';




import { GoogleAuthProvider } from "firebase/auth";
import { signInWithRedirect } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();



const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : 'http://ferm.fao.org';

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: baseUrl,
    // url: 'http://ferm.fao.org',
    // url: 'http://127.0.0.1:5173',
    // This must be true.
    handleCodeInApp: true,
    // iOS: {
    //   bundleId: 'com.example.ios'
    // },
    // android: {
    //   packageName: 'com.example.android',
    //   installApp: true,
    //   minimumVersion: '12'
    // },
    // dynamicLinkDomain: 'example.page.link'
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
        user: null as User | null,
        isAdmin: false,
        privileges: {},
        userGroups: {},
        returnUrl: '/'
    }),
    actions: {
        // async register(email: string, password: string) {
        //     try {
        //         await createUserWithEmailAndPassword(auth, email, password);
        //     } catch (error: any) {
        //         switch (error.code) {
        //             case "auth/email-already-in-use":
        //                 alert("Email already in use");
        //                 break;
        //             case "auth/invalid-email":
        //                 alert("Invalid email");
        //                 break;
        //             case "auth/operation-not-allowed":
        //                 alert("Operation not allowed");
        //                 break;
        //             case "auth/weak-password":
        //                 alert("Weak password");
        //                 break;
        //             default:
        //                 alert(`Sorry, something went wrong. Error code: ${error.code}`);
        //         }
        //         return;
        //     }

        //     this.user = auth.currentUser;

        //     router.push("/");

        //     // await signInWithEmailAndPassword(auth, email, password);
        //     // const privileges = await getUserAccessPrivileges();

        //     // // update pinia state
        //     // this.userId     = userId;
        //     // this.isAdmin    = privileges.admin;
        //     // this.privileges = privileges.privileges;

        //     // // redirect to previous url or default to home page
        //     // router.push(this.returnUrl);
        // },

        async login(email: string) {
            const auth = getAuth();
            actionCodeSettings.url = baseUrl + this.returnUrl;
            sendSignInLinkToEmail(auth, email, actionCodeSettings)
                .then(() => {
                    // The link was successfully sent. Inform the user.
                    // Save the email locally so you don't need to ask the user for it again
                    // if they open the link on the same device.
                    window.localStorage.setItem('emailForSignIn', email);
                    alert("An email was sent to you to complete the login, please click on the link provided.");
                })
                .catch((error) => {
                    // const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(`Sorry, something went wrong: ${errorMessage}`);
                });
            // try {
            //     await signInWithEmailAndPassword(auth, email, password);
            // } catch (error: any) {
            //     switch(error.code) {
            //         case "auth/user-not-found":
            //             alert("User not found");
            //             break;
            //         case "auth/wrong-password":
            //             alert("Wrong password");
            //             break;
            //         default:
            //             alert(`Sorry, something went wrong. Error code: ${error.code}`);
            //     }
            //     return;
            // }

            // this.user = auth.currentUser;

            // const idToken = await this.user.getIdTokenResult();
            // if (idToken) {
            //     this.isAdmin = idToken.claims.admin,
            //     this.privileges = idToken.claims.privileges || {}
            // }

            // router.push(this.returnUrl);
        },

        async logout() {
            const auth = getAuth();
            await signOut(auth);

            this.user = null;
            this.isAdmin = false;
            this.privileges = {};

            router.push('/login')

            // try {
            //     await logout();

            //     // update pinia state
            //     this.userId = null;
            //     this.isAdmin = false;
            //     this.privileges = {};
            // } catch(error) {
            //     alert("Error logging out"); // TODO: better message
            // }
        },
        async setUserData(user: User | null) {
            if (user === null) {
                console.log('user is null');
            } else {
                this.user = user;

                // Get user privileges
                const idToken = await user.getIdTokenResult(true);
                if (idToken) {
                    this.isAdmin = idToken.claims.admin as unknown as boolean,
                        this.privileges = idToken.claims.privileges || {};
                }
                await router.isReady();
                if (router.currentRoute.value.path === "/login") {
                    router.push(this.returnUrl);
                }

                // Get user group names
                const groupIds = Object.keys(this.privileges);
                const groupsCollection = collection(db, 'groups');

                if (groupIds.length) {
                    const setUserGroups = getDocs(query(groupsCollection, where(documentId(), 'in', groupIds)))
                        .then(groups => {
                            // this.userGroups = groups
                            this.userGroups = groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
                        });

                    // TODO fetch user preferences in parallel
                    await setUserGroups;
                }
                // const userPrefsStore = useUserPrefsStore();
                // await userPrefsStore.fetchUserPrefs();
            }
            this.authLoaded = true;
        },
        async fetchUser() {
            const auth = getAuth();

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
                return signInWithEmailLink(auth, email!, window.location.href)
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
                        await this.setUserData(result.user);
                    })
                    .catch(error => {
                        alert('Some error occurred: ' + error.code);
                        // Some error occurred, you can inspect the code: error.code
                        // Common errors could be invalid email and invalid or expired OTPs.
                    });
            }

            auth.onAuthStateChanged(async user => { this.setUserData(user); });
        },

        async getAllGroups() {
            const groupsCollection = collection(db, 'groups');
            const groups = await getDocs(query(groupsCollection));
            return groups.docs.reduce((prev, current) => ({ ...prev, [current.id]: current.data().name }), {});
        },

        loginWithGoogle() {
            signInWithRedirect(auth, provider);
        }

        // fetchUser_() {
        //     const auth = getAuth();
        //     auth.onAuthStateChanged(async user => {
        //         if (user === null) {
        //             //
        //         } else {
        //             this.user = user;
        //             // TODO repetition
        //             const idToken = await user.getIdTokenResult();
        //             if (idToken) {
        //                 this.isAdmin = idToken.claims.admin as unknown as boolean,
        //                     this.privileges = idToken.claims.privileges || {}
        //             }

        //             await router.isReady();
        //             if (router.currentRoute.value.path === "/login") {
        //                 router.push(this.returnUrl); // TODO
        //             }

        //             // get user groups
        //             const groupIds = Object.keys(this.privileges);

        //             const groupsCollection = collection(db, 'groups');
        //             const setUserGroups = getDocs(query(groupsCollection, where(documentId(), 'in', groupIds)))
        //                 .then(groups => {
        //                     // this.userGroups = groups
        //                     this.userGroups = groups.docs.reduce((prev, current) =>
        //                         ({ ...prev, [current.id]: current.data().name }), {});
        //                 });

        //             // TODO fetch user preferences in parallel

        //             await setUserGroups
        //             // TODO await for user pref
        //         }
        //         this.authLoaded = true;
        //     });
        // },

        // (defn get-groups []
        //     (.then (getDocs (query groups-collection))
        //            (fn [query-snapshot]
        //              ^js/Array (.-docs query-snapshot))))


        // getAccessToken() {
        //     return this.user.accessToken;
        // }
    }
});


// (defn get-access-token []
//     (.. auth -currentUser -accessToken))
