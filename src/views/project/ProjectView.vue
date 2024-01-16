<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';

import router from '@/router';

import { useProjectStore } from '@/stores/project';


const store = useProjectStore();

const route = useRoute();

// This is a hack to reset the project state when the user navigates away from the project view
onBeforeRouteLeave((_to, _from) => {
    store.resetProjectState();
});

const tabs = [
    { name: 'General', path: 'general' },
    { name: 'Area & Ecosystems', path: 'area' },
    // { name: 'Ecosystems', path: 'ecosystems' },
    { name: 'Characteristics', path: 'characteristics' },
    { name: 'Activities', path: 'activities' },
    { name: 'Indicators', path: 'indicators' },
    { name: 'Monitoring', path: 'monitoring' },
    { name: 'Results', path: 'results' }
];

const currentRouteIdx = computed(() => tabs.findIndex(tab => route.path.endsWith(tab.path)));

const firstTab = computed(() => {
    return (currentRouteIdx.value === 0);
});

const lastTab = computed(() => {
    return (currentRouteIdx.value === tabs.length - 1);
});


function gotoNextTab() {
    if (!lastTab.value) {
        router.push(tabs[currentRouteIdx.value + 1].path);
    }
}

function gotoPreviousTab() {
    if (!firstTab.value) {
        router.push(tabs[currentRouteIdx.value - 1].path);
    }
}
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <div class="mt-4 md:mt-6 mb-6 md:mb-8">
                <div class="sm:hidden">
                    <label for="tabs"
                           class="sr-only">Select a tab</label>
                    <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                    <select @change="() => router.push($event.target.value)"
                            id="tabs"
                            name="tabs"
                            class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <option v-for="tab in tabs"
                                :key="tab.name"
                                :selected="route.path.endsWith(tab.path)">{{ tab.name }}
                        </option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px grid auto-cols-auto grid-cols-7 text-sm tracking-tight font-akrobat font-semibold"
                             aria-label="Tabs">
                            <div class="bg-yellow-100 col-span-3 text-center py-2">Planning & Assessment</div>
                            <div class="bg-green-100 col-span-1 text-center py-2">Implementation</div>
                            <div class="bg-blue-100 col-span-3 text-center py-2">Monitoring & Reporting</div>

                            <router-link v-for="tab in tabs"
                                         :class="[route.path.endsWith(tab.path) ? 'border-indigo-500 text-indigo-600 dark:text-indigo-200' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300', 'border-b-2 py-6 text-center text-base font-medium', 'cursor-pointer flex flex-col']"
                                         :aria-current="route.path.endsWith(tab.path) ? 'page' : undefined"
                                         :key="tab.name"
                                         :to="tab.path">
                                {{ tab.name }}
                            </router-link>
                        </nav>
                    </div>
                </div>
            </div>

            <router-view :previous="gotoPreviousTab"
                         :next="gotoNextTab"
                         :first="firstTab"
                         :last="lastTab" />

        </div>
    </div>
</template>
