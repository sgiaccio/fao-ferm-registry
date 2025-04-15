<script lang="ts" setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';

import { useI18n } from 'vue-i18n';

import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import BingMaps from 'ol/source/BingMaps.js';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Style, Fill, Stroke, Circle } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import 'ol/ol.css';

import { toast } from 'vue3-toastify'

import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TextInput from './TextInput.vue';

import AreaEcosystemsView from '@/views/project/AreaEcosystemsView.vue';

import { CalculatorIcon } from '@heroicons/vue/20/solid';
import NumberInput from '@/components/inputs/base/NumberInput.vue';

import { getMenuSelectedLabel } from '@/components/project/menus';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';


const props = withDefaults(defineProps<{
    modelValue: {
        siteName: string,
        uuid: string,
        area: number,
        activities: number[],
        ecosystems: string[],
    }
    edit?: boolean
    index: number,
    nAreas: number
}>(), {
    edit: true
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const uploadStatus = ref('idle');

const authStore = useAuthStore();
const projectStore = useProjectStore();
const menus = useMenusStore().menus;

const mapRoot = ref(null);

const style = new Style({
    fill: new Fill({
        color: 'rgba(0, 0, 0, 0)' // Transparent fill
    }),
    stroke: new Stroke({
        color: '#ffcc33',
        width: 2
    }),
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: '#ffcc33'
        }),
        stroke: new Stroke({
            color: 'white',
            width: 2
        })
    })
});

const drawStyle = {
    'circle-radius': 5,
    'circle-fill-color': '#ffcc33',
    'circle-stroke-color': 'white',
    'stroke-color': '#ffcc33',
    'stroke-width': 2
};


function getGeoJson() {
    const geoJSON = new GeoJSON({ featureProjection: 'EPSG:3857' });

    // Get the array of polygons and convert them to features
    const polygons = multiPolygon.getPolygons();
    const features = polygons.map(polygon => new Feature(polygon));
    // Write the features to GeoJSON
    return geoJSON.writeFeatures(features);
}

const areaUploaded = computed(() => !!props.modelValue?.uuid);

var multiPolygon = new MultiPolygon([]);
const drawVectorSource = new VectorSource();
const drawInteraction = new Draw({ source: drawVectorSource, type: 'Polygon', style: drawStyle });
const modifyInteraction = new Modify({ source: drawVectorSource, style: drawStyle });
const snapInteraction = new Snap({ source: drawVectorSource });
drawInteraction.on('drawend', e => {
    const poly = e.feature.getGeometry() as Polygon;
    multiPolygon.appendPolygon(poly);
});

function addInteractions() {
    m.addInteraction(drawInteraction);
    m.addInteraction(modifyInteraction);
    m.addInteraction(snapInteraction);
}

function removeInteractions() {
    m.removeInteraction(drawInteraction);
    m.removeInteraction(modifyInteraction);
    m.removeInteraction(snapInteraction);
}

const drawVectorLayer = new VectorLayer({ source: drawVectorSource, style });

async function postGeoJson() {
    if (areaUploaded.value) return;

    uploadStatus.value = 'uploading';
    const geoJson = getGeoJson();
    fetch(
        '/loadAreaJson',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authStore.user.accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `project_id=${projectStore.id}&geojson=${encodeURIComponent(geoJson)}`
        }).then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
            return response.text();
        }).then(uuids => {
            const uuidsArr: string[] = JSON.parse(uuids);
            uploadStatus.value = 'uploaded';
            emit('update:modelValue', { ...props.modelValue, uuid: uuidsArr[0] });
            toast.success(`Area uploaded\nPlease remember to click "Save and close", otherwise the data will be lost.`,
                {
                    autoClose: false,
                    position: 'top-right',
                }
            );
            projectStore.updateCountries();
        }).catch(error => {
            toast.error('Error uploading the JSON file', {
                autoClose: false,
                position: 'top-right',
            });
            console.error('Error uploading the JSON file', error);
            uploadStatus.value = 'idle';
        });
}

async function fetchGeoJson() {
    // return {};
    return fetch(
        `https://europe-west3-fao-ferm.cloudfunctions.net/get_area_json?area_uuid=${props.modelValue.uuid}&project_id=${projectStore.id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authStore.user.accessToken}`
        }
    }
    ).then(response => response.json());
}

let m: Map;
let observer: IntersectionObserver;

let vectorSource: VectorSource;
let vectorLayer: VectorLayer<Feature>;

