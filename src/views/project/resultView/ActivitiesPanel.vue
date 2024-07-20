<script setup lang="ts">
import { useMenusStore } from '@/stores/menus';

import ResultPanel from './ResultPanel.vue';


const { menus, getRecursiveMenuItem } = useMenusStore();

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
    return uniqueActivities.map(a => getRecursiveMenuItem(menus.activities, a)).map(i => i.label).sort();
}
</script>

<template>
    <ResultPanel title="Activities">
        <div
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
        >No activities</div>
    </ResultPanel>
</template>