<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';

import { storeToRefs } from "pinia";

import router from '@/router';

import { useBestPracticesStore } from '../../stores/bestpractices';


const route = useRoute();
const { fetchBestPractice, saveBestPractice } = useBestPracticesStore();
const { bestPractice } = storeToRefs(useBestPracticesStore());
const store = useBestPracticesStore();


const tabs = [
    { name: 'Objectives and Context', href: 'objectives' },
    { name: 'Methodology', href: 'methodology' },
    { name: 'Key Factors, Constraints and Lessons Learned', href: 'key-factors' },
    { name: 'Benefits and Validation', href: 'benefits' },
    { name: 'Additional Resources', href: 'additional-resources' }
];

onBeforeMount(async () => {
    await fetchBestPractice(route.params.id as string);
});

// watch(
//     () => route.params,
//     async () => {
//         // createEmptyDoc();
//         await fetchBestPractice(route.params.id as string);
//     },
//     // fetch the data when the view is created and the data is already being observed
//     { immediate: true },
// )

async function save() {
    await saveBestPractice();
    router.push('/best-practices');
}

</script>

<template>
    <div>
        <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <select id="tabs" name="tabs" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option v-for="tab in tabs" :key="tab.name" :selected="route.name === tab.href">{{ tab.name }}</option>
            </select>
        </div>
        <div class="hidden sm:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <router-link
                        v-for="tab in tabs"
                        :key="tab.name"
                        :class="[route.name === tab.href ? 'border-indigo-500 text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']" :aria-current="route.name === tab.href ? 'page' : undefined"
                        :to="tab.href">{{tab.name}}
                    </router-link>
                </nav>
            </div>
        </div>
    </div>

    <!-- <router-view /> -->

    <!-- TODO, important -->
    <router-view v-slot="{ Component, route }" v-if="store.bestPractice">
        <keep-alive include="BestPracticeObjectivesView">
            <component :is="Component" :key="route.path" />
        </keep-alive>
    </router-view>

    <div class="w-full relative">
        <button
            @click="save"
            type="button"
            class="absolute right-0 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save</button>
    </div>

    <pre class="text-white">{{JSON.stringify(bestPractice, null, 2)}}</pre>

</template>
