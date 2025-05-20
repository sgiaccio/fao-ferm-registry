<script setup lang="ts">
import { ref } from 'vue';
// import TabTemplate from '../TabTemplate.vue';
import { gefQc, exportPublicPolygons } from '@/firebase/functions';

const gefQcButtonEnabled = ref(true);
const exportPolygonsButtonEnabled = ref(true);

async function downloadGefQc() {
    gefQcButtonEnabled.value = false;

    const json: any = await gefQc();
    // create the first row with the headers
    const headers = [...Object.keys(json[0]), 'link'].join(',');
    const csv = json
        .map((row: any) => {
            const values = Object.values(row);
            const rootUrl = window.location.origin;
            values.push(`${rootUrl}/registry/initiatives/${row.id}/general`);
            return values
                .map((v) => (typeof v === 'string' ? `"${v}"` : v))
                .join(',');
        })
        .join('\n');

    const blob = new Blob([headers + '\n' + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gef-qc.csv';
    a.click();

    window.URL.revokeObjectURL(url);

    gefQcButtonEnabled.value = true;
}

async function downloadPublicPolygons() {
    exportPolygonsButtonEnabled.value = false;

    try {
        const result = await exportPublicPolygons();

        // Create anchor element and click it to trigger download
        const a = document.createElement('a');
        a.href = result.downloadUrl;
        a.download = result.filename;
        a.target = '_blank'; // Optional: open in new tab
        a.click();

        alert(
            `GeoJSON file with ${result.features} features is ready for download from ${result.downloadUrl}.`,
        );
    } catch (error) {
        console.error('Error exporting polygons:', error);
        alert(
            'Error exporting polygons: ' +
                (error.message || JSON.stringify(error)),
        );
    } finally {
        exportPolygonsButtonEnabled.value = true;
    }
}
</script>

<template>
    <div class="mb-6">
        <h1
            class="bg-ferm-blue-light-200 text-black py-3 md:py-5 rounded-md text-center text-3xl uppercase font-bold tracking-wide"
        >
            Quality Control (Beta)
        </h1>
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="mt-8 flow-root">
                <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div
                        class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
                    >
                        <button
                            :disabled="!gefQcButtonEnabled"
                            @click="downloadGefQc"
                            :class="[
                                'bg-blue-500 text-white font-bold py-2 px-4 rounded',
                                {
                                    'opacity-50 cursor-not-allowed':
                                        !gefQcButtonEnabled,
                                },
                                { 'hover:bg-blue-700': gefQcButtonEnabled },
                            ]"
                        >
                            Download GEF QC
                        </button>

                        <button
                            :disabled="!exportPolygonsButtonEnabled"
                            @click="downloadPublicPolygons"
                            :class="[
                                'ml-4 bg-green-500 text-white font-bold py-2 px-4 rounded',
                                {
                                    'opacity-50 cursor-not-allowed':
                                        !exportPolygonsButtonEnabled,
                                },
                                {
                                    'hover:bg-green-700':
                                        exportPolygonsButtonEnabled,
                                },
                            ]"
                        >
                            Export Public Polygons
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
