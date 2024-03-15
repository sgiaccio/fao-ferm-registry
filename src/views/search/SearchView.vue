<script
    setup
    lang="ts"
>
import { ref } from 'vue'

// import WavyDivider from '@/views/WavyDivider.vue';

import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

import {
    Dialog,
    DialogPanel,

    TransitionRoot,
    TransitionChild,

    RadioGroup,
    RadioGroupLabel,
    RadioGroupOption
} from '@headlessui/vue'

import SidebarGoodPractices from './SidebarGoodPractices.vue'
import SidebarInitiatives from './SidebarInitiatives.vue'
import GoodPracticesSearchResultView from './GoodPracticesSearchResultView.vue'
import ProjectsSearchResultView from './ProjectsSearchResultView.vue'


const sidebarOpen = ref(false)

const queryGoodPractices = [
    {
        name: 'Degradation Drivers',
        queryName: 'drivers',
        queryValues: ['Cultural and social drivers', 'Ecological and environmental drivers', 'Economic drivers']
    }, {
        name: 'Ecosystem',
        queryName: 'ecosystems',
        queryValues: ['Farmlands', 'Forests', 'Freshwaters', 'Grasslands, Shrublands and Savannahs', 'Mountains', 'Oceans and coasts', 'Peatlands', 'Urban areas']
    }, {
        name: 'Region',
        queryName: 'regions',
        queryValues: ['Africa', 'Asia and the Pacific', 'Europe', 'Latin America and the Caribbean', 'North America', 'West Asia']
    }, {
        name: 'Source',
        queryName: 'source',
        queryValues: ['FERM', 'GoProFor', 'Panorama', 'WoCat']
    },
]

const queryInitiatives = [
    {
        name: 'Ecosystem',
        queryName: 'ecosystems',
        queryValues: ['Farmlands', 'Forests', 'Freshwaters', 'Grasslands, Shrublands and Savannahs', 'Mountains', 'Oceans and coasts', 'Peatlands', 'Urban areas', 'Not available']
    }, {
        name: 'Region',
        queryName: 'regions',
        queryValues: ['Africa', 'Asia and the Pacific', 'Europe', 'Latin America and the Caribbean', 'North America', 'West Asia']
    }, {
        name: 'Source',
        queryName: 'source',
        queryValues: ['FERM', 'Nature Commitments']
    }, {
        name: 'Restoration Type',
        queryName: 'restoration_types',
        queryValues: ['Ecological restoration', 'Rehabilitation']
    }, {
        name: 'Restoration Status',
        queryName: 'restoration_status',
        queryValues: ['In preparation', 'In progress', 'Post-completion monitoring']
    },
]

const searchTextGoodPractices = ref<string>('');
const searchTextInitiatives = ref<string>('');
const searchTermsGoodPractices = ref(Object.fromEntries(queryGoodPractices.map((q) => [q.queryName, []])));
const searchTermsInitiatives = ref(Object.fromEntries(queryInitiatives.map((q) => [q.queryName, []])));
const countriesBestPractices = ref([]);
const countriesInitiatives = ref([]);

const whatToSearch = ref<'initiatives' | 'goodPractices'>('initiatives');
</script>

