<script setup lang="ts">
import { useMenusStore } from '@/stores/menus';

import ResultPanel from './ResultPanel.vue';


const { menus, getRecursiveMenuItem, flattenMenu } = useMenusStore();

const props = defineProps<{
    areas: any[]
}>();

function getAllActivities() {
    if (props.areas?.length === 0) return [];
    const activities = props.areas.reduce((acc, area) => {
        const areaObjValue = Object.values(area)[0];
        const areaActivities = areaObjValue.activities;
        return areaActivities ? [...acc, ...areaActivities] : acc;
    }, []);
    // remove duplicates
    const uniqueActivities = [...new Set(activities)];
    return uniqueActivities.map(a => getRecursiveMenuItem(menus.activities, a)).map(i => i.value)
}

function groupActivitiesByType() {
    const allActivitiesInProject = getAllActivities();
    const allBiophysicalActivities = flattenMenu(menus.activities[0].items!);
    const allEnablingActivities = flattenMenu(menus.activities[1].items!);

    const biophysicalActivities = allActivitiesInProject
        .filter(a => allBiophysicalActivities.find(b => b.value === a))
        .sort((a, b) => allActivitiesInProject.indexOf(a) - allActivitiesInProject.indexOf(b))
        .map(i => getRecursiveMenuItem(menus.activities, i).label);
    const enablingActivities = allActivitiesInProject
        .filter(a => allEnablingActivities.find(b => b.value === a))
        .sort((a, b) => allActivitiesInProject.indexOf(a) - allActivitiesInProject.indexOf(b))
        .map(i => getRecursiveMenuItem(menus.activities, i).label);

    return {
        biophysicalActivities,
        enablingActivities
    };
}

const { biophysicalActivities, enablingActivities } = groupActivitiesByType();
</script>

<template>
    <ResultPanel title="Activities">
        <!-- <div
            v-if="getAllActivities().length > 0"
            class="list-disc list-inside flex flex-col divide-y"
        >
            <div
                v-for="activity in getAllActivities()"
                :key="activity"
                class="py-1"
            >{{ activity }}</div>
        </div>
        <div
            v-else
            class="italic text-gray-500"
        >No activities</div> -->
        <div
            v-if="biophysicalActivities.length > 0"
            class="list-disc list-inside flex flex-col"
        >
            <span class="font-bold">Biophysical</span>
            <div
                v-for="activity in biophysicalActivities"
                :key="activity"
                class="py-.5"
            >{{ activity }}</div>
        </div>
        <div
            v-if="enablingActivities.length > 0"
            class="mt-4 list-disc list-inside flex flex-col"
        >
            <span class="font-bold">Enabling</span>
            <div
                v-for="activity in enablingActivities"
                :key="activity"
                class="py-.5"
            >{{ activity }}</div>
        </div>
        <div
            v-if="biophysicalActivities.length === 0 && enablingActivities.length === 0"
            class="italic text-gray-500"
        >No activities</div>
    </ResultPanel>
</template>