<script setup lang="ts">
import { ref, watch } from 'vue'

import TabTemplate from "../TabTemplate.vue"

import TextFormGroup from "../../components/inputs/base/TextFormGroup.vue";
import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";

import { objectives, ecosystems, drivers, activities, iucnEcosystems, type MenuItem, type RecursiveMenu } from "../../components/project/menus";

import { useBestPracticesStore } from '../../stores/bestpractices';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useBestPracticesStore();

// type AOI = {
//     adminArea: {
//         siteName?: string,
//         admin0: string,
//         admin1: string,
//         admin2: string,
//     }
// };

// type Objectives = {
//     projectId?: string,
//     objectives?: number[],
//     objectivesOther?: [{"other": string}],
//     title?: string,
//     ecosystems?: number[],
//     // coordinates?: { latitude: number, longitude: number },
//     context?: string,
//     drivers?: number[],
//     additionalInformation?: string,
//     aoi?: AOI[],
//     activities?: number[]
// }

// const selectedAreas = ref([]);
// const selectedActivities = ref([]);

const flattenedActivities: MenuItem[] = [];
const flattenedIucnEcosystems: MenuItem[] = [];

function flatten(data: RecursiveMenu, flattenedArray: MenuItem[]) {
    if (!data.children) {
        if (data.value) {
            flattenedArray.push({ value: data.value, label: data.label });
        }
    } else {
        data.children.forEach(c => { flatten(c, flattenedArray) });
    }
}

flatten(activities, flattenedActivities);
flatten(iucnEcosystems, flattenedIucnEcosystems);

// (function flatten(data) {
//     if (!data.children) {
//         if (data.value) {
//             flattenedActivities.push({ value: data.value, label: data.label });
//         }
//     } else {
//         data.children.forEach(c => { flatten(c) });
//     }
// })(activities);

// (function flatten(data) {
//     if (!data.children) {
//         if (data.value) {
//             flattenedIucnEcosystems.push({ value: data.value, label: data.label });
//         }
//     } else {
//         data.children.forEach(c => { flatten(c) });
//     }
// })(iucnEcosystems);

// Build the area menu - collect all the areas from the related project
let areasMenu = ref([]);
watch(() => store.projectAreas, areas => {
    if (areas) {
        areasMenu.value = areas.map((el: any, index: number) => ({
            value: index,
            label: (Object.values(el)[0] as any).siteName || 'Area name not provided'
        }));
    }
});

let activitiesMenu = ref<MenuItem[]>([]);
function setActivitiesMenu(areas: number[] = []) {
    // This array of activities contains duplicates but it doesn't matter
    // as we are using it to select from flattenedActivities
    const activityIds = store.projectAreas
        .filter((_: any, index: number) => areas.includes(index))
        .reduce((prev: number[], current: any) => { // TODO
            const newActivities = (Object.values(current)[0] as any).activities || [];
            return [...prev, ...newActivities];
        }, [])
        .sort();

    activitiesMenu.value = flattenedActivities.filter(a => activityIds.includes(a.value));

    return activityIds;
}

let ecosystemsMenu = ref<MenuItem[]>([]);
function setEcosystemsMenu(areas: number[] = []) {
    // This array of ecosystems contains duplicates but it doesn't matter
    // as we are using it to select from flattenedEcosystems
    const ecosystemIds = store.projectAreas
        .filter((_: any, index: number) => areas.includes(index))
        .reduce((prev: number[], current: any) => { // TODO
            const newEcosystems = (Object.values(current)[0] as any).ecosystems || [];
            return [...prev, ...newEcosystems];
        }, [])
        .sort();

    ecosystemsMenu.value = flattenedIucnEcosystems.filter(a => ecosystemIds.includes(a.value));

    return ecosystemIds;
}


// From the selected areas from the menu, build the activities menu
// watching areasMenu as we need to setup the activitiesMenu on page load    
watch(() => store.bestPracticeAreaIdxs, areas => {
    if (!store.bestPractice) return // it has been saved and set to null, so nothing to do here

    const activityIds = setActivitiesMenu(areas);
    // Delete from the selected activities the ones that are not on the menu anymore
    store.bestPractice.activities = store.bestPractice.activities
        ? store.bestPractice.activities.filter((v: number) => activityIds.includes(v))
        : [];

    const ecosystemIds = setEcosystemsMenu(areas);
    // Delete from the selected ecosystems the ones that are not on the menu anymore
    store.bestPractice.iucnEcosystems = store.bestPractice.iucnEcosystems
        ? store.bestPractice.iucnEcosystems.filter((v: number) => ecosystemIds.includes(v))
        : [];
});
</script>

<template>
    <TabTemplate title="Objectives and Context">
        <template #default>
            <template v-if="store.bestPractice">
                <TextFormGroup v-model="store.bestPractice.title"
                               label="1.1 Title"
                               description="Title of the restoration practice."
                               :required=true
                               :edit=edit>
                </TextFormGroup>
                <MultiSelectFormGroup :options="objectives"
                                      v-model="store.bestPractice.objectives"
                                      label="1.2 Objectives"
                                      description="Please select the main objectives of the practice."
                                      :required="true"
                                      :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.objectivesAdditionalInformation"
                                   label="1.3 Objectives additional information"
                                   description="Feel free to provide additional information on specific objectives of the practice."
                                   :edit=edit />
                <MultiSelectFormGroup :options="areasMenu"
                                      v-model="store.bestPracticeAreaIdxs"
                                      label="1.4 Areas"
                                      :description="areasMenu.length ? 'Select the areas where the practice was implemented.' : 'No area was selected for the project.'"
                                      :edit=edit />
                <MultiSelectFormGroup :options="ecosystems"
                                      v-model="store.bestPractice.ecosystems"
                                      label="1.5 Ecosystems"
                                      description="Ecosystems where the practice was applied [Select all that apply]"
                                      :edit=edit />
                <MultiSelectFormGroup :options="ecosystemsMenu"
                                      v-model="store.bestPractice.iucnEcosystems"
                                      label="1.6 Ecosystems additional information"
                                      description="Select the specific types of ecosystem(s) where the practice was applied."
                                      :required="true"
                                      :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.context"
                                   label="1.7 Context"
                                   description="Please share any relevant ecological, socioeconomic and cultural context for the practice's implementation."
                                   :edit=edit />
                <MultiSelectFormGroup :options="activitiesMenu"
                                      v-model="store.bestPractice.activities"
                                      label="1.8 Activities"
                                      :description="areasMenu.length ? 'Select the activities of your restoration initiative to which the practice belongs.' : 'No activity was selected for the project.'"
                                      :required="true"
                                      :edit=edit />
                <MultiSelectFormGroup :options="drivers"
                                      v-model="store.bestPractice.drivers"
                                      label="1.9 Drivers"
                                      description="Direct and indirect drivers of degradation addressed by the practice [Select all that apply]."
                                      :required="true"
                                      :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.driversAdditionalInformation"
                                   label="1.10 Drivers additional information"
                                   description="Please provide additional information to explain how the practice contributed to reducing the drivers of ecosystem degradation selected above."
                                   :edit=edit />
            </template>
        </template>
    </TabTemplate>
    <!-- <pre class="text-white">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>

