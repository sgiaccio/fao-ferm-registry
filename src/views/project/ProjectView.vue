<script setup lang="ts">
import { onBeforeMount, onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import router from '@/router';

import { useProjectStore } from '../../stores/project';

const { fetchProject, saveProject, createEmptyProject } = useProjectStore();

const store = useProjectStore();

onBeforeMount(async () => {
    if (route.params.id === 'new') {
        createEmptyProject(route.query.groupId as string)
    } else {
        await fetchProject(route.params.id as string);
    }
});

// onMounted(() => {
//     router.push({ name: 'initiative-info', params: { id: route.params.id } });
// });

const route = useRoute();

const tabs = computed (() => [
  { name: 'Initiative', href: 'info', current: 'info' === route.name },
  { name: 'Area', href: 'aoi', current: 'aoi' === route.name },
  { name: 'Characteristics', href: 'characteristics', current: 'characteristics' === route.name },
  { name: 'Activities', href: 'activities', current: 'activities' === route.name },
  { name: 'Ecosystems', href: 'ecosystems', current: 'ecosystems' === route.name },
  { name: 'Indicators', href: 'indicators', current: 'indicators' === route.name },
//   { name: 'Information', href: 'information', current: 'information' === route.name },
  { name: 'Results', href: 'results', current: 'results' === route.name },
]);

// const showJson = ref(false);
// function toggleJson() { showJson.value = !showJson.value }

async function save() {
    await saveProject();
    router.push('/initiatives');
}
</script>

<template>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">

    <div>
        <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
            <select id="tabs" name="tabs" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option v-for="tab in tabs" :key="tab.name" :selected="tab.current">{{ tab.name }}</option>
            </select>
        </div>
        <div class="hidden sm:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <router-link v-for="tab in tabs"
                                 :key="tab.name"
                                 :href="tab.href"
                                 :class="[tab.current ? 'border-indigo-500 text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']" :aria-current="tab.current ? 'page' : undefined"
                                 :to="tab.href">{{tab.name}}</router-link>
                </nav>
            </div>
        </div>
    </div>
    <RouterView v-if="store.project"/>





    <div class="w-full relative">
        <button
            @click="save"
            type="button"
            class="absolute right-0 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ">Save and leave
        </button>
        <!-- <button 
            class="absolute left-0 border hover:text-amber-800 text-amber-500 dark:text-amber-900 font-semibold border-gray-300 dark:border-gray-900 bg-gray-200 dark:bg-gray-800 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
            @click="toggleJson">JSON</button>
        <pre v-if="showJson" class="text-xs font-medium absolute text-amber-700 dark:text-amber-600 top-20">{{JSON.stringify(store.project, null, 2)}}</pre> -->
    </div>
    <div class="h-24"></div> <!-- TODO -->
    </div></div>
</template>
