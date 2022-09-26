<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

import { indicators } from '../../components/project/menus';
import TreeItem from '../../components/inputs/base/TreeItem.vue';

const store = useProjectStore();
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Indicator selection</h1>
        <p class="dark:text-zinc-200">Indicators are selected to monitor ecosystem restoration progress. The list of priority indicators is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated. You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project.</p>
        <TreeItem
            v-model="store.project.indicators"
            :treeData="indicators"
            :expandLevel="0" />
    </div>
</template>
