<script setup lang="ts">
import { onMounted } from 'vue';

import {
    BuildingLibraryIcon,
    GlobeEuropeAfricaIcon,
} from '@heroicons/vue/24/outline'

import { ArrowSmallRightIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

import ShittyDivider from '../components/shittyDivider.vue'


const points = [
    { flagship: "Altyn Dala Conservation Initiative", target2030: "5 million ha new protected areas and ecological corridors", restored: "", memberStates: "Kazakhstan", iucnEcosystemsBiomes: "Shrublands & shrubby woodlands biome; Savannas and grasslands biome; Deserts and semi-deserts biome; Palustrine wetlands biome (*which covers Peatlands); Rivers and streams biome", latitude: 48.0196, longitude: 66.9237 },
    { flagship: "Building with Nature in Indonesia - restoring an eroding coastline and inspiring action at scale", target2030: "", restored: "119 ha mangroves restored@ 300 ha of sustainable aquaculture and 3.4 km permeable structures built", memberStates: "Indonesia", iucnEcosystemsBiomes: "Intensive land-use systems biome; Shorelines biome; Brackish tidal biome", latitude: -0.7893, longitude: 113.9213 },
    { flagship: "Central America dry corridor Agro-Forestry Restoration", target2030: "300@000 ha", restored: "", memberStates: "Costa Rica@ El Salvador@ Guatemala@ Honduras@ Nicaragua@ Panama", iucnEcosystemsBiomes: "Tropical-subtropical forests biome", latitude: 12.8654, longitude: -85.2072 },
    { flagship: "GGW for restoration and Peace building", target2030: "100 million ha", restored: "", memberStates: "Burkina Faso@ Djibouti@ Eritrea@ Ethiopia@ Mali@ Mauritania@ Niger@ Senegal@ Sudan@ Chad", iucnEcosystemsBiomes: "Savannas and grasslands biome; Deserts and semi-deserts biome", latitude: 17.6078, longitude: 13.0817 },
    { flagship: "Multi-country flagship on ecosystem restoration in mountain regions", target2030: "Virunga Massif: 8@333 ha", restored: "Virunga Massif: 1@027 ha", memberStates: "DRC/Uganda/Rwanda@ Kyrgyzstan@ Serbia", iucnEcosystemsBiomes: "Tropical-subtropical forests biome; Temperate-boreal forests & woodlands biome; Shrublands & shrubby woodlands biome; Savannas and grasslands biome; Deserts and semi-deserts biome; Intensive land-use systems biome; Rivers and streams biome", latitude: -1.9403, longitude: 29.8739 },
    { flagship: "Multi-country flagship on ecosystem restoration in mountain regions", target2030: "Serbia: two nature parks: 5@000 ha (Stara Planina) and 35@000 ha (Kucaj – Beljanica); 200 ha forests@ between 30 and 40 ha pasture", restored: "200 ha", memberStates: "DRC/Uganda/Rwanda@ Kyrgyz@ Serbia", iucnEcosystemsBiomes: "Tropical-subtropical forests biome; Temperate-boreal forests & woodlands biome; Shrublands & shrubby woodlands biome; Savannas and grasslands biome; Deserts and semi-deserts biome; Intensive land-use systems biome; Rivers and streams biome", latitude: 44.0165, longitude: 21.0059 },
    { flagship: "Multi-country flagship on ecosystem restoration in mountain regions", target2030: "Kyrgyzstan: biodiversity conservation and pasture management: micro-reserve Moldonun-Beli with 11@450 ha and pastures of 2 Pasture Committees – 52@000 ha; Dzheti-Oguz zoological preserve with 30@000 ha and pastures of 2 Pasture Committees – 20@800 ha; Teploklyuchensky zoological preserve 29@000 ha and pastures of 1 Pasture Committees – 22@600 ha. At-Bashyn district of Naryn province are planned to be covered by pasture management@ with a potential area of 1.9 million ha.  Forest management: 34 Forest Management Units (FMUs) around the country. Each unit is expected to restore 400 ha per year. When considering the 34 FMUs@ 13@600 ha are expected to be restored per year@ which amounts to 110@000 ha by 2030", restored: "The following areas have been conserved and restored through biodiversity conservation and pasture management: micro-reserve Baiboosun: 14@000 ha of protected area and 75@500 ha of pasture since 2019; zoological reserve Jargylchak: 23@098 ha of protected area and 101@891 ha of pasture. In addition@ another 26@258 ha of pasture have been restored by applying GRI.    Forest management: Through 8 forest management units (FMUs)@ 126@000 ha of forest have already been restored. Another 2@500 ha of forest has been planted and an improved management of the forest was achieved through community engagement which in turn has led to 800@000 ha of forest ecosystems that are now under sustainable management", memberStates: "DRC/Uganda/Rwanda@ Kyrgyz@ Serbia", iucnEcosystemsBiomes: "Tropical-subtropical forests biome; Temperate-boreal forests & woodlands biome; Shrublands & shrubby woodlands biome; Savannas and grasslands biome; Deserts and semi-deserts biome; Intensive land-use systems biome; Rivers and streams biome", latitude: 41.2044, longitude: 74.7661 },
    { flagship: "Namami Gange", target2030: "134@000 ha reforestation", restored: "30@000 ha reforestation and 370 km river banks restored", memberStates: "India", iucnEcosystemsBiomes: "Tropical-subtropical forests biome; Shrublands and shrubby woodlands biome; Intensive land use systems biome; Palustrine wetlands biome (including peatlands); Rivers and streams biome; Lakes biome; Artificial wetlands biome", latitude: 20.5937, longitude: 78.9629 },
    { flagship: "Restoration of Coastal and Marine Ecosystems of Abu Dhabi@ United Arab Emirates", target2030: "Another 4@500 ha of of coastal areas", restored: "7@500 ha of of coastal areas", memberStates: "United Arab Emirates", iucnEcosystemsBiomes: "Marine shelf biome; Shorelines biome; Brackish tidal biome", latitude: 23.4241, longitude: 53.8478 },
    { flagship: "Shan-Shui Initiative in China", target2030: "10 million ha", restored: "2 million ha", memberStates: "China", iucnEcosystemsBiomes: "Tropical-subtropical forests biome; Temperate-boreal forests & woodlands biome; Shrublands & shrubby woodlands biome; Deserts and semi-deserts biome; Intensive land-use systems biome; Palustrine wetlands biome (*which covers Peatlands); Rivers and streams biome; Lakes biome; Artificial wetlands biome; Anthropogenic marine biome; Shorelines biome; Supralittoral coastal biome; Anthropogenic shorelines biome; Brackish tidal biome", latitude: 35.8617, longitude: 104.1954 },
    { flagship: "SIDS Ecosystem Restoration Flagship", target2030: "", restored: "Comoros: 82@000 ha under restoration", memberStates: "Saint Lucia@ Comoros@ Vanuatu", iucnEcosystemsBiomes: "Rivers and streams biome; Tropical or subtropical forests biome; Shrublands and shrubby woodlands biome; Savannas and grasslands biome; Intensive land use (crop and urban) biome; Marine shelf biome; Shorelines biome; Brackish tidal biome", latitude: -11.6455, longitude: 43.3333 },
    { flagship: "SIDS Ecosystem Restoration Flagship", target2030: "", restored: "Saint Lucia: 21@000 ha under restoration", memberStates: "Saint Lucia@ Comoros@ Vanuatu", iucnEcosystemsBiomes: "Rivers and streams biome; Tropical or subtropical forests biome; Shrublands and shrubby woodlands biome; Savannas and grasslands biome; Intensive land use (crop and urban) biome; Marine shelf biome; Shorelines biome; Brackish tidal biome", latitude: 13.9094, longitude: -60.9789 },
    { flagship: "SIDS Ecosystem Restoration Flagship", target2030: "", restored: "Vanuatu: 10 ha under restoration", memberStates: "Saint Lucia@ Comoros@ Vanuatu", iucnEcosystemsBiomes: "Rivers and streams biome; Tropical or subtropical forests biome; Shrublands and shrubby woodlands biome; Savannas and grasslands biome; Intensive land use (crop and urban) biome; Marine shelf biome; Shorelines biome; Brackish tidal biome", latitude: -15.3767, longitude: 166.9592 },
    { flagship: "Trinational Atlantic Forest Pact", target2030: "1 million ha", restored: "700@000 ha", memberStates: "Argentina@ Brazil@ Paraguay", iucnEcosystemsBiomes: "Tropical-subtropical forests biome; Intensive land-use systems biome; Rivers and streams biome; Shorelines biome; Supralittoral coastal biome; Anthropogenic shorelines biome", latitude: -23.4425, longitude: -58.4438 },
];

const lastFlagships = [
    { name: "Altyn Dala Conservation Initiative", memberStates: "Kazakhstan", ecosystems: "Grasslands, Shrublands and Savannahs" },
    { name: "Building with Nature in Indonesia", memberStates: "Indonesia", ecosystems: "Forests; Coasts; Human settlements" },
    { name: "Central American Dry Corridor", memberStates: "Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua, Panama", ecosystems: "Farmlands; Forests" },
    { name: "Great Green Wall for Restoration and Peace", memberStates: "Burkina Faso, Niger", ecosystems: "Grasslands, Shrublands and Savannahs; Farmlands" },
    { name: "Multi-country Mountain Flagship", memberStates: "DRC/Uganda/Rwanda, Kyrgyzstan, Serbia", ecosystems: "Mountains; Forests" },
    { name: "Namami Gange", memberStates: "India", ecosystems: "Freshwaters; Peatlands" },
    { name: "Abu Dhabi Marine Restoration", memberStates: "United Arab Emirates", ecosystems: "Oceans and coasts" },
    { name: "Shan-Shui Initiative in China", memberStates: "China", ecosystems: "Forests; Peatlands; Freshwaters; Farmlands; Mountains; Coasts; Grasslands, Shrublands and Savannahs" },
    { name: "SIDS Ecosystem Restoration Flagship", memberStates: "Saint Lucia, Comoros, Vanuatu", ecosystems: "Oceans and coasts; Freshwaters" },
    { name: "Trinational Atlantic Forest Pact", memberStates: "Argentina, Brazil, Paraguay", ecosystems: "Forests; Freshwaters; Coasts" }
]

async function initMap() {
    const { Map } = await google.maps.importLibrary('maps');
    const map = new Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 0, lng: 40 },
        zoom: 1,
        disableDefaultUI: true,
        mapId: 'acfd9aecb62ff17c'
        // styles: [
        //     {
        //         featureType: "administrative",
        //         "elementType": "labels",
        //         "stylers": [
        //             {
        //                 "visibility": "off"
        //             }
        //         ]
        //     },
        //     // {
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#f5f5f5",
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "elementType": "labels",
        //     //     "stylers": [
        //     //         {
        //     //             "visibility": "off"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "elementType": "labels.icon",
        //     //     "stylers": [
        //     //         {
        //     //             "visibility": "off"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#616161"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "elementType": "labels.text.stroke",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#f5f5f5"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "administrative.land_parcel",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#bdbdbd"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "administrative.neighborhood",
        //     //     "stylers": [
        //     //         {
        //     //             "visibility": "off"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "poi",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#eeeeee"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "poi",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#757575"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "poi.park",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#e5e5e5"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "poi.park",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#9e9e9e"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "road",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#ffffff"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "road.arterial",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#757575"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "road.highway",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#dadada"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "road.highway",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#616161"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "road.local",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#9e9e9e"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "transit.line",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#e5e5e5"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "transit.station",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#eeeeee"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "water",
        //     //     "elementType": "geometry",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#c9c9c9"
        //     //         }
        //     //     ]
        //     // },
        //     // {
        //     //     "featureType": "water",
        //     //     "elementType": "labels.text.fill",
        //     //     "stylers": [
        //     //         {
        //     //             "color": "#9e9e9e"
        //     //         }
        //     //     ]
        //     // }
        // ]
    });

    // Add marks from the points array
    points.forEach(point => {
        new google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                // fillColor: '#fff',
                // fillOpacity: 0.5,
                strokeColor: '#0A97D9',
                // strokeWeight: 1,
            },
            opacity: 0.9,
            cursor: 'hand',
            map: map,
        });
    });
}

