<script setup lang="ts">
import { ref, watch } from 'vue'

import { useI18n } from 'vue-i18n';

import router from '@/router';

import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild,
} from '@headlessui/vue'

import SidebarGoodPractices from './SidebarGoodPractices.vue'
import SidebarInitiatives from './SidebarInitiatives.vue'
import GoodPracticesSearchResultView from './GoodPracticesSearchResultView.vue'
import ProjectsSearchResultView from './ProjectsSearchResultView.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';


const props = withDefaults(defineProps<{
    type: 'initiatives' | 'goodPractices'
    source?: string
}>(), {
    type: 'initiatives'
});

const { t } = useI18n();

const sidebarOpen = ref(false)
const aboutOpen = ref(false)

// get source from url query or from props
const source = props.source || router.currentRoute.value.query.source as string;
const whatToSearch = ref<'initiatives' | 'goodPractices'>();
watch(() => props.type, type => {
    whatToSearch.value = type;

    // show the about dialog if the user is searching for good practices for the first time
    if (!localStorage.getItem('aboutViewedOnce') && type === 'goodPractices') {
        localStorage.setItem('aboutViewedOnce', 'true');
        aboutOpen.value = true;
    }
}, { immediate: true });

const queryGoodPractices = [
    {
        queryName: 'drivers',
        // queryValues: ['Cultural and social drivers', 'Ecological and environmental drivers', 'Economic drivers']
        queryValues: [
            { value: 'culturalAndSocialDrivers', label: 'Cultural and social drivers' },
            { value: 'ecologicalAndEnvironmentalDrivers', label: 'Ecological and environmental drivers' },
            { value: 'economicDrivers', label: 'Economic drivers' }
        ]
    }, {
        queryName: 'ecosystems',
        // queryValues: ['Farmlands', 'Forests', 'Freshwaters', 'Grasslands, Shrublands and Savannahs', 'Mountains', 'Oceans and coasts', 'Peatlands', 'Urban areas']
        queryValues: [
            { value: 'farmlands', label: 'Farmlands' },
            { value: 'forests', label: 'Forests' },
            { value: 'freshwaters', label: 'Freshwaters' },
            { value: 'grasslands', label: 'Grasslands, Shrublands and Savannahs' },
            { value: 'mountains', label: 'Mountains' },
            { value: 'oceans', label: 'Oceans and coasts' },
            { value: 'peatlands', label: 'Peatlands' },
            { value: 'urban', label: 'Urban areas' }
        ]
    }, {
        queryName: 'regions',
        // queryValues: ['Africa', 'Asia and the Pacific', 'Europe', 'Latin America and the Caribbean', 'North America', 'West Asia']
        queryValues: [
            { value: 'africa', label: 'Africa' },
            { value: 'asia', label: 'Asia and the Pacific' },
            { value: 'europe', label: 'Europe' },
            { value: 'latinAmerica', label: 'Latin America and the Caribbean' },
            { value: 'northAmerica', label: 'North America' },
            { value: 'westAsia', label: 'West Asia' }
        ]
    }, {
        queryName: 'source',
        // queryValues: ['FERM', 'GoProFor', 'Panorama', 'WoCat']
        queryValues: [
            { value: 'ferm', label: 'FERM' },
            { value: 'goProFor', label: 'GoProFor' },
            { value: 'panorama', label: 'Panorama' },
            { value: 'woCat', label: 'WoCat' }
        ]
    },
]

