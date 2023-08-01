<script setup lang="ts">
import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from "../TabTemplate.vue";

// import { indicators, gefIndicators } from '@/components/project/menus';
import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import RecursiveRadio from '@/components/inputs/base/RecursiveRadio.vue';

const store = useProjectStore();
const menus = useMenusStore().menus;

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const indicator = store.projectAreas[0][key].gefIndicator;
    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            area[key].gefIndicator = indicator;
        }
    });
}
</script>

<template>
    <TabTemplate title="Indicators">
        <template #description>
            <p>Indicators are selected to monitor ecosystem restoration progress. The list of priority indicators is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated. You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project.</p>
        </template>
        <template #default>
            <!-- hide if not GEF -->
            <div v-if="store.project.reportingLine !== 'GEF'"
                 class="pt-6 pb-6">
                <h1 class="text-2xl dark:text-zinc-300 font-bold mb-3">SDG indicators</h1>
                <RecursiveMenu :edit="edit"
                               v-model="store.project.indicators"
                               :options="menus.indicators"
                               :expandLevel="0" />

            </div>

            <div class="pt-8"
                 v-if="store.project.reportingLine === 'GEF'">
                <h1 class="akrobat text-2xl dark:text-zinc-300 font-bold mb-3">GEF indicators</h1>
                <LabelFormGroup label="Total area under restoration (achieved area spatially explicit)"
                                :value="store.polygonsArea()" />
                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="(area, i) in store.projectAreas"
                         class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                        <div class="flex flex-row my-3">
                            <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                                Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
                                      v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName }}</span>
                            </div>
                            <div  v-if="edit">
                                <button v-if="i === 0 && store.projectAreas.length > 1"
                                        type="button"
                                        class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        @click="applyToAll">
                                    Apply to all
                                </button>
                            </div>
                        </div>
                        <RecursiveRadio v-model="area[Object.keys(area)[0]].gefIndicator"
                                        :options="menus.gefIndicators"
                                        :edit="edit" />
                        <!-- <TreeItem :edit="edit"
                                  v-model="area[Object.keys(area)[0]].gefIndicators"
                                  :treeData="gefIndicators"
                                  :expandLevel="0" /> -->
                    </div>
                </div>
                <div v-else-if="edit"
                     class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                    <router-link class="text-blue-400 underline hover:text-blue-600"
                                 :to="{ path: 'area' }">Area tab</router-link>
                </div>
                <div v-else>
                    <div class="text-lg italic text-gray-600 dark:text-gray-400">None selected</div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
