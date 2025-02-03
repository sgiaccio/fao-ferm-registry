<script setup lang="ts">
import { onMounted } from 'vue';

import {
    BuildingLibraryIcon,
    GlobeEuropeAfricaIcon,
} from '@heroicons/vue/24/outline'

import { MapPinIcon, GlobeAltIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/vue/24/solid'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import WavyDivider from '@/views/WavyDivider.vue';
import Footer from '@/views/Footer.vue'

import { useI18n } from 'vue-i18n';


const { t } = useI18n();

const points = [
    {
        latitude: 48.0196,
        longitude: 66.9237
    },
    {
        latitude: -0.7893,
        longitude: 113.9213
    },
    {
        latitude: 9.907,
        longitude: -84.1051
    },
    {
        latitude: 13.6918,
        longitude: -89.2261
    },
    {
        latitude: 14.6345,
        longitude: -90.517
    },
    {
        latitude: 14.081,
        longitude: -87.1607
    },
    {
        latitude: 12.1015,
        longitude: -86.2268
    },
    {
        latitude: 9.0021,
        longitude: -79.5176
    },
    {
        latitude: 12.3756,
        longitude: -1.5211
    },
    {
        latitude: 13.4849,
        longitude: 2.1343
    },
    {
        latitude: -4.5249,
        longitude: 15.7612
    },
    {
        latitude: 0.353,
        longitude: 32.5896
    },
    {
        latitude: -1.9412,
        longitude: 30.0449
    },
    {
        latitude: 44.0165,
        longitude: 21.0059
    },
    {
        latitude: 41.2044,
        longitude: 74.7661
    },
    {
        latitude: 20.5937,
        longitude: 78.9629
    },
    {
        latitude: 23.4241,
        longitude: 53.8478
    },
    {
        latitude: 35.8617,
        longitude: 104.1954
    },
    {
        latitude: -11.6455,
        longitude: 43.3333
    },
    {
        latitude: 13.9094,
        longitude: -60.9789
    },
    {
        latitude: -15.3767,
        longitude: 166.9592
    },
    {
        latitude: -34.6073,
        longitude: -58.961
    },
    {
        latitude: -15.7949,
        longitude: -47.9137
    },
    {
        latitude: -25.1845,
        longitude: -57.4534
    },
    {
        latitude: 6.9022,
        longitude: 79.9088
    },
    {
        latitude: 33.6844,
        longitude: 73.0479
    },
    {
        latitude: 27.7172,
        longitude: 85.324
    },
    {
        latitude: -34.603722,
        longitude: -58.381592
    },
    {
        latitude: -33.44889,
        longitude: -70.669265
    },
    {
        latitude: -19.033349,
        longitude: -65.262738
    },
    {
        latitude: -0.180653,
        longitude: -78.467838
    },
    {
        latitude: -12.046374,
        longitude: -77.042793
    },
    {
        latitude: 14.6928,
        longitude: -17.4467
    },
    {
        latitude: 17.5707,
        longitude: -3.9962
    },
    {
        latitude: -6.163,
        longitude: 35.7516
    },
    {
        latitude: -1.286389,
        longitude: 36.817223
    },
    {
        latitude: 0.3476,
        longitude: 32.5825
    },
    {
        latitude: -1.286389,
        longitude: 36.817223
    },
    {
        latitude: 2.0469,
        longitude: 45.3182
    },
    {
        latitude: 9.03,
        longitude: 38.74
    },
    {
        latitude: -1.9579,
        longitude: 30.1129
    },
    {
        latitude: 12.6392,
        longitude: -8.0029
    },
    {
        latitude: 13.5127,
        longitude: 2.1125
    },
    {
        latitude: 14.6928,
        longitude: -17.4467
    },
    {
        latitude: 5.6037,
        longitude: -0.187
    },
    {
        latitude: 33.8938,
        longitude: 35.5018
    },
    {
        latitude: 34.0209,
        longitude: -6.8416
    },
    {
        latitude: 36.8065,
        longitude: 10.1815
    },
    {
        latitude: 39.9334,
        longitude: 32.8597
    },
];

const lastFlagships = [
    { name: "Altyn Dala Conservation Initiative", memberStates: "Kazakhstan", iucnBiomes: "Shrublands & shrubby woodlands biome; Savannas and grasslands biome; Deserts and semi-deserts biome; Palustrine wetlands biome (*which covers Peatlands); Rivers and streams biome" },
    { name: "Building with Nature in Indonesia", memberStates: "Indonesia", iucnBiomes: "Intensive land-use systems biome; Shorelines biome; Brackish tidal biome" },
    { name: "Central American Dry Corridor", memberStates: "Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua, Panama", iucnBiomes: "Tropical-subtropical forests biome" },
    { name: "Great Green Wall for Restoration and Peace", memberStates: "Burkina Faso, Niger", iucnBiomes: "Savannas and grasslands biome; Deserts and semi-deserts biome" },
    { name: "Multi-country Mountain Flagship", memberStates: "DRC/Uganda/Rwanda, Kyrgyzstan, Serbia", iucnBiomes: "Tropical-subtropical forests biome; Temperate-boreal forests & woodlands biome; Shrublands & shrubby woodlands biome; Savannas and grasslands biome; Deserts and semi-deserts biome; Intensive land-use systems biome; Rivers and streams biome" },
    { name: "Namami Gange", memberStates: "India", iucnBiomes: "Tropical-subtropical forests biome; Shrublands and shrubby woodlands biome; Intensive land use systems biome; Palustrine wetlands biome (including peatlands); Rivers and streams biome; Lakes biome; Artificial wetlands biome" },
    { name: "Abu Dhabi Marine Restoration", memberStates: "United Arab Emirates", iucnBiomes: "Marine shelf biome; Shorelines biome; Brackish tidal biome" },
    { name: "Shan-Shui Initiative in China", memberStates: "China", iucnBiomes: "Tropical-subtropical forests biome; Temperate-boreal forests & woodlands biome; Shrublands & shrubby woodlands biome; Deserts and semi-deserts biome; Intensive land-use systems biome; Palustrine wetlands biome (*which covers Peatlands); Rivers and streams biome; Lakes biome; Artificial wetlands biome; Anthropogenic marine biome; Shorelines biome; Supralittoral coastal biome; Anthropogenic shorelines biome; Brackish tidal biome" },
    { name: "SIDS Ecosystem Restoration Flagship", memberStates: "Saint Lucia, Comoros, Vanuatu", iucnBiomes: "Rivers and streams biome; Tropical or subtropical forests biome; Shrublands and shrubby woodlands biome; Savannas and grasslands biome; Intensive land use (crop and urban) biome; Marine shelf biome; Shorelines biome; Brackish tidal biome" },
    { name: "Trinational Atlantic Forest Pact", memberStates: "Argentina, Brazil, Paraguay", iucnBiomes: "Tropical-subtropical forests biome; Intensive land-use systems biome; Rivers and streams biome; Shorelines biome; Supralittoral coastal biome; Anthropogenic shorelines biome" },
    { name: "Sri Lanka’s Mangrove Restoration", memberStates: "Sri Lanka", iucnBiomes: "Brackish Tidal Biome" },
    { name: "The Living Indus Initiative", memberStates: "Pakistan", iucnBiomes: "Tropical-subtropical forests; Shrublands & shrubby woodlands; Deserts and semi-deserts; Intensive land-use systems; Rivers and streams biome; Lakes biome; Artificial wetlands biome; Marine shelf biome; Supralittoral coastal biome" },
    { name: "Corridor Restoration in Terai Arc Landscape", memberStates: "Nepal", iucnBiomes: "Tropical-subtropical forests; Savannas and grasslands; Rivers and streams biome" },
    { name: "Accion Andina", memberStates: "Argentina, Chile, Bolivia, Ecuador, Peru", iucnBiomes: "Polar-alpine; Rivers and streams biome" },
    { name: "African Farmers Transforming Food Systems", memberStates: "Senegal, Mali,Tanzania, Kenya, Uganda", iucnBiomes: "Intensive land-use systems" },
    { name: "Regreening Africa", memberStates: "Kenya, Somalia, Ethiopia, Rwanda, Mali, Niger, Senegal, Ghana", iucnBiomes: "Tropical-subtropical forests; Savannas and grasslands biome;  Shrublands & shrubby woodlands; Intensive land-use systems" },
    { name: "Restoring Mediterranean Forests", memberStates: "Lebanon, Morocco, Tunisia, Turkey", iucnBiomes: "Temperate-boreal forests & woodlands; Shrublands & shrubby woodlands; Savannas and grasslands" },
].reverse();

async function initMap() {
    const { Map } = await google.maps.importLibrary('maps');
    const map = new Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 0, lng: 40 },
        zoom: 1,
        disableDefaultUI: true,
        mapId: 'acfd9aecb62ff17c'
    });

    // Add marks from the points array
    points.forEach(point => {
        new google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4.,
                fillColor: '#fff',
                fillOpacity: 0.9,
                strokeColor: '#EEA63A',
                strokeWeight: 2.5
            },
            opacity: 0.9,
            cursor: 'hand',
            map: map,
        });
    });
}

