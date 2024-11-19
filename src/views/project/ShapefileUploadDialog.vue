<script setup lang="ts">
import { ref, watch } from 'vue';

import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

import { useAuthStore } from '../../stores/auth';
import { useProjectStore } from '../../stores/project';

import JSZip from 'jszip';
import parsedbf from 'parseDBF';
import { Buffer } from 'buffer';

import { DocumentIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid';

import FileUploadFormGroup from '@/components/inputs/base/FileUploadFormGroup.vue';


const authStore = useAuthStore();
const projectStore = useProjectStore();

const props = withDefaults(defineProps<{
    open?: boolean
}>(), {
    open: true
});

const emit = defineEmits(['cancel', 'done']);

const selectedFile = ref<File | null>(null);
const dissolve = ref(true);

const uploadStatus = ref<'idle' | 'uploading' | 'uploaded'>();

function setSelectedFile(files: FileList) {
    selectedFile.value = files[0];
}

async function parseDbfFromZip(f: File) {
    let zip;
    try {
        zip = await JSZip.loadAsync(f);
    } catch (e) {
        getAreaName.value = false;
        getAreaId.value = false;
        areaNameField.value = null;
        areaIdField.value = null;
        header.value = null;
        rows.value = null;
        selectedFile.value = null;
        dissolve.value = true;
        throw Error('It doesn\'t seem to be a zip file');
    }
    let shpFile: string | null = null;
    zip.forEach((_, zipEntry) => {
        const name = zipEntry.name;
        if (name.endsWith('.shp') && !name.includes('._')) {
            if (shpFile) {
                throw Error('Zip file contains more than one shp files');
            }
            shpFile = name;
        }
    });
    let dbfFileName: string | null = null;
    if (shpFile === null) {
        throw new Error('Zip file doesn\'t contain any shapefile');
    }

    dbfFileName = (shpFile as string).replace(/shp$/, 'dbf');

    if (dbfFileName === null) {
        throw new Error('Zip file doesn\'t contain any dbf file');
    }

    // Read the dbf file
    const arrBuf = await zip.files[dbfFileName].async('arraybuffer');
    return parsedbf(Buffer.from(arrBuf));
}

const header = ref<string[] | null>();
const rows = ref<any[] | null>();

async function previewFile() {
    try {
        const f = selectedFile.value!;
        const parsedDBF = await parseDbfFromZip(f);

        if (parsedDBF.length === 0) {
            throw new Error('No features found in the shapefile');
        }

        header.value = Object.keys(parsedDBF[0]).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        rows.value = parsedDBF;
        areaNameField.value = header.value[0];
        areaIdField.value = header.value[0];
    } catch (e) {
        alert(e);
    }
}

watch(selectedFile, f => {
    if (f) {
        previewFile();
    }
});

watch(dissolve, () => {
    if (dissolve.value) {
        getAreaName.value = false;
        getAreaId.value = false;
    }
});

async function uploadFile() {
    if (!selectedFile.value) return;
    if (uploadStatus.value !== 'idle') return;

    uploadStatus.value = 'uploading';

    const formData = new FormData();
    formData.append('project_id', projectStore.id!);
    formData.append('file', selectedFile.value, selectedFile.value.name);
    formData.append('dissolve', 'false');

    return fetch(
        '/loadShapefile',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authStore.user.accessToken}`
                // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: formData
        }).then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
            return response.text();
        }).then(async uuidsAndAreas => {
            const uuidsAndAreasParsed = JSON.parse(uuidsAndAreas);
            const uuidsArr: string[] = uuidsAndAreasParsed.map(([uuid, _]: [string, any]) => uuid);
            const areasArr: number[] = uuidsAndAreasParsed.map(([_, area]: [string, number]) => (area * 1e-4).toFixed(2));

            uploadStatus.value = 'uploaded';
            emit('done', uuidsArr.map((uuid, i) => ({
                siteName: getAreaName.value ? (rows.value!)[i][(areaNameField.value as string)] || undefined : undefined,
                shapeId: getAreaId.value ? (rows.value!)[i][(areaIdField.value as string)] || undefined : undefined,
                uuid: uuid,
                area: areasArr[i],
                activities: null
            })));
            selectedFile.value = null;

            // get the list of intersecting countries and put it in the store
            projectStore.updateCountries();

            alert(`${uuidsArr.length} files uploaded. Please remember to click "Save and close" otherwise the data will be lost.`);
        }).catch(e => {
            alert('Error uploading the Shapefile: ' + e.message);
            console.error(e);
            uploadStatus.value = 'idle';
        });
}

function cancel() {
    emit('cancel');
    header.value = null;
    rows.value = null;
    selectedFile.value = null;
    areaNameField.value = null;
    areaIdField.value = null;
    uploadStatus.value = 'idle';
    dissolve.value = true;
}

watch(() => props.open, open => {
    if (open) uploadStatus.value = 'idle';
    getAreaName.value = false;
    getAreaId.value = false;
    areaNameField.value = null;
    areaIdField.value = null;
    header.value = null;
    rows.value = null;
    selectedFile.value = null;
    dissolve.value = true;
});

const getAreaName = ref(false);
const areaNameField = ref<String | null>(null);
const getAreaId = ref(false);
const areaIdField = ref<String | null>(null);
</script>

<template>
    <TransitionRoot
        as="template"
        :show="open"
    >
        <Dialog
            as="div"
            class="relative z-50"
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle
                                        as="h3"
                                        class="text-lg font-medium leading-6 text-gray-900"
                                    >Upload shapefile
                                    </DialogTitle>
                                    <div>
                                        <div class="text-xs mt-3 text-gray-800 font-light">
                                            <p class="mb-2">Please upload a <span class="font-semibold">zip file</span> containing
                                                the <span class="font-semibold text-blue-500">.shp, .shx,
                                                    .dbf</span>, and .<span class="font-semibold text-blue-500">prj</span> files.
                                            </p>
                                            <p class="mb-2">The shapefile can contain one or many <span class="font-semibold">points</span>, <span class="font-semibold">polygons</span>, or <span class="font-semibold">multipolygons</span>.
                                            </p>
                                            <!-- <p class="mb-2">For each feature on the shapefile, one area will be
                                                added to the registry.
                                            </p> -->
                                            <p class="mb-4">If possible, the shapefile should be in <span class="font-semibold">geographic projection</span>
                                                (latitude/longitude). If not, the system will try to reproject it.
                                            </p>
                                        </div>
                                        <div class="flex-grow focus-within:z-10">
                                            <FileUploadFormGroup
                                                :multiple="false"
                                                :edit="selectedFile === null"
                                                @upload="setSelectedFile"
                                                accept=".zip"
                                                class="w-full"
                                            >
                                                <template v-if="selectedFile === null">
                                                    Drop file here or click to upload
                                                </template>
                                                <template v-else>
                                                    <DocumentIcon class="h-5 w-5 mr-1.5 text-gray-600" />
                                                    {{ selectedFile.name }}
                                                </template>
                                            </FileUploadFormGroup>
                                            <!-- <input
                                                    type="file"
                                                    name="file"
                                                    accept=".zip"
                                                    class="pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                                    @change="setSelectedFile"
                                                > -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                v-if="rows"
                                class="mx-6"
                            >
                                <div class="mb-3">
                                    <div class="flex items-start">
                                        <div class="flex h-5 items-center">
                                            <input
                                                id="dissolve"
                                                aria-describedby="comments-description"
                                                name="comments"
                                                type="checkbox"
                                                v-model="dissolve"
                                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div class="ml-3 text-sm">
                                            <label
                                                for="dissolve"
                                                class="font-medium text-gray-700"
                                            >Dissolve features</label>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="text-red-500 mb-3"
                                    v-if="!dissolve && rows.length <= 50"
                                >
                                    <p class="text-sm text-red-600 italic px-3 py-2 bg-red-50 shadow rounded">Please note that <span class="font-bold underline underline-offset-2">{{ rows.length }} areas will be added to the initiative</span> &mdash; one for each feature in the shapefile.</p>
                                </div>
                                <div
                                    v-if="!dissolve && rows.length > 50"
                                    class="rounded-md bg-yellow-50 p-4"
                                >
                                    <div class="flex">
                                        <div class="flex-shrink-0">
                                            <ExclamationTriangleIcon
                                                class="h-5 w-5 text-yellow-400"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div class="ml-3">
                                            <h3 class="text-sm font-medium text-yellow-800">Too many features</h3>
                                            <div class="mt-2 text-sm text-yellow-700">
                                                <p>It's not possible to import a shapefile with more than 50 features at once. Please dissolve the features or reduce the number of features in the shapefile.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- <div
                                    class="text-redd-500 mb-3"
                                    v-if="!dissolve && rows.length > 50"
                                >
                                    <p class="text-sm text-red-600 italic px-3 py-2 bg-red-50 shadow rounded">It's not possible to add more than 50 areas at once. Please dissolve the features or reduce the number of features in the shapefile.</p>
                                </div> -->
                                <template v-if="!dissolve && rows.length < 50">
                                    <div>
                                        <div class="flex items-start">
                                            <div class="flex h-5 items-center">
                                                <input
                                                    id="areaName"
                                                    aria-describedby="comments-description"
                                                    name="areaName"
                                                    type="checkbox"
                                                    v-model="getAreaName"
                                                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div class="ml-3 text-sm">
                                                <label
                                                    for="areaName"
                                                    class="font-medium text-gray-700"
                                                >Get area name from attribute</label>
                                            </div>
                                        </div>
                                        <select
                                            id="areaNameSelect"
                                            name="areaNameSelect"
                                            :disabled="!getAreaName"
                                            v-model="areaNameField"
                                            :class="[getAreaName ? '' : 'bg-gray-200 text-gray-500', 'mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm']"
                                        >
                                            <option v-for="h in header">{{ h }}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div class="flex items-start mt-6">
                                            <div class="flex h-5 items-center">
                                                <input
                                                    id="areaId"
                                                    aria-describedby="comments-description"
                                                    name="comments"
                                                    type="checkbox"
                                                    v-model="getAreaId"
                                                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div class="ml-3 text-sm">
                                                <label
                                                    for="areaId"
                                                    class="font-medium text-gray-700"
                                                >Get area ID from
                                                    attribute</label>
                                            </div>
                                        </div>
                                        <select
                                            id="areaIdSelect"
                                            name="areaIdSelect"
                                            :disabled="!getAreaId"
                                            v-model="areaIdField"
                                            :class="[getAreaId ? '' : 'bg-gray-200 text-gray-500', 'mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm']"
                                        >
                                            <option v-for="h in header">{{ h }}</option>
                                        </select>
                                    </div>
                                </template>
                                <div class="text-center font-bold text-base mt-6 mb-2">{{ rows.length }}
                                    feature{{ rows.length > 1 ? 's' : '' }} found:
                                </div>
                                <div class="border-gray-300 rounded-md border overflow-hidden">
                                    <div class="overflow-auto text-xs max-h-52">
                                        <table class="divide-y divide-gray-300 w-full">
                                            <tr class="py-2">
                                                <th
                                                    class="truncate max-w-[200px] px-2 py-1"
                                                    v-for="h in header"
                                                >{{ h }}
                                                </th>
                                            </tr>
                                            <tr v-for="row in rows">
                                                <td
                                                    class="truncate max-w-[200px] px-2 py-1"
                                                    v-for="h in header"
                                                >
                                                    {{ row[h] }}
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    @click="uploadFile()"
                                    type="button"
                                    :disabled="!(uploadStatus === 'idle' && selectedFile && (dissolve || rows && rows.length <= 50))"
                                    :class="[selectedFile && selectedFile && (dissolve || rows && rows.length <= 50) ? 'bg-blue-600 hover:bg-blue-700  focus:ring-blue-500 focus:ring-offset-2' : 'bg-gray-300 cursor-not-allowed', 'inline-flex w-full justify-center rounded-md border border-transparent  px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2  sm:ml-3 sm:w-auto sm:text-sm']"
                                >
                                    <span v-if="uploadStatus === 'idle'">Upload</span>
                                    <span v-if="uploadStatus === 'uploading'">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            class="w-5 h-5 animate-spin"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    @click="cancel"
                                    ref="cancelButtonRef"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
