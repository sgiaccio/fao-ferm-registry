<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

import {
    Dialog,
    DialogPanel,
    TransitionRoot,
    TransitionChild,
} from '@headlessui/vue'

import { Squares2X2Icon, ListBulletIcon } from '@heroicons/vue/24/outline'

import { debounce, resilientFetch } from '@/lib/util'

import Thumbnail from './Thumbnail.vue'
import Detail from './Detail.vue'

import { XMarkIcon } from '@heroicons/vue/24/outline'


const props = defineProps<{
    searchText: string
    searchTerms: any
    countries: []
}>();

const secondResultsAsiaPopup = ref(false);
const secondResultsAsiaPopupShown = ref(false);

onMounted(() => {
    loadMore();
    window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});

function handleScroll() {
    if (isLoading.value || !hasMore.value) return;

    const threshold = document.documentElement.scrollHeight - window.innerHeight - 100;
    if (window.scrollY >= threshold) {
        loadMore();
    }
}

const showAsList = ref(false);

const currentResult = ref(null);
const isDetailsModalOpen = ref(false);

function showDetail(result) {
    currentResult.value = result;
    isDetailsModalOpen.value = true;
}

const debouncedSearchText = ref('');
watch(() => props.searchText, debounce((text: string) => {
    debouncedSearchText.value = text
}, 1000));

const debouncedSearchTerms = ref({});
watch(() => props.searchTerms, debounce((val: {}) => {
    debouncedSearchTerms.value = { ...val }
}, 1000), { deep: true });

const debouncedCountries = ref([]);
watch(() => props.countries, debounce((val: []) => {
    debouncedCountries.value = [...val]
}, 1000), { deep: true });

const isLoading = ref(false);
const searchResults = ref<any>([]);
const totalCount = ref(null);
const hasMore = ref(true);

watch([debouncedSearchTerms, debouncedSearchText, debouncedCountries], () => {
    isLoading.value = true;
    searchResults.value = [];
    totalCount.value = null;

    loadMore();
}, { deep: true });