<template>
    <header class="inset-x-0 top-0">
        <div class="overflow-hidden bg-none relative">
            <img
                src="/seashore.jpg"
                class="w-full h-full _bg-[url('/seashore.jpg')] object-cover absolute"
            >
            <!-- <wavy-divider class="absolute -left-1 bottom-0" /> -->
            <div class="px-4 sm:px-12 pt-8 pb-4">
                <!-- Logos -->
                <div class="relative w-full pl-10 flex mb-6">
                    <div class="mb-2 sm:mb-5 mt-2 grid grid-flow-col gap-x-6 mx-auto md:mx-0 divide-x divide-gray-300">
                        <div class="-ml-10 mr-3">
                            <router-link :to="{ name: 'home' }">
                                <img
                                    src="@/assets/FERM_LOGO_MASTER_colour_white_EN.svg"
                                    alt="FERM logo"
                                    class="h-10 md:h-12 w-auto scale-125"
                                />
                            </router-link>
                        </div>
                        <div>
                            <a
                                href="https://www.decadeonrestoration.org"
                                target="_blank"
                            >
                                <img
                                    src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                                    alt="FERM logo"
                                    class="h-10 md:h-12 w-auto scale-150 ml-10"
                                />
                            </a>
                        </div>
                    </div>
                </div>
                <div class="relative w-full text-center font-akrobat font-bold text-gray-50 text-3xl md:text-4xl lg:text-5xl uppercase shadow-black text-shadow-sm mb-6 sm:mb-8">Framework for Ecosystem<br>Restoration Monitoring</div>
            </div>
        </div>
    </header>
    <div class="mx-auto max-w-7xl sm:px-6_ lg:px-8">
        <div class="flex flex-row">

            <TransitionRoot
                as="template"
                :show="sidebarOpen"
            >
                <Dialog
                    as="div"
                    class="relative z-50 lg:hidden"
                    @close="sidebarOpen = false"
                >
                    <TransitionChild
                        as="template"
                        enter="transition-opacity ease-linear duration-300"
                        enter-from="opacity-0"
                        enter-to="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leave-from="opacity-100"
                        leave-to="opacity-0"
                    >
                        <div class="fixed inset-0 bg-gray-900/80" />
                    </TransitionChild>

                    <div class="fixed inset-0 flex">
                        <TransitionChild
                            as="template"
                            enter="transition ease-in-out duration-300 transform"
                            enter-from="-translate-x-full"
                            enter-to="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leave-from="translate-x-0"
                            leave-to="-translate-x-full"
                        >
                            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                                <TransitionChild
                                    as="template"
                                    enter="ease-in-out duration-300"
                                    enter-from="opacity-0"
                                    enter-to="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leave-from="opacity-100"
                                    leave-to="opacity-0"
                                >
                                    <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button
                                            type="button"
                                            class="-m-2.5 p-2.5"
                                            @click="sidebarOpen = false"
                                        >
                                            <span class="sr-only">Close sidebar</span>
                                            <XMarkIcon
                                                class="h-6 w-6 text-white"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </TransitionChild>
                                <!-- Sidebar component, swap this element with another sidebar if you like -->
                                <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                    <SidebarGoodPractices
                                        v-if="whatToSearch === 'goodPractices'"
                                        :query="queryGoodPractices"
                                        v-model:searchTerms="searchTermsGoodPractices"
                                        v-model:countries="countriesBestPractices"
                                    />
                                    <SidebarInitiatives
                                        v-else
                                        :query="queryInitiatives"
                                        v-model:searchTerms="searchTermsGoodPractices"
                                        v-model:countries="countriesInitiatives"
                                    />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </TransitionRoot>

            <div class="hidden lg:inset-y-0 lg:z-40 lg:flex lg:w-80 lg:flex-col flex-shrink-0 flex-col gap-y-5 overflow-y-auto border-r-2 border-gray-50 bg-white px-6 pb-4">
                <SidebarGoodPractices
                    v-if="whatToSearch === 'goodPractices'"
                    :query="queryGoodPractices"
                    v-model:searchTerms="searchTermsGoodPractices"
                    v-model:countries="countriesBestPractices"
                />
                <SidebarInitiatives
                    v-else
                    :query="queryInitiatives"
                    v-model:searchTerms="searchTermsInitiatives"
                    v-model:countries="countriesInitiatives"
                />
            </div>
            <div
                class="w-full"
                style_="box-shadow: inset 7px 0 7px -5px #eaeaea;"
            >
                <div class="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
                    <div class="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white_ px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none backdrop-blur-sm bg-white/95 ">
                        <button
                            type="button"
                            class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                            @click="sidebarOpen = true"
                        >
                            <span class="sr-only">Open sidebar</span>
                            <Bars3Icon
                                class="h-6 w-6"
                                aria-hidden="true"
                            />
                        </button>
                        <div
                            class="h-6 w-px bg-gray-200 lg:hidden"
                            aria-hidden="true"
                        />

                        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                            <div class="relative flex flex-1">
                                <label
                                    for="search-field"
                                    class="sr-only"
                                >Search</label>
                                <MagnifyingGlassIcon
                                    class="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                                <input
                                    v-if="whatToSearch === 'goodPractices'"
                                    v-model="searchTextGoodPractices"
                                    id="search-field"
                                    class="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base bfont-semibold bg-transparent"
                                    placeholder="Search..."
                                    type="search"
                                    name="search"
                                />
                                <input
                                    v-else
                                    v-model="searchTextInitiatives"
                                    id="search-field"
                                    class="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base bfont-semibold bg-transparent"
                                    placeholder="Search..."
                                    type="search"
                                    name="search"
                                    </div
                                >


                                <div>
                                    <span class="isolate inline-flex rounded-md shadow-sm mt-3">
                                        <button
                                            type="button"
                                            @click="whatToSearch = 'initiatives'"
                                            :class="['relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 border-t border-l border-b focus:z-10_', whatToSearch === 'initiatives' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-50']"
                                        >Initiatives</button>
                                        <!-- <button
                                            type="button"
                                            class="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                                        >Months</button> -->
                                        <button
                                            @click="whatToSearch = 'goodPractices'"
                                            type="button"
                                            :class="['relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 border-t border-r border-b focus:z-10_', whatToSearch === 'goodPractices' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-50']"
                                        >Good practices</button>
                                    </span>

                                    <!-- <RadioGroup
                                        v-model="whatToSearch"
                                        class="mt-2"
                                    >
                                        <RadioGroupLabel class="sr-only">Choose a memory option</RadioGroupLabel>
                                        <div class="grid grid-cols-2 gap-3">
                                            <RadioGroupOption
                                                as="template"
                                                value="initiatives"
                                                v-slot="{ active, checked }"
                                            >
                                                <div :class="['cursor-pointer focus:outline-none', active ? 'ring-2 ring-indigo-600 ring-offset-2' : '', whatToSearch === 'initiatives' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1']">
                                                    <RadioGroupLabel as="span">Initiatives</RadioGroupLabel>
                                                </div>
                                            </RadioGroupOption>
                                            <RadioGroupOption
                                                as="template"
                                                value="goodPractices"
                                                v-slot="{ active, checked }"
                                            >
                                                <div :class="['cursor-pointer focus:outline-none', active ? 'ring-2 ring-indigo-600 ring-offset-2' : '', whatToSearch === 'goodPractices' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1']">
                                                    <RadioGroupLabel as="span">Good practices</RadioGroupLabel>
                                                </div>
                                            </RadioGroupOption>
                                        </div>
                                    </RadioGroup> -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- <div id="total-count" class="flex justify-center items-center pt-5"></div> -->

                    <main class="pt-6 pb-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <GoodPracticesSearchResultView
                            v-if="whatToSearch === 'goodPractices'"
                            :searchText="searchTextGoodPractices"
                            :searchTerms="searchTermsGoodPractices"
                            :countries="countriesBestPractices"
                        />
                        <ProjectsSearchResultView
                            v-else
                            :searchText="searchTextInitiatives"
                            :searchTerms="searchTermsInitiatives"
                            :countries="countriesInitiatives"
                        />
                    </main>
                </div>
            </div>

        </div>
</template>

<style scoped>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
    transition: height 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    height: 0;
}
</style>
