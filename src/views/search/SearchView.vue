<script
    setup
    lang="ts"
>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// import WavyDivider from '@/views/WavyDivider.vue';

import { Dialog, DialogPanel } from '@headlessui/vue'

import { Bars3Icon } from '@heroicons/vue/24/outline'

import { ChevronRightIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

import { CheckIcon } from '@heroicons/vue/16/solid'

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    TransitionRoot,
    TransitionChild,
} from '@headlessui/vue'

import Detail from './Detail.vue'
import CountrySelect from './CountrySelect.vue'

onMounted(() => {
    loadMore();
    window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});

const hasMore = ref(true);
function handleScroll() {
    if (isLoading.value || !hasMore) return;

    const threshold = document.documentElement.scrollHeight - window.innerHeight - 100;
    if (window.scrollY >= threshold) {
        loadMore();
    }
}

const searchText = ref<string>('');
const query = [
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
    }, {
        name: 'Country',
        queryName: 'country',
        queryValues: ['Afghanistan']
    },
]

const sidebarOpen = ref(false)

// const searchTerms = ref({
//     drivers: [],
//     ecosystems: [],
//     regions: [],
//     source: [],
//     country: [],
// });

const searchTerms = ref(Object.fromEntries(query.map((q) => [q.queryName, []])));

function toggleSearchTerm(queryName: string, value: string) {
    const current = searchTerms.value[queryName]
    if (current.includes(value)) {
        searchTerms.value[queryName] = current.filter((v) => v !== value)
    } else {
        searchTerms.value[queryName] = [...current, value]
    }
}

