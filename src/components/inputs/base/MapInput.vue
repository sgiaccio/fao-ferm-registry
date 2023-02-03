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

import TextInput from './TextInput.vue'


const props = defineProps<{
  modelValue: {
    siteName: string,
    uuid: string,
    activities: number[],
    ecosystems: string[]
  }
}>()

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
        }
    ).then(
        response => response.text()
    ).then(([uuid]) => {
        // load_area_json returns an array of uuids but in this case there's only one
        alert(`Area uploaded with uuid ${uuid}`);
        emit('update:modelValue', { ...props.modelValue, uuid: uuid });
        uploadStatus.value = 'uploaded';
    }).catch(error => {
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

    if (!areaUploaded.value && edit) {
        m.addInteraction(draw);
        m.addInteraction(modify);
        m.addInteraction(snap);
    } else {
        const geoJson = await fetchGeoJson();
        const olGeoJsonObj = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        const source = new VectorSource({features: olGeoJsonObj.readFeatures(geoJson)});
        m.removeLayer(vectorLayer);
        m.addLayer(new VectorLayer({ source }));
        m.getView().fit(source.getExtent());
    }
});

watch(areaUploaded, (uploaded) => {
    if (uploaded && edit) {
        m.removeInteraction(draw);
        m.removeInteraction(modify);
        m.removeInteraction(snap);
    } else {
        m.addInteraction(draw);
        m.addInteraction(modify);
        m.addInteraction(snap);
    }
});

const edit = true;
</script>

<template>
    <TextInput
        v-if="edit"
        placeholder="Site name"
        v-model="modelValue.siteName" />
    <div class="mt-4" ref="mapRoot" style="width: 600px; height: 400px" />
    <button
        v-if="!areaUploaded && edit"
        class="mt-4 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :class="[uploadStatus === 'idle' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-default']"
        @click="postGeoJson()">Upload</button>
</template>
