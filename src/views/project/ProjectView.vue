<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';

import router from '@/router';

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

const containerClass = computed(() => {
  return route.name === 'projectResults' ? 'pt-8 max-w-full mx-auto' : 'pt-8 max-w-6xl mx-auto';
});
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
    <div class="mt-16 sm:ml-16 lg:ml-60 px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] overflow-y-auto">
        <div :class="containerClass">
            <router-view
                :previous="gotoPreviousTab"
                :next="gotoNextTab"
                :first="firstTab"
                :last="lastTab"
            />
        </div>
    </div>
</template>
