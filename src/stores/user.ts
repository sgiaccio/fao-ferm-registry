import { defineStore } from "pinia";

import {
    getAuth,
    deleteUser,
    type User,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore/lite";

import { db } from '../firebase';


export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        // user: null as User | null,
        // loading: false,
    }),
    actions: {
        async deleteUser(user: User) {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            try {
                await deleteDoc(doc(db, 'users', user.uid));
                await deleteUser(user.uid);

                alert(user.displayName || user.email + ' deleted');
            } catch (error: unknown) {
                if (error instanceof Error) {
                    alert('Error deleting user: ' + error.message);
                } else {
                    alert('Error deleting user');
                }
            }
        }
    }
});
