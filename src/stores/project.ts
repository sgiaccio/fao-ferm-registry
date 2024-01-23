import {
    getDocs,
    getDoc,
    collection,
    writeBatch,
    doc,
    query,
    where,
    serverTimestamp,
    orderBy,
    startAfter,
    limit,
    getCount,
    QueryConstraint
} from 'firebase/firestore/lite';

import { defineStore } from 'pinia';

import { db } from '../firebase';

import { setsContainSameValues, snakeToCamel } from '../lib/util'

import { useAuthStore } from './auth';
import { GoalIndicator, rawGoalIndicators as _rawGoalIndicators } from '@/lib/auroraIndicators';
import { getIntersectingCountries } from '@/firebase/functions';

import { getGaulLevel0 } from '@/firebase/firestore';


const projectsCollection = collection(db, 'registry')
const areaCollection = collection(db, 'areas')


function gaul2iso(gaulLevel0: any[], gaulId: number) {
    const gaul0 = gaulLevel0
        .find(g => g.value === gaulId);
    return gaul0?.iso2;
}

export const useProjectStore = defineStore({
    id: 'project',
    state: () => ({
        // Project
        id: null as string | null,
        project: null as any, // TODO type
        projectAreas: [] as any[], // TODO type
        loaded: false,

        // Project list - TODO eventually move to a separate store
        projects: [] as any[],
        isLastPage: false,
        lastVisible: null as any,
        nProjectsFound: 0,
        loadingNext: false,
    }),
    actions: {
        resetProjectState() {
            this.id = null;
            this.project = null;
            this.projectAreas = [];
            this.loaded = false;
        },
        async fetchProject(projectId: string) {
            this.loaded = false;
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
                this.projectAreas = this.project.aoi;
                delete this.project.aoi;
                // this.projectAreas = [];
            } else {
                const areasRef = doc(areaCollection, projectId);
                this.projectAreas = (await getDoc(areasRef)).data()?.areas || [];
            }

            // map aurora indicators to their ids
            this.projectAreas.forEach((area: any) => {
                // Get the aurora indicators from the area
                const [_, areaValue]: [string, any] = Object.entries(area)[0];
                if (areaValue.goalIndicators) {
                    areaValue.goalIndicators = areaValue.goalIndicators.map((indicator: any) => ({
                        ...indicator,
                        indicator: new GoalIndicator(indicator.indicator)
                    }));
                }
            });

            this.id = projectId;

            // Use a separate flag to indicate that the project is loaded,
            // because projectAreas is never null so it cannot be used to check if all the data is loaded
            this.loaded = true
        },
        async fetchNextProjects(groupId: string | null, freeTextSearch = null, nProjects: number = 25, reset: boolean = false) {
            // if we are on the last page and getting the next page, do nothing
            if (this.isLastPage && !reset) {
                return;
            }

            const authStore = useAuthStore();

            if (reset) {
                this.lastVisible = null;
                this.isLastPage = false;
                this.projects = [];
            }

            // set the paging constraints (limit and startAfter)
            const pagingConstraints: QueryConstraint[] = [limit(nProjects + 1)];
            if (this.lastVisible) {
                pagingConstraints.push(startAfter(this.lastVisible));
            }

            // set the filter constraints (group)
            const filterConstraints: QueryConstraint[] = [];
            if (groupId) {
                // if a group is selected, get only the projects from that group
                filterConstraints.push(where('group', '==', groupId));
            } else if (!authStore.isAdmin) {
                // otherwise if user is not admin, get the projects only from the groups they belong to
                let userGroups: string[] = authStore.privileges ? Object.keys(authStore.privileges) : [];
                if (userGroups.length === 0) {
                    // if the user does not belong to any group, return an empty list
                    this.projects = [];
                    this.isLastPage = true;
                    return;
                }
                filterConstraints.push(where('group', 'in', userGroups));
            }
            // if (projectId) {
            //     // if a group is selected, get only the projects from that group
            //     filterConstraints.push(where('group', '==', projectId));
            // }
            // if (freeTextSearch) {
            //     // if a free text search is present, get only the projects that match the search
            //     // TODO - this is not a good solution, because it will not work with pagination
            //     filterConstraints.push(where('project/name', '>=', freeTextSearch));
            //     filterConstraints.push(where('project/name', '<=', freeTextSearch + '\uf8ff'));
            // }

            const q = query(projectsCollection, ...filterConstraints, orderBy('updateTime', 'desc'), ...pagingConstraints);

            this.loadingNext = true;
            getDocs(q).then(querySnapshot => {
                const docs = querySnapshot.docs;
                if (docs.length <= nProjects) {
                    this.isLastPage = true;
                } else {
                    this.lastVisible = docs[docs.length - 2];
                }
                // append the new projects to the existing ones, except the last one
                let newProjects = docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
                if (newProjects.length > nProjects) {
                    newProjects = newProjects.slice(0, -1);

                }
                this.projects = [...this.projects, ...newProjects];

                this.loadingNext = false;
            });

            const countQ = query(projectsCollection, ...filterConstraints);
            getCount(countQ).then(countSnapshot => {
                this.nProjectsFound = countSnapshot.data().count;
            });
        },
        async refetchProject(projectId: string) {
            // find the index of the project in the list
            const index = this.projects.findIndex(p => p.id === projectId);
            // if the project is not found, do nothing
            if (index === -1) {
                return;
            }
            // fetch the project again
            const docRef = doc(db, 'registry', projectId);

            // replace the project in the list
            this.projects[index] = { id: projectId, data: snakeToCamel((await getDoc(docRef)).data()) };

            // re-fetch the current project if any
            if (this.id === projectId) {
                await this.fetchProject(projectId);
            }
        },
        // I could not make this work, so I am using the previous function. Keeping this code here for reference
        // async fetchNextProjects_(groupId: string | null, nProjects: number = 25, reset: boolean = false, get: 'next' | 'previous' = 'next') {
        //     // This code sucks, but pagination in Firestore is not easy
        //     // https://firebase.google.com/docs/firestore/query-data/query-cursors

        //     // if we are on the last page and getting the next page, do nothing
        //     if (get === 'next' && this.isLastPage && !reset) {
        //         return;
        //     }
        //     // if we are on the first page and getting the previous page, do nothing
        //     if (get === 'previous' && this.isFirstPage && !reset) {
        //         return;
        //     }

        //     // Get user groups
        //     const authStore = useAuthStore();

        //     // Get nProjects + 1 projects to check if we are on the last page
        //     const paginationConstraints: QueryConstraint[] = [orderBy('updateTime', 'desc')];
        //     if (get === 'next') {
        //         paginationConstraints.push(limit(nProjects + 1));
        //         // if no projects are loaded or reset is true, get the first nProjects projecs, otherwise get the next nProjects projects
        //         if (!(this.projects.length < nProjects) && !reset) {
        //             paginationConstraints.push(startAfter(this.lastVisible));
        //         }
        //     } else {
        //         paginationConstraints.push(limitToLast(nProjects + 1));
        //         // if no projects are loaded or reset is true, get the first nProjects projecs, otherwise get the next nProjects projects
        //         if (!(this.projects.length < nProjects) && !reset) {
        //             paginationConstraints.push(endBefore(this.firstVisible));
        //         }
        //     }

        //     const filterConstraints: QueryConstraint[] = [];
        //     if (groupId) {
        //         // if a group is selected, get only the projects from that group
        //         filterConstraints.push(where('group', '==', groupId));
        //     } else if (!authStore.isAdmin) {
        //         // otherwise if user is not admin, get the projects only from the groups they belong to
        //         let userGroups: string[] = authStore.privileges ? Object.keys(authStore.privileges) : [];
        //         filterConstraints.push(where('group', 'in', userGroups));
        //     }

        //     const q = query(projectsCollection, ...filterConstraints, ...paginationConstraints);
        //     // For the count, we don't want to apply the pagination constraints
        //     const qCount = query(projectsCollection, ...filterConstraints);
        //     let docs = (await getDocs(q)).docs;

        //     this.isFirstPage = reset || get === 'previous' && docs.length <= nProjects;
        //     this.isLastPage = get === 'next' && docs.length <= nProjects;

        //     // if we are on the first page, projects.length could be less than nProjects + 1. If so, attach the remaining ones form the previous results (next page)
        //     if (get === 'previous' && docs.length < nProjects + 1) {
        //         docs = [...docs, ...this.prevDocs.slice(-1 * (nProjects + 1 - docs.length))];
        //     }

        //     this.prevDocs = docs;

        //     let projects = docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));

        //     // Count the total number of projects based on the filter on the group
        //     this.nProjectsFound = (await getCount(qCount)).data().count;

        //     // If the number of projects is less than the requested number, it means that we are on the last page
        //     this.lastVisible = docs[docs.length - 2];
        //     this.firstVisible = docs[0];

        //     // this.projects = docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) })).slice(0, -1);
        //     if (get === 'next') {
        //         // get first nProjects projects
        //         this.projects = projects.slice(0, nProjects);
        //     } else {
        //         this.projects = projects.slice(0, nProjects);
        //     }


        //     // Get related good practices - TODO store the number of best practices in the project itself
        //     await Promise.all(this.projects.map(async (p: any) => {
        //         const projectId = p.id;
        //         const q2 = query(bestPracticesCollection, where('projectId', '==', projectId));
        //         const querySnapshot2 = await getDocs(q2);
        //         p.nBestPractices = querySnapshot2.size;
        //     }));
        // },
        areaByGefIndicator() {
            // Use the reduce function to accumulate areas by their respective indicators
            return Object.entries(
                this.projectAreas.reduce((acc: { [indicator: string]: number }, area) => {
                    // Destructure the first value of the area object to get the gefIndicator and areaValue
                    const { gefIndicator, area: areaValue } = Object.values(area)[0] as any;

                    // If the gefIndicator exists, accumulate the areaValue for that indicator
                    // Otherwise, return the accumulator as is
                    return gefIndicator ? {
                        ...acc,
                        [gefIndicator]: (acc[gefIndicator] || 0) + (+areaValue || 0)
                    } : acc;
                }, {}))
                // Sort the resulting entries by indicator name in ascending order
                .sort((a, b) => {
                    if (a[0] > b[0]) return 1;
                    if (a[0] < b[0]) return -1;
                    return 0;
                });
        },
        createEmptyProject(groupId: string) {
            const projectRef = doc(projectsCollection);
            this.id = projectRef.id
            this.project = {
                group: groupId,
                project: {},
                indicators: [],
                results: {},
                status: 'draft',
            }
            this.projectAreas = [];

            this.loaded = true;
        },
        async createProject(groupId: string, title: string, reportingLine: string, termsAndConditionsAccepted: boolean) {
            if (!groupId || !title || !reportingLine || !termsAndConditionsAccepted) {
                throw new Error('Missing required fields');
            }

            const authStore = useAuthStore();

            const batch = writeBatch(db);
            // const projectRef = await addDoc(projectsCollection, {
            //     group: groupId,
            //     project: {
            //         title: title,
            //     },
            //     indicators: [],
            //     results: {},
            //     reportingLine: reportingLine,
            //     created_by: authStore.user.uid,
            //     termsAndConditionsAccepted: termsAndConditionsAccepted,
            //     createTime: serverTimestamp(),
            //     updateTime: serverTimestamp()
            // });

            const projectRef = doc(projectsCollection);
            batch.set(projectRef, {
                group: groupId,
                project: {
                    title: title
                },
                indicators: [],
                results: {},
                reportingLine: reportingLine,
                created_by: authStore.user!.uid,
                termsAndConditionsAccepted: termsAndConditionsAccepted,
                createTime: serverTimestamp(),
                updateTime: serverTimestamp(),
                status: 'draft'
            });

            // Create an empty area collection
            const areasRef = doc(areaCollection, projectRef.id);
            batch.set(areasRef, { areas: [] });

            const result = await batch.commit();

            await this.fetchProject(projectRef.id);
        },
        async save({ rawGoalIndicators } = { rawGoalIndicators: _rawGoalIndicators }) {
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

            // TODO - this is a temporary solution to save the aurora indicators
            const projectAreasToBeSaved: any = [];
            for (const area of this.projectAreas) {
                // Get the aurora indicators from the area
                const [areaType, areaValue]: [string, any] = Object.entries(area)[0];
                const newAreaValue = { ...areaValue };

                // Replace the aurora indicator ids with the full objects from the goalJsonData
                if (newAreaValue.goalIndicators) {
                    newAreaValue.goalIndicators = newAreaValue.goalIndicators.map((goalIndicator: any) => ({
                        ...goalIndicator,
                        indicator: rawGoalIndicators.find((ind: any) => ind.id === goalIndicator.indicator.id)
                    }));
                }

                projectAreasToBeSaved.push({ [areaType]: newAreaValue });
            }

            const areasRef = doc(areaCollection, projectRef.id);
            batch.set(areasRef, { areas: projectAreasToBeSaved });

            await batch.commit();
        },
        async saveAndExit() {
            await this.save();
            this.resetProjectState();
        },
        polygonsArea() {
            // const getType = (area: any) => Object.keys(area)[0];
            const getValue = (area: any) => Object.values(area)[0];
            try {
                const areas = this.projectAreas
                    // .filter((a: any) => ['draw', 'upload'].includes(getType(a)))
                    .map((a: any) => +((getValue(a) as { area: number }).area || 0));
                return areas.reduce((a: number, b: number) => a + b, 0);
            } catch (e) {
                console.error('Error calculating polygons area', e);
                return NaN;
            }
        },
        async deleteProject(projectId: string) {
            const batch = writeBatch(db);

            // Delete project
            const projectRef = doc(db, 'registry', projectId);
            batch.delete(projectRef);

            // Areas are deletedby a cloud functino triggered when a project is deleted
            // // Delete areas
            // const areasRef = doc(db, 'areas', projectId);
            // batch.delete(areasRef);

            // Do not delete good practices anymore
            // Delete best practices
            // TODO repetition from bestpractices store
            // const q = query(bestPracticesCollection, where('projectId', '==', projectId));
            // const querySnapshot = await getDocs(q);
            // querySnapshot.forEach(doc => { batch.delete(doc.ref) });

            await batch.commit();
            // await this.fetchGroupOwnedProjects();
        },

        async getCountriesIso2Codes() {
            if (!this.projectAreas || this.projectAreas.length === 0) return new Set();

            const intersectingCountries = await _getPolygonsIso2Codes(this.projectAreas);
            const adminAreasIsoCodes = await _getAdminAreasIso2Codes(this.projectAreas);

            return new Set([...intersectingCountries, ...adminAreasIsoCodes]);
        },
        async updateCountries() {
            alert('Please wait while the list of countries is updated. This may take a few seconds.');
            try {
                const intersectingCountries = await _getPolygonsIso2Codes(this.projectAreas);
                const adminAreasIsoCodes = await _getAdminAreasIso2Codes(this.projectAreas);

                const oldIso2Codes = new Set(this.project.project.countries);
                const newIso2Codes = new Set([...intersectingCountries, ...adminAreasIsoCodes]);

                if (!setsContainSameValues(oldIso2Codes, newIso2Codes)) {
                    alert('The list of countries has changed. Please review it in the Areas & Ecosystems tab before saving.');
                    this.project.project.countries = [...newIso2Codes];
                }
            } catch (e) {
                alert('Error getting the new new list of countries');
            }
        },
        async addCountriesFromAdminAreas() {
            try {
                const adminAreasIsoCodes = await _getAdminAreasIso2Codes(this.projectAreas);
                const oldIso2Codes = new Set(this.project.project.countries);
                const newIso2Codes = new Set([...oldIso2Codes, ...adminAreasIsoCodes]);

                if (!setsContainSameValues(oldIso2Codes, newIso2Codes)) {
                    alert('The list of countries has changed. Please review it in the Areas & Ecosystems tab before saving.');
                    this.project.project.countries = [...newIso2Codes];
                }
            } catch (e) {
                alert('Error getting the new new list of countries');
            }
        }
    }
});

async function _getPolygonsIso2Codes(projectAreas: any[]) {
    const uuids = projectAreas.map(a => Object.values(a)).map(v => v[0].uuid).filter(uuid => uuid);
    const intersectingCountries = uuids && uuids.length ? await getIntersectingCountries(uuids) : new Set();

    return intersectingCountries;
}

async function _getAdminAreasIso2Codes(projectAreas: any[]) {
    const gaulLevel0 = await getGaulLevel0();
    // also merge the countries from the admin areas
    const adminAreasIsoCodes = new Set(projectAreas
        .map(a => Object.values(a))
        .map(v => +v[0].admin0)
        .filter(a0 => a0)
        .map(g => gaul2iso(gaulLevel0, g))
        .filter(iso => iso));

    return adminAreasIsoCodes;
}

// const store = useProjectStore();
// // Watch for changes in the project and update the projectAreas variable
// store.$subscribe((mutation, state) => {
//     console.log('mutation', mutation);
//     console.log('state', state);
//     const events = mutation.events;
//     if (events?.key === 'gefIndicator' && events?.newValue.startsWith('GEF3')) {
//         delete events?.target.tenureStatus
//         delete events?.target.restorationType
//     }
// });
