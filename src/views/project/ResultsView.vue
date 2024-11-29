<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted, computed } from 'vue';

import { useRoute } from 'vue-router'

import { ArrowLeftIcon } from '@heroicons/vue/24/outline';

import { getPublicProjectThumbnail } from '@/firebase/functions';
import { getGaulLevel0 } from '@/firebase/firestore';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import ResultPanel from '../search/project/ResultPanel.vue';
import ActivitiesPanel from '../search/project/ActivitiesPanel.vue';
import SdgPanel from '../search/project/SdgPanel.vue';
import AreasCharts from '../search/project/AreasCharts.vue';
import AlertModal from '@/views/AlertModal.vue';
import IndicatorsPanel from '../search/project/IndicatorsPanel.vue';
import MapPanel from '../search/project/MapPanel.vue';
import EcosystemsPanel from '../search/project/EcosystemsPanel.vue';
import ChartsSwiper from '@/views/charts/ChartsSwiper.vue';

import CommittedAreaChart from '@/views/charts/CommittedAreaChart.vue';

import { useUserPrefsStore } from '@/stores/userPreferences';

import {
    getRecursiveMenuItem,
    getLastTargetArea,
    getPolygonsArea,
    areaByGefIndicatorGroup as areaByGefIndicatorGroupUtil,
    formatNumber
} from '@/lib/util';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const userPrefsStore = useUserPrefsStore();

const route = useRoute();
const { menus } = useMenusStore();
const projectStore = useProjectStore();

const countries = ref<{ iso2: string, label: string }[] | null>(null);

const project = ref<any>(null);
const projectAreas = ref<any[]>([]);

const areaByGefIndicatorGroup = ref<any[]>([]);

const mapPanel = ref<any>(null);


const indicatorGroupNames = [
    { value: 1, label: '1. Terrestrial protected areas created or under improved management for conservation and sustainable use' },
    { value: 2, label: '2. Marine protected areas created or under improved management for conservation and sustainable use' },
    { value: 3, label: '3. Area of land and ecosystems under restoration' },
    { value: 4, label: '4. Area of landscapes under improved practices' },
    { value: 5, label: '5. Area of marine habitat under improved practices to benefit biodiversity' },
    { value: '2LDCF', label: '2 (LDCF). Area of land managed for climate resilience' }
];

onBeforeMount(async () => {
    project.value = projectStore.project;
    projectAreas.value = projectStore.projectAreas;

    countries.value = await getGaulLevel0();

    if (project.value.reportingLine === 'GEF') {
        areaByGefIndicatorGroup.value = areaByGefIndicatorGroupUtil(projectAreas.value);
    }
});

onUnmounted(() => {
    // Revoke all object URLs
    uploadedFiles.value.forEach(file => {
        if (file.imageUrl) {
            URL.revokeObjectURL(file.imageUrl);
        }
    });

    if (thumbnail.value) {
        URL.revokeObjectURL(thumbnail.value);
    }
});

const uploadedFiles = ref<{ name: string, path: string, imageUrl?: string }[]>([]);

async function getThumbnail() {
    try {
        const blob = await getPublicProjectThumbnail(route.params.id as string);
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error displaying the thumbnail:', error);
    }
}

const thumbnail = ref<string | null>(null);

const showDisclaimer = ref(!userPrefsStore.userPrefs.previewModalSeen);

function hideDisclaimer() {
    showDisclaimer.value = false;
    userPrefsStore.setPreviewModalSeen();
}


onMounted(async () => {
    const imageUrl = await getThumbnail();
    if (!imageUrl) {
        console.error('Failed to load thumbnail:', imageUrl);
    } else {
        thumbnail.value = imageUrl;
    }
});

const countriesObj = computed(() => {
    if (!countries.value || !project?.value?.project?.countries) return '';
    const projectCountries = (project?.value?.project?.countries || []).map((iso2: string) => {
        return countries.value!.find(c => c.iso2 === iso2)
    });
    return projectCountries.map(c => ({ name: c?.label, iso2: c?.iso2 })).sort((a, b) => a.name.localeCompare(b.name));
});


