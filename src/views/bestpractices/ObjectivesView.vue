<script setup lang="ts">
import { ref, watch } from 'vue'

import { storeToRefs } from 'pinia'

import TextFormGroup from "../../components/inputs/base/TextFormGroup.vue";
import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";
// import LatLongFormGroup from "../../components/inputs/LatLongFormGroup.vue";

import { objectives, ecosystems, drivers, activities } from "../../components/project/menus";

import { useBestPracticesStore } from '../../stores/bestpractices';

const store = useBestPracticesStore();

type AOI = {
    adminArea: {
        siteName?: string,
        admin0: string,
        admin1: string,
        admin2: string,
    }
};

type Objectives = {
    projectId?: string,
    objectives?: number[],
    objectivesOther?: [{"other": string}],
    title?: string,
    ecosystems?: number[],
    // coordinates?: { latitude: number, longitude: number },
    context?: string,
    drivers?: number[],
    additionalInformation?: string,
    aoi?: AOI[],
    activities?: number[]
}

// const selectedAreas = ref([]);
// const selectedActivities = ref([]);

const flattenedActivities: [{ value: number, label: string}] | [] = [];
(function flatten(data) {
    if (!data.children) {
        flattenedActivities.push({ value: data.value, label: data.label });
    } else {
        data.children.forEach(c => { flatten(c) });
    }
})(activities)

// Build the area menu - collect all the areas from the related project
let areasMenu = ref([]);
watch(() => store.projectAreas, areas => {
    if (areas) {
        areasMenu.value = areas.map((el: any, index: number) => ({
            value: index,
            label: (Object.values(el)[0]).siteName || 'Area name not provided'
        }));
    }
});

let activitiesMenu = ref([]);

function setActivitiesMenu(areas) {
    // This array of activities contains duplicates but it doesn't matter
    // as we are using it to select from flattenedActivities
    const activityIds = store.projectAreas
        .filter((_: any, index: number) => areas?.includes(index))
        .reduce((prev: number[], current) => {
            const newActivities = Object.values(current)[0].activities || [];
            return [...prev, ...newActivities];
        }, [])
        .sort();
    
    activitiesMenu.value = flattenedActivities.filter(a => activityIds.includes(a.value));

    return activityIds;
}

// From the selected areas from the menu, build the activities menu
// watching areasMenu as we need to setup the activitiesMenu on page load    
watch(() => store.bestPracticeAreaIdxs, (areas) => {
    if (!store.bestPractice) return // it has been saved and set to null, so nothing to do here

    // // This array of activities contains duplicates but it doesn't matter
    // // as we are using it to select from flattenedActivities
    // const activityIds = store.projectAreas
    //     .filter((_: any, index: number) => areas?.includes(index))
    //     .reduce((prev: number[], current) => {
    //         const newActivities = Object.values(current)[0].activities || [];
    //         return [...prev, ...newActivities];
    //     }, [])
    //     .sort();
    
    // activitiesMenu.value = flattenedActivities.filter(a => activityIds.includes(a.value));

    const activityIds = setActivitiesMenu(areas)

    // Delete from the selected activities the ones that are not on the menu anymore
    // selectedActivities.value is undefined if selection is empty
    store.bestPractice.activities = store.bestPractice.activities ? store.bestPractice.activities.filter(v => activityIds.includes(v)) : [];
});

</script>


<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Objectives and Context</h1>
        <!-- <p class="dark:text-zinc-200">In this tab, basic information about your initiative is needed. The title and a summary of the aims and expected results of the initiative can be provided in the description section. You also need to provide further information such as when the initiative is expected to start and end, sources of funding and responsible organisms.</p> -->

        <div class="divide-y divide-stone-300 dark:divide-stone-900">
            <TextFormGroup
                v-model="store.bestPractice.title"
                label="1.1 Title"
                description="Title of the restoration practice."
                :required=true>
            </TextFormGroup>
            <!-- <MultiSelectFormGroup
                :options="objectives"
                v-model="store.bestPractice.objectives"
                label="Objectives"
                description="Objectives of the initiatives."
                :required="true"
                :otherEnabled="true"
                v-model:others="store.bestPractice.objectivesOther" /> -->
            <MultiSelectFormGroup
                :options="objectives"
                v-model="store.bestPractice.objectives"
                label="1.2 Objectives"
                description="Please select the main objectives of the practice."
                :required="true" />
            <TextareaFormGroup
                v-model="store.bestPractice.objectivesAdditionalInformation"
                label="1.3 Objectives additional information"
                description="Feel free to provide additional information on specific objectives of the practice." />
            <MultiSelectFormGroup
                :options="ecosystems"
                v-model="store.bestPractice.ecosystems"
                label="1.4 Ecosystems"
                description="Ecosystems where the practice was applied [Select all that apply]"></MultiSelectFormGroup>
            <!-- <LatLongFormGroup
                v-model="store.bestPractice.coordinates"
                label="Geographic coordinates"
                description="If available, please insert the geographic coordinates of the restoration area. Please use the WGS84 Geographic Reference System."></LatLongFormGroup> -->
            <TextareaFormGroup
                v-model="store.bestPractice.ecosystemAdditionalInfo"
                label="1.5 Ecosystems additional information"
                dangerousHtmlDescription="Please provide additional information on specific types of ecosystem(s) where the practice was applied. Please use the Ecosystem Functional Groups from the IUCN Global Ecosystem Typology here: <a class='text-blue-600' target='_blank' href='https://global-ecosystems.org/analyse'>https://global-ecosystems.org/analyse</a>"></TextareaFormGroup>
            <TextareaFormGroup
                v-model="store.bestPractice.context"
                label="1.6 Context"
                description="Please share any relevant ecological, socioeconomic and cultural context for the practice's implementation." />
            <MultiSelectFormGroup
                :options="areasMenu"
                v-model="store.bestPracticeAreaIdxs"
                label="1.7 Areas"
                :description="areasMenu.length ? 'Select the areas where the practice was implemented.' : 'No area was selected for the project.'" />
            <MultiSelectFormGroup
                :options="activitiesMenu"
                v-model="store.bestPractice.activities"
                label="1.8 Activities"
                :description="areasMenu.length ? 'Select the activities of your restoration initiative to which the practice belongs.' : 'No activity was selected for the project.'"
                :required="true" />
            <MultiSelectFormGroup
                :options="drivers"
                v-model="store.bestPractice.drivers"
                label="1.9 Drivers"
                description="Direct and indirect drivers of degradation addressed by the practice [Select all that apply]."
                :required="true">
            </MultiSelectFormGroup>
            <TextareaFormGroup
                v-model="store.bestPractice.driversAdditionalInformation"
                label="1.10 Drivers additional information"
                description="Feel free to provide additional information to explain how the practice contributed to addressing the drivers of ecosystem degradation selected above."></TextareaFormGroup>
        </div>
    </div>
</template>
