import { defineStore } from "pinia";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    // onAuthStateChanged,
    // signOut,
    // sendPasswordResetEmail,
    // sendEmailVerification
} from "firebase/auth";

import { auth } from '../firebase'
import router from '@/router';


export const useAuthStore = defineStore({
    id: "auth",
    state: () => ({
        user: null as any,
        isAdmin: false,
        privileges: {},

        returnUrl: '/projects/1/info' // TODO
    }),
    actions: {
        async register(email: string, password: string) {
            try {
                await createUserWithEmailAndPassword(auth, email, password); 
            } catch (error: any) {
                switch(error.code) {
                    case "auth/email-already-in-use":
                        alert("Email already in use");
                        break;
                    case "auth/invalid-email":
                        alert("Invalid email");
                        break;
                    case "auth/operation-not-allowed":
                        alert("Operation not allowed");
                        break;
                    case "auth/weak-password":
                        alert("Weak password");
                        break;
                    default:
                        alert("Something went wrong");
                }
                return;
            }

            this.user = auth.currentUser;

            router.push("/");

            // await signInWithEmailAndPassword(auth, email, password);
            // const privileges = await getUserAccessPrivileges();
    
            // // update pinia state
            // this.userId     = userId;
            // this.isAdmin    = privileges.admin;
            // this.privileges = privileges.privileges;

            // // redirect to previous url or default to home page
            // router.push(this.returnUrl);
        },

        async login(email: string, password: string) {
            try {
                await signInWithEmailAndPassword(auth, email, password); 
            } catch (error: any) {
                switch(error.code) {
                    case "auth/user-not-found":
                        alert("User not found");
                        break;
                    case "auth/wrong-password":
                        alert("Wrong password");
                        break;
                    default:
                        alert("Something went wrong");
                }
                return;
            }

            this.user = auth.currentUser;

            const idToken = await this.user.getIdTokenResult();
            console.log(idToken)
            if (idToken) {
                this.isAdmin = idToken.claims.admin,
                this.privileges = idToken.claims.privileges || {}
            }

            router.push(this.returnUrl);
        },

        async logout() {
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

        fetchUser() {
            auth.onAuthStateChanged(async user => {
                if (user === null) {
                    //
                } else {
                    this.user = user;
                    // TODO repetition
                    const idToken = await user.getIdTokenResult();
                    if (idToken) {
                        this.isAdmin = idToken.claims.admin as unknown as boolean,
                        this.privileges = idToken.claims.privileges || {}
                    }

                    await router.isReady();
                    if (router.currentRoute.value.path === "/login") {
                        router.push(this.returnUrl); // TODO
                    }
                }
            });
        }
    }
});
