<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadFiles, listProjectFiles, getFileAsBlob, deleteFile } from '@/firebase/storage';
import { makeCoverPhoto } from '@/firebase/functions';

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

const uploadedFiles = ref<{ name: string, path: string, url: string, imageUrl?: string }[]>([]);

async function getUploadedFiles() {
    try {
        const accessToken = await props.getAccessTokenFn();
        const files = await listProjectFiles(props.projectId, props.folder, accessToken);

        // Initialize the array with placeholders to maintain order
        uploadedFiles.value = new Array(files.length);

        files.forEach(async (file, index) => {
            try {
                const blob = await getFileAsBlob(props.projectId, file.path, accessToken);
                const imageUrl = URL.createObjectURL(blob);

                // Place the file at the correct index
                uploadedFiles.value[index] = { ...file, imageUrl };
                console.log(uploadedFiles.value);
                // Trigger a reactive update
                uploadedFiles.value = [...uploadedFiles.value];
            } catch (error) {
                console.error(`Failed to load file ${file.path}:`, error);
            }
        });
    } catch (error) {
        console.error(error);
        alert('Failed to load files: ' + error);
    }
}

onMounted(async () => {
    await getUploadedFiles();
});

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

// async function download(path: string, name: string) {
//     try {
//         const accessToken = await props.getAccessTokenFn();
//         const blob = await getFileAsBlob(props.projectId, path, accessToken);
//         const url = URL.createObjectURL(blob);

//         const link = document.createElement('a');
//         link.href = url;
//         link.download = name;
//         link.click();
//     } catch (error) {
//         console.error(error);
//         alert('Download failed: ' + error);
//     }
// }

const deleting = ref<Set<string>>(new Set())
async function deleteFromStorage(name: string, path: string) {
    if (!props.edit) return;
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        if (deleting.value.has(path)) return;
        deleting.value.add(path);
        try {
            const accessToken = await props.getAccessTokenFn();
            await deleteFile(props.projectId, path, accessToken);
            uploadedFiles.value = uploadedFiles.value.filter(file => file.path !== path);
        } catch (error) {
            alert('Failed to delete file: ' + error);
        } finally {
            deleting.value.delete(path);
        }
    }
}

function notify(nFiles: number) {
    const toastId = toast.loading(`Uploading ${nFiles} file${nFiles > 1 ? 's' : ''}...`);
    return toastId
};

async function makeCover(imgUrl) {
    // TODO this works but trying to resize client side
    // alert('Make cover photo for: ' + path); // DEBUG
    // await makeCoverPhoto(props.projectId, path);

    // resize client side
    const img = new Image();
    img.onload = () => resizeImage(img);
    img.src = imgUrl
}

const canvasRef = ref<HTMLCanvasElement>();
function resizeImage(img, callback) {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const maxWidth = 200; // Maximum width for the resized image
    const maxHeight = 200; // Maximum height for the resized image

    const ctx = canvas.getContext('2d');
    if (!ctx) return

    let width = img.width;
    let height = img.height;

    if (width > height) {
        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    console.log(canvas);

    canvas.toBlob(blob => {
        console.log('Resized image Blob:', blob);
        // Now you can upload the resized image blob to your server
        callback();
    }, "image/jpeg");
}
</script>

<template>
    <canvas
        ref="canvasRef"
        style="display:none;"
    ></canvas>
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription"
    >
        <div class="bg-white text-sm">
            <div class="grid grid-cols-3 gap-2">
                <template v-if="uploadedFiles?.length">
                    <template v-for="(file, i) in uploadedFiles">
                        <div
                            v-if="file?.imageUrl"
                            class="aspect-square rounded-md shadow-md overflow-hidden relative"
                            @click="() => makeCover(file.imageUrl)"
                        >
                            <div
                                v-if="edit"
                                class="absolute cursor-pointer bottom-2 right-2 drop-shadow-md"
                                @click.stop="() => deleteFromStorage(file.name, file.path)"
                            >
                                <TrashIcon
                                    v-if="!deleting.has(file.path)"
                                    class="inline left-auto w-5 h-5 text-ferm-red-dark hover:text-ferm-red-light"
                                />
                                <!-- otherwise show spinning duck -->
                                <svg
                                    v-else
                                    aria-hidden="true"
                                    style="width:1.5rem;height:1.5rem;"
                                    class="spinner"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642
                                        10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                            </div>
                            <img
                                v-if="file?.imageUrl"
                                :src="file.imageUrl"
                                alt="File Image"
                                class="w-full h-full object-cover aspect-square"
                            />
                        </div>
                        <div
                            v-else
                            class="aspect-square"
                        >
                            <!-- show a spinning loader -->
                            <div class="w-full h-full flex items-center justify-center shadow-md">
                                <svg
                                    aria-hidden="true"
                                    style="width:3.5rem;height:3.5rem;"
                                    class="spinner"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                            </div>
                        </div>
                        <!-- <div
                            :class="['cursor-pointer', edit ? 'mr-3' : '']"
                            @click="() => download(file.path, file.name)"
                        >
                            <ArrowDownTrayIcon class="inline left-auto w-5 h-5 hover:text-ferm-blue-dark-800" />
                        </div> -->
                        <!-- <div
                        v-if="edit"
                        class="cursor-pointer"
                        @click="() => deleteFromStorage(file.name, file.path)"
                    >
                        <TrashIcon class="inline left-auto w-5 h-5 text-ferm-red-dark hover:text-ferm-red-light" />
                    </div> -->
                        <!-- </div> -->
                    </template>
                </template>
                <Upload
                    class="aspect-square w-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer font-bold text-center hover:bg-ferm-blue-dark-200 rounded-md p-6"
                    :edit="edit"
                    :multiple="multiple"
                    :files="uploadedFiles"
                    @startUpload="upload"
                    @done="getUploadedFiles"
                    @delete="deleteFromStorage"
                />
            </div>
        </div>
        <!-- <div v-else-if="!edit">
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
