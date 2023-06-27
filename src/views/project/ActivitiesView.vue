<script setup lang="ts">
import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

// import { activities, restorationTypes, tenureStatuses } from '@/components/project/menus';

import TabTemplate from "../TabTemplate.vue";
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import SelectFormGroup from "@/components/inputs/base/SelectFormGroup.vue";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();
const menus = useMenusStore().menus;

function applyToAll() {
    if (!confirm('Are you sure you want to apply this activity to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const value = store.projectAreas[0][key];
    const activities = value.activities;
    const restorationType = value.restorationType;
    const tenureStatus = value.tenureStatus;
    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            area[key].restorationType = restorationType;
            area[key].tenureStatus = tenureStatus;
            area[key].activities = activities;
        }
    });
}
</script>

<template>
    <TabTemplate title="Activities">
        <template #description>
            <p>There are various forms of activities to support ecosystem restoration. They range from technologies to approaches, at local to watershed levels. Different parameters are identified to categorize activities and better identify related indicators and datasets for each area of interest.</p>
        </template>
        <template #default>
            <div v-if="store.projectAreas?.length"
                 class="flex flex-col gap-y-4 pt-6">
                <div v-for="area, i in store.projectAreas"
                     class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                            Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
                                  v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName }}</span>
                        </div>
                        <div>
                            <button v-if="i === 0"
                                    type="button"
                                    class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="applyToAll">
                                Apply to all
                            </button>
                        </div>
                    </div>
                    <SelectFormGroup :edit="edit"
                                     v-model="area[Object.keys(area)[0]].restorationType"
                                     label="Restoration type"
                                     :options="menus.restorationTypes"></SelectFormGroup>
                    <SelectFormGroup :edit="edit"
                                     v-model="area[Object.keys(area)[0]].tenureStatus"
                                     label="Tenure status"
                                     :options="menus.tenureStatuses"></SelectFormGroup>
                    <h1 class="font-akrobat text-2xl dark:text-zinc-300 font-bold mb-2">Activities</h1>
                    <RecursiveMenu :edit="edit"
                                   v-model="area[Object.keys(area)[0]].activities"
                                   :options="menus.activities" />
                </div>
            </div>
            <div v-else-if="edit"
                 class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                <router-link class="text-blue-400 underline hover:text-blue-600"
                             :to="{ path: 'area' }">Area tab</router-link>
            </div>
            <div v-else>
                <div class="text-lg italic mt-6 text-gray-600 dark:text-gray-400">None selected</div>
            </div>
        </template>
    </TabTemplate>
    <!-- <pre class="text-white">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
