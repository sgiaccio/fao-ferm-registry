<script setup lang="ts">
import * as vue from 'vue';
import { getStorage, ref, uploadBytes, listAll, deleteObject, getBlob } from 'firebase/storage';

import baseProps from "../formGroupProps"
import FormGroup from '../FormGroup.vue'


const selectedFile = vue.ref<File | null>(null);
const uploadStatus = vue.ref<'idle' | 'uploading' | 'uploaded'>('idle');

const props = defineProps({
    ...baseProps,
    ...{
        bucketUrl: { type: String }, // firebase sets default bucket if undefined
        folder: { type: String },
        modelValue: { type: String }
    }
});

async function loadFile(src: string, maxRetries = 5, pause = 2000): Promise<Blob> {
    let tries = 0;
    let blob: Blob;

    return new Promise(async (resolve, reject) => {
        while (!blob && tries++ < maxRetries) {
            console.debug('trying...');
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
    try {
        const imgBlob = await loadFile(`${props.folder}/thumbnail/thumbnail.jpg`, maxRetries, pause);
        const urlCreator = window.URL || window.webkitURL;
        thumbnailUrl.value = urlCreator.createObjectURL(imgBlob);
    } catch (error) {
        thumbnailUrl.value = null;
    }
}

vue.onMounted(async () => {
    getFiles();
    loadThumbnail();
});


function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
}

const storage = getStorage(undefined, props.bucketUrl);

function uploadFile() {
    if (uploadStatus.value !== 'idle') return;

    const storageRef = ref(storage, `${props.folder}/${selectedFile.value!.name}`);
    const uploadTask = uploadBytes(storageRef, selectedFile.value!);

    uploadStatus.value = 'uploading';
    uploadTask.then(async _snapshot => {
        getFiles();
        selectedFile.value = null;
        uploadStatus.value = 'uploaded';
        await loadThumbnail(5);
    }).catch(_error => {
        uploadStatus.value = 'idle';
    });
}

async function listFiles(folder: string) {
    const dirRef = ref(storage, folder);
    return listAll(dirRef);
}

const fileName = vue.ref<string | null>();

async function getFiles() {
    const fList = await listFiles(props.folder!);
    fileName.value = fList.items && fList.items.length && fList.items[0].name || null; // only one file can be uploaded
    // emit('update:modelValue', fileName.value);
}

function deleteFile() {
    if (!confirm(`Are you sure you want to delete the file ${fileName.value}`)) return;
    const fRef = ref(storage, `${props.folder}/${fileName.value}`);
    deleteObject(fRef)
        .catch(_ => alert('Error deleting the file'))
        .finally(() => {
            getFiles();
            loadThumbnail(5);
        });
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <div v-if="!fileName">
            <label for="file"
                   class="block text-sm font-medium text-gray-700" />
            <div class="dark:text-zinc-400 border-gray-300 dark:bg-zinc-900 mt-1 flex rounded-md shadow-sm">
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
                        @click="uploadFile()">
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
            <div v-if="selectedFile"
                 class="text-red-500 text-sm">Remember to click the upload button before saving.</div>
        </div>
        <div v-else
             class="dark:text-white">
            <img v-if="thumbnailUrl"
                 :src="thumbnailUrl">
            <button v-if="edit"
                    @click="deleteFile()"
                    type="button"
                    class="rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Delete</button>
        </div>
    </FormGroup>
</template>