const timeframe = computed(() => {
    const p = project.value.project;

    if (!p.startingYear && !p.endingYear) return 'No timeframe specified';
    if (p.startingYear && p.endingYear) return `${p.startingYear} – ${p.endingYear}`;
    if (p.startingYear) return `from ${p.startingYear}`;
    if (p.endingYear) return `until ${p.endingYear}`;
});

function zoomToArea(uuid: string) {
    return;
    // // Look for the feature with the given uuid
    // let foundFeature = null;
    // map.data.forEach(feature => {
    //     if (feature.getProperty('uuid') === uuid) {
    //         foundFeature = feature;
    //     }
    // });

    // // zoom to the feature
    // if (foundFeature) {
    //     zoomAndHighlightFeature(foundFeature);
    // } else {
    //     // zoom to the whole layer
    //     const layerBounds = new google.maps.LatLngBounds();
    //     map.data.forEach(feature => {
    //         feature.getGeometry().forEachLatLng(latlng => {
    //             layerBounds.extend(latlng);
    //         });
    //     });
    //     map.fitBounds(layerBounds);
    //     map.setCenter(layerBounds.getCenter());
    // }
}

const showFullDescription = ref(false);

const selectedArea = ref(null);
function areaClicked(area: any) {
    // if there's only one area, don't do anything because the information would be the same
    if (projectAreas.value.length === 1) return;

    selectedArea.value = area;
}

function deselectArea() {
    selectedArea.value = null;
    mapPanel.value?.resetMap();
}

const targetArea = computed(() => {
    if (project.value.reportingLine === 'GEF') {
        return getLastTargetArea(project.value);
    } else {
        return project.value.project.targetArea;
    }
});

const areaUnderRestoration = computed(() => {
    if (project.value.reportingLine === 'GEF') {
        return getPolygonsArea(projectAreas.value);
    } else {
        return project.value.project.areaUnderRestoration;
    }
});

</script>

