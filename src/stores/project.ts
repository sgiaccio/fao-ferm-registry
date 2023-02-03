import { getDocs, getDoc, collection, writeBatch, setDoc, addDoc, doc, query, where, serverTimestamp, orderBy } from 'firebase/firestore'
import { defineStore } from 'pinia';

import { db } from '../firebase';

import { snakeToCamel } from '../lib/util'

import { useAuthStore } from './auth';

const projectsCollection = collection(db, 'registry')
const areaCollection = collection(db, 'areas')
const bestPracticesCollection = collection(db, 'bestPractices');

export const useProjectStore = defineStore({
    id: 'project',
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
        async fetchProject(projectId: string) {
            const docRef = doc(db, 'registry', projectId);
            this.project = {
                project: {},
                indicators: [],
                results: {},
                ...snakeToCamel((await getDoc(docRef)).data())
            };

            // This is needed before data is transformed to the detached AOI version
            // Detach areas if present (has not been edited) and store them in a separate variable
            if (this.project.aoi) {
                this.projectAreas = this.project.aoi
                delete this.project.aoi
                this.projectAreas = [];
            } else {
                // TODO else fetch AOIs from separate collection
                const areasRef = doc(areaCollection, projectId);
                this.projectAreas = (await getDoc(areasRef)).data()?.areas || [];
            }

            this.id = projectId;
        },
        async fetchGroupOwnedProjects(groupId: string | null) {
            const authStore = useAuthStore();
            let userGroups = null;
            if (groupId) {
                userGroups = [groupId]
            } else {
                if (!authStore.isAdmin) {
                    userGroups = Object.keys(authStore.privileges);
                }
            }

            const q = userGroups 
                ? query(projectsCollection, where('group', 'in', userGroups))
                : query(projectsCollection)
            // const q = query(projectsCollection, where('group', 'in', userGroups));
            const querySnapshot = await getDocs(q);
            this.projects = querySnapshot.docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));

            // Get related good practices
            this.projects.forEach(async (p: any) => {
                const projectId = p.id;
                const q2 = query(bestPracticesCollection, where('projectId', '==', projectId));
                const querySnapshot2 = await getDocs(q2);
                p.nBestPractices = querySnapshot2.size;
            });
        },
        createEmptyProject(groupId: string) {
            const projectRef = doc(projectsCollection);
            this.id = projectRef.id
            this.project = {
                group: groupId,
                project: {},
                indicators: [],
                results: {}
            }
            this.projectAreas = [];
        },
        async save() {
            const authStore = useAuthStore();

            // Set project additional information
            const projectToBeSaved = {
                ...this.project,
                'updateTime': serverTimestamp()
            };

            // Use a Firestore transaction
            const batch = writeBatch(db);

            let projectRef;
            if (!projectToBeSaved['createTime']) {
                // It's a new project
                projectToBeSaved['createTime'] = serverTimestamp();
                projectToBeSaved['created_by'] = authStore.user.uid
                projectRef = doc(projectsCollection);
            }

            projectRef = doc(projectsCollection, this.id);
            batch.set(projectRef, projectToBeSaved);

            // Save areas in a separate collection
            const areasRef = doc(areaCollection, projectRef.id);
            batch.set(areasRef, { areas: this.projectAreas });
            
            await batch.commit();
        },
        async saveAndExit() {
            await this.save();
            this.resetProjectState();
        },
        async deleteProject(projectId: string) {
            const batch = writeBatch(db);

            // Delete project
            const projectRef = doc(db, 'registry', projectId);
            batch.delete(projectRef);

            // Delete areas
            const areasRef = doc(db, 'areas', projectId);
            batch.delete(areasRef);

            // Delete best practices
            // TODO repetition from bestpractices store
            const q = query(bestPracticesCollection, where('projectId', '==', projectId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => { batch.delete(doc.ref) });

            await batch.commit();
            return this.fetchGroupOwnedProjects();
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
  