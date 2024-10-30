<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { getProjectAreas, getProjectAdminAreas } from '@/firebase/functions';

import SpinningThing from '@/components/SpinningThing.vue';


const props = withDefaults(defineProps<{
    projectId: string;
    public: boolean;
}>(), {
    public: true,
})

const emit = defineEmits(['areaClicked']);

const mapDiv = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    if (mapDiv.value) {
        initMap();
    }
});

const geoJsonLoaded = ref(false);
const geoJsonLoadError = ref(false);

let map: google.maps.Map | null = null;

const pinSvgString = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="#EEA63A" stroke="white" stroke-width="3" /></svg>';
// same as above but without fill and with slightly transparent stroke
const pinActiveSvgString = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3" /></svg>';
const parser = new DOMParser();

async function initMap() {
    if (!mapDiv.value) return;

    geoJsonLoaded.value = false;
    geoJsonLoadError.value = false;

    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    const bounds = {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
    };
    map = new Map(mapDiv.value as HTMLElement, {
        center: { lat: 0, lng: 40 },
        zoom: 1,
        restriction: {
            latLngBounds: bounds,
            strictBounds: true,
        },

        disableDefaultUI: true,
        // satellite map
        mapTypeId: 'hybrid',
        mapId: 'acfd9aecb62ff17c',
    });

    // Load the json data
    const [geojson, adminGeoJson] = await Promise.all([
        getProjectAreas(props.projectId, props.public),
        getProjectAdminAreas(props.projectId, props.true),
    ]).catch((error) => {
        console.error('Failed to load geojson:', error);
        geoJsonLoadError.value = true;
    }).finally(() => {
        geoJsonLoaded.value = true;
    });
    map.data.addGeoJson(geojson);
    map.data.addGeoJson(adminGeoJson);

    // hide by default
    map.data.setStyle({
        visible: false,
    });

    // Add mouseover and mouseout events
    map.data.addListener('mouseover', function (event) {
        map.data.overrideStyle(event.feature, {
            fillOpacity: 0.3,
            strokeWeight: 3,
        });
    });

    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle(event.feature);
    });

    // zoom to the layer
    if (geojson.features.length > 0 || adminGeoJson.features.length > 0) {
        const layerBounds = new google.maps.LatLngBounds();
        map.data.forEach(feature => {
            feature.getGeometry().forEachLatLng(latLng => {
                layerBounds.extend(latLng);
            });
        });
        map.fitBounds(layerBounds);
        map.setCenter(layerBounds.getCenter());
    }

    function getPseudoCentroid(geometry: google.maps.Data.Geometry) {
        if (geometry.getType() === 'Point') {
            return geometry.get();
        }

        const bounds = new google.maps.LatLngBounds();
        const xs = [];
        const ys = [];

        if (geometry.getType() === 'MultiPoint') {
            geometry.getArray().forEach(point => {
                xs.push(point.lng());
                ys.push(point.lat());
            });
            const x = xs.reduce((a, b) => a + b) / xs.length;
            const y = ys.reduce((a, b) => a + b) / ys.length;
            return new google.maps.LatLng(y, x);
        }

        if (geometry.getType() === 'LineString') {
            geometry.getArray().forEach(latLng => {
                xs.push(latLng.lng());
                ys.push(latLng.lat());
            });
            const x = xs.reduce((a, b) => a + b) / xs.length;
            const y = ys.reduce((a, b) => a + b) / ys.length;
            return new google.maps.LatLng(y, x);
        }

        if (geometry.getType() === 'MultiLineString') {
            geometry.getArray().forEach(line => {
                line.getArray().forEach(latLng => {
                    xs.push(latLng.lng());
                    ys.push(latLng.lat());
                });
            });
            const x = xs.reduce((a, b) => a + b) / xs.length;
            const y = ys.reduce((a, b) => a + b) / ys.length;
            return new google.maps.LatLng(y, x);
        }
        if (geometry.getType() === 'Polygon') {
            geometry.getArray().forEach(path => {
                path.getArray().forEach(latLng => {
                    bounds.extend(latLng);
                });
            });
            return bounds.getCenter();
        }
        if (geometry.getType() === 'MultiPolygon') {
            geometry.getArray().forEach(polygon => {
                polygon.getArray().forEach(path => {
                    path.getArray().forEach(latLng => {
                        xs.push(latLng.lng());
                        ys.push(latLng.lat());
                    });
                });
            });
            const x = xs.reduce((a, b) => a + b) / xs.length;
            const y = ys.reduce((a, b) => a + b) / ys.length;
            return new google.maps.LatLng(y, x);
        }
        return null;
    }

    const centroidsAndFeatures: { centroid: google.maps.LatLng, feature: google.maps.Data.Feature }[] = [];
    map.data.forEach(feature => {
        const centroid = getPseudoCentroid(feature.getGeometry());
        centroidsAndFeatures.push({ centroid, feature });
    });

    // if any set of centroids match exactly, offset them slightly
    centroidsAndFeatures.forEach((cf, i) => {
        const { centroid, feature } = cf;
        const existing = centroidsAndFeatures.find(({ centroid: c }) => c.equals(centroid));
        if (existing && existing.feature !== feature) {
            // offset the centroid slightly
            const offset = 0.0001;
            const offsetX = offset * (1 + Math.random() - 0.5);
            const offsetY = offset * (1 + Math.random() - 0.5);
            cf.centroid = new google.maps.LatLng(centroid.lat() + offsetX, centroid.lng() + offsetY);
        }
    });

    const pinSvg = parser.parseFromString(pinSvgString, 'image/svg+xml').documentElement;
    // Center the SVG using CSS
    pinSvg.style.position = 'absolute';
    pinSvg.style.top = '50%';
    pinSvg.style.left = '50%';
    pinSvg.style.transform = 'translate(-50%, -50%)';

    const pinActiveSvg = parser.parseFromString(pinActiveSvgString, 'image/svg+xml').documentElement;
    // Center the SVG using CSS
    pinActiveSvg.style.position = 'absolute';
    pinActiveSvg.style.top = '50%';
    pinActiveSvg.style.left = '50%';
    pinActiveSvg.style.transform = 'translate(-50%, -50%)';
    
    // Create markers based on centroids
    const markers = centroidsAndFeatures.map(({ centroid, feature }) => {
        const marker = new AdvancedMarkerElement({
            position: centroid,
            content: pinSvg.cloneNode(true),
        });

        // Add click listener to highlight related feature
        marker.addListener("click", () => {
            zoomAndHighlightFeature(feature);
            emit('areaClicked', feature.getProperty('areaObject'));

            // reset all markers to default style
            markers.forEach(marker => {
                marker.content = pinSvg.cloneNode(true);
            });
            marker.content = pinActiveSvg;
        });
        return marker;
    });

    // when not clicking on any marker, reset the style
    map.addListener('click', () => {
        map.data.setStyle({
            visible: false,
        });
        emit('areaClicked', null);
    });

    // Add a marker clusterer to manage the markers.
    const markerCluster = new MarkerClusterer({ markers, map });

    // when clicking on a marker, reset the style of all features
    markerCluster.addListener('click', () => {
        map.data.setStyle({
            visible: false,
        });
    });

    // if there's only one feature, zoom to it
    if (geojson.features.length + adminGeoJson.features.length === 1) {
        map.data.forEach(feature => {
            highlightFeature(feature);
        });
    }
}