<template>
    <AlertModal
        title="Description"
        :onClose="() => showFullDescription = false"
        :open="showFullDescription"
        buttonText="Close"
    >
        <p class="whitespace-pre-wrap text-sm text-gray-800 text-left font-serif_">{{ project?.project.description }}</p>
    </AlertModal>

    <AlertModal
        :onClose="hideDisclaimer"
        :open="showDisclaimer"
        buttonText="Close"
    >
        <div class="text-left text-sm space-y-3">
            <p>
                The preview tab provides a comprehensive summary of the initiative's key features, including basic information about the initiative, the biomes and ecosystems involved, the areas committed to and currently under restoration, the restoration activities undertaken, progress on key indicators, and a selection of spatial datasets useful for monitoring restoration progress, all described in more detail in the <a
                    href="/docs/ferm_user_guide_draft.pdf"
                    target="_blank"
                    class="underline text-blue-700"
                >FERM guidance</a>.
            </p>
            <p>
                Users can scroll down to review the initiative's details and explore interactive charts activated by clicking on individual areas highlighted by the yellow circles.
            </p>
            <p>
                This section also offers a preview of the content that will be visible in the search engine once the initiative is published.
            </p>
        </div>
    </AlertModal>

    <div class="h-full bg-slate-100 rounded-lg overflow-hidden">
        <div class="flex flex-col md:flex-row h-full">
            <div
                id="projectInfo"
                class="h-full w-full md:w-[400px] xl:w-[500px] pr-3 text-gray-800 overflow-auto"
            >
                <div
                    v-if="project"
                    class="relative"
                >
                    <transition name="appear_from_left">
                        <div
                            v-if="selectedArea"
                            class="absolute w-full space-y-4 bg-slate-100 z-50 py-6 pl-4 "
                        >
                            <div class="text-gray-800 text-sm flex w-full items-center">
                                <div class="flex-grow">
                                    <h1 class="text-2xl font-akrobat font-semibold">{{ selectedArea.siteName || 'Area' }}</h1>
                                </div>
                                <button @click="deselectArea">
                                    <div class="rounded-full bg-gray-300 hover:bg-gray-400 p-1">
                                        <ArrowLeftIcon class="h-6 w-6" />
                                    </div>
                                </button>
                            </div>

                            <EcosystemsPanel :areas="[{ dummy: selectedArea }]" />

                            <ActivitiesPanel :areas="[{ dummy: selectedArea }]" />

                            <IndicatorsPanel :areas="[{ dummy: selectedArea }]" />

                            <AreasCharts
                                :areas="[{ dummy: selectedArea }]"
                                @zoomToArea="zoomToArea"
                            />

                            <ChartsSwiper :area="selectedArea" />
                        </div>
                    </transition>
                    <transition name="disappear_to_left">
                        <div
                            v-if="!selectedArea"
                            class="space-y-4 py-6 pl-4"
                        >
                            <div class="text-gray-800 text-sm">
                                <div class="flex flex-row w-full">
                                    <div class="flex-1">
                                        <h1 class="text-2xl font-akrobat font-semibold">{{ project.project.title }}</h1>
                                    </div>
                                    <!-- add GEF logo if GEF project -->
                                    <div
                                        v-if="project.reportingLine === 'GEF'"
                                        class="mt-2"
                                    >
                                        <img
                                            src="/interop_logos/gef.svg"
                                            alt="GEF logo"
                                            class="h-12 w-auto"
                                        />
                                    </div>
                                </div>
                                <div class="mt-1 flex flex-wrap gap-x-3 gap-y-2">
                                    <div
                                        v-for="c in countriesObj"
                                        :key="c.iso2"
                                        class="flex items-center"
                                    >
                                        <img
                                            :src="`/flags/iso2/${c.iso2.toLowerCase()}.svg`"
                                            :alt="`${c.name} flag`"
                                            class="h-6 w-6 flex-shrink-0 rounded-full"
                                        />
                                        <span class="ml-2">{{ c.name }}</span>
                                    </div>


                                </div>
                            </div>

                            <div
                                v-if="thumbnail"
                                class="shadow rounded-lg overflow-hidden aspect-[162/100]"
                            >
                                <img
                                    v-if="project.project.thumbnailUrl"
                                    :src="thumbnail"
                                    alt="Project thumbnail"
                                    class="object-cover aspect-[162/100]"
                                />
                            </div>
                            <CommittedAreaChart
                                :areaUnderRestoration="areaUnderRestoration"
                                :targetArea="targetArea"
                                :units="project.project.areaUnits"
                            />
                            <div
                                v-if="project.reportingLine === 'GEF'"
                                class="gap-x-5 lg:gap-x-0 rounded-md p-2 h-full bg-[#007F5F] text-white"
                            >
                                <div class="font-bold">GEF Core Indicators</div>
                                <div
                                    v-for="group in areaByGefIndicatorGroup"
                                    :key="group[0]"
                                    class="flex mt-2"
                                >
                                    <div class="flex flex-row gap-4">
                                        <div class="flex-grow">
                                            {{ indicatorGroupNames.find(i => '' + i.value === '' + group[0])?.label }}
                                        </div>
                                        <div>
                                            <span class="font-bold text-xl mr-1">{{ group[1] ? formatNumber(group[1]) : 'n/a' }}</span>
                                            <span class="text-xl">{{ project.project.areaUnits || '' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ResultPanel>
                                <div class="border-gray-100">
                                    <dl class="divide-y divide-gray-100">
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Description</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                <template v-if="project.project.description">
                                                    <template v-if="project.project.description.length > 250">
                                                        <p>{{ project.project.description.substring(0, 250) }}...</p>
                                                        <button
                                                            @click="showFullDescription = !showFullDescription"
                                                            class="text-blue-700 underline"
                                                        >Show more</button>
                                                    </template>

                                                    <template v-else>
                                                        <p>{{ project.project.description }}</p>
                                                    </template>
                                                </template>
                                                <template v-else>
                                                    <p class="italic text-gray-500">n/a</p>
                                                </template>
                                            </dd>
                                        </div>
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Timeframe</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ timeframe }}</dd>
                                        </div>
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Restoration status</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                <template v-if="project.reportingLine !== 'GEF'">
                                                    <template v-if="project.project.restorationStatus">
                                                        {{ getRecursiveMenuItem(menus.restorationStatuses, project.project.restorationStatus)?.label }}
                                                    </template>
                                                    <span
                                                        v-else
                                                        class="italic text-gray-500"
                                                    >n/a</span>
                                                </template>
                                                <template v-else>
                                                    <template v-if="project.project.targetAreaEvaluationPhase">
                                                        Post-completion
                                                    </template>
                                                    <template v-else-if="project.project.targetAreaReviewPhase">
                                                        In progress
                                                    </template>
                                                    <template v-else-if="project.project.targetAreaDesignPhase">
                                                        In preparation
                                                    </template>
                                                    <span
                                                        v-else
                                                        class="italic text-gray-500"
                                                    >n/a</span>
                                                </template>
                                            </dd>
                                        </div>
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Restoration types</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                <template v-if="project.project.restorationTypes?.length > 0">
                                                    {{ project.project.restorationTypes.map(type => getRecursiveMenuItem(menus.restorationTypes, type)?.label).join(', ') }}
                                                </template>
                                                <span
                                                    v-else
                                                    class="italic text-gray-500"
                                                >n/a</span>
                                            </dd>
                                        </div>
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Tenure statuses</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                <template v-if="project.project.tenureStatuses?.length > 0">
                                                    {{ project.project.tenureStatuses.map(status => getRecursiveMenuItem(menus.tenureStatuses, status)?.label).join(', ') }}
                                                </template>
                                                <span
                                                    v-else
                                                    class="italic text-gray-500"
                                                >n/a</span>
                                            </dd>
                                        </div>
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Website</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 hover:text-gray-900">
                                                <a
                                                    v-if="project.project.website"
                                                    :href="project.project.website.startsWith('http') ? project.project.website : 'http://' + project.project.website"
                                                    target="_blank"
                                                    class="underline"
                                                >{{ project.project.website }}</a>
                                                <span
                                                    v-else
                                                    class="italic text-gray-500"
                                                >n/a</span>
                                            </dd>
                                        </div>
                                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt class="text-sm font-medium leading-6 text-gray-900">Keywords</dt>
                                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                <template v-if="project.project.keywords?.length > 0">
                                                    {{ project.project.keywords.join(', ') }}
                                                </template>
                                                <span
                                                    v-else
                                                    class="italic text-gray-500"
                                                >n/a</span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </ResultPanel>

                            <EcosystemsPanel :areas="projectAreas" />
                            <ActivitiesPanel :areas="projectAreas" />
                            <SdgPanel :sdgs="project.contributionToSdg" />
                            <IndicatorsPanel :areas="projectAreas" />
                            <AreasCharts
                                :areas="projectAreas"
                                @zoomToArea="zoomToArea"
                            />

                            <ChartsSwiper
                                v-if="projectAreas.length === 1 && Object.values(projectAreas[0])[0].uuid"
                                :area="Object.values(projectAreas[0])[0]"
                            />
                        </div>
                    </transition>
                </div>
            </div>
            <div class="flex-grow bg-slate-300 relative">
                <MapPanel
                    ref="mapPanel"
                    :projectId="route.params.id as string"
                    :public="false"
                    @area-clicked="areaClicked"
                    class="rounded-none"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
#projectInfo {
    scrollbar-color: #bbb transparent;
    /* scrollbar-width: thin; */
}

.gm-style iframe+div {
    border: none !important;
}

.appear_from_left-enter-active,
.appear_from_left-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.appear_from_left-enter-from,
.appear_from_left-leave-to {
    transform: translateX(100%);
}

.appear_from_left-enter-to,
.appear_from_left-leave-from {
    transform: translateX(0);
}

.disappear_to_left-enter-active,
.disappear_to_left-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.disappear_to_left-enter-from,
.disappear_to_left-leave-to {
    transform: translateX(-100%);
}

.disappear_to_left-enter-to,
.disappear_to_left-leave-from {
    transform: translateX(0);
}
</style>
