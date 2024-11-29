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

let map: google.maps.Map | null = null;
let maxExtent: google.maps.LatLngBounds;

const geoJsonLoaded = ref(false);
const geoJsonLoadError = ref(false);
let markers: any = [];

const parser = new DOMParser();

function buildSvgElemFromString(svgString: string) {
    return parser.parseFromString(svgString, 'image/svg+xml').documentElement;
}

defineExpose({
    resetMap: () => {
        unhighlightAllFeatures();

        if (markers) {
            markers.forEach((marker: any) => {
                const pinSvg = buildSvgElemFromString(areaCentroidSvgString);
                marker.content = pinSvg.cloneNode(true);
            });
        }

        if (map && maxExtent) {
            map?.fitBounds(maxExtent, 50);
        }
    }
});

const mapDiv = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    if (mapDiv.value) {
        await initMap();
    }
});

let advancedMarkerElement: any = null;

async function importAdvancedMarkerElement() {
    if (!advancedMarkerElement) {
        advancedMarkerElement = (await google.maps.importLibrary("marker") as google.maps.MarkerLibrary).AdvancedMarkerElement;
    }
    return advancedMarkerElement;
}

function getAreaCentroidSvgString(size: number, stroke: string, fill: string) {
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" rx="2" ry="2" width="16" height="16" fill="${fill}" stroke="${stroke}" stroke-width="3" />
    </svg>`;
}

const areaCentroidSvgString = getAreaCentroidSvgString(16, 'white', '#EEA63A');
const areaCentroidDimmedSvgString = getAreaCentroidSvgString(16, 'white', 'none');

const pointSvgString = `
    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="6" fill="#EEA63A" stroke="white" stroke-width="2" />
    </svg>`;

async function loadGeoJson() {
    return Promise.all([
        getProjectAreas(props.projectId, props.public),
        getProjectAdminAreas(props.projectId, props.public),
    ]);
}

function zoomTo(extent: google.maps.LatLngBounds) {
    map?.fitBounds(extent, 50);
    map?.setCenter(extent.getCenter());
}

function getPseudoCentroid(geometry: google.maps.Data.Geometry) {
    const geometryType = geometry.getType();

    if (geometryType === 'Point') {
        return geometry.get();
    }

    const xs: number[] = [];
    const ys: number[] = [];

    if (geometry.getType() === 'MultiPoint') {
        geometry.getArray().forEach(point => {
            xs.push(point.lng());
            ys.push(point.lat());
        });
        const x = xs.reduce((a, b) => a + b) / xs.length;
        const y = ys.reduce((a, b) => a + b) / ys.length;
        return new google.maps.LatLng(y, x);
    }
    else if (geometryType === 'LineString') {
        geometry.getArray().forEach(latLng => {
            xs.push(latLng.lng());
            ys.push(latLng.lat());
        });
        const x = xs.reduce((a, b) => a + b) / xs.length;
        const y = ys.reduce((a, b) => a + b) / ys.length;
        return new google.maps.LatLng(y, x);
    }
    else if (geometryType === 'MultiLineString') {
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
    else if (geometryType === 'Polygon') {
        geometry.getArray().forEach(path => {
            path.getArray().forEach(latLng => {
                bounds.extend(latLng);
            });
        });
        return bounds.getCenter();
    }
    else if (geometryType === 'MultiPolygon') {
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

function getMarkerCoordinates(feature: google.maps.Data.Feature) {
    const pointOnSurface: [number, number] = feature.getProperty('pointOnSurface') as any;
    const geometry = feature.getGeometry();

    if (!geometry) {
        return [0, 0]; // Return a default value. Not ideal but better than crashing
    }

    if (pointOnSurface && ['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString'].includes(geometry.getType())) {
        return new google.maps.LatLng(pointOnSurface[0], pointOnSurface[1])
    }
    return getPseudoCentroid(geometry); // in case of points, return the pseudo centroid otherwise point on surface would coincide with one of the points
}

async function initMap() {
    if (!mapDiv.value) return;

    try {
        geoJsonLoaded.value = false;
        geoJsonLoadError.value = false;

        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const AdvancedMarkerElement = await importAdvancedMarkerElement();

        map = new Map(mapDiv.value as HTMLElement, {
            zoom: 1,
            center: { lat: 0, lng: 40 },
            gestureHandling: "greedy",
            restriction: {
                latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
                strictBounds: true,
            },
            disableDefaultUI: true,
            mapTypeId: 'hybrid',
            mapId: 'acfd9aecb62ff17c',
        });

        // Load the json data
        const [geojson, adminGeoJson] = await loadGeoJson();
        map.data.addGeoJson(geojson);
        map.data.addGeoJson(adminGeoJson);

        // hide by default
        map.data.setStyle({
            visible: false,
        });

        // zoom to the layer
        maxExtent = new google.maps.LatLngBounds();
        if (geojson.features.length > 0 || adminGeoJson.features.length > 0) {
            map.data.forEach(feature => {
                const centroid = getMarkerCoordinates(feature);
                maxExtent.extend(centroid);
            });
            zoomTo(maxExtent);
        }

        const centroidsAndFeatures: { centroid: google.maps.LatLng, feature: google.maps.Data.Feature }[] = [];

        map.data.forEach(feature => {
            centroidsAndFeatures.push({ centroid: getMarkerCoordinates(feature), feature });
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

        const pinSvg = buildSvgElemFromString(areaCentroidSvgString);
        // Center the SVG using CSS
        pinSvg.style.position = 'absolute';
        pinSvg.style.top = '50%';
        pinSvg.style.left = '50%';
        pinSvg.style.transform = 'translate(-50%, -50%)';

        const pinDimmedSvg = buildSvgElemFromString(areaCentroidDimmedSvgString);
        // Center the SVG using CSS
        pinDimmedSvg.style.position = 'absolute';
        pinDimmedSvg.style.top = '50%';
        pinDimmedSvg.style.left = '50%';
        pinDimmedSvg.style.transform = 'translate(-50%, -50%)';

        // Create markers based on centroids
        markers = centroidsAndFeatures.map(({ centroid, feature }) => {
            const marker = new AdvancedMarkerElement({
                position: centroid,
                content: pinSvg.cloneNode(true),
            });


            // Most of this code doesn't make sense, but have no time now
            
            // Add click listener to highlight related feature
            marker.addListener("click", () => {
                zoomAndHighlightFeature(feature);
                emit('areaClicked', feature.getProperty('areaObject'));

                // reset all other markers to dimmed style
                markers.forEach(marker => {
                    // Create a wrapper element
                    const markerContent = document.createElement('div');

                    // Create and append both pin versions
                    const dimmedPin = pinDimmedSvg.cloneNode(true);
                    const highlightedPin = pinSvg.cloneNode(true);

                    // Initially hide the highlighted version
                    highlightedPin.style.display = 'none';

                    // Append both versions to the wrapper
                    markerContent.appendChild(dimmedPin);
                    markerContent.appendChild(highlightedPin);

                    // Define the handlers
                    function onMouseEnter() {
                        dimmedPin.style.display = 'none';
                        highlightedPin.style.display = 'block';
                    }

                    function onMouseLeave() {
                        dimmedPin.style.display = 'block';
                        highlightedPin.style.display = 'none';
                    }

                    // Add the event listeners to the wrapper
                    markerContent.addEventListener('mouseenter', onMouseEnter);
                    markerContent.addEventListener('mouseleave', onMouseLeave);

                    // Set the marker content to the wrapper
                    marker.content = markerContent;
                });
                marker.content = pinSvg;
            });

            return marker;
        });

        // when not clicking on any marker, reset the style
        // map.addListener('click', () => {
        //     unhighlightAllFeatures();

        //     // set all markers to default style
        //     markers.forEach(marker => {
        //         marker.content = pinSvg.cloneNode(true);
        //     });

        //     emit('areaClicked', null);
        // });

        const customRenderer = {
            render: ({ count, position }) => {
                const size = 40; // Size of the SVG
                const fill = "#EEA63A"; // Fill color (consistent with your example)
                const stroke = "white"; // Stroke color
                const strokeWidth = 1.6; // Thinner stroke width
                const cornerRadius = 4; // Radius for rounded corners

                const svgContent = `
                <svg width="${size}" height="${size}" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="14" height="14" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${cornerRadius}" ry="${cornerRadius}" />
                    <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="7" dy=".3em" font-weight="semibold">
                        ${count}
                    </text>
                </svg>
                `;

                const clusterElement = document.createElement("div");
                clusterElement.innerHTML = svgContent;
                clusterElement.style.width = `${size}px`;
                clusterElement.style.height = `${size}px`;

                // when the user click on a cluster, reset the style of all markers
                clusterElement.addEventListener('click',
                    () => {
                        markers.forEach(marker => {
                            marker.content = pinSvg.cloneNode(true);
                        });

                        unhighlightAllFeatures();
                    });

                return new AdvancedMarkerElement({
                    position,
                    content: clusterElement,
                });
            },
        };

        // Add a marker clusterer to manage the markers.
        const markerCluster = new MarkerClusterer({ markers, map, renderer: customRenderer });

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

        geoJsonLoaded.value = true;
    } catch (error) {
        console.error(error);
        geoJsonLoadError.value = true;
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
    zoomTo(bounds);
}

let selectedPointMarkers = [];

function clearMultipointMarkers() {
    if (selectedPointMarkers.length > 0) {
        selectedPointMarkers.forEach(marker => {
            marker.setMap(null);
        });
        selectedPointMarkers = [];
    }
}

function unhighlightAllFeatures() {
    clearMultipointMarkers();

    if (map) {
        map.data.setStyle({
            visible: false,
        });
    }
}

async function highlightFeature(feature) {
    unhighlightAllFeatures();

    const geometryType = feature.getGeometry().getType();
    if (geometryType === "MultiPoint") {
        // Import the AdvancedMarkerElement
        const AdvancedMarkerElement = await importAdvancedMarkerElement();

        // Loop through the points and create individual markers
        const markers = feature
            .getGeometry()
            .getArray()
            .map((latLng) => {
                // Create the marker content
                const markerContent = parser
                    .parseFromString(pointSvgString, "image/svg+xml")
                    .documentElement;

                // Set cursor to hand
                markerContent.style.cursor = "grab";

                // Align the marker correctly with the map position
                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.transform = 'translate(-50%, -50%)'; // Center marker on its position
                // container.style.pointerEvents = 'none'; // Prevent issues with marker interactions
                container.appendChild(markerContent);

                // Create the marker
                const marker = new AdvancedMarkerElement({
                    position: latLng,
                    content: container, // Use the container for proper alignment
                    map, // Add directly to the map
                });

                // Do nothing when clicking on the marker
                marker.addListener("click", () => { });

                return marker;
            });

        // Store these markers globally or in a local variable if needed
        selectedPointMarkers = markers; // Save for future clearing if necessary
    } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
        map.data.setStyle((f) => {
            // Set a style for the highlighted feature
            if (f === feature) {
                return {
                    fillColor: "#EEA63A",
                    fillOpacity: 0,
                    strokeColor: "#FFBF5B",
                    strokeWeight: 4,
                };
            } else {
                return {
                    visible: false,
                };
            }
        });
    }
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