// debounce searchText
const debounce = (func, wait: number) => {
    let timeout;
    return function (...args) {
        const context = this;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
};

const debouncedSearchText = ref('');
watch(searchText, debounce((text) => {
    debouncedSearchText.value = text
}, 1000));

const debouncedSearchTerms = ref({});
watch(searchTerms, debounce((val) => {
    debouncedSearchTerms.value = { ...val }
}, 1000), { deep: true });

const isLoading = ref(false);

const searchResults = ref([]);
const totalCount = ref(null);

watch([debouncedSearchTerms, debouncedSearchText], ([newVal = {}, newSearchText = '']) => {
    isLoading.value = true;
    searchResults.value = [];
    totalCount.value = null;

    loadMore();
}, { deep: true });

function loadMore() {
    isLoading.value = true;
    const nLoaded = searchResults.value.length;
    const queryStart = 'WITH data AS ( SELECT * FROM fao-maps-review.fao_cse.vw_cse_en ), counted_data AS ( SELECT *, COUNT(*) OVER() AS total_count FROM data '

    let conditions = Object.entries(searchTerms.value).map(([key, values]) => {
        if (values.length === 0) return ''
        if (key === 'source') {
            return `source IN UNNEST([${values.map((v) => `'${v}'`).join(', ')}])`
        } else {
            return `EXISTS (SELECT 1 FROM UNNEST(${key}) AS ${key} WHERE ${key} IN (${values.map((v) => `'${v}'`).join(', ')}))`
        }
    }).filter(Boolean)

    if (searchText.value) {
        // escape single quotes and backslashes in the search text
        let escapedSearchText = searchText.value.toLowerCase().replace(/['\\]/g, '\\$&');
        conditions.push(`(LOWER(title) LIKE '%${escapedSearchText}%' OR LOWER(short_description) LIKE '%${escapedSearchText}%' OR EXISTS ( SELECT 1 FROM UNNEST(country_iso3_codes) AS country WHERE LOWER(country) LIKE '%${escapedSearchText}%' ))`);
    }

    const queryEnd = `) SELECT * FROM counted_data LIMIT 30 OFFSET ${nLoaded};`
    const query = queryStart + (conditions.length ? ' WHERE ' + conditions.join(' AND ') : '') + queryEnd

    fetch('https://api.data.apps.fao.org/api/v2/bigquery?query=' + encodeURIComponent(query) + '&output_format=json&download=false')
        .then(response => response.json())
        .then(data => {
            searchResults.value = [...searchResults.value, ...data];
            totalCount.value = data[0]?.total_count;
            isLoading.value = false;
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while fetching the data');
        })
        .finally(() => {
            isLoading.value = false;
        })
}

const currentResult = ref(null);
function showDetail(result) {
    currentResult.value = result;
    setIsOpen(true);
}

const isOpen = ref(false);

function setIsOpen(value: boolean) {
    isOpen.value = value;
}
</script>

<template>
    <TransitionRoot
        as="template"
        :show="isOpen"
    >
        <Dialog
            @close="setIsOpen(false)"
            class="relative z-50"
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

                <div class="fixed inset-0 bg-black/60 bg-opacity-75 transition-opacity w-screen" />
            </TransitionChild>
            <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enter-to="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 translate-y-0 sm:scale-100"
                    leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >

                    <DialogPanel class="w-full max-w-4xl rounded-md bg-white overflow-hidden min-h-64 shadow-md flex flex-col">
                        <!-- close button on the top left -->
                        <!-- <button
                    @click="setIsOpen(false)"
                    class="absolute -top-3 -left-3 overflow-visible z-50"
                >
                    <XMarkIcon class="h-6 w-6 text-gray-700 rounded-full bg-gray-400" />
                </button> -->

                        <!-- <DialogTitle>Deactivate account</DialogTitle>
                <DialogDescription>
                    This will permanently deactivate your account
                </DialogDescription>
 -->
                        <Detail :practice="currentResult" />
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
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
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">


        <div class="flex flex-row">



            <!-- Sidebar component, swap this element with another sidebar if you like -->
            <div class="hidden lg:inset-y-0 lg:z-40 lg:flex lg:w-80 lg:flex-col flex-shrink-0 flex-col gap-y-5 overflow-y-auto border-r-2 border-gray-50 bg-white px-6 pb-4">

                <nav class="flex flex-1 flex-col pt-6">
                    <ul
                        role="list"
                        class="flex flex-1 flex-col gap-y-5"
                    >
                        <Disclosure
                            v-for="item in query"
                            class="border-b-2 border-b-gray-100"
                            as="li"
                            v-slot="{ open }"
                            :defaultOpen="true"
                        >
                            <DisclosureButton class="flex flex-row w-full font-bold uppercase text-gray-600 cursor-pointer items-center">
                                <ChevronRightIcon
                                    v-if="!open"
                                    class="h-5 w-5 text-gray-800"
                                />
                                <ChevronDownIcon
                                    v-else
                                    class="h-5 w-5 text-gray-800"
                                />
                                <span>{{ item.name }}</span>
                            </DisclosureButton>
                            <!-- Use the built-in `transition` component to add transitions. -->
                            <!-- <transition
                                enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-out"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0"
                            > -->
                            <DisclosurePanel
                                as="ul"
                                role="list"
                                class="mx-2 mt-1 mb-2 space-y-1"
                            >
                                <li
                                    v-for="value in item.queryValues"
                                    :key="value"
                                    :class="[searchTerms[item.queryName].includes(value) ? 'bg-blue-100' : '', 'flex flex-row justify-between text-sm cursor-pointer hover:bg-blue-100 rounded-full py-1 pl-3 items-center']"
                                    @click="() => toggleSearchTerm(item.queryName, value)"
                                >
                                    <div class="flex flex-row items-center justify-between w-full">
                                        <span class="text-gray-700">{{ value }}</span>
                                        <!-- <span v-if="searchTerms[item.queryName].includes(value)" class="text-gray-700 pr-3"></span> -->
                                        <CheckIcon
                                            :class="[searchTerms[item.queryName].includes(value) ? 'visible' : 'invisible', 'h-4 w-4 text-gray-800 mr-2 flex-shrink-0']"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </li>
                            </DisclosurePanel>
                            <!-- </transition> -->
                        </Disclosure>

                        <CountrySelect v-model:query="searchTerms.country" />
                    </ul>
                    <!-- <ul
                        role="list"
                        class="flex flex-1 flex-col gap-y-7"
                    >
                        <li>
                            <ul
                                role="list"
                                class="-mx-2 space-y-1"
                            >
                                <li
                                    v-for="item in query"
                                    :key="item.name"
                                    class="flex flex-col"
                                >
                                    <div
                                        :class="['text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group justify-between flex gap-x-3 rounded-md p-2 text-sm font-semibold border-b uppercase cursor-pointer']"
                                        @click="toggleSearchSection(item.queryName)"
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="['text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                                            aria-hidden="true"
                                        />
                                        {{ item.name }}
                                        <ChevronDownIcon
                                            v-if="openedSearches.has(item.queryName)"
                                            class="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                        <ChevronRightIcon
                                            v-else
                                            class="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div
                                        v-show="openedSearches.has(item.queryName)"
                                        class="flex flex-col gap-y-2"
                                    >
                                        <div
                                            v-for="value in item.queryValues"
                                            :key="value"
                                            class="flex flex-row justify-between items-end text-sm"
                                        >
                                            <span class="text-gray-700">{{ value }}</span>
                                        </div>
                                    </div>
                                    <div
                                        v-show="openedSearches.has(item.queryName)"
                                        class="flex flex-col gap-y-2"
                                    >
                                        <div
                                            v-for="value in item.queryValues"
                                            :key="value"
                                            class="flex flex-row justify-between items-end text-sm"
                                        >
                                            <span class="text-gray-700">{{ value }}</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul> -->
                </nav>
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

                        <!-- Separator -->
                        <div
                            class="h-6 w-px bg-gray-200 lg:hidden"
                            aria-hidden="true"
                        />

                        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                            <form
                                class="relative flex flex-1"
                                action="#"
                                method="GET"
                            >
                                <label
                                    for="search-field"
                                    class="sr-only"
                                >Search</label>
                                <MagnifyingGlassIcon
                                    class="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                                <input
                                    v-model="searchText"
                                    id="search-field"
                                    class="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base bfont-semibold bg-transparent"
                                    placeholder="Search good practices..."
                                    type="search"
                                    name="search"
                                />
                            </form>
                        </div>
                    </div>
                </div>

                <div
                    v-if="totalCount !== null"
                    class="flex justify-center items-center pt-5"
                >
                    <span class="text-gray-500 font-semibold">Showing {{ searchResults.length }} of {{ totalCount }} good practices</span>
                </div>


                <main class="pt-6 pb-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div
                        v-if="true"
                        class="grid grid-cols-2 md:grid-cols-3 gap-4"
                    >
                        <div
                            v-for="result in searchResults"
                            :key="result.id"
                            class="aspect-square rounded-md overflow-hidden cursor-pointer hover:shadow-md hover:shadow-gray-400 shadow-sm transition-all duration-200 flex"
                            @click="() => showDetail(result)"
                            :style="`background-image: url(${result.preview_image || '/placeholder.png'});background-size: cover; background-position: center;`"
                        >
                            <div class="h-20 bg-black/60 text-white px-3 p-3 w-full self-end">
                                <h3 class="text-sm font-medium line-clamp-3">{{ result.title }}</h3>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else
                        class="grid grid-cols-1 gap-y-4 lg:gap-y-5"
                    >
                        <div
                            v-for="result in searchResults"
                            class="w-full max-w-4xl rounded-md bg-white overflow-hidden h-56 shadow-md flex flex-col border"
                        >
                            <Detail
                                :key="result.id"
                                :practice="result"
                            />
                        </div>
                    </div>
                    <div
                        v-if="isLoading"
                        class="flex justify-center items-center mt-10"
                    >
                        <svg
                            aria-hidden="true"
                            style="color: rgb(229 231 235);fill: #2563eb;"
                            class="animate-spin h-10"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                            />
                        </svg>
                    </div>
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
