<script setup lang="ts">
import {
    InformationCircleIcon,
    GlobeAltIcon,
    WrenchScrewdriverIcon,
    EyeIcon,
    TrophyIcon,
    ChartBarIcon,
    ListBulletIcon,
} from '@heroicons/vue/24/outline'

import {
    InformationCircleIcon as InformationCircleIconSolid,
    GlobeAltIcon as GlobeAltIconSolid,
    WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
    EyeIcon as EyeIconSolid,
    TrophyIcon as TrophyIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    ListBulletIcon as ListBulletIconSolid,
} from '@heroicons/vue/24/solid'

import { computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';

import router from '@/router';

import { useProjectStore } from '@/stores/project';


const navigation = [{
    name: 'Planning & Assessment',
    color: 'bg-yellow-200',
    tabs: [{
        name: 'General',
        path: 'general',
        icon: InformationCircleIcon,
        solidIcon: InformationCircleIconSolid
    }, {
        name: 'Area & Ecosystems',
        path: 'area',
        icon: GlobeAltIcon,
        solidIcon: GlobeAltIconSolid
    }, {
        name: 'Characteristics',
        path: 'characteristics',
        icon: ListBulletIcon,
        solidIcon: ListBulletIconSolid
    }]
}, {
    name: 'Implementation',
    color: 'bg-green-200',
    tabs: [{
        name: 'Activities',
        path: 'activities',
        icon: WrenchScrewdriverIcon,
        solidIcon: WrenchScrewdriverIconSolid
    }]
}, {
    name: 'Monitoring & Reporting',
    color: 'bg-blue-200',
    tabs: [{
        name: 'Indicators',
        path: 'indicators',
        icon: ChartBarIcon,
        solidIcon: ChartBarIconSolid
    }, {
        name: 'Monitoring',
        path: 'monitoring',
        icon: EyeIcon,
        solidIcon: EyeIconSolid
    }, {
        name: 'Results',
        path: 'results',
        icon: TrophyIcon,
        solidIcon: TrophyIconSolid
    }]
}];

const store = useProjectStore();

const route = useRoute();

// This is a hack to reset the project state when the user navigates away from the project view
onBeforeRouteLeave((_to, _from) => {
    store.resetProjectState();
});

const flattenedTabs = navigation.reduce((acc, curr) => acc.concat(curr.tabs), []);
const firstTab = computed(() => currentRouteIdx.value === 0);
const lastTab = computed(() => currentRouteIdx.value === flattenedTabs.length - 1);
const currentRouteIdx = computed(() => flattenedTabs.findIndex(tab => route.path.endsWith(tab.path)));

function gotoNextTab() {
    if (!lastTab.value) {
        router.push('./' + flattenedTabs[currentRouteIdx.value + 1].path);
    }
}

function gotoPreviousTab() {
    if (!firstTab.value) {
        router.push('./' + flattenedTabs[currentRouteIdx.value - 1].path);
    }
}
</script>


<template>
    <div class="lg:inset-0">
        <div class="hidden sm:fixed sm:inset-y-0 sm:z-40 sm:flex sm:w-16 lg:w-60 lg:flex-col grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 mt-16">
            <nav class="flex lg:hidden flex-1 flex-col divide-y-2 pt-4">
                <div
                    v-for="phase in navigation"
                    :key="phase.name"
                    role="list"
                    class="-mx-2 space-y-1 py-4 flex flex-col gap-y-2"
                >
                    <div
                        v-for="item in phase.tabs"
                        :key="item.name"
                    >
                        <div>
                            <router-link
                                :to="item.path"
                                :class="[route.path.endsWith(item.path) ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md text-sm leading-6 font-semibold justify-center']"
                            >
                                <component
                                    :is="item.solidIcon"
                                    :class="[route.path.endsWith(item.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                                    aria-hidden="true"
                                />
                            </router-link>
                        </div>
                    </div>
                </div>
            </nav>
            <nav class="hidden lg:flex flex-1 flex-col pt-6">
                <ul
                    role="list"
                    class="flex flex-1 flex-col gap-y-7"
                >
                    <li>
                        <ul
                            v-for="phase in navigation"
                            :key="phase.name"
                            role="list"
                            class="-mx-2 space-y-1"
                        >
                            <div :class="['text-xs font-semibold leading-6 text-gray-400']">{{ phase.name }}</div>
                            <li
                                v-for="item in phase.tabs"
                                :key="item.name"
                            >
                                <router-link
                                    :to="item.path"
                                    :class="[route.path.endsWith(item.path) ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']"
                                >
                                    <component
                                        :is="item.icon"
                                        :class="[route.path.endsWith(item.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                                        aria-hidden="true"
                                    />
                                    {{ item.name }}
                                    <!-- <span
                                        v-if="item.count"
                                        class="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
                                        aria-hidden="true"
                                    >{{ item.count }}</span> -->
                                </router-link>
                            </li>
                        </ul>
                    </li>
                    <!--
                    <li class="-mx-6 mt-auto">
                        <a
                            href="#"
                            class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                        >
                            <img
                                class="h-8 w-8 rounded-full bg-gray-50"
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt=""
                            />
                            <span class="sr-only">Your profile</span>
                            <span aria-hidden="true">Tom Cook</span>
                        </a>
                    </li> -->
                </ul>
            </nav>
        </div>
    </div>
    <div class="mt-16 sm:ml-16 lg:ml-60 px-4 sm:px-6 lg:px-8">
        <div class="pt-8 max-w-4xl mx-auto">
            <router-view
                :previous="gotoPreviousTab"
                :next="gotoNextTab"
                :first="firstTab"
                :last="lastTab"
            />
        </div>
    </div>
</template>
  


<!-- <script setup lang="ts">
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
                    <!- - Use an "onChange" listener to redirect the user to the selected tab URL. - ->
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
                            <!- - <div class="bg-yellow-100 col-span-3 text-center py-2">Planning & Assessment</div>
                            <div class="bg-green-100 col-span-1 text-center py-2">Implementation</div>
                            <div class="bg-blue-100 col-span-3 text-center py-2">Monitoring & Reporting</div> - ->
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
</template> -->
