import { getDocs, getDoc, collection, writeBatch, setDoc, addDoc, doc, query, where, serverTimestamp } from "firebase/firestore"
import { defineStore } from "pinia";

import { db } from "../firebase";

import { snakeToCamel } from "../lib/util"

import { useAuthStore } from './auth';

const projectsCollection = collection(db, "registry")
const areaCollection = collection(db, "areas")

export const useProjectStore = defineStore({
    id: "project",
    state: () => ({
        projects: [] as any[],
        id: null as string | null,
        project: null as any, // TODO
        projectAreas: [] as any[] // TODO
    }),
    actions: {
        resetProjectState() {
            this.id = null;
            this.project = null;
            this.projectAreas = [];
        },
        async fetchProject(id: string) {
            const docRef = doc(db, 'registry', id);
            this.project = snakeToCamel((await getDoc(docRef)).data());

            // This is needed before data is transformed to the detached AOI version
            // Detach areas if present (has not been edited) and store them in a separate variable
            if (this.project.aoi) {
                this.projectAreas = this.project.aoi
                delete this.project.aoi
            } else {
                // TODO else fetch AOIs from separate collection
                const areasRef = doc(areaCollection, id);
                this.projectAreas = (await getDoc(areasRef)).data()?.areas || [];
            }
            this.id = id;
        },
        async fetchGroupOwnedProjects() {
            const authStore = useAuthStore();
            const userGroups = Object.keys(authStore.privileges);

            const q = query(projectsCollection, where("group", "in", userGroups));
            const querySnapshot = await getDocs(q);
            querySnapshot.docs;
            this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
        },
        createEmptyProject() {
            this.id = null;
            this.project = {
                project: {},
                indicators: [],
                results: {}
            }
        },
        async saveProject() {
            const authStore = useAuthStore();

            // Set project additional information
            const projectToBeSaved = {
                ...this.project,
                group: 'MUKCRgfAZxOeevfaerdx',
                created_by: authStore.user.uid,
                'update-time': serverTimestamp()
            };

            // Use a Firestore transaction
            const batch = writeBatch(db);

            let projectRef;
            if (this.id) {
                projectToBeSaved['create-time'] = serverTimestamp();
                projectRef = doc(projectsCollection, this.id);
            } else {
                projectRef = doc(projectsCollection);
            }

            batch.set(projectRef, projectToBeSaved);

            // Save areas in a separate collection
            const areasRef = doc(areaCollection, projectRef.id);
            batch.set(areasRef, { areas: this.projectAreas });
            
            await batch.commit();

            this.resetProjectState();
        }
    }
});



// (defn get-user-accessible-projects
//     "Returns a list of records accessible by the current user (either public or belonging to one of his groups)"
//     []
//     (let [user-groups (-> @privileges keys clj->js)
//           q           (query registry-collection (where "group" "in" user-groups))
//           group-owned (getDocs q)
//           user-owned  (query registry-collection (where "created_by" "==" @userid))
//           public      (get-public-projects)]
//       (.then (js/Promise.all #js [group-owned user-owned public])
//              (fn [[g u p]]
//                ;; Deduplicate results from the two queries
//                (let [duplicates (concat (vec p) (vec ^js/Array (.-docs u)) (vec ^js/Array (.-docs g)))
//                      t (into {} (map #(-> [(.-id %) %]) duplicates))]
//                  (vals t))))))
  