function buildQuery() {
    const queryStart = 'WITH data AS ( SELECT * FROM fao-ferm2-review.initiatives.vw_cse ), counted_data AS ( SELECT *, COUNT(*) OVER() AS total_count FROM data '

    let conditions = Object.entries(props.searchTerms).map(([key, values]) => {
        if (values.length === 0) return ''
        if (key === 'source' || key === 'restoration_status') {
            return `${key} IN UNNEST([${values.map((v) => `'${v}'`).join(', ')}])`
        } else {
            return `EXISTS (SELECT 1 FROM UNNEST(${key}) AS ${key} WHERE ${key} IN (${values.map((v) => `'${v}'`).join(', ')}))`
        }
    }).filter(Boolean)

    if (props.countries.length) {
        const countryIso3Codes = props.countries.map(c => c.ISO3)
        conditions.push(`EXISTS (SELECT 1 FROM UNNEST(country_codes_iso3) AS country WHERE country IN (${countryIso3Codes.map((v) => `'${v}'`).join(', ')}))`)
    }

    if (props.searchText) {
        // escape single quotes and backslashes in the search text
        let escapedSearchText = props.searchText.toLowerCase().replace(/['\\]/g, '\\$&');
        conditions.push(`(LOWER(title) LIKE '%${escapedSearchText}%' OR EXISTS ( SELECT 1 FROM UNNEST(country_codes_iso3) AS country WHERE LOWER(country) LIKE '%${escapedSearchText}%' ))`);
    }

    const queryEnd = `) SELECT * FROM counted_data ORDER BY last_updated DESC LIMIT 30 OFFSET ${searchResults.value.length};`;

    return queryStart + (conditions.length ? ' WHERE ' + conditions.join(' AND ') : '') + queryEnd
}

async function loadMore() {
    try {
        isLoading.value = true;

        const query = buildQuery();
        const url = `https://api.data.apps.fao.org/api/v2/bigquery?query=${encodeURIComponent(query)}&output_format=json&download=false`;
        const response = await resilientFetch(url, {}, 10000);

        const data = await response.json();
        searchResults.value = [...searchResults.value, ...data];
        totalCount.value = data[0]?.total_count;

        hasMore.value = searchResults.value.length < totalCount.value;
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching the data');
    } finally {
        isLoading.value = false;
    }
}

function changeSource(event, source) {
    const img = event.target;
    img.src = `/interop_logos/${source.toLowerCase()}.png`;
}

const firstResultAsiaPopup = ref(true);
const resultAsiaPopupShown = ref(false);
//wath the searchTerms and if it contains source='RESULT Asia-Pacific', show a popup
watch(() => props.searchTerms, (val) => {
    if (val.source && val.source.includes('RESULT Asia-Pacific')
        && !resultAsiaPopupShown.value
        && !firstResultAsiaPopup.value
        && !secondResultsAsiaPopupShown.value) {
        secondResultsAsiaPopup.value = true
        secondResultsAsiaPopupShown.value = true
    }
}, { deep: true, immediate: true });

function firstDialogClose() {
    // show the second dialog
    if (props.searchTerms.source?.includes('RESULT Asia-Pacific') && !resultAsiaPopupShown.value && !secondResultsAsiaPopupShown.value) {
        secondResultsAsiaPopup.value = true;
        secondResultsAsiaPopupShown.value = true;
    }
    firstResultAsiaPopup.value = false;
}
</script>

<template>
    <div
        class="w-full flex justify-between mb-5 relative items-center"
        v-if="totalCount !== null"
    >
        <div class="text-gray-700 font-medium_ tracking-wide text-lg">Showing <span class="font-bold">{{ searchResults.length }}</span> of <span class="font-bold">{{ totalCount }}</span> initiatives</div>
        <!-- show as list or as grid -->
        <div class="flex justify-end items-center gap-x-2">
            <button
                class="border-2 border-gray-400 rounded-md text-gray-400 p-0.5  hover:bg-gray-50 transition-all duration-200"
                @click="showAsList = !showAsList"
            >
                <Squares2X2Icon
                    v-if="!showAsList"
                    class="h-6 w-6"
                />
                <ListBulletIcon
                    v-else
                    class="h-6 w-6"
                />
            </button>
        </div>
    </div>

    <TransitionRoot
        as="template"
        :show="isDetailsModalOpen"
    >
        <Dialog
            @close="isDetailsModalOpen = false"
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
                        <Detail
                            :title="currentResult.title"
                            :shortDescription="currentResult.description"
                            :lastUpdated="currentResult.last_updated"
                            :organizations="currentResult.organizations"
                            :url="currentResult.url"
                            :source="currentResult.source"
                            :previewImage="currentResult.preview_image"
                            :countryIso3Codes="currentResult.country_codes_iso3"
                            :countryNames="currentResult.countries"
                            viewFullText="View full initiative"
                        />
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>


    <div
        v-if="!showAsList"
        class="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
        <div
            v-for="result in searchResults"
            :key="result.id"
            class="relative cursor-pointer"
            @click="showDetail(result)"
        >
            <Thumbnail
                class="rounded-md hover:shadow-md hover:shadow-gray-400 shadow-sm transition-all duration-200 flex"
                :title="result.title"
                :previewImage="result.preview_image"
                :source="result.source"
            />
            <img
                v-if="result.source && result.preview_image"
                class="h-7 absolute top-1.5 right-1.5 rounded-sm bg-white/90 p-1 shadow-md shadow-black/10 backdrop-blur-sm"
                :src="`/interop_logos/${result.source.toLowerCase()}.svg`"
                @error="changeSource($event, result.source)"
                :alt="result.source"
            />
        </div>
    </div>

    <div
        v-else
        class="grid grid-cols-1 gap-y-4 lg:gap-y-5"
    >
        <div
            v-for="result in searchResults"
            class="w-full max-w-4xl rounded-md bg-white overflow-hidden h-64 shadow-md flex flex-col border"
        >
            <Detail
                :title="result.title"
                :shortDescription="result.description"
                :lastUpdated="result.last_updated"
                :organizations="result.organizations"
                :url="result.url"
                :source="result.source"
                :previewImage="result.preview_image"
                :countryIso3Codes="result.country_codes_iso3"
                :countryNames="result.countries"
                viewFullText="View full initiative"
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






    <TransitionRoot
        as="template"
        :show="secondResultsAsiaPopup"
    >
        <Dialog
            class="relative z-50"
            @close="() => secondResultsAsiaPopup = false"
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
                <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
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
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                <button
                                    type="button"
                                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    @click="secondResultsAsiaPopup = false"
                                >
                                    <span class="sr-only">Close</span>
                                    <XMarkIcon
                                        class="size-6"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                            <div class="_sm:flex _sm:items-start">
                                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <!-- <DialogTitle
                                        as="h3"
                                        class="text-base font-semibold text-gray-900"
                                    >Deactivate account</DialogTitle> -->
                                    <div class="mt-2">
                                        <img src="/resultasiaheader.png">

                                        <h1 class="text-6xl mt-6 font-semibold text-green-500 uppercase">RESULT Asia-Pacific</h1>
                                        <p class="mt-3 text-base font-bold text-green-600">
                                            In this section you can find Ecosystem Restoration projects ideas in Asia-Pacific prepared for funding in the context of the RESULT Asia-Pacific framework.
                                        </p>
                                        <p class="mt-3 text-base text-gray-700">
                                            RESULT Asia-Pacific represents collective action by countries and partners to restore and sustainably manage a consolidated 100 million hectares of the region’s degraded landscapes; transforming them into productive, ecologically functional and resilient landscapes by 2030.
                                        </p>
                                        <p class="mt-3 text-base text-gray-700">
                                            It enables the countries in the region to lead the achievement of their ambitious restoration targets with scaled-up interventions on priority landscapes, enhanced financing, sustained high-quality outcomes, and optimal benefits flowing to smallholders and local communities.
                                        </p>
                                        <p class="mt-3 text-base text-gray-700">
                                            This Regional Programmatic Framework was designed in line with the Asia-Pacific Regional Strategy and Action Plan on Forest and Landscape Restoration (FLR) and the UN Decade on Ecosystem Restoration.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <!-- <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                    @click="showResultsAsiaInitialPopup = false"
                                >Deactivate</button>
                                <button
                                    type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    @click="showResultsAsiaInitialPopup = false"
                                >Cancel</button>
                            </div> -->
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>

    <!-- <TransitionRoot
        as="template"
        :show="showResultsAsiaInitialPopup"
    >
        <Dialog
            as="div"
            class="relative z-50"
            @close="() => showResultsAsiaInitialPopup = false"
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
                <div class="flex min-h-full items-end justify-center text-center sm:items-center max-w-4xl mx-auto p-4">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform text-left shadow-xl transition-all w-full m-12 h-[calc(100vh-6rem)]">
                            <button
                                @click="() => showResultsAsiaInitialPopup = false"
                                class="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none flex items-center justify-center z-10"
                                aria-label="Close modal"
                            >
                                <XMarkIcon class="h-6 w-6 text-gray-500" />
                            </button>
                            <div class="h-full bg-slate-100 rounded-lg overflow-hidden">
                                <p>
                                    RESULT Asia-Pacific represents collective action by countries and partners to restore and sustainably manage a consolidated 100 million hectares of the region’s degraded landscapes; transforming them into productive, ecologically functional and resilient landscapes by 2030.
                                </p>
                                <p>
                                    It enables the countries in the region to lead the achievement of their ambitious restoration targets with scaled-up interventions on priority landscapes, enhanced financing, sustained high-quality outcomes, and optimal benefits flowing to smallholders and local communities.
                                </p>
                                <p>
                                    This Regional Programmatic Framework was designed in line with the Asia-Pacific Regional Strategy and Action Plan on Forest and Landscape Restoration (FLR) and the UN Decade on Ecosystem Restoration.
                                </p>

                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot> -->

    <TransitionRoot
        as="template"
        :show="firstResultAsiaPopup"
    >
        <Dialog
            class="relative z-50"
            @close="firstDialogClose"
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
                <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
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
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                <button
                                    type="button"
                                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    @click="firstDialogClose"
                                >
                                    <span class="sr-only">Close</span>
                                    <XMarkIcon
                                        class="size-6"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                            <div class="_sm:flex _sm:items-start">
                                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <!-- <DialogTitle
                                        as="h3"
                                        class="text-base font-semibold text-gray-900"
                                    >Deactivate account</DialogTitle> -->
                                    <div class="mt-2">
                                        <img src="/resultasiaheader.png">

                                        <h1 class="text-3xl mt-6 font-semibold text-green-500 uppercase">RESULT Asia-Pacific partner initiatives are available in FERM</h1>

                                        <!-- <p class="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed from our servers forever. This action cannot be undone.</p> -->
                                        <p class="mt-3 text-base font-bold text-green-600">
                                            By making the the RESULT Asia-Pacific initiatives available in the FERM, investments in ecosystem restoration are enabled by connecting donors with viable, bankable projects.
                                        </p>
                                        <p class="mt-3 text-base text-gray-700">
                                            We are pleased to announce Ecosystem Restoration project ideas in the Asia-Pacific region, developed under the RESULT Asia-Pacific framework, are now available on FERM.
                                        </p>
                                        <p class="mt-3 text-base text-gray-700">
                                            You can explore these projects by clicking on the RESULT Asia-Pacific filter in the FERM search engine under sources. Start discovering opportunities for #generationrestoration!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>

</template>

<style scoped>
img.thumb_logo {
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
}
</style>