<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

import { iucnEcosystems } from '../../components/project/menus';

import FormGroup from '../../components/inputs/FormGroup.vue';
import TreeItem from '../../components/inputs/base/TreeItem.vue';
import DateFormGroup from '../../components/inputs/base/DateFormGroup.vue';


const store = useProjectStore();
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Ecosystems</h1>
        <p class="dark:text-zinc-200">It is crucial to identify the ecosystems that your initiative is restoring. If spatially explicit information of an area is provided and represents the entirety of the area under restoration (i.e. polygons of the areas are provided), the ecosystems can be calculated based on a map overlay. If only tabular data of an area is provided, we kindly ask you to select the corresponding ecosystems using biomes of the IUCN Global Ecosystem Typology 2.0 (Keith et al., 2022).
        </p>
        <p>
        There are different ecosystem classifications. The IUCN Global Ecosystem Typology 2.0 is the outcome of critical review and input by an extensive international network of ecosystem scientists, containing profiles for 25 biomes and 108 ecosystem functional groups.</p>

        <FormGroup label="Ecosystems" v-if="store.projectAreas?.length">
            <div class="flex flex-col gap-y-4">
                <div
                    v-for="area, i in store.projectAreas"
                    class="border-2 px-3 py-2 rounded-lg">
                    <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2">
                        Area {{i + 1}}<span class="text-black dark:text-gray-100" v-if="area[Object.keys(area)[0]].siteName">: {{area[Object.keys(area)[0]].siteName}}</span>
                    </div>
                    <TreeItem
                        v-model="area[Object.keys(area)[0]].ecosystems"
                        :treeData="iucnEcosystems"
                        :expandLevel="0" />
                </div>
            </div>
        </FormGroup>
        
        <div v-else class="text-red-600 font-bold text-lg">Please enter at least one area in the <router-link class="text-blue-400 underline hover:text-blue-600" :to="{name: 'aoi'}">Area tab</router-link></div>
    </div>
</template>

