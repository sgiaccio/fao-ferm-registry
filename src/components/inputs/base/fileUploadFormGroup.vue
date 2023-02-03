<script setup lang="ts">
import * as vue from 'vue';
import { getStorage, ref, uploadBytes, listAll, deleteObject } from 'firebase/storage';

import { useProjectStore } from '../../../stores/project';

import baseProps from "../formGroupProps"


const store = useProjectStore();


const selectedFile = vue.ref<File | null>(null);
const uploadStatus = vue.ref<'idle' | 'uploading' | 'uploaded'>('idle');


const props = defineProps({
    ...baseProps,
    ...{
        bucketUrl: { type: String }, // firebase sets default bucket if undefined
        modelValue: { type: String }
    }
});

const emit = defineEmits(['update:modelValue'])

function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
}

const storage = getStorage(undefined, props.bucketUrl);

function uploadFile(projectId: string | null) {
    if (projectId === null) return

    if (uploadStatus.value !== 'idle') return;

    const storageRef = ref(storage, `${projectId}/documents/${selectedFile.value!.name}`);
    const uploadTask = uploadBytes(storageRef, selectedFile.value!);

    uploadStatus.value = 'uploading';
    uploadTask.then(snapshot => {
        getFiles(projectId);
        selectedFile.value = null;
        uploadStatus.value = 'uploaded';
    }).catch(error => {
        uploadStatus.value = 'idle';
    });
}

async function listFiles(projectId: string) {
    const dirRef = ref(storage, `${projectId}/documents/`);
    return listAll(dirRef);
}

const fileName = vue.ref<string | null>();

async function getFiles(id: string) {
    const fList = await listFiles(id);
    fileName.value = fList.items && fList.items.length && fList.items[0].name || null; // only one file can be uploaded
    emit('update:modelValue', fileName.value);
}

function deleteFile(projectId: string | null, fileName: string) {
    if (projectId === null) return;

    if (!confirm(`Are you sure you want to delete the file ${fileName}`)) return;
    const fRef = ref(storage, `${projectId}/documents/${fileName}`);
    deleteObject(fRef)
    // .then(() => {
    //     getFiles(projectId);
    // })
    .catch(_ => alert('Error deleting the file'))
    .finally(() => getFiles(projectId));
}

vue.watch(() => store.id as string, async id => {
    getFiles(id);
});
</script>

<template>
    <div v-if="!fileName">
        <div>Upload one initiative document</div>
        <label for="file" class="block text-sm font-medium text-gray-700" />
        <div class="mt-1 flex rounded-md shadow-sm">
            <div class="flex-grow focus-within:z-10">
                <input
                    v-if="edit" type="file" name="file"
                    class="pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    @change="setSelectedFile">
                <div v-else>
                    {{selectedFile?.name}}
                </div>
            </div>
            <button
                v-if="edit"
                type="button"
                class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 focus:outline-none"
                :class="['idle' === 'idle' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-default']"
                @click="uploadFile(store.id)">
                <svg 
                    v-if="uploadStatus === 'idle'" xmlns="http://www.w3.org/2000/svg"
                    :class="[selectedFile ? 'text-red-600 animate-pulse' : 'text-gray-400', 'h-5 w-5']"
                    viewBox="0 0 20 20" fill="currentColor"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd">
                    <path
                        fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"></path>
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5 animate-spin">
                    <path
                        fill-rule="evenodd"
                        d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <div
            v-if="selectedFile"
            class="text-red-500 text-sm">Remember to click the upload button before saving.</div>
    </div>
    <div
        v-else-if="edit"
        class="dark:text-white">
        Initiative file: {{ fileName }}
        <span @click="deleteFile(store.id, fileName!)">[delete]</span>
    </div>
</template>
