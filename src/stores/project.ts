import { ref } from 'vue';

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

import {
    setsContainSameValues,
    snakeToCamel,
    getPolygonsArea as getPolygonsAreaUtil,
    areaByGefIndicator as areaByGefIndicatorUtil,
    areaByGefIndicatorGroup as areaByGefIndicatorGroupUtil,
} from '../lib/util'

import { useAuthStore } from './auth';
import { GoalIndicator, rawGoalIndicators as _rawGoalIndicators } from '@/lib/auroraIndicators';
import { getIntersectingCountries } from '@/firebase/functions';

import { getGaulLevel0 } from '@/firebase/firestore';
import type { AreaObject } from "@/types";

// import { validate } from '@/lib/validation/schema';

const projectsCollection = collection(db, 'registry')
const areaCollection = collection(db, 'areas')


function gaul2iso(gaulLevel0: any[], gaulId: number) {
    const gaul0 = gaulLevel0
        .find(g => g.value === gaulId);
    return gaul0?.iso2;
}

export const useProjectStore = defineStore('', () => {
    const id = ref<string | null>(null);
    const project = ref<any>(null); // TODO type
    const projectAreas = ref<AreaObject[]>([]);
    const loaded = ref(false);

    // Projects search - todo move to a separate store
    const projects = ref<any[]>([]); // TODO type
    const isLastPage = ref(false);
    const lastVisible = ref<any>(null);
    const nProjectsFound = ref(0);
    const loadingNext = ref(false);
    const validation = ref();

    // const validating = ref(false);

    // watch(() => project.value, (p) => {
    //     if (!validating.value) {
    //         validating.value = true
    //         console.log(validate(p))

    //         validating.value = false
    //     }
    // }, { deep: true });

    function resetProjectState() {
        id.value = null;
        project.value = null;
        projectAreas.value = [];
        loaded.value = false;
    }

    async function fetchProject(projectId: string) {
        loaded.value = false;
        const docRef = doc(db, 'registry', projectId);
        const areaDocRef = doc(areaCollection, projectId);
        const loadPromises = [getDoc(docRef), getDoc(areaDocRef)];

        const [projectDoc, areaDoc] = await Promise.all(loadPromises);

        project.value = {
            project: {},
            indicators: [],
            results: {},
            ...snakeToCamel(projectDoc.data())
        };

        // This is needed before data is transformed to the detached AOI version
        // Detach areas if present (has not been edited) and store them in a separate variable
        if (project.value.aoi) {
            projectAreas.value = project.value.aoi;
            delete project.value.aoi;
            // this.projectAreas = [];
        } else {
            projectAreas.value = areaDoc.data()?.areas || [];
        }

        // map aurora indicators to their ids
        projectAreas.value.forEach((area: any) => {
            // Get the aurora indicators from the area
            const [_, areaValue]: [string, any] = Object.entries(area)[0];
            if (areaValue.goalIndicators) {
                areaValue.goalIndicators = areaValue.goalIndicators.map((indicator: any) => ({
                    ...indicator,
                    indicator: new GoalIndicator(indicator.indicator)
                }));
            }
        });

        id.value = projectId;

        // Use a separate flag to indicate that the project is loaded,
        // because projectAreas is never null so it cannot be used to check if all the data is loaded
        loaded.value = true
    }

    async function fetchNextProjects(nProjects: number = 25, reset: boolean = false, searchOptions: { group?: string, country?: string, gefCycle?: string } = {}) {
        // if we are on the last page and getting the next page, do nothing
        if (isLastPage.value && !reset) {
            return;
        }

        const authStore = useAuthStore();

        if (reset) {
            lastVisible.value = null;
            isLastPage.value = false;
            projects.value = [];
        }

        // set the paging constraints (limit and startAfter)
        const pagingConstraints: QueryConstraint[] = [limit(nProjects + 1)];
        if (lastVisible.value) {
            pagingConstraints.push(startAfter(lastVisible.value));
        }

        const filterConstraints: QueryConstraint[] = [];
        if (searchOptions.country) {
            // if a country is selected, get only the projects from that country
            filterConstraints.push(where('project.countries', 'array-contains', searchOptions.country));
        }
        if (searchOptions.gefCycle) {
            // if a gefCycle is selected, get only the projects from that gefCycle
            filterConstraints.push(where('project.gefCycle', '==', searchOptions.gefCycle));
        }
        if (searchOptions.group) {
            // if a group is selected, get only the projects from that group
            filterConstraints.push(where('group', '==', searchOptions.group));
        } else if (!authStore.isAdmin) {
            // otherwise if user is not admin, get the projects only from the groups they belong to
            let userGroups: string[] = authStore.privileges ? Object.keys(authStore.privileges) : [];
            if (userGroups.length === 0) {
                // if the user does not belong to any group, return an empty list
                projects.value = [];
                isLastPage.value = true;
                return;
            }
            filterConstraints.push(where('group', 'in', userGroups));
        }

        const q = query(projectsCollection, ...filterConstraints, orderBy('updateTime', 'desc'), ...pagingConstraints);

        loadingNext.value = true;

        try {
            const querySnapshot = await getDocs(q)
            const docs = querySnapshot.docs;
            if (docs.length <= nProjects) {
                isLastPage.value = true;
            } else {
                lastVisible.value = docs[docs.length - 2];
            }
            // append the new projects to the existing ones, except the last one
            let newProjects = docs.map(doc => ({ id: doc.id, data: snakeToCamel(doc.data()) }));
            if (newProjects.length > nProjects) {
                newProjects = newProjects.slice(0, -1);

            }
            projects.value = [...projects.value, ...newProjects];

            loadingNext.value = false;

            const countQ = query(projectsCollection, ...filterConstraints);
            const countSnapshot = await getCount(countQ);
            nProjectsFound.value = countSnapshot.data().count;
        } catch (e: any) {
            console.error('Error fetching projects', e);
            alert('Error fetching projects' + e.message);
            loadingNext.value = false;
        }
    }

    async function refetchProject(projectId: string) {
        // find the index of the project in the list
        const index = projects.value.findIndex(p => p.id === projectId);
        // if the project is not found, do nothing
        if (index === -1) {
            return;
        }
        // fetch the project again
        const docRef = doc(db, 'registry', projectId);

        // replace the project in the list
        projects.value[index] = { id: projectId, data: snakeToCamel((await getDoc(docRef)).data()) };

        // re-fetch the current project if any
        if (id.value === projectId) {
            await fetchProject(projectId);
        }
    }

    function areaByGefIndicator() {
        const areas = projectAreas.value;
        return areaByGefIndicatorUtil(areas);
    }

    function areaByGefIndicatorGroup() {
        const areas = projectAreas.value;
        return areaByGefIndicatorGroupUtil(areas);
    }

    function createEmptyProject(groupId: string) {
        const projectRef = doc(projectsCollection);
        id.value = projectRef.id
        project.value = {
            group: groupId,
            project: {},
            indicators: [],
            results: {},
            status: 'draft',
        }
        projectAreas.value = [];

        loaded.value = true;
    }

    async function createProject(groupId: string, title: string, reportingLine: string, termsAndConditionsAccepted: boolean, language: string) {
        if (!groupId || !title || !reportingLine || !termsAndConditionsAccepted || !language) {
            throw new Error('Missing required fields');
        }

        const authStore = useAuthStore();

        const batch = writeBatch(db);

        const projectRef = doc(projectsCollection);
        batch.set(projectRef, {
            group: groupId,
            project: {
                title
            },
            indicators: [],
            results: {},
            reportingLine,
            created_by: authStore.user!.uid,
            created_by_name: authStore.user!.displayName,
            language,
            termsAndConditionsAccepted,
            createTime: serverTimestamp(),
            updateTime: serverTimestamp(),
            status: 'draft'
        });

        // Create an empty area collection
        const areasRef = doc(areaCollection, projectRef.id);
        batch.set(areasRef, { areas: [] });

        await batch.commit();

        await fetchProject(projectRef.id);
    }

    async function save({ rawGoalIndicators } = { rawGoalIndicators: _rawGoalIndicators }) {
        const authStore = useAuthStore();

        if (!authStore.user?.uid) {
            throw new Error('User not authenticated');
        }

        if (!id.value) {
            throw new Error('Id is not set');
        }

        // Set project additional information
        const projectToBeSaved = {
            ...project.value,
            'updateTime': serverTimestamp()
        };

        // Use a Firestore transaction
        const batch = writeBatch(db);

        let projectRef;
        if (!projectToBeSaved['createTime']) {
            // It's a new project
            projectToBeSaved['createTime'] = serverTimestamp();
            projectToBeSaved['created_by'] = authStore.user.uid;
            projectRef = doc(projectsCollection);
        }

        projectRef = doc(projectsCollection, id.value);
        batch.set(projectRef, projectToBeSaved);

        // Save areas in a separate collection
        // TODO - this is a temporary solution to save the aurora indicators
        const projectAreasToBeSaved: any = [];
        for (const area of projectAreas.value) {
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
    }
    async function saveAndExit() {
        await save();
        resetProjectState();
    }
    function polygonsArea() {
        return getPolygonsAreaUtil(projectAreas.value);
        // const getValue = (area: any) => Object.values(area)[0];
        // try {
        //     const areas = projectAreas.value
        //         // .filter((a: any) => ['draw', 'upload'].includes(getType(a)))
        //         .map((a: any) => +((getValue(a) as { area: number }).area || 0));
        //     return areas.reduce((a: number, b: number) => a + b, 0);
        // } catch (e) {
        //     console.error('Error calculating polygons area', e);
        //     return NaN;
        // }
    }

    async function deleteProject(projectId: string) {
        const batch = writeBatch(db);

        // Delete project
        const projectRef = doc(db, 'registry', projectId);
        batch.delete(projectRef);

        // Areas are deleted by a cloud function triggered when a project is deleted
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
    }

    async function getCountriesIso2Codes() {
        if (!projectAreas.value || projectAreas.value.length === 0) return new Set();

        const intersectingCountries = await _getPolygonsIso2Codes(projectAreas.value);
        const adminAreasIsoCodes = await _getAdminAreasIso2Codes(projectAreas.value);

        return new Set([...intersectingCountries, ...adminAreasIsoCodes]);
    }

    async function updateCountries() {
        alert('Please wait while the list of countries is updated. This may take a few seconds.');
        try {
            const intersectingCountries = await _getPolygonsIso2Codes(projectAreas.value);
            const adminAreasIsoCodes = await _getAdminAreasIso2Codes(projectAreas.value);

            const oldIso2Codes = new Set(project.value.project.countries);
            const newIso2Codes = new Set([...intersectingCountries, ...adminAreasIsoCodes]);

            if (!setsContainSameValues(oldIso2Codes, newIso2Codes)) {
                alert('The list of countries has changed. Please review it in the Areas & Ecosystems tab before saving.');
                project.value.project.countries = [...newIso2Codes];
            }
        } catch (e) {
            alert('Error getting the new new list of countries');
        }
    }

    async function addCountriesFromAdminAreas() {
        try {
            const adminAreasIsoCodes = await _getAdminAreasIso2Codes(projectAreas.value);
            const oldIso2Codes = new Set(project.value.project.countries);
            const newIso2Codes = new Set([...oldIso2Codes, ...adminAreasIsoCodes]);

            if (!setsContainSameValues(oldIso2Codes, newIso2Codes)) {
                alert('The list of countries has changed. Please review it in the Areas & Ecosystems tab before saving.');
                project.value.project.countries = [...newIso2Codes];
            }
        } catch (e) {
            alert('Error getting the new new list of countries');
        }
    }

    return {
        id,
        project,
        projectAreas,
        loaded,

        projects,
        isLastPage,
        lastVisible,
        nProjectsFound,
        loadingNext,

        validation,

        resetProjectState,
        fetchProject,
        fetchNextProjects,
        refetchProject,
        areaByGefIndicator,
        areaByGefIndicatorGroup,
        createEmptyProject,
        createProject,
        save,
        saveAndExit,
        polygonsArea,
        deleteProject,
        getCountriesIso2Codes,
        updateCountries,
        addCountriesFromAdminAreas
    };
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
