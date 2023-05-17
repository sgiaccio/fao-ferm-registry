<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'

import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { Draw, Modify, Snap } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'

import 'ol/ol.css'

import { useAuthStore } from '../../../stores/auth'
import { useProjectStore } from '../../../stores/project'

import FormGroup from '../FormGroup.vue'
import TextInput from './TextInput.vue'

import { CalculatorIcon } from '@heroicons/vue/20/solid'


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

// const props = defineProps<{
//     modelValue: {
//         siteName: string,
//         uuid: string,
//         area: number,
//         activities: number[],
//         ecosystems: string[],
//     }
// }>()

const uploadStatus = ref('idle');

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const projectStore = useProjectStore();

const mapRoot = ref(null);

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource });

function getGeoJson() {
    const geoJSON = new GeoJSON({ featureProjection: 'EPSG:3857' });
    return geoJSON.writeFeatures(vectorLayer.getSource().getFeatures());
}

const areaUploaded = computed(() => !!props.modelValue?.uuid);

const draw = new Draw({ source: vectorSource, type: 'Polygon' });
const modify = new Modify({ source: vectorSource });
const snap = new Snap({ source: vectorSource });

async function postGeoJson() {
    if (areaUploaded.value) return;

    uploadStatus.value = 'uploading';
    const geoJson = getGeoJson();
    fetch(
        'https://europe-west3-fao-ferm.cloudfunctions.net/load_area_json',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authStore.user.accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `project_id=${projectStore.id}&geojson=${encodeURIComponent(geoJson)}`
        }).then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) })
            }
            return response.text();
        }).then(uuids => {
            const uuidsArr: string[] = JSON.parse(uuids)
            uploadStatus.value = 'uploaded';
            emit('update:modelValue', { ...props.modelValue, uuid: uuidsArr[0] });
            alert(`Area uploaded with UUID ${uuidsArr[0]}\n\nPlease remember to click "Save and close" otherwise the data will be lost.`);
        }).catch(_error => {
            alert('Error uploading the JSON file');
            uploadStatus.value = 'idle'
        });
}

async function fetchGeoJson() {
    return fetch(
        `https://europe-west3-fao-ferm.cloudfunctions.net/get_area_json?area_uuid=${props.modelValue.uuid}&project_id=${projectStore.id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authStore.user.accessToken}`,
        },
    }
    ).then(response => response.json());
}

let m: Map;

onMounted(async () => {
    m = new Map({
        target: mapRoot.value,
        layers: [
            new TileLayer({ source: new OSM() }),
            vectorLayer
        ],
        view: new View({
            zoom: 0,
            center: [0, 0],
            constrainResolution: true
        }),
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
        m.addLayer(new VectorLayer({ source }));
        m.getView().fit(source.getExtent());
    }
});

watch(areaUploaded, (uploaded) => {
    if (uploaded && props.edit) {
        m.removeInteraction(draw);
        m.removeInteraction(modify);
        m.removeInteraction(snap);
    } else {
        m.addInteraction(draw);
        m.addInteraction(modify);
        m.addInteraction(snap);
    }
});

function fetchPolygonArea() {
    // Calls the get_polygon_area cloud function with area_uuid as argument
    // and returns the area in hectares
    fetch(
        `https://europe-west3-fao-ferm.cloudfunctions.net/get_polygon_area?area_uuid=${props.modelValue.uuid}&project_id=${projectStore.id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authStore.user.accessToken}`,
        },
    }).then(response => response.json()).then(area => {
        console.log(area);
        console.log({ ...props.modelValue, area });
        emit('update:modelValue', { ...props.modelValue, area: (area * 0.0001).toFixed(2) });
    });
}

// const edit = true;
</script>

<template>
    <FormGroup label="Site name">
        <TextInput :edit="edit"
                   v-model="modelValue.siteName" />
    </FormGroup>
    <div>
        <legend class="block text-sm font-medium leading-6 text-gray-900">
            Area [ha]
        </legend>
        <template v-if="edit">
            <div class="mt-2 flex rounded-md shadow-sm">
                <div class="relative flex flex-grow items-stretch focus-within:z-10">
                    <input type="number"
                           v-model="modelValue.area"
                           name="area"
                           class="block w-full rounded-none rounded-l-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
                <button type="button"
                        @click="fetchPolygonArea()"
                        class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <CalculatorIcon class="-ml-0.5 h-5 w-5 text-gray-400"
                                    aria-hidden="true" />
                    Calculate area
                </button>
            </div>
        </template>
        <div v-else>{{ modelValue.area }}</div>
    </div>
    <!-- <FormGroup label="Area [ha]">
        <NumberInput :edit="edit"
                     v-model="modelValue.area" />
    </FormGroup> -->
    <div class="mt-4"
         ref="mapRoot"
         style="width: 600px; height: 400px" />
    <button v-if="!areaUploaded && edit"
            class="mt-4 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :class="[uploadStatus === 'idle' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-default']"
            @click="postGeoJson()">Upload</button>
</template>
