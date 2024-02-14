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

const superTabs = [
    {
        indexes: [0, 1, 2],
        name: 'Planning & Assessment',
        color: 'bg-yellow-200',
    },
    {
        indexes: [3],
        name: 'Implementation',
        color: 'bg-green-200',
    },
    {
        indexes: [4, 5, 6],
        name: 'Monitoring & Reporting',
        color: 'bg-blue-200',
        fadedColor: 'bg-blue-50'
    }
];

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
            <div class="mt-4 md:mt-6 mb-6 md:mb-8 print:hidden">
                <div class="sm:hidden">
                    <label
                        for="tabs"
                        class="sr-only"
                    >Select a tab</label>
                    <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                    <select
                        @change="(a) => router.push(a.target.value)"
                        id="tabs"
                        name="tabs"
                        class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option
                            v-for="tab in tabs"
                            :key="tab.name"
                            :value="tab.path"
                            :selected="route.path.endsWith(tab.path)"
                        >{{ tab.name }}
                        </option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <div class="border-b border-gray-200">
                        <nav
                            class="-mb-px grid auto-cols-max grid-cols-7 text-sm tracking-tight_ font-semibold"
                            aria-label="Tabs"
                        >
                            <!-- <div class="bg-yellow-100 col-span-3 text-center py-2">Planning & Assessment</div>
                            <div class="bg-green-100 col-span-1 text-center py-2">Implementation</div>
                            <div class="bg-blue-100 col-span-3 text-center py-2">Monitoring & Reporting</div> -->
                            <div
                                v-for="(superTab) in superTabs"
                                :class="`${superTab.color} col-span-${superTab.indexes.length} text-center py-2 font-normal`"
                            >
                                {{ superTab.name }}
                            </div>

                            <router-link
                                v-for="(tab, i) in tabs"
                                :class="[route.path.endsWith(tab.path) ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-gray-800 hover:border-gray-300 hover:text-gray-900', 'border-b-2 py-6 text-center text-sm font-light cursor-pointer flex flex-col tracking-tighter']"
                                :aria-current="route.path.endsWith(tab.path) ? 'page' : undefined"
                                :key="tab.name"
                                :to="tab.path"
                            >
                                {{ tab.name }}
                            </router-link>
                        </nav>
                    </div>
                </div>
            </div>

            <router-view
                :previous="gotoPreviousTab"
                :next="gotoNextTab"
                :first="firstTab"
                :last="lastTab"
            />

        </div>
    </div>
</template>