function zoomAndHighlightFeature(feature) {
    zoomToFeature(feature);
    highlightFeature(feature);
}

function zoomToFeature(feature) {
    const bounds = new google.maps.LatLngBounds();
    feature.getGeometry().forEachLatLng(latlng => {
        bounds.extend(latlng);
    });
    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
}

function highlightFeature(feature) {
    // Set a style for the highlighted feature
    map.data.setStyle(f => {
        if (f === feature) {
            return {
                fillColor: '#EEA63A',
                fillOpacity: 0,
                strokeColor: '#FFBF5B',
                strokeWeight: 3,
            };
        } else {
            return {
                visible: false,
            };
        }
    });
}
</script>

<template>
    <div
        id="map"
        ref="mapDiv"
        class="focus:ring-0"
        v-bind="$attrs"
    />
    <div
        v-if="!geoJsonLoaded || geoJsonLoadError"
        class="absolute inset-0 flex items-center justify-center font-sans text-gray-100"
    >
        <div
            v-if="!geoJsonLoaded && !geoJsonLoadError"
            class="flex flex-col items-center border border-gray-500 bg-black/60 px-10 py-6 rounded-md"
        >
            <SpinningThing />
            <div class="mt-3">
                Loading map
            </div>
        </div>
        <div
            v-else
            class="flex flex-col items-center border border-gray-500 bg-black/60 px-10 py-6 rounded-md"
        >
            <div>
                Failed to load map
            </div>

            <div class="mt-3">
                <button
                    @click="initMap"
                    class="bg-gray-600 text-white px-4 py-2 rounded-sm border border-gray-500"
                >
                    Retry
                </button>
            </div>
        </div>
    </div>
</template>