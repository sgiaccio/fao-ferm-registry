<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import router from '@/router';

import { useBestPracticesStore } from '../../stores/bestpractices';

// import Guidelines from './Guidelines.vue';


const route = useRoute();
const { fetchBestPractice, saveBestPractice, createEmptyBestPractice } = useBestPracticesStore();
const store = useBestPracticesStore();
// const { bestPractice } = storeToRefs(store); // TODO delete


const tabs = [
    { name: 'Objectives and Context', html: 'Objectives<br>and Context', href: 'objectives'},
    { name: 'Methodology', html: 'Methodology', href: 'methodology' },
    { name: 'Key Factors, Constraints and Lessons Learned', html: 'Key Factors, Constraints<br>and Lessons Learned', href: 'key-factors' },
    { name: 'Benefits and Validation', html: 'Benefits<br>and Validation', href: 'benefits' },
    { name: 'Additional Resources', html: 'Additional Resources', href: 'additional-resources' }
];

onBeforeMount(async () => {
    if (route.params.id === 'new') {
        if (!route.query.projectId) throw Error('Didn\'t get project id in request query');
        createEmptyBestPractice(route.query.projectId as string);
    } else {
        return fetchBestPractice(route.params.id as string);
    }
});

onMounted(() => {
    const id = route.params.id;
    let nextRoute = { name: 'objectives', params: { id } }
    if (id === 'new') nextRoute = { ...nextRoute, query: { projectId: route.query.projectId }}
    router.push(nextRoute);
});

async function save() {
    await saveBestPractice();
    router.push('/objectives');
}

const showJson = ref(false)
function toggleJson() {
    showJson.value = !showJson.value;
}

</script>

<template>
    <!-- <Guidelines></Guidelines> -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
        <div>
            <div class="sm:hidden">
                <label for="tabs" class="sr-only">Select a tab</label>
                <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                <select id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <option v-for="tab in tabs" :key="tab.name" :selected="route.name === tab.href">{{ tab.name }}</option>
                </select>
            </div>
            <div class="hidden sm:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex" aria-label="Tabs">
                    <router-link v-for="tab in tabs" :key="tab.name" :to="tab.href" :class="[route.name === tab.href ? 'border-indigo-500  text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm']" :aria-current="route.name === tab.href ? 'page' : undefined">{{ tab.name }}</router-link>
                </nav>
            </div>
            </div>
        </div>

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
                class="absolute right-0 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save and leave
            </button>
            <!-- <button 
                class="absolute left-0 border hover:text-amber-800 text-amber-500 dark:text-amber-900 font-semibold border-gray-300 dark:border-gray-900 bg-gray-200 dark:bg-gray-800 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
                @click="toggleJson">JSON</button>
            <pre v-if="showJson" class="text-xs font-medium absolute text-amber-700 dark:text-amber-600 top-20">{{JSON.stringify(store.bestPractice, null, 2)}}</pre> -->
        </div>
        <!-- <div class="h-24"></div> <!- -TODO -->
    </div>
</div>
</template>
