<script setup lang="ts">
import { ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import { toast } from 'vue3-toastify';

import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

import { useAuthStore } from '../../stores/auth';
import { useProjectStore } from '../../stores/project';

import { DocumentIcon } from '@heroicons/vue/24/outline';

import FileUploadFormGroup from '@/components/inputs/base/FileUploadFormGroup.vue';


const props = withDefaults(defineProps<{
    open?: boolean
}>(), {
    open: true
});

const emit = defineEmits(['cancel', 'done']);

const { t } = useI18n();

const authStore = useAuthStore();
const projectStore = useProjectStore();

const selectedFile = ref<File | null>(null);

const uploadStatus = ref<'idle' | 'uploading' | 'uploaded'>();

function setSelectedFile(files: FileList) {
    selectedFile.value = files[0];
}

async function uploadFile() {
    if (!selectedFile.value) return;
    if (uploadStatus.value !== 'idle') return;

    uploadStatus.value = 'uploading';

    const formData = new FormData();
    formData.append('project_id', projectStore.id!);
    formData.append('file', selectedFile.value, selectedFile.value.name);

    return fetch(
        '/loadKmlKmz',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authStore.user.accessToken}`
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
            const areasArr: number[] = uuidsAndAreasParsed.map(([_, area]: [string, number]) => (area * 0.0001).toFixed(2));

            uploadStatus.value = 'uploaded';
            emit('done', uuidsArr.map((uuid, i) => ({
                uuid: uuid,
                area: areasArr[i],
                activities: null
            })));
            selectedFile.value = null;


            // // get the list of intersecting countries and put it in the store
            // try {
            //     projectStore.getCountriesIso2Codes().then(intersectingCountries => {
            //         const oldCountries = new Set(projectStore.project.project.countries);
            //         if (!setsContainSameValues(oldCountries, intersectingCountries)) {
            //             alert('The list of intersecting countries has changed. Please review the list of countries in the general tab before saving.');
            //             projectStore.project.project.countries = [...intersectingCountries];
            //         }
            //     });
            // } catch (e) {
            //     alert('Error getting the new list of countries');
            // }
            projectStore.updateCountries();

            // alert(`Files uploaded with UUIDs ${uuidsArr}\n\nPlease remember to click "Save and close" otherwise the data will be lost.`);
            toast.success(`</p>${t('inputs.aoi.uploadSuccess', { fileCount: uuidsArr.length })}</p><p>${t('inputs.aoi.reminder')}</p>`, {
                dangerouslyHTMLString: true,
                position: 'top-right',
                autoClose: false
            });

        }).catch(e => {
            // alert('Error uploading the file: ' + e.message);
            toast.error(`${t('inputs.aoi.uploadError', { error: e.message })}`, {
                position: 'top-right',
                autoClose: false
            });
            console.error(e);
            uploadStatus.value = 'idle';
        });
}

function cancel() {
    emit('cancel');
    selectedFile.value = null;
}

watch(() => props.open, open => {
    if (open) uploadStatus.value = 'idle';
});

</script>

<template>
    <TransitionRoot
        as="template"
        :show="open"
    >
        <Dialog
            as="div"
            class="relative z-10"
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
                                    >
                                        {{ t('inputs.aoi.uploadGeoJson') }}
                                    </DialogTitle>
                                    <div class="mt-2">
                                        <div class="text-xs mt-3 text-gray-800 font-light">
                                            <!-- <p class="mb-2">Please upload a file in KML, KMZ of geojson format.</p>
                                            <p class="mb-2">For each feature on the shapefile, one area will be added to the registry.
                                            </p>
                                            <p class="mb-4">IIf possible, the data should be in <span class="font-semibold">geographic projection</span>
                                                (latitude/longitude). If not, the system will try to reproject it.
                                            </p> -->
                                            <div class="text-xs mt-3 text-gray-800 font-light">
                                                <p class="mb-2">
                                                    <i18n-t keypath="inputs.aoi.geoJsonUpload.instruction1">
                                                        <template #fileFormats>
                                                            <span class="font-semibold">
                                                                {{ t('inputs.aoi.geoJsonUpload.fileFormats') }}
                                                            </span>
                                                        </template>
                                                    </i18n-t>
                                                </p>
                                                <p class="mb-2">
                                                    {{ t('inputs.aoi.geoJsonUpload.instruction2') }}
                                                </p>
                                                <p class="mb-4">
                                                    <i18n-t keypath="inputs.aoi.geoJsonUpload.instruction3">
                                                        <template #projectionType>
                                                            <span class="font-semibold">
                                                                {{ t('inputs.aoi.geoJsonUpload.projectionType') }}
                                                            </span>
                                                        </template>
                                                    </i18n-t>
                                                </p>
                                            </div>
                                        </div>

                                        <div class="mt-2 flex rounded-md shadow-sm">
                                            <div class="flex-grow focus-within:z-10">
                                                <FileUploadFormGroup
                                                    :multiple="false"
                                                    :edit="selectedFile === null"
                                                    @upload="setSelectedFile"
                                                    accept=".kml,.kmz,.json,.geojson"
                                                    class="w-full"
                                                >
                                                    <template v-if="selectedFile === null">
                                                        {{ t('inputs.aoi.geoJsonUpload.dropFile') }}
                                                    </template>
                                                    <template v-else>
                                                        <DocumentIcon class="h-6 w-6 mr-1.5 text-gray-600" />
                                                        {{ selectedFile.name }}
                                                    </template>
                                                </FileUploadFormGroup>
                                                <!-- <input
                                                    type="file"
                                                    name="file"
                                                    accept=".kml,.kmz,.json,.geojson"
                                                    class="pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                                    @change="setSelectedFile"
                                                > -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    @click="uploadFile()"
                                    type="button"
                                    :disabled="uploadStatus !== 'idle'"
                                    :class="[selectedFile ? 'bg-blue-600 hover:bg-blue-700  focus:ring-blue-500 focus:ring-offset-2' : 'bg-gray-300 cursor-not-allowed', 'inline-flex w-full justify-center rounded-md border border-transparent  px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2  sm:ml-3 sm:w-auto sm:text-sm']"
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