const queryInitiatives = [
    {
        queryName: 'ecosystems',
        // queryValues: ['Farmlands', 'Forests', 'Freshwaters', 'Grasslands, Shrublands and Savannahs', 'Mountains', 'Oceans and coasts', 'Peatlands', 'Urban areas', 'Not Available']
        queryValues: [
            { value: 'farmlands', label: 'Farmlands' },
            { value: 'forests', label: 'Forests' },
            { value: 'freshwaters', label: 'Freshwaters' },
            { value: 'grasslands', label: 'Grasslands, Shrublands and Savannahs' },
            { value: 'mountains', label: 'Mountains' },
            { value: 'oceans', label: 'Oceans and coasts' },
            { value: 'peatlands', label: 'Peatlands' },
            { value: 'urban', label: 'Urban areas' },
            { value: 'notAvailable', label: 'Not Available' }
        ]
    }, {
        queryName: 'regions',
        // queryValues: ['Africa', 'Asia and the Pacific', 'Europe', 'Latin America and the Caribbean', 'North America', 'West Asia']
        queryValues: [
            { value: 'africa', label: 'Africa' },
            { value: 'asia', label: 'Asia and the Pacific' },
            { value: 'europe', label: 'Europe' },
            { value: 'latinAmerica', label: 'Latin America and the Caribbean' },
            { value: 'northAmerica', label: 'North America' },
            { value: 'westAsia', label: 'West Asia' }
        ]
    }, {
        queryName: 'source',
        // queryValues: ['FERM', 'GEF', 'RESULT Asia-Pacific', 'Nature Commitments', 'Restoration Resource Center', 'Brazilian Restoration and Reforestation Observatory']
        queryValues: [
            { value: 'ferm', label: 'FERM' },
            { value: 'gef', label: 'GEF' },
            { value: 'resultAsiaPacific', label: 'RESULT Asia-Pacific' },
            { value: 'natureCommitments', label: 'Nature Commitments' },
            { value: 'restorationResourceCenter', label: 'Restoration Resource Center' },
            { value: 'brazilianRestorationAndReforestationObservatory', label: 'Brazilian Restoration and Reforestation Observatory' }
        ]
    }, {
        queryName: 'restoration_types',
        // queryValues: ['Ecological restoration', 'Rehabilitation', 'Other']
        queryValues: [
            { value: 'ecologicalRestoration', label: 'Ecological restoration' },
            { value: 'rehabilitation', label: 'Rehabilitation' },
            { value: 'other', label: 'Other' }
        ]
    }, {
        queryName: 'restoration_status',
        // queryValues: ['In preparation', 'In progress', 'Post-completion monitoring', 'Other']
        queryValues: [
            { value: 'inPreparation', label: 'In preparation' },
            { value: 'inProgress', label: 'In progress' },
            { value: 'postCompletionMonitoring', label: 'Post-completion monitoring' },
            { value: 'other', label: 'Other' }
        ]
    },
]

const searchTextGoodPractices = ref<string>('');
const searchTextInitiatives = ref<string>('');
const searchTermsGoodPractices = ref(Object.fromEntries(queryGoodPractices.map(q => [q.queryName, []])));
// const searchTermsInitiatives_ = ref(Object.fromEntries(queryInitiatives.map((q) => [q.queryName, []])));
// initialize search terms for initiatives with the source gotten
const searchTermsInitiatives = ref(
    Object.fromEntries(
        queryInitiatives.map(q => [
            q.queryName,
            (q.queryName === 'source') && source ? [source] : []
        ])
    )
);


const countriesBestPractices = ref<{ ISO3: string, name: string }[]>([]);
const countriesInitiatives = ref<{ ISO3: string, name: string }[]>([]);
const language = ref<'en' | 'es' | 'fr'>('en');

// This is needed because some values are stored in different languages in the database.
const labelTranslations = {
    'en': {
        drivers: {
            culturalAndSocialDrivers: 'Cultural and social drivers',
            ecologicalAndEnvironmentalDrivers: 'Ecological and environmental drivers',
            economicDrivers: 'Economic drivers'
        },
        ecosystems: {
            farmlands: 'Farmlands',
            forests: 'Forests',
            freshwaters: 'Freshwaters',
            grasslands: 'Grasslands, Shrublands and Savannahs',
            mountains: 'Mountains',
            oceans: 'Oceans and coasts',
            peatlands: 'Peatlands',
            urban: 'Urban areas'
        },
    },
    'es': {
        drivers: {
            culturalAndSocialDrivers: 'Factores culturales y sociales',
            ecologicalAndEnvironmentalDrivers: 'Factores ecológicos y medioambientales',
            economicDrivers: 'Factores económicos'
        },
        ecosystems: {
            farmlands: 'Tierras agrícolas',
            forests: 'Bosques',
            freshwaters: 'Agua dulce',
            grasslands: 'Pastizales, matorrales y sabanas',
            mountains: 'Montañas',
            oceans: 'Océanos y costas',
            peatlands: 'Turberas',
            urban: 'Zonas urbanas'
        },
    },
    'fr': {
        drivers: {
            culturalAndSocialDrivers: 'Facteurs culturels et sociaux',
            ecologicalAndEnvironmentalDrivers: 'Facteurs écologiques et environnementaux',
            economicDrivers: 'Facteurs économiques'
        },
        ecosystems: {
            farmlands: 'Terres agricoles',
            forests: 'Forêts',
            freshwaters: 'Eaux douces',
            grasslands: 'Prairies, terrains arbustifs et savanes',
            mountains: 'Montagnes',
            oceans: 'Océans et côtes',
            peatlands: 'Tourbières',
            urban: 'Zones urbaines'
        },
    }
}

