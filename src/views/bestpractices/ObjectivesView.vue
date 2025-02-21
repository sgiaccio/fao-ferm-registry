<script setup lang="ts">
import { ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import TabTemplate from "../TabTemplate.vue"

import TextFormGroup from "@/components/inputs/base/TextFormGroup.vue";
import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue";
import SelectFormGroup from "@/components/inputs/base/SelectFormGroup.vue";

import type { MenuItem, RecursiveMenu } from "@/components/project/menus";

import { useBestPracticesStore } from '@/stores/bestpractices';
import { useMenusStore } from '@/stores/menus';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useBestPracticesStore();
const menus = useMenusStore().menus;

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
    for (const item of data) {
        if (item.value) { // should always be the case
            flattenedArray.push({ value: item.value, label: item.label });
        }
        if (item.items) {
            flatten(item.items, flattenedArray);
        }
    }
}

flatten(menus.activities, flattenedActivities);
flatten(menus.iucnEcosystems, flattenedIucnEcosystems);

// Build the area menu - collect all the areas from the related project
let areasMenu = ref([]);
watch(() => store.projectAreas, areas => {
    if (areas) {
        areasMenu.value = areas.map((el: any, index: number) => ({
            value: index,
            label: (Object.values(el)[0] as any).siteName || t('goodPractices.inputs.noSiteName')
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
    <TabTemplate :title="t('goodPractices.objectives.title')">
        <template #default>
            <template v-if="store.bestPractice">
                <SelectFormGroup
                    class="border-b-2 pb-6 mb-6"
                    :edit="edit"
                    v-model="store.bestPractice.language"
                    :options="[{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }, { value: 'fr', label: 'Français' }, { value: 'pt', label: 'Português' }]"
                    :label="$t('newProjectDialog.fields.language')"
                />
                <TextFormGroup
                    v-model="store.bestPractice.title"
                    :label="`1.1 ${t('goodPractices.inputs.title.label')}`"
                    :description="t('goodPractices.inputs.title.description')"
                    :required=true
                    :edit=edit
                >
                </TextFormGroup>
                <MultiSelectFormGroup
                    :options="menus.objectives"
                    v-model="store.bestPractice.objectives"
                    :label="`1.2 ${t('goodPractices.inputs.objectives.label')}`"
                    :description="t('goodPractices.inputs.objectives.description')"
                    :required="true"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.objectivesAdditionalInformation"
                    :label="`1.3 ${t('goodPractices.inputs.objectivesAdditionalInformation.label')}`"
                    :description="t('goodPractices.inputs.objectivesAdditionalInformation.description')"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="areasMenu"
                    v-model="store.bestPracticeAreaIdxs"
                    :label="`1.4 ${t('goodPractices.inputs.areas.label')}`"
                    :description="areasMenu.length ? t('goodPractices.inputs.areas.description') : t('goodPractices.inputs.areas.noAreasSelected')"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="menus.ecosystems"
                    v-model="store.bestPractice.ecosystems"
                    :label="`1.5 ${t('goodPractices.inputs.ecosystems.label')}`"
                    :description="t('goodPractices.inputs.ecosystems.description')"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="ecosystemsMenu"
                    v-model="store.bestPractice.iucnEcosystems"
                    :label="`1.6 ${t('goodPractices.inputs.iucnEcosystems.label')}`"
                    :description="t('goodPractices.inputs.iucnEcosystems.description')"
                    :required="true"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.context"
                    :label="`1.7 ${t('goodPractices.inputs.context.label')}`"
                    :description="t('goodPractices.inputs.context.description')"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="activitiesMenu"
                    v-model="store.bestPractice.activities"
                    :label="`1.8 ${t('goodPractices.inputs.activities.label')}`"
                    :description="areasMenu.length ? t('goodPractices.inputs.activities.description') : t('goodPractices.inputs.activities.noActivitiesSelected')"
                    :required="true"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="menus.drivers"
                    v-model="store.bestPractice.drivers"
                    :label="`1.9 ${t('goodPractices.inputs.drivers.label')}`"
                    :description="t('goodPractices.inputs.drivers.description')"
                    :required="true"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.driversAdditionalInformation"
                    _label="1.10 Degradation drivers additional information"
                    _description="Please provide additional information to explain how the practice contributed to reducing the drivers of ecosystem degradation selected above."
                    :label="`1.10 ${t('goodPractices.inputs.driversAdditionalInformation.label')}`"
                    :description="t('goodPractices.inputs.driversAdditionalInformation.description')"
                    :edit=edit
                />
            </template>
        </template>
    </TabTemplate>
    <!-- <pre class="text-white">{{JSON.stringify(store.bestPractice, null, 2)}}</pre> -->
    <!-- <pre class="text-white">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
