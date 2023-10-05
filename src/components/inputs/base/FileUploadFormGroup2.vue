<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadFiles, listFiles, getFileAsBlob, deleteFile } from '@/firebase/storage';


import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/solid';

import baseProps from '../formGroupProps';
import FormGroup from '../FormGroup.vue';


const progress = ref(0);

const props = defineProps({
    ...baseProps,
    ...{
        folder: { type: String, required: true }
    }
});

const uploadedFiles = ref<{ name: string, path: string }[]>([]);

async function getUploadedFiles() {
    try {
        uploadedFiles.value = await listFiles(props.folder);
    } catch (error) {
        console.error(error);
        alert('Failed to load files: ' + error);
    }
}

onMounted(async () => {
    await getUploadedFiles();
});

function upload(files: FileList) {
    uploadFiles(props.folder, Array.from(files), (uploadProgress) => {
        progress.value = uploadProgress;
    }).then(async () => {
        console.log('Upload complete');
        progress.value = 0;
        await getUploadedFiles();
    }).catch((error) => {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error);
    });
}

async function download(path: string, name: string) {
    try {
        const blob = await getFileAsBlob(path);
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
    } catch (error) {
        console.error(error);
        alert('Download failed: ' + error);
    }
}

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref<boolean>(false);

const dragEnter = () => {
    isDragging.value = true;
};

const dragLeave = () => {
    isDragging.value = false;
};

function handleDrop(event: DragEvent) {
    event.preventDefault();

    isDragging.value = false;

    const files = event.dataTransfer?.files;
    if (files) {
        fileInput.value!.files = files;
        handleFiles();
    }
};

function handleFiles() {
    const files = fileInput.value!.files;

    if (!files) return;

    // find the files that have already been uploaded
    const uploadedFileNames = uploadedFiles.value.map(file => file.name);
    const filesAlreadyUploaded = Array.from(files).filter(file => uploadedFileNames.includes(file.name));

    if (filesAlreadyUploaded.length) {
        const confirmMessage = `The following files have already been uploaded:\n${filesAlreadyUploaded.map(file => file.name).join('\n')}\n\nDo you want to upload them again?`;
        if (!confirm(confirmMessage)) {
            return;
        }
    }

    upload(files);
}

const openFileDialog = () => {
    fileInput.value!.click();
};

async function deleteFromStorage(name: string, path: string) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        try {
            await deleteFile(path);
            await getUploadedFiles();
        } catch (error) {
            alert('Failed to delete file: ' + error);
        }
    }
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <div v-if="edit"
             @dragover.prevent
             @dragenter="dragEnter"
             @dragleave="dragLeave"
             @drop="handleDrop"
             @click="openFileDialog"
             class="w-full h-32 mb-6 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer font-bold text-center hover:bg-ferm-blue-dark-200 rounded-lg"
             :class="isDragging ? 'bg-ferm-blue-dark-200' : ''">
            Drop {{ uploadedFiles && uploadedFiles.length ? 'more' : '' }} files here or click to upload
            <input
                ref="fileInput"
                type="file"
                multiple
                class="hidden"
                @change="handleFiles"
            />
        </div>

        <div v-if="uploadedFiles.length"
             class="overflow-hidden bg-white shadow sm:rounded-md text-sm border max-h-36 overflow-y-auto">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="file in uploadedFiles"
                    :key="file.name"
                    class="px-3 py-2 sm:px-6">
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex-grow">
                            {{ file.name }}
                        </div>
                        <div class="mr-3 cursor-pointer"
                             @click="() => download(file.path, file.name)">
                            <ArrowDownTrayIcon class="inline left-auto w-5 h-5 hover:text-ferm-blue-dark-800" />
                        </div>
                        <div class="cursor-pointer"
                             @click="() => deleteFromStorage(file.name, file.path)">
                            <TrashIcon class="inline left-auto w-5 h-5 text-ferm-red-dark hover:text-ferm-red-light" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else-if="!edit">
            <p class="text-gray-400 italic">No files uploaded yet</p>
        </div>
        <template v-slot:info v-if="$slots.info">
            <slot name="info" />
        </template>
    </FormGroup>
</template>
