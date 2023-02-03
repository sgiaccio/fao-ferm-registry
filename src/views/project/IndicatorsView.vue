<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

import { indicators, gefIndicators } from '../../components/project/menus';
import TreeItem from '../../components/inputs/base/TreeItem.vue';

const store = useProjectStore();

withDefaults(defineProps<{
    edit: boolean
}>(), {
    edit: true
});
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Indicator selection</h1>
        <p class="dark:text-zinc-200">Indicators are selected to monitor ecosystem restoration progress. The list of priority indicators is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated. You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project.</p>
        <h1 class="text-2xl dark:text-zinc-300">SDG indicators</h1>
        <TreeItem
            :edit="edit"
            v-model="store.project.indicators"
            :treeData="indicators"
            :expandLevel="0" />
        <h1 class="text-2xl dark:text-zinc-300">GEF indicators</h1>
        <div
            v-for="area, i in store.projectAreas"
            class="border-2 px-3 py-2 rounded-lg">
            <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2">
                Area {{i + 1}}<span class="text-black dark:text-gray-100" v-if="area[Object.keys(area)[0]].siteName">: {{area[Object.keys(area)[0]].siteName}}</span>
            </div>
            <TreeItem
            :edit="edit"
                v-model="area[Object.keys(area)[0]].gefIndicators"
                :treeData="gefIndicators"
                :expandLevel="0" />
        </div>
    </div>
</template>