</script>

<template>
    <TransitionRoot
        as="template"
        :show="aboutOpen"
    >
        <Dialog
            as="div"
            class="relative z-50"
            @close="aboutOpen = false"
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
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div class="flex min-h-full justify-center p-4 text-center">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 max-w-3xl sm:p-6">
                            <!-- <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                <button
                                    type="button"
                                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    @click="open = false"
                                >
                                    <span class="sr-only">Close</span>
                                    <XMarkIcon
                                        class="h-6 w-6"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div> -->
                            <DialogTitle
                                as="h1"
                                class="text-2xl font-bold leading-6 mb-5 font-akrobat uppercase text-ferm-blue-dark-800"
                            >Welcome to the FERM Common Search Engine for Good Practices on Ecosystem Restoration!</DialogTitle>

                            <p>This common search engine is the result of a collaborative effort by the FAO-led <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://www.decadeonrestoration.org/task-forces/best-practices"
                                >Best Practices</a> and <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://www.decadeonrestoration.org/task-forces/monitoring"
                                >Monitoring</a> Task Forces of the UN Decade on Ecosystem Restoration, combining the need to share and promote good practices and the need to transparently track progress of our collective restoration efforts.
                            </p>

                            <h2 class="font-akrobat uppercase text-lg font-bold mt-4 text-ferm-blue-dark-800">Purpose</h2>
                            <p>The primary purpose of the FERM Common Search Engine is to <span class="font-bold">foster mutual learning and knowledge sharing among restoration practitioners</span> by systematically disseminating good practices resulting from restoration initiatives. This will prevent them from repeating mistakes and will encourage the replication and adaptation of good practices in different contexts with similar goals, enhancing their capacity to undertake and scale up effective restoration efforts across all sectors, ecosystems, and regions.</p>

                            <h2 class="font-akrobat uppercase text-lg font-bold mt-4 text-ferm-blue-dark-800">Using the FERM Common Search Engine</h2>
                            <p>To facilitate access to good practices on ecosystem restoration, the common search engine brings together good practices documented from four collaborating platforms: the <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://ferm.fao.org/login"
                                >FERM Registry</a>, <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://www.lifegoprofor-gp.eu/"
                                >LIFE GoProFor</a>, <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://panorama.solutions/en/portal/panorama-restoration"
                                >Panorama Solutions</a> and <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://www.wocat.net/en/global-slm-database/"
                                >WOCAT</a>. Users can effectively search, filter, and access an extensive array of good restoration practices according to their specific needs. There are two search modalities available:
                            </p>

                            <ul class="list-inside list-disc pl-4 mt-2">
                                <li>Open browser search: Users can type in keywords to find relevant good practices.</li>
                                <li>Refined filters: Users can filter practices based on degradation drivers addressed by the practice, ecosystem, region, source, and language.</li>
                            </ul>

                            <h2 class="font-akrobat uppercase text-lg font-bold mt-4 text-ferm-blue-dark-800">What is a good practice for ecosystem restoration? </h2>
                            <p>A good practice for ecosystem restoration is an <span class="font-bold">evidence-based approach, technique or technology</span> that contributes to achieving one or more objectives of a restoration initiative, maximizing benefits for nature and people across different contexts. <span class="font-bold">It is usually a component of a restoration initiative that has been applied, tested and replicated in different contexts and therefore, can be easily transferred and/or adapted to other initiatives with similar goals.</span>If a practice has been tested solely in a specific context, it is considered a promising practice, then results need to be proven outside the current situation for replicability and adaptability to different contexts.</p>

                            <h2 class="font-akrobat uppercase text-lg font-bold mt-4 text-ferm-blue-dark-800">How can restoration practices be shared through the FERM common search engine?</h2>
                            <p>Restoration practitioners can document their practices through any of the following collaborating platforms: the <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://ferm.fao.org/login"
                                >FERM Registry</a>, <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://panorama.solutions/en/portal/panorama-restoration"
                                >Panorama Solutions</a> and <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://www.wocat.net/en/global-slm-database/"
                                >WOCAT</a>. By doing so, you can contribute to our collective effort to inspire others with your valuable experiences.
                            </p>
                            <p class="mt-2">
                                For more information on how to submit good practices through the <span class="font-bold">FERM Registry</span>, please follow this <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://docs.google.com/document/d/17p410EysJ1j7ZE427z1yyYJ50xrLbKe7/edit"
                                >link</a>.
                            </p>
                            <p class="mt-2">
                                For more information on how to submit good practices through <span class="font-bold">Panorama Solutions</span>, please follow this <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://panorama.solutions/en/solution/add"
                                >link</a>.
                            </p>
                            <p class="mt-2">
                                For more information on how to submit good practices through <span class="font-bold">WOCAT</span>, please follow this <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://qcat.wocat.net/en/wocat/add/"
                                >link</a>.
                            </p>

                            <h2 class="font-akrobat uppercase text-lg font-bold mt-4 text-ferm-blue-dark-800">Providing feedback</h2>
                            <p>We continuously strive to improve our common search engine and make it more user-friendly. If you have any feedback or suggestions regarding your experience while consulting good practices through the FERM common search engine, please <a
                                    class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-600"
                                    target="_blank"
                                    href="https://forms.office.com/e/uhAfteu8ZV"
                                >HERE</a> to provide your valuable input.</p>

                            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    @click="aboutOpen = false"
                                >Close</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>



    <header class="inset-x-0 top-0">
        <div class="overflow-hidden bg-none relative">
            <img
                src="/seashore.jpg"
                class="w-full h-full object-cover absolute"
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
                    <div class="absolute top-3 right-3 flex flex-col sm:flex-row gap-x-6">
                        <button
                            v-if="whatToSearch === 'goodPractices'"
                            @click="aboutOpen = true"
                            class="font-bold uppercase text-lg_ tracking-wide text-white/90 text-shadow-sm shadow-black"
                        >{{ t('publicSearch.about.button') }}</button>
                        <LanguageSwitcher />
                    </div>
                </div>
                <div class="relative w-full text-center font-akrobat font-bold text-gray-50 text-3xl md:text-4xl lg:text-5xl uppercase shadow-black text-shadow-sm mb-6 sm:mb-8">
                    {{ t('fermRegistryLong1') }}
                    <br>
                    {{ t('fermRegistryLong2') }}

                </div>
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
                                        v-model:language="language"
                                        :labelTranslations="labelTranslations"
                                    />
                                    <SidebarInitiatives
                                        v-else
                                        :query="queryInitiatives"
                                        v-model:searchTerms="searchTermsInitiatives"
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
                    v-model:language="language"
                    :labelTranslations="labelTranslations"
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
                                            @click="router.push({ name: 'searchInitiatives' })"
                                            :class="['relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 border-t border-l border-b capitalize-first-letter', whatToSearch === 'initiatives' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-50']"
                                        >{{ t('common.initiatives') }}</button>
                                        <button
                                            @click="router.push({ name: 'searchGoodPractices' })"
                                            type="button"
                                            :class="['relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 border-t border-r border-b capitalize-first-letter', whatToSearch === 'goodPractices' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-50']"
                                        >{{ t('common.goodPractices') }}</button>
                                    </span>
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
                            :language="language"
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

.capitalize-first-letter {
    display: block;
}

.capitalize-first-letter::first-letter {
    text-transform: capitalize
}
</style>
