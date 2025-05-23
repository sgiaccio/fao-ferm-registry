<script setup lang="ts">
import { ref, h } from 'vue';
// import TabTemplate from '../TabTemplate.vue';
import { gefQc, exportPublicPolygons } from '@/firebase/functions';
import { toast } from 'vue3-toastify';

const gefQcButtonEnabled = ref(true);
const exportPolygonsButtonEnabled = ref(true);
let polygonFileUrl = ref('');
let polygonFileName = ref('');
let polygonFeatureCount = ref(0);

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

// Function to trigger download and remove toast
function downloadPolygonFile(url: string, filename: string, toastId: string) {
    // Create an anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Remove the toast after a short delay
    setTimeout(() => {
        toast.remove(toastId);
    }, 1000);
}

// Create a toast content component using render function
const ToastContent = (props: {
    url: string;
    filename: string;
    features: number;
    toastId: string;
}) => {
    return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        [
            h(
                'div',
                {},
                `GeoJSON file with ${props.features} features is ready`,
            ),
            h('div', {}, [
                h(
                    'button',
                    {
                        style: {
                            backgroundColor: '#4a90e2',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        },
                        onClick: () =>
                            downloadPolygonFile(
                                props.url,
                                props.filename,
                                props.toastId,
                            ),
                    },
                    'Download GeoJSON',
                ),
            ]),
        ],
    );
};

async function downloadPublicPolygons() {
    exportPolygonsButtonEnabled.value = false;

    const toastId = toast.loading('Generating public polygons...', {
        position: toast.POSITION.TOP_RIGHT,
    });

    try {
        const result = await exportPublicPolygons();

        // Store the result data in reactive refs
        polygonFileUrl.value = result.downloadUrl;
        polygonFileName.value = result.filename;
        polygonFeatureCount.value = result.features;

        toast.update(toastId, {
            render: () =>
                h(ToastContent, {
                    url: result.downloadUrl,
                    filename: result.filename,
                    features: result.features,
                    toastId: toastId,
                }),
            type: toast.TYPE.SUCCESS,
            isLoading: false,
            autoClose: false,
            closeOnClick: false,
            closeButton: true,
        });
    } catch (error) {
        console.error('Error exporting polygons:', error);

        toast.update(toastId, {
            render: `Error exporting polygons: ${error.message || JSON.stringify(error)}`,
            type: toast.TYPE.ERROR,
            isLoading: false,
            autoClose: false,
            closeOnClick: true,
            closeButton: true,
        });
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