onMounted(async () => {
    if (!window.google) {
        (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({ key: "AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M", v: "weekly" });
    }

    initMap();
});
</script>

<template>
    <div class="bg-white">
        <header class="inset-x-0 top-0">
            <div class="overflow-hidden bg-none relative">
                <img src="/seashore.jpg"
                     class="w-full h-full _bg-[url('/seashore.jpg')] object-cover absolute brightness-50">
                <shitty-divider class="absolute -left-1 bottom-0" />
                <div class="px-4 sm:px-12 pt-12 pb-28">
                    <!-- Logos -->
                    <div class="relative w-full pl-10 flex mb-10">
                        <div class="mb-2 sm:mb-5 mt-2 grid grid-flow-col gap-x-6 mx-auto md:mx-0 divide-x divide-gray-300">
                            <div class="-ml-10 mr-3">
                                <img src="@/assets/FERM_LOGO_MASTER_colour_white_EN.svg"
                                     alt="FERM logo"
                                     class="h-16 w-auto scale-125" />
                            </div>
                            <div>
                                <img src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                                     alt="FERM logo"
                                     class="h-16 w-auto scale-150 ml-10" />
                            </div>
                        </div>
                    </div>
                    <div class="relative w-full text-center font-akrobat font-bold text-gray-50 text-5xl md:text-6xl lg:text-7xl uppercase shadow-black text-shadow-sm">Framework for Ecosystem<br>Restoration Monitoring</div>

                    <div class="relative text-white mt-20 max-w-sm md:max-w-3xl mx-auto grid grid-rows-3 gap-y-4 md:gap-y-0 md:grid-rows-none md:grid-cols-3 md:gap-x-5">
                        <router-link :to="{ name: 'initiatives' }"
                                     class="bg-ferm-green-light/70 border-ferm-green-light_ border-4_ rounded-lg px-4 py-4 text-left transition-colors hover:bg-ferm-green-light shadow backdrop-blur">
                            <div class="flex flex-row gap-x-2">
                                <div class="mt-0.5">
                                    <ArrowSmallRightIcon class="w-6 h-6" />
                                </div>
                                <div>
                                    <div class="text-xl font-bold uppercase">Register</div>
                                    <div class="text-sm mt-3">Your restoration initiative and good practices</div>
                                </div>
                            </div>
                        </router-link>

                        <a href="https://data.apps.fao.org/ferm/"
                           target="_blank"
                           class="bg-ferm-blue-dark/80 border-ferm-blue-light_ border-4_ rounded-lg px-4 py-4 text-left transition-colors hover:bg-ferm-blue-light shadow backdrop-blur">
                            <div class="flex flex-row gap-x-2">
                                <div>
                                    <GlobeAltIcon class="w-6 h-6" />
                                </div>
                                <div>
                                    <div class="text-xl font-semibold uppercase">Visualize</div>
                                    <div class="text-sm mt-3">The latest geospatial data on restoration</div>
                                </div>
                            </div>
                        </a>

                        <button class="bg-ferm-mustard-dark/70 border-ferm-mustard-dark_ border-4_ rounded-lg px-4 py-4 text-left transition-colors shadow cursor-default backdrop-blur">
                            <div class="flex flex-row gap-x-2">
                                <div>
                                    <MagnifyingGlassIcon class="w-6 h-6" />
                                </div>
                                <div>
                                    <div class="text-xl font-semibold uppercase">Search</div>
                                    <div class="text-sm mt-3">For good practices on ecosystem restoration (coming soon)</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    </div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6 lg:py-8 font-roboto">
        <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
        <div class="mx-auto max-w-5xl">

            <div class="px-4 lg:px-0 mt-10 text-lg leading-snug font-akrobat font-semibold text-center max-w-2xl mx-auto text-gray-700 dark:text-gray-400 tracking-wide">The FERM consists of a geospatial platform and a registry of restoration initiatives. It is the official monitoring platform for tracking global progress and disseminating good practices for the UN Decade on Ecosystem Restoration. It also supports countries in reporting areas under restoration for the Kunming-Montreal Global Biodiversity Framework Target 2.</div>

            <div class="px-4 sm:px-0 mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">

                <div class="bg-ferm-blue-light p-4 rounded-lg text-sm font-base flex flex-col shadow">
                    <div>
                        The <span class="font-semibold">FERM Registry</span> provides a harmodized data collection mechanism to aggregate data from restoration platforms.
                    </div>
                    <div class="flex-grow flex h-full justify-end items-end">
                        <BuildingLibraryIcon class="text-white h-10 w-10" />
                    </div>
                </div>

                <div class="bg-ferm-green-light p-4 rounded-lg text-sm font-base flex flex-col shadow">
                    <div>
                        The <span class="font-semibold">FERM Platform</span> is built on FAO's corporate <span class="whitespace-nowrap">Hand-In-Hand</span> geospatial architecture and provides accessible and transparent information for restoration practitioners.
                    </div>
                    <div class="flex-grow flex h-full justify-end items-end">
                        <GlobeEuropeAfricaIcon class="text-gray-100 h-10 w-10" />
                    </div>
                </div>


                <div class="p-4 font-akrobat font-semibold text-white col-span-2 rounded-lg text-sm bg-[url('/soil.jpg')] bg-cover bg-center flex lg:h-full justify-end items-end h-48 shadow">
                    <div class="px-16 aligh-bottom text-center bottom-3 text-lg sm:text-xl brightness-100 z-50 sm:leading-tight text-shadow-sm shadow-black">
                        Join #GenerationRestoration and share your restoration initiative and good practices with the world.
                    </div>
                </div>

                <div class="col-span-2 h-72 rounded-lg bg-white border-2 border-ferm-blue-dark-300 overflow-hidden shadow flex flex-col">
                    <div class="py-4 px-8 font-akrobat font-bold text-xl bg-ferm-blue-light-50">New Initiatives</div>
                    <div class="overflow-y-auto px-4 py-2">
                        <ul role="list"
                            class="divide-y divide-gray-200 text-sm">
                            <li v-for="flagship in lastFlagships"
                                :key="flagship.name"
                                class="px-4 py-3 sm:px-4">
                                <div class="flex flex-col">
                                    <div class="font-bold text-ferm-blue-dark">{{ flagship.name }}</div>
                                    <div><span class="font-semibold text-ferm-blue-dark-900">Countries: </span>{{ flagship.memberStates }}</div>
                                    <div><span class="font-semibold text-ferm-blue-dark-900">Ecosystems: </span>{{ flagship.ecosystems }}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="col-span-2 h-72 rounded-lg shadow">
                    <div id="map"
                         class="overflow-hidden rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
</template>
