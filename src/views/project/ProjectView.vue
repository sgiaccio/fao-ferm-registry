<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';

import router from '@/router';
import { defineAsyncComponent } from 'vue';
import {
    InformationCircleIcon,
    GlobeAltIcon,
    WrenchScrewdriverIcon,
    EyeIcon,
    ComputerDesktopIcon,
    ChartBarIcon,
    ListBulletIcon,
} from '@heroicons/vue/24/outline'

import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

import {
    InformationCircleIcon as InformationCircleIconSolid,
    GlobeAltIcon as GlobeAltIconSolid,
    WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
    EyeIcon as EyeIconSolid,
    ComputerDesktopIcon as ComputerDesktopIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    ListBulletIcon as ListBulletIconSolid,
} from '@heroicons/vue/24/solid'

import { XMarkIcon } from '@heroicons/vue/16/solid';

import { useProjectStore } from '@/stores/project';

// import ResultsView from './ResultsView.vue';
const ResultsView = defineAsyncComponent(() => import('./ResultsView.vue'));

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

function openPreviewModal() {
    router.push({
        query: {
            ...route.query,
            modal: 'preview'
        }
    });
}

const isPreviewOpen = computed(() => route.query.modal === 'preview' && !!store.project);

function closeModal() {
    router.push({
        query: {
            ...route.query,
            modal: undefined
        }
    });
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
                <!-- add public page preview link -->
                <div class="flex gap-x-3 rounded-md text-sm leading-6 font-semibold justify-center">
                    <div
                        @click="openPreviewModal"
                        class="group flex gap-x-3 rounded-md text-sm leading-6 font-semibold cursor-pointer hover:text-indigo-600 hover:bg-gray-50"
                    >
                        <ComputerDesktopIconSolid
                            class="h-6 w-6 shrink-0"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </nav>
            <nav class="hidden lg:flex flex-1 flex-col pt-6">
                <ul
                    role="list"
                    class="flex flex-1 flex-col gap-y-6"
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
                                </router-link>
                            </li>
                        </ul>
                    </li>
                    <!-- add public page preview link -->
                    <li class="border-t border-gray-200 pt-6">
                        <div
                            class="group flex gap-x-3 rounded-md text-sm leading-6 font-semibold cursor-pointer hover:text-indigo-600 hover:bg-gray-50"
                            @click="openPreviewModal"
                        >
                            <ComputerDesktopIcon
                                class="h-6 w-6 shrink-0"
                                aria-hidden="true"
                            />
                            Public Page Preview
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
    <div class="mt-16 sm:ml-16 lg:ml-60 px-4 sm:px-6 lg:px-8 _h-[calc(100vh-4rem)] _overflow-y-auto">
        <div :class="containerClass">
            <router-view
                :previous="gotoPreviousTab"
                :next="gotoNextTab"
                :first="firstTab"
                :last="lastTab"
            />
        </div>
    </div>

    <TransitionRoot
        as="template"
        :show="isPreviewOpen"
    >
        <Dialog
            as="div"
            class="relative z-50"
            @close="closeModal"
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity w-screen" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform text-left shadow-xl transition-all w-full m-6 h-[calc(100vh-3rem)]">
                            <button
                                @click="closeModal"
                                class="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none flex items-center justify-center z-10"
                                aria-label="Close modal"
                            >
                                <XMarkIcon class="h-6 w-6 text-gray-500" />
                            </button>
                            <ResultsView />
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
