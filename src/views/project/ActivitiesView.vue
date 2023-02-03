<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

import { activities } from '../../components/project/menus';

import FormGroup from '../../components/inputs/FormGroup.vue';
import TreeItem from '../../components/inputs/base/TreeItem.vue';
import DateFormGroup from '../../components/inputs/base/DateFormGroup.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Activities</h1>
        <p class="dark:text-zinc-200">There are various forms of activities to support ecosystem restoration. They range from technologies to approaches, at local to watershed levels. Different parameters are identified to categorize activities and better identify related indicators and datasets for each area of interest.</p>

        <FormGroup label="Activities" v-if="store.projectAreas?.length">
            <div class="flex flex-col gap-y-4">
                <div
                    v-for="area, i in store.projectAreas"
                    class="border-2 px-3 py-2 rounded-lg">
                    <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2">
                        Area {{i + 1}}<span class="text-black dark:text-gray-100" v-if="area[Object.keys(area)[0]].siteName">: {{area[Object.keys(area)[0]].siteName}}</span>
                    </div>
                    <DateFormGroup
                        :edit="edit"
                        v-model="area[Object.keys(area)[0]].startingDate"
                        label="Starting date"></DateFormGroup>
                    <DateFormGroup
                        :edit="edit"
                        v-model="area[Object.keys(area)[0]].endingDate"
                        label="Ending date"></DateFormGroup>
                    <TreeItem
                    :edit="edit"
                        v-model="area[Object.keys(area)[0]].activities"
                        :treeData="activities" />
                </div>
            </div>
        </FormGroup>
        <div v-else class="text-red-600 font-bold text-lg">Please enter at least one area in the <router-link class="text-blue-400 underline hover:text-blue-600" :to="{name: 'aoi'}">Area tab</router-link></div>
    </div>
</template>

