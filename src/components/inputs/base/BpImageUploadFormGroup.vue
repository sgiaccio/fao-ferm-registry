<script setup lang="ts">
import * as vue from 'vue';
import { getStorage, ref, getBlob } from 'firebase/storage';

import baseProps from "../formGroupProps"
import FormGroup from '../FormGroup.vue'

import { useAuthStore } from '@/stores/auth';


const authStore = useAuthStore();

const selectedFile = vue.ref<File | null>(null);
const uploadStatus = vue.ref<'idle' | 'uploading' | 'uploaded'>('idle');

const props = defineProps({
    ...baseProps,
    ...{
        bucketUrl: { type: String }, // firebase sets default bucket if undefined
        bpId: { type: String, required: true },
        modelValue: { type: String }
    }
});

const storage = getStorage(undefined, props.bucketUrl);

async function loadFile(src: string, maxRetries = 5, pause = 2000): Promise<Blob> {
    let tries = 0;
    let blob: Blob;

    return new Promise(async (resolve, reject) => {
        while (!blob && tries++ < maxRetries) {
            try {
                blob = await getBlob(ref(storage, src));
                resolve(blob);
            } catch (error) {
                if (tries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, pause));
                }
            }
        }
        reject(new Error('Could not load image'));
    });
}

const thumbnailUrl = vue.ref();

async function loadThumbnail(maxRetries = 1, pause = 2000) {
    revokeObjectURL();
    try {
        const imgBlob = await loadFile(`${props.bpId}/images/thumbnail/thumbnail.jpg`, maxRetries, pause);
        const urlCreator = window.URL || window.webkitURL;
        thumbnailUrl.value = urlCreator.createObjectURL(imgBlob);
    } catch (error) {
        thumbnailUrl.value = null;
    }
}

// async function loadThumbnail(maxRetries = 1, pause = 2000) {
//     // create url parameters
//     const params = new URLSearchParams({
//         'bp_id': props.bpId
//     });

//     return fetch('https://europe-west3-fao-ferm.cloudfunctions.net/get_bp_thumbnail?' + params, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${authStore!.user!.accessToken}`,
//         },
//     }).then(async response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.blob();
//     }).then(imgBlob => {
//         debugger;
//         thumbnailUrl.value = URL.createObjectURL(imgBlob);
//     }).catch(error => {
//         console.error(error); // DEBUG
//     });
// }


vue.onMounted(async () => {
    loadThumbnail();
});


function revokeObjectURL() {
    if (thumbnailUrl.value) {
        URL.revokeObjectURL(thumbnailUrl.value);
    }
}

vue.onUnmounted(revokeObjectURL);

function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
}

async function uploadToBucket(bpId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bp_id', bpId);

    const accessToken = await authStore!.getIdToken();
    return fetch('https://europe-west3-fao-ferm.cloudfunctions.net/upload_bp_image', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }).catch(error => {
        console.error(error); // DEBUG
    });
}


function uploadFile() {
    if (uploadStatus.value !== 'idle') return;

    const uploadTask = uploadToBucket(props.bpId, selectedFile.value!);

    uploadStatus.value = 'uploading';
    uploadTask.then(async () => {
        selectedFile.value = null;
        uploadStatus.value = 'uploaded';
        await loadThumbnail(20);
    }).catch(_error => {
        uploadStatus.value = 'idle';
    });
}

// async function listFiles(folder: string) {
//     const dirRef = ref(storage, folder);
//     return listAll(dirRef);
// }

async function deleteFile() {
    const params = new URLSearchParams({
        'bp_id': props.bpId
    });

    const accessToken = await authStore!.getIdToken();
    return fetch('https://europe-west3-fao-ferm.cloudfunctions.net/delete_bp_image?' + params, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    }).then(async response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }).catch(error => {
        console.error(error);
    }).finally(() => {
        loadThumbnail();
        uploadStatus.value = 'idle';
    });
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <div v-if="!thumbnailUrl">
            <label for="file"
                   class="block text-sm font-medium text-gray-700" />
            <div class="border-gray-300 mt-1 flex rounded-md shadow-sm">
                <div class="flex-grow focus-within:z-10">
                    <input v-if="edit"
                           type="file"
                           name="file"
                           class="py-2 pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                           @change="setSelectedFile">
                    <div v-else>
                        {{ selectedFile?.name }}
                    </div>
                </div>
                <!-- Upload button -->
                <button v-if="edit"
                        type="button"
                        class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 focus:outline-none"
                        :class="['idle' === 'idle' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-default']"
                        @click="uploadFile">
                    <!-- Not uploading -->
                    <svg v-if="uploadStatus === 'idle'"
                         xmlns="http://www.w3.org/2000/svg"
                         :class="[selectedFile ? 'text-red-600 animate-pulse' : 'text-gray-400', 'h-5 w-5']"
                         viewBox="0 0 20 20"
                         fill="currentColor"
                         d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                         clip-rule="evenodd">
                        <path fill-rule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                              clip-rule="evenodd"></path>
                    </svg>
                    <!-- Uploading -->
                    <svg v-else
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 20 20"
                         fill="currentColor"
                         class="w-5 h-5 animate-spin">
                        <path fill-rule="evenodd"
                              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                              clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <!-- Show reminder if file was chosen -->
            <!-- <div v-if="selectedFile"
                 class="text-red-500 text-sm">Remember to click the upload button before saving.</div> -->
        </div>
        <div v-else>
            <img v-if="thumbnailUrl"
                 :src="thumbnailUrl">
            <button v-if="edit"
                    @click="deleteFile()"
                    type="button"
                    class="rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Delete</button>
        </div>
    </FormGroup>
</template>
