<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
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
    { name: 'Area', path: 'area' },
    { name: 'Ecosystems', path: 'ecosystems' },
    // { name: 'Characteristics', path: 'characteristics' },
    { name: 'Activities', path: 'activities' },
    { name: 'Indicators', path: 'indicators' },
    { name: 'Monitoring & Results', path: 'results' }
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
                    <select id="tabs"
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
                        <nav class="-mb-px flex"
                             aria-label="Tabs">
                            <router-link v-for="tab in tabs"
                                         :key="tab.name"
                                         :to="tab.path"
                                         :class="[route.path.endsWith(tab.path) ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium']"
                                         :aria-current="route.path.endsWith(tab.path) ? 'page' : undefined">
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