onMounted(initMap);
</script>

<template>
    <div class="bg-white">
        <header class="inset-x-0 top-0">
            <div class="overflow-hidden bg-none relative">
                <img
                    src="/seashore.jpg"
                    class="w-full h-full _bg-[url('/seashore.jpg')] object-cover absolute"
                >
                <wavy-divider class="absolute -left-1 bottom-0" />
                <div class="px-4 sm:px-12 pt-12 md:pb-4 pb-32">
                    <!-- Logos  and Language Links -->
                    <!-- <div class="relative w-full pl-10 flex mb-10"> -->
                    <div class="relative w-full flex items-center justify-between mb-10">
                        <!-- Logos -->
                        <div class="mb-2 sm:mb-5 mt-2 grid grid-flow-col gap-x-6 mx-auto md:mx-0 divide-x divide-gray-300">
                            <div class="-ml-10_ mr-3">
                                <img
                                    src="@/assets/FERM_LOGO_MASTER_colour_white_EN.svg"
                                    alt="FERM logo"
                                    class="h-12 sm:h-16 w-auto scale-125"
                                />
                            </div>
                            <div>
                                <a
                                    href="https://www.decadeonrestoration.org"
                                    target="_blank"
                                >
                                    <img
                                        src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                                        alt="FERM logo"
                                        class="h-12 sm:h-16 w-auto scale-150 ml-10"
                                    />
                                </a>
                            </div>
                        </div>
                        <LanguageSwitcher />
                    </div>
                    <div class="relative w-full text-center font-akrobat font-bold text-gray-50 text-5xl md:text-6xl lg:text-7xl uppercase shadow-black text-shadow-sm">
                        {{ t('fermRegistryLong1') }}
                        <br>
                        {{ t('fermRegistryLong2') }}
                    </div>
                    <div class="relative text-white mt-16 max-w-sm md:max-w-2xl mx-auto grid grid-rows-3 gap-y-4 md:gap-y-8 md:grid-cols-2 md:gap-x-10">
                        <div class="bg-ferm-green-light/70 rounded-lg p-4 md:py-5 text-left transition-colors hover:bg-ferm-green-light shadow backdrop-blur order-1 md:order-none">
                            <router-link :to="{ name: 'initiatives' }">
                                <div class="flex flex-row gap-x-4 h-full">
                                    <div class="mt-0.5">
                                        <GlobeAltIcon class="w-12 h-12" />
                                    </div>
                                    <div class="flex flex-col md:place-content-between gap-y-2 md:gap-y-3">
                                        <div class="text-xl font-bold uppercase md:tracking-wide">
                                            <!-- Register -->
                                            {{ t('home.register') }}
                                        </div>
                                        <div class="text-sm md:text-base">
                                            {{ t('home.registerDescription') }}
                                            <!-- Your restoration initiative and good practices -->
                                        </div>
                                    </div>
                                </div>
                            </router-link>
                        </div>
                        <a
                            href="https://data.apps.fao.org/ferm/"
                            target="_blank"
                            class="bg-ferm-blue-dark/80 rounded-lg p-4 md:py-5 text-left transition-colors hover:bg-ferm-blue-light shadow backdrop-blur order-2 md:order-none"
                        >
                            <div class="flex flex-row gap-x-4 h-full">
                                <div>
                                    <MapPinIcon class="w-12 h-12" />
                                </div>
                                <div class="flex flex-col md:place-content-between gap-y-2 md:gap-y-3">
                                    <div class="text-xl font-semibold uppercase md:tracking-wide">
                                        {{ t('home.visualize') }}
                                    </div>
                                    <div class="text-sm md:text-base">
                                        {{ t('home.visualizeDescription') }}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <a
                            href="/docs/ferm_user_guide_draft.pdf"
                            target="_blank"
                            class="border-ferm-green-light/70 hover:border-transparent border-4 rounded-lg p-4 md:py-5 text-left transition-colors hover:bg-ferm-green-light/70 shadow backdrop-blur order-4 md:order-none"
                        >
                            <div class="flex flex-row gap-x-4 h-full -m-1">
                                <div>
                                    <BookOpenIcon class="w-12 h-12" />
                                </div>
                                <div class="flex flex-col md:place-content-between gap-y-2 md:gap-y-3">
                                    <div class="text-xl font-semibold uppercase md:tracking-wide">
                                        {{ t('home.userGuide') }}
                                    </div>
                                    <div class="text-sm md:text-base">
                                        {{ t('home.userGuideDescription') }}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <router-link
                            :to="{ name: 'searchInitiatives' }"
                            class="bg-ferm-mustard-dark/95 hover:bg-ferm-mustard-light rounded-lg p-4 md:py-5 text-left transition-colors shadow backdrop-blur order-3 md:order-none"
                        >
                            <div class="flex flex-row gap-x-4 h-full">
                                <div>
                                    <MagnifyingGlassIcon class="w-12 h-12" />
                                </div>
                                <div class="flex flex-col md:place-content-between gap-y-2 md:gap-y-3">
                                    <div class="text-xl font-semibold uppercase md:tracking-wide">
                                        {{ t('home.search') }}
                                    </div>
                                    <div class="text-sm md:text-base">
                                        {{ t('home.searchDescription') }}
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
        </header>
    </div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6 lg:py-8 font-roboto">
        <div class="mx-auto max-w-5xl">

            <div class="px-4 lg:px-0 mt-10 text-lg leading-snug font-akrobat_ font-semibold_ text-center max-w-2xl mx-auto text-gray-700">
                {{ t('home.description') }}
            </div>
            <div class="px-4 sm:px-0 mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                <div class="bg-ferm-blue-light p-4 rounded-lg text-sm font-base flex flex-col shadow">
                    <i18n-t
                        keypath="home.fermRegistryDescription"
                        tag="div"
                    >
                        <template #fermRegistry>
                            <span class="font-semibold">{{ t('fermRegistry') }}</span>
                        </template>
                    </i18n-t>
                    <div class="flex-grow flex h-full justify-end items-end">
                        <BuildingLibraryIcon class="text-white h-10 w-10" />
                    </div>
                </div>

                <div class="bg-ferm-green-light p-4 rounded-lg text-sm font-base flex flex-col shadow">
                    <i18n-t
                        keypath="home.fermPlatformDescription"
                        tag="div"
                    >
                        <template #fermPlatform>
                            <span class="font-semibold">{{ t('fermPlatform') }}</span>
                        </template>
                        <template #handInHand>
                            <span class="whitespace-nowrap">{{ t('home.handInHand') }}</span>
                        </template>
                    </i18n-t>
                    <div class="flex-grow flex h-full justify-end items-end">
                        <GlobeEuropeAfricaIcon class="text-gray-100 h-10 w-10" />
                    </div>
                </div>


                <div class="p-4 font-akrobat font-semibold text-white col-span-2 rounded-lg text-sm bg-[url('/soil.jpg')] bg-cover bg-center flex lg:h-full justify-end items-end h-48">
                    <i18n-t
                        keypath="home.joinGenerationRestoration"
                        tag="div"
                        class="px-16 aligh-bottom text-center bottom-3 text-lg sm:text-xl brightness-100 z-50 sm:leading-tight text-shadow-sm shadow-black"
                    >
                        <template #generationRestoration>
                            <a
                                href="https://twitter.com/hashtag/GenerationRestoration"
                                class="underline hover:text-yellow-300"
                                target="_blank"
                            >#GenerationRestoration</a>
                        </template>
                    </i18n-t>
                </div>

                <div class="col-span-2 h-72 rounded-lg bg-white border-2_ border-ferm-blue-dark-300 overflow-hidden shadow flex flex-col">
                    <div class="py-4 px-8 font-akrobat font-bold text-xl bg-ferm-blue-light-200">
                        <!-- New Initiatives -->
                        {{ t('home.newInitiatives') }}
                    </div>
                    <div class="overflow-y-auto px-4 py-2">
                        <ul
                            role="list"
                            class="divide-y divide-gray-200 text-sm"
                        >
                            <li
                                v-for="flagship in lastFlagships"
                                :key="flagship.name"
                                class="px-4 py-3 sm:px-4"
                            >
                                <div class="flex flex-col">
                                    <div class="font-bold text-ferm-blue-dark">{{ flagship.name }}</div>
                                    <div><span class="font-semibold text-ferm-blue-dark-900">{{ t('home.countries') }}: </span>{{ flagship.memberStates }}</div>
                                    <div><span class="font-semibold text-ferm-blue-dark-900">{{ t('home.ecosystems') }}: </span>{{ flagship.iucnBiomes }}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="col-span-2 h-72 rounded-lg shadow">
                    <div
                        id="map"
                        class="overflow-hidden rounded-lg"
                    ></div>
                </div>
            </div>
        </div>
    </div>
    <Footer />
</template>