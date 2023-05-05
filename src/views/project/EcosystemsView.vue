<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

import { iucnEcosystems } from '../../components/project/menus';

import TabTemplate from '../TabTemplate.vue';
import TreeItem from '../../components/inputs/base/TreeItem.vue';


const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

</script>

<template>

    <TabTemplate title="Ecosystems">
        <template #description>
            <p>
                It is crucial to identify the ecosystems that your initiative is restoring. If spatially explicit information of an area is provided and represents the entirety of the area under restoration (i.e. polygons of the areas are provided), the ecosystems can be calculated based on a map overlay. If only tabular data of an area is provided, we kindly ask you to select the corresponding ecosystems using biomes of the IUCN Global Ecosystem Typology 2.0 (Keith et al., 2022).
            </p>
            <p>
                There are different ecosystem classifications. The IUCN Global Ecosystem Typology 2.0 is the outcome of critical review and input by an extensive international network of ecosystem scientists, containing profiles for 25 biomes and 108 ecosystem functional groups.
            </p>
        </template>
        <template #default>
            <div v-if="store.projectAreas?.length"
                 class="flex flex-col gap-y-4 pt-6">
                <div v-for="area, i in store.projectAreas"
                     class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                    <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2">
                        Area {{ i + 1}}<span class="text-black dark:text-gray-100"
                              v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName }}</span>
                    </div>
                    <TreeItem :edit="edit"
                              v-model="area[Object.keys(area)[0]].ecosystems"
                              :treeData="iucnEcosystems"
                              :expandLevel="0" />
                </div>
            </div>
            <div v-else
                 class="text-red-600 font-bold text-lg pb-4">Please enter at least one area in the <router-link class="text-blue-400 underline hover:text-blue-600"
                             :to="{ path: 'aoi' }">Area tab</router-link></div>
        </template>
    </TabTemplate>
</template>

