<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

import TabTemplate from "../TabTemplate.vue";

import { indicators, gefIndicators } from '../../components/project/menus';
import TreeItem from '../../components/inputs/base/TreeItem.vue';


const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});
</script>

<template>
    <TabTemplate title="Indicators">
        <template #description>
            <p>Indicators are selected to monitor ecosystem restoration progress. The list of priority indicators is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated. You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project.</p>
        </template>
        <template #default>
            <div class="pt-6 pb-6">
                <h1 class="font-akrobat text-2xl dark:text-zinc-300 font-bold">SDG indicators</h1>
                <TreeItem :edit="edit"
                          v-model="store.project.indicators"
                          :treeData="indicators"
                          :expandLevel="0" />

            </div>

            <div class="pt-8">
                <h1 class="font-akrobat text-2xl dark:text-zinc-300 font-bold">GEF indicators</h1>
                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="area, i in store.projectAreas"
                         class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                        <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2">
                            Area {{ i + 1}}<span class="text-black dark:text-gray-100"
                                  v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName }}</span>
                        </div>
                        <TreeItem :edit="edit"
                                  v-model="area[Object.keys(area)[0]].gefIndicators"
                                  :treeData="gefIndicators"
                                  :expandLevel="0" />
                    </div>
                </div>
                <div v-else
                     class="text-red-600 font-bold text-lg pb-4">Please enter at least one area in the <router-link class="text-blue-400 underline hover:text-blue-600"
                                 :to="{ path: 'aoi' }">Area tab</router-link></div>
            </div>
        </template>
    </TabTemplate>
</template>
