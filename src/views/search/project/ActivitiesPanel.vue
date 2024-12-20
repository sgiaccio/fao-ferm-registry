<script setup lang="ts">
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { useMenusStore } from '@/stores/menus';

import ResultPanel from './ResultPanel.vue';

import { flattenMenu, getAllSelectedItemsInAreas, getRecursiveMenuItem } from '@/lib/util';


const { menus } = useMenusStore();

const props = defineProps<{
    areas: any[]
}>();

const { t } = useI18n();

// function getAllActivities(areas) {
//     if (areas.length === 0) return [];
//     const activities = props.areas.reduce((acc, area) => {
//         const areaObjValue = Object.values(area)[0];
//         const areaActivities = areaObjValue.activities;
//         return areaActivities ? [...acc, ...areaActivities] : acc;
//     }, []);
//     // remove duplicates
//     const uniqueActivities = [...new Set(activities)];
//     return uniqueActivities.map(a => getRecursiveMenuItem(menus.activities, a)).map(i => i.value)
// }

function groupActivitiesByType() {
    // const areasEcosystems = getAllSelectedItemsInAreas(props.areas, 'ecosystems', menus.iucnEcosystems);

    // const allActivitiesInAreas = getAllActivities(props.areas);
    const allActivitiesInAreas = getAllSelectedItemsInAreas(props.areas, 'activities', menus.activities);
    const allBiophysicalActivities = flattenMenu(menus.activities[0].items!);
    const allEnablingActivities = flattenMenu(menus.activities[1].items!);

    const biophysicalActivities = allActivitiesInAreas
        .filter(a => allBiophysicalActivities.find(b => b.value === a))
        .sort((a, b) => allActivitiesInAreas.indexOf(a) - allActivitiesInAreas.indexOf(b))
        .map(i => getRecursiveMenuItem(menus.activities, i)?.label)
        .filter(Boolean); // filter out undefined and null values
    const enablingActivities = allActivitiesInAreas
        .filter(a => allEnablingActivities.find(b => b.value === a))
        .sort((a, b) => allActivitiesInAreas.indexOf(a) - allActivitiesInAreas.indexOf(b))
        .map(i => getRecursiveMenuItem(menus.activities, i)?.label)
        .filter(Boolean); // filter out undefined and null values

    return {
        biophysicalActivities,
        enablingActivities
    };
}

// const { biophysicalActivities, enablingActivities } = groupActivitiesByType();

const biophysicalActivities = computed(() => groupActivitiesByType().biophysicalActivities);
const enablingActivities = computed(() => groupActivitiesByType().enablingActivities);
</script>

<template>
    <ResultPanel :title="t('publicPagePreview.activitiesPanel.title')">
        <div
            v-if="biophysicalActivities.length > 0"
            class="flex flex-col"
        >
            <span class="font-semibold">Biophysical</span>
            <div
                v-for="activity in biophysicalActivities"
                :key="activity"
                class="py-.5"
            >{{ activity }}</div>
        </div>
        <div
            v-if="enablingActivities.length > 0"
            class="mt-4 flex flex-col"
        >
            <span class="font-semibold">Enabling</span>
            <div
                v-for="activity in enablingActivities"
                :key="activity"
                class="py-.5"
            >{{ activity }}</div>
        </div>
        <div
            v-if="biophysicalActivities.length === 0 && enablingActivities.length === 0"
            class="italic text-gray-500"
        >
            {{ t('publicPagePreview.activitiesPanel.noActivities') }}
        </div>
    </ResultPanel>
</template>