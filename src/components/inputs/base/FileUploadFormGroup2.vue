<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadFiles, listProjectFiles, getFileAsBlob, deleteFile } from '@/firebase/storage';

import { toast } from 'vue3-toastify';

import baseProps from '../formGroupProps';

import Upload from './Upload.vue';
import FormGroup from '../FormGroup.vue';

import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/solid';


const props = defineProps({
    ...baseProps,
    ...{
        projectId: { type: String, required: true },
        folder: { type: String, required: true },
        multiple: { type: Boolean, default: true },
        getAccessTokenFn: { type: Function, required: true },
    }
});

const uploadedFiles = ref<{ name: string, path: string }[]>([]);

async function getUploadedFiles() {
    try {
        const accessToken = await props.getAccessTokenFn();
        uploadedFiles.value = await listProjectFiles(props.projectId, props.folder, accessToken);
    } catch (error) {
        console.error(error);
        alert('Failed to load files: ' + error);
    }
}

onMounted(async () => {
    await getUploadedFiles();
});

// const progress = ref(0);
// function upload(files: FileList) {
//     uploadFiles(props.folder, Array.from(files), (uploadProgress) => {
//         progress.value = uploadProgress;
//     }).then(async () => {
//         console.log('Upload complete');
//         progress.value = 0;
//         await getUploadedFiles();
//     }).catch((error) => {
//         console.error('Upload failed:', error);
//         alert('Upload failed: ' + error);
//     });
// }

// const uploadProgress = ref(0);

async function upload(files: FileList) {
    const toastId = notify(files.length);

    try {
        const accessToken = await props.getAccessTokenFn();
        const onUploadComplete = () => {
            toast.update(toastId, {
                render: `Upload complete`,
                autoClose: true,
                closeOnClick: true,
                closeButton: true,
                type: toast.TYPE.SUCCESS,
                isLoading: false,
            });
        };
        await uploadFiles(props.projectId, props.folder, Array.from(files), accessToken, () => { }, onUploadComplete);
        await getUploadedFiles();
    } catch (error) {
        console.error('Upload failed:', error);
        toast.update(toastId, {
            render: 'Upload failed',
            autoClose: false,
            closeOnClick: true,
            closeButton: true,
            type: toast.TYPE.ERROR,
            isLoading: false,
        });
    }
}

async function download(path: string, name: string) {
    try {
        const accessToken = await props.getAccessTokenFn();
        const blob = await getFileAsBlob(props.projectId, path, accessToken);
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

async function deleteFromStorage(name: string, path: string) {
    if (!props.edit) return;
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        try {
            const accessToken = await props.getAccessTokenFn();
            await deleteFile(props.projectId, path, accessToken);
            await getUploadedFiles();
        } catch (error) {
            alert('Failed to delete file: ' + error);
        }
    }
}

function notify(nFiles: number) {
    // const toastId = toast(`Uploading ${nFiles} file${nFiles > 1 ? 's' : ''}...`, {
    //     progress: 0,
    //     autoClose: true,
    // });

    const toastId = toast.loading(`Uploading ${nFiles} file${nFiles > 1 ? 's' : ''}...`,
        // { progress: 0, autoClose: true, type: toast.TYPE.DEFAULT }
    );
    console.log('toastId', toastId);
    return toastId
};
</script>

<template>
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription"
    >
        <Upload
            :edit="edit"
            :multiple="multiple"
            :files="uploadedFiles"
            @startUpload="upload"
            @done="getUploadedFiles"
            @delete="deleteFromStorage"
            class="w-full h-32 mb-6 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer font-bold text-center hover:bg-ferm-blue-dark-200 rounded-lg"
        />
        <div
            v-if="uploadedFiles?.length"
            class="overflow-hidden bg-white shadow sm:rounded-md text-sm border max-h-36 overflow-y-auto"
        >
            <ul
                role="list"
                class="divide-y divide-gray-200"
            >
                <li
                    v-for="file in uploadedFiles"
                    :key="file.name"
                    class="px-3 py-2 sm:px-6"
                >
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex-grow">
                            {{ file.name }}
                        </div>
                        <div
                            :class="['cursor-pointer', edit ? 'mr-3' : '']"
                            @click="() => download(file.path, file.name)"
                        >
                            <ArrowDownTrayIcon class="inline left-auto w-5 h-5 hover:text-ferm-blue-dark-800" />
                        </div>
                        <div
                            v-if="edit"
                            class="cursor-pointer"
                            @click="() => deleteFromStorage(file.name, file.path)"
                        >
                            <TrashIcon class="inline left-auto w-5 h-5 text-ferm-red-dark hover:text-ferm-red-light" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else-if="!edit">
            <p class="text-gray-400 italic">No files uploaded yet</p>
        </div>

        <!-- <div v-if="edit && (multiple || uploadedFiles.length === 0)"
             @dragover.prevent
             @dragenter="dragEnter"
             @dragleave="dragLeave"
             @drop="handleDrop"
             @click="openFileDialog"
             class="w-full h-32 mb-6 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer font-bold text-center hover:bg-ferm-blue-dark-200 rounded-lg"
             :class="isDragging ? 'bg-ferm-blue-dark-200' : ''">
            Drop {{ uploadedFiles && uploadedFiles.length ? 'more' : '' }} file{{ multiple ? 's' : '' }} here or click to upload
            <input ref="fileInput"
                   type="file"
                   :multiple="multiple"
                   class="hidden"
                   @change="handleFiles" />
        </div>

        <div v-if="uploadedFiles.length"
             class="overflow-hidden bg-white shadow sm:rounded-md text-sm border max-h-36 overflow-y-auto">
            <ul role="list"
                class="divide-y divide-gray-200">
                <li v-for="file in uploadedFiles"
                    :key="file.name"
                    class="px-3 py-2 sm:px-6">
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex-grow">
                            {{ file.name }}
                        </div>
                        <div :class="['cursor-pointer', edit ? 'mr-3' : '']"
                             @click="() => download(file.path, file.name)">
                            <ArrowDownTrayIcon class="inline left-auto w-5 h-5 hover:text-ferm-blue-dark-800" />
                        </div>
                        <div v-if="edit"
                             class="cursor-pointer"
                             @click="() => deleteFromStorage(file.name, file.path)">
                            <TrashIcon class="inline left-auto w-5 h-5 text-ferm-red-dark hover:text-ferm-red-light" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else-if="!edit">
            <p class="text-gray-400 italic">No files uploaded yet</p>
        </div> -->
        <template
            v-slot:info
            v-if="$slots.info"
        >
            <slot name="info" />
        </template>
    </FormGroup>
</template>
