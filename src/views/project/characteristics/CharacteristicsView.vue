<script setup lang="ts">
import { ref } from 'vue';

import { useProjectStore } from '../../../stores/project';

import MeanMinMax from './MeanMinMax.vue';
import LandCover from './LandCover.vue';

// import { iucnEcosystems } from '../../components/project/menus';

// import TreeItem from '../../components/inputs/base/TreeItem.vue';


const store = useProjectStore();

async function fetchPolygonIndicator(areaUuid: string, statistics: string) {
    var url = new URL('https://europe-west3-fao-ferm.cloudfunctions.net/get_polygon_zonal_stats');
    const params = { area_uuid: areaUuid, statistics, project_id: store.id! }
    url.search = new URLSearchParams(params).toString();

    return fetch(
        url,
        {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${authStore.user.accessToken}`,
                // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        }).then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        }).then(json => {
            return json;
        });
}

// const statisticsIds = ['elevation', 'temperature', 'precipitation', 'land_cover']

interface Statistics {
    requestId: string,
    dbId: string,
    label: string,
    fn: any, // TODO: function
    template: any // TODO vue template
}

function calculateAverages(values: any[]): { mean: number, min: number, max: number } {
    function calculateAverage(key: string) {
        return (values.reduce((prev, curr) => prev + curr[key], 0) / values.length).toFixed(2);
    }

    return {
        mean: calculateAverage('mean'),
        min: calculateAverage('min'),
        max: calculateAverage('max')
    }
}

const statistics: Statistics[] = [{
    requestId: 'elevation',
    dbId: 'elevation',
    label: 'Elevation [m]',
    fn: calculateAverages,
    template: MeanMinMax
}, {
    requestId: 'temperature',
    dbId: 'temperature',
    label: 'Temperature [℃]',
    fn: result => {
        const k = calculateAverages(result);
        return {
            mean: (k.mean - 273.15).toFixed(2),
            min: (k.min - 273.15).toFixed(2),
            max: (k.max - 273.15).toFixed(2),
        }
    },
    template: MeanMinMax
}, {
    requestId: 'precipitation',
    dbId: 'precipitation',
    label: 'Precipitation [mm]',
    fn: calculateAverages,
    template: MeanMinMax
}, {
    requestId: 'land_cover',
    dbId: 'landCover',
    label: 'Land cover',
    fn: (val: any) => Object.entries(val[0]).map(([k, v]) => [+k, v]).filter(entry => !isNaN(+entry[0])),
    template: LandCover
}]

const t = statistics.reduce((prev, curr) => ({ ...prev, [curr.dbId]: 'idle' }), {})
const areaStatStatus = ref<{ [key: string]: 'idle' | 'loading' | 'error' }[]>(new Array(store.projectAreas.length).fill(null).map(() => ({ ...t })));

const nDots = ref(0);
const nLoading = ref(0)

function fetchIndicators(area: any) {
    
    const areaIdx = store.projectAreas.indexOf(area);

    if (Object.values(areaStatStatus.value[areaIdx]).includes('loading')) {
        return;
    }

    let intervalId;

    statistics.forEach(async stats => {
        if (nLoading.value === 0) {
            intervalId = setInterval(() => nDots.value = (nDots.value + 1) % 4, 600);
        }
        nLoading.value += 1;

        areaStatStatus.value[areaIdx][stats.dbId] = 'loading';
        const areaValues = area[Object.keys(area)[0]];
        areaValues.characteristics = {};

        try {
            const result = await fetchPolygonIndicator(areaValues.uuid, stats.requestId);
            areaValues.characteristics[stats.dbId] = stats.fn(result);
            areaStatStatus.value[areaIdx][stats.dbId] = 'idle';
        } catch (e) {
            areaStatStatus.value[areaIdx][stats.dbId] = 'error';
        } finally {
            nLoading.value -= 1;
            if (nLoading.value === 0) {
                clearInterval(intervalId);
                nDots.value = 1;
            }
        }
    });
}


// (defn fetch-polygon-indicator [{:keys [area-uuid statistics f]}]
//   (js/Promise. (fn [resolve reject]
//                  (GET (str "https://europe-west3-fao-ferm.cloudfunctions.net/get_polygon_zonal_stats"
//                            "?area_uuid=" area-uuid
//                            "&statistics=" statistics)
//                    {:response-format :json
//                     :keywords? true
//                     :handler #(-> % f resolve)
//                     :error-handler (fn [err]
//                                      (js/console.log err)
//                                      (js/alert err)
//                                      (reject err))}))))
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Characteristics</h1>
        <p class="dark:text-zinc-200">The project area is characterized by a number of default parameters. They are automatically generated for each aoi based on global data sources. More information about the data source will be soon made available.</p>
        <div class="text-sm text-gray-800 dark:text-zinc-300">
            <p>
                <span class="font-bold">Elevation:</span> Shuttle Radar Topography Mission (SRTM) digital elevation dataset with 3 arc second (approx. 90m) spatial resolution. The vertical error of the DEM’s is reported to be less than 16m.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4">https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4</a>
            </p>
            <p class="mt-2">
                <span class="font-bold">Temperature:</span> ERA5 is the fifth generation ECMWF atmospheric reanalysis of the global climate. Monthly aggregates have been calculated based on the ERA5 hourly temperature values.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY">https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY</a>
            </p>
            <p class="mt-2">
                <span class="font-bold">Rainfall:</span> Climate Hazards Group InfraRed Precipitation with Station data (CHIRPS) is a 30+ year quasi-global rainfall dataset. CHIRPS incorporates 0.05° resolution satellite imagery with in-situ station data to create gridded rainfall time series for trend analysis and seasonal drought monitoring.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_PENTAD">https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_PENTAD</a>
            </p>
            <p class="mt-2">
                <span class="font-bold">Land cover:</span> Dynamic Land Cover map at 100 m resolution (CGLS-LC100). Provides provides a primary land cover scheme using PROBA-V 100 m time-series.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global">https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global</a>
            </p>
            <div class="flex flex-col gap-y-4 mt-6">
                <div
                    v-for="area, i in store.projectAreas"
                    class="border-2 px-3 py-2 rounded-lg">
                    <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2">
                        Area {{i + 1}}<span class="text-black dark:text-gray-100" v-if="area[Object.keys(area)[0]].siteName">: {{area[Object.keys(area)[0]].siteName}}</span>
                    </div>

                    <div class="grid grid-cols-4 gap-x-4 gap-y-3">
                        <template v-for="stats in statistics">
                            <div class="font-bold">{{stats.label}}</div>
                            <div 
                                v-if="area[Object.keys(area)[0]].characteristics && area[Object.keys(area)[0]].characteristics[stats.dbId]"
                                class="col-span-3">
                                <component :is="stats.template" :value="area[Object.keys(area)[0]].characteristics[stats.dbId]"></component>
                            </div>
                            <template v-else>
                                <div class="col-span-3" v-if="areaStatStatus[i][stats.dbId] === 'loading'">
                                    Loading{{'.'.repeat(nDots)}}
                                </div>
                                <div v-else-if="areaStatStatus[i][stats.dbId] === 'error'"
                                     class="text-red-500 col-span-3">Error getting statistics</div>
                                <div class="col-span-3" v-else>n/a</div>
                            </template>
                        </template>
                    </div>
                    <div class="w-full flex place-content-end">
                        <button
                            type="button"
                            class="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            @click="fetchIndicators(area)">Fetch values</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
