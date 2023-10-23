<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';

import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps.js';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Style, Fill, Stroke } from 'ol/style.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';

import 'ol/ol.css';

import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import FormGroup from '../FormGroup.vue';
import TextInput from './TextInput.vue';

import { CalculatorIcon } from '@heroicons/vue/20/solid';
import NumberInput from '@/components/inputs/base/NumberInput.vue';

import { getMenuSelectedLabel } from '@/components/project/menus';


const props = withDefaults(defineProps<{
    modelValue: {
        siteName: string,
        uuid: string,
        area: number,
        activities: number[],
        ecosystems: string[],
    }
    edit?: boolean
}>(), {
    edit: true
});


const uploadStatus = ref('idle');

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const projectStore = useProjectStore();
const menus = useMenusStore().menus;

const mapRoot = ref(null);

const style = new Style({
    fill: new Fill({
        color: 'rgba(0,0,0,0)' // Transparent fill
    }),
    stroke: new Stroke({
        color: '#ffcc33',
        width: 2
    })
});

const drawStyle = {
    'circle-radius': 5,
    'circle-fill-color': '#ffcc33',
    'circle-stroke-color': 'white',
    'stroke-color': '#ffcc33',
    'stroke-width': 2
};

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource, style });

function getGeoJson() {
    const geoJSON = new GeoJSON({ featureProjection: 'EPSG:3857' });
    return geoJSON.writeFeatures(vectorLayer.getSource().getFeatures());
}

const areaUploaded = computed(() => !!props.modelValue?.uuid);

const draw = new Draw({
    source: vectorSource,
    type: 'Polygon',
    style: drawStyle
});
const modify = new Modify({ source: vectorSource, style: drawStyle });
const snap = new Snap({ source: vectorSource });

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
            alert(`Area uploaded with UUID ${uuidsArr[0]}\n\nPlease remember to click "Save and close" otherwise the data will be lost.`);
        }).catch(_error => {
            alert('Error uploading the JSON file');
            uploadStatus.value = 'idle';
        });
}

async function fetchGeoJson() {
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

onMounted(async () => {
    m = new Map({
        target: mapRoot.value,
        layers: [
            // new TileLayer({ source: new OSM() }),
            new TileLayer({
                visible: true,
                preload: Infinity,
                source: new BingMaps({
                    key: import.meta.env.VITE_BING_KEY,
                    imagerySet: 'AerialWithLabelsOnDemand'
                    // use maxZoom 19 to see stretched tiles instead of the BingMaps
                    // "no photos at this zoom level" tiles
                    // maxZoom: 19
                })
            }),
            vectorLayer
        ],
        view: new View({
            zoom: 0,
            center: [0, 0],
            constrainResolution: true
        })
    });

    if (!areaUploaded.value && props.edit) {
        m.addInteraction(draw);
        m.addInteraction(modify);
        m.addInteraction(snap);
    } else {
        const geoJson = await fetchGeoJson();
        const olGeoJsonObj = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        const source = new VectorSource({ features: olGeoJsonObj.readFeatures(geoJson) });
        m.removeLayer(vectorLayer);
        m.addLayer(new VectorLayer({ source, style }));
        m.getView().fit(source.getExtent());
    }
});

watch(areaUploaded, (uploaded) => {
    if (uploaded && props.edit) {
        m.removeInteraction(draw);
        m.removeInteraction(modify);
        m.removeInteraction(snap);

        if (!props.modelValue.area) {
            fetchPolygonArea();
        }
    } else {
        m.addInteraction(draw);
        m.addInteraction(modify);
        m.addInteraction(snap);
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
        emit('update:modelValue', { ...props.modelValue, area: parseFloat((1e-4 * area)) });
    });
}
</script>

<template>
    <FormGroup label="Site name">
        <TextInput :edit="edit"
                   v-model="modelValue.siteName" />
    </FormGroup>
    <FormGroup :label="`Area [${getMenuSelectedLabel(projectStore.project.project.areaUnits, menus.units)}]`">
        <template v-if="edit">
            <div class="mt-2 flex rounded-md shadow-sm">
                <div class="relative flex flex-grow items-stretch focus-within:z-10">
                    <NumberInput v-model="modelValue.area"
                                 :edit="edit" />
                </div>
                <button type="button"
                        @click="fetchPolygonArea()"
                        :disabled="!areaUploaded"
                        :class="[areaUploaded ? 'hover:bg-gray-50' : 'bg-gray-100 text-gray-500',
                        'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 ' +
                        'text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ml-5']">
                    <CalculatorIcon class="-ml-0.5 h-5 w-5 text-gray-400"
                                    aria-hidden="true" />
                    Calculate area
                </button>
            </div>
        </template>
        <div v-else>{{ modelValue.area }}</div>
    </FormGroup>
    <div class="mt-4 w-full h-96 border-2 border-gray-300 dark:border-gray-700"
         ref="mapRoot"
         id="caz" />
    <button v-if="!areaUploaded && edit"
            class="mt-4 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :class="[uploadStatus === 'idle' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-default']"
            @click="postGeoJson()">Upload
    </button>
</template>
