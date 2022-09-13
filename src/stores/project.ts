import { getDocs, getDoc, collection, doc } from "firebase/firestore"
import { defineStore } from "pinia";

import { db } from "../firebase";


const projectsCollection = collection(db, "projects")

// function fetchProject(id: string) {
//     const docRef = doc(db, "registry", id)
// }





export const useProjectStore = defineStore({
    id: "project",
    state: () => ({
        project: null as any // TODO
    }),
    actions: {
        fetchProject(id: string) {
            const docRef = doc(db, "registry", id);
            this.project = getDoc(docRef);
            return this.project;
        }
    }
});