onMounted(async () => {
    if (!mapRoot.value) return;

    m = new Map({
        target: mapRoot.value,
        // layers: [vectorLayer],
        view: new View({
            zoom: 0,
            center: [0, 0],
            constrainResolution: true
        })
    });

    m.addLayer(drawVectorLayer);
    if (!areaUploaded.value && props.edit) {
        addInteractions();
    } else {
        try {
            const geoJson = await fetchGeoJson();
            const olGeoJsonObj = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
            vectorSource = new VectorSource({ features: olGeoJsonObj.readFeatures(geoJson) });
            vectorLayer = new VectorLayer({ source: vectorSource, style });
            m.addLayer(vectorLayer);
            m.getView().fit(vectorSource.getExtent());
        } catch (error) {
            console.error('Error fetching GeoJSON', error);
        }
    }

    // observer to detect when the map is visible. Used to load the map only when it is visible
    observer = new IntersectionObserver(
        ([entry]) => {
            if (!mapRoot.value) return;
            if (entry.isIntersecting) {
                handleIntersection();
                observer.unobserve(mapRoot.value);
            }
        },
        {
            threshold: 0.1,
        }
    );

    observer.observe(mapRoot.value);
});

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect();
    }
});

function handleIntersection() {
    const newLayer = new TileLayer({
        visible: true,
        preload: Infinity,
        // @ts-ignore
        source: new BingMaps({
            key: import.meta.env.VITE_BING_KEY,
            imagerySet: 'AerialWithLabelsOnDemand'
            // use maxZoom 19 to see stretched tiles instead of the BingMaps
            // "no photos at this zoom level" tiles
            // maxZoom: 19
        })
    });

    m.getLayers().insertAt(0, newLayer);
}

watch(areaUploaded, (uploaded) => {
    if (uploaded && props.edit) {
        removeInteractions();

        if (!props.modelValue.area) {
            fetchPolygonArea();
        }
    } else {
        multiPolygon = new MultiPolygon([]);
        if (vectorSource) {
            vectorSource.clear();
        }
        if (vectorLayer) {
            m.removeLayer(vectorLayer);
        }
        if (drawVectorSource) {
            drawVectorSource.clear();
        }

        addInteractions();
    }
});

function fetchPolygonArea() {
    // Calls the get_polygon_area cloud function with area_uuid as argument and returns the area in hectares
    fetch(
        `https://europe-west3-fao-ferm.cloudfunctions.net/get_polygon_area?area_uuid=${props.modelValue.uuid}&project_id=${projectStore.id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authStore.user.accessToken}`
        }
    }).then(response => response.json()).then(area => {
        emit('update:modelValue', { ...props.modelValue, area: 1e-4 * area });
    });
}

function clear() {
    multiPolygon = new MultiPolygon([]);
    drawVectorSource.clear();
}
</script>

<template>
    <div class="flex flex-col md:flex-row gap-6">
        <div
            class="mt-4 w-full md:w-72 h-72 border-gray-300 shadow rounded-lg min-w-fit-content"
            ref="mapRoot"
            id="mapRoot"
        />
        <div class="flex-1">
            <fieldset>
                <div class="md:mt-5 mb-5">
                    <legend class="block text-sm font-bold text-gray-700 sm:mt-px">
                        {{ t('inputs.aoi.siteName') }}
                    </legend>
                    <div>
                        <TextInput
                            :edit="edit"
                            v-model="modelValue.siteName"
                        />
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <div>
                    <legend class="block text-sm font-bold text-gray-700 sm:mt-px">
                        {{ `${t('inputs.areaSurface')} [${getMenuSelectedLabel(projectStore.project.project.areaUnits, menus.units)}]` }}
                    </legend>
                    <div>
                        <template v-if="edit">
                            <div class="mt-2 flex rounded-md">
                                <div class="relative flex flex-1 items-stretch focus-within:z-10">
                                    <NumberInput
                                        v-model="modelValue.area"
                                        :edit="edit"
                                    />
                                </div>
                                <button
                                    type="button"
                                    @click="fetchPolygonArea()"
                                    :disabled="!areaUploaded"
                                    :class="[areaUploaded ? 'hover:bg-gray-50' : 'bg-gray-100 text-gray-500',
                                        'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ml-5']"
                                >
                                    <CalculatorIcon
                                        class="-ml-0.5 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    <!-- Calculate area -->
                                    {{ t('inputs.aoi.calculateArea') }}
                                </button>
                            </div>
                        </template>
                        <div v-else>{{ modelValue.area }}</div>
                    </div>
                </div>
            </fieldset>
        </div>
    </div>
    <button
        v-if="!areaUploaded && edit"
        class="rounded-md px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        :class="[uploadStatus === 'idle' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-400 cursor-default']"
        @click="postGeoJson()"
    >
        {{ t('inputs.aoi.uploadArea') }}
    </button>
    <button
        v-if="!areaUploaded && edit"
        class="ml-4 mt-4 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        @click="clear"
    >
        {{ $t('inputs.aoi.clear') }}
    </button>

    <AreaEcosystemsView
        :edit="edit"
        :area="modelValue"
        :index="index"
        :nAreas="nAreas"
    />
</template>
