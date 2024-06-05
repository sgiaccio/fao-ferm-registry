<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { uploadFiles, listProjectFiles, getFileAsBlob, deleteFile } from '@/firebase/storage';
import { makeCoverPhoto } from '@/firebase/functions';

import { toast } from 'vue3-toastify';

import baseProps from '../formGroupProps';

import Upload from './Upload.vue';
import FormGroup from '../FormGroup.vue';

import { TrashIcon } from '@heroicons/vue/24/solid';


const props = defineProps({
    ...baseProps,
    ...{
        modelValue: { type: String },
        projectId: { type: String, required: true },
        folder: { type: String, required: true },
        multiple: { type: Boolean, default: true },
        getAccessTokenFn: { type: Function, required: true },
    }
});

const emit = defineEmits(['update:modelValue']);

const uploadedFiles = ref<{ name: string, path: string, imageUrl?: string }[]>([]);

async function getUploadedFiles() {
    try {
        const accessToken = await props.getAccessTokenFn();
        uploadedFiles.value = await listProjectFiles(props.projectId, props.folder, accessToken);

        // Load each file in parallel
        uploadedFiles.value.forEach(async (file: { name: string, path: string }, index: number) => {
            try {
                const blob = await getFileAsBlob(props.projectId, file.path, accessToken);
                const imageUrl = URL.createObjectURL(blob);

                // Place the file at the correct index
                uploadedFiles.value[index] = { ...file, imageUrl };
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

onUnmounted(() => {
    // Revoke all object URLs
    uploadedFiles.value.forEach(file => {
        if (file.imageUrl) {
            URL.revokeObjectURL(file.imageUrl);
        }
    });
});

function tryReduceImageSize(file: File) {
    return new Promise<File>((resolve, reject) => {
        if (file.size > 1024 * 1024) { // Check if the file size is greater than 1MB
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const image = new Image();
            image.src = URL.createObjectURL(file);

            image.onload = () => {
                // Calculate the new dimensions while maintaining the aspect ratio
                const maxDim = 1000;
                let width = image.width;
                let height = image.height;

                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                // Set the canvas dimensions to the new size
                canvas.width = width;
                canvas.height = height;

                // Draw the image onto the canvas with the new dimensions
                ctx?.drawImage(image, 0, 0, width, height);

                // Convert the canvas to a Blob and then a File
                canvas.toBlob(blob => {
                    if (blob) {
                        // Check the new image size, if still above 1MB, throw an error
                        if (blob.size > 1024 * 1024) {
                            reject(new Error('Image size is still above 1MB'));
                        } else {
                            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        }
                    } else {
                        reject(new Error('Canvas is empty'));
                    }
                }, 'image/jpeg', 0.7);
            };

            image.onerror = () => {
                reject(new Error('Image load error'));
            };
        } else {
            resolve(file); // If the file size is already below 1MB, resolve with the original file
        }
    });
}

async function upload(origFiles: FileList) {
    // make sure that all files are images
    if (Array.from(origFiles).some(file => !file.type.startsWith('image/'))) {
        toast.error('Only images are allowed');
        return;
    }

    // Try to reduce the size of the images if they are above 1MB - do in parallel
    // First check if any of the files are above 1MB
    if (Array.from(origFiles).some(file => file.size > 1024 * 1024)) {
        toast.info('Image size must be below 1MB, reducing size...');
    }

    const promises = Array.from(origFiles).map(file => tryReduceImageSize(file));
    const files = await Promise.all(promises);

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

const deleting = ref<Set<string>>(new Set())
async function deleteFromStorage(name: string, path: string) {
    if (!props.edit) return;

    if (confirm('Are you sure you want to delete this image?')) {
        if (deleting.value.has(path)) return;

        const toastId = toast.loading('Deleting image...');

        deleting.value.add(path);
        try {
            const accessToken = await props.getAccessTokenFn();
            await deleteFile(props.projectId, path, accessToken);
            uploadedFiles.value = uploadedFiles.value.filter(file => file.path !== path);

            // if the thumbnail was created by these image, remove it
            if (path === props.modelValue) {
                emit('update:modelValue', undefined);
            }

            toast.update(toastId, {
                render: 'Image deleted',
                autoClose: true,
                closeOnClick: true,
                closeButton: true,
                type: toast.TYPE.SUCCESS,
                isLoading: false,
            });
        } catch (error) {
            alert('Failed to delete file: ' + error);
            toast.update(toastId, {
                render: 'Failed to delete image',
                autoClose: false,
                closeOnClick: true,
                closeButton: true,
                type: toast.TYPE.ERROR,
                isLoading: false,
            });
        } finally {
            deleting.value.delete(path);
        }
    }
}

function notify(nFiles: number) {
    const toastId = toast.loading(`Uploading ${nFiles} file${nFiles > 1 ? 's' : ''}...`);
    return toastId
};

async function makeCover(path: string) {
    if (path === props.modelValue) return;
    
    const toastId = toast.loading('Creating the thumbnail...');
    try {
        await makeCoverPhoto(props.projectId, path);
        emit('update:modelValue', path);
        toast.update(toastId, {
            render: 'Thumbnail created - please save to apply changes',
            autoClose: true,
            closeOnClick: true,
            closeButton: true,
            type: toast.TYPE.SUCCESS,
            isLoading: false,
        });
    } catch (error) {
        console.error('Failed to create thumbnail:', error);
        toast.update(toastId, {
            render: 'Failed to create thumbnail',
            autoClose: false,
            closeOnClick: true,
            closeButton: true,
            type: toast.TYPE.ERROR,
            isLoading: false,
        });
    }
}
</script>

<template>
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription"
    >
        <div class="bg-white text-sm">
            <div class="grid grid-cols-3 gap-2">
                <template v-if="uploadedFiles?.length">
                    <div
                        v-for="file in uploadedFiles"
                        class="rounded-md shadow-md overflow-hidden"
                        :class="{ 'border-2 border-ferm-blue-dark-800': file?.path === props.modelValue, 'cursor-pointer hover:shadow-lg': edit && file?.path !== props.modelValue }"
                    >
                        <div
                            v-if="file?.imageUrl"
                            class="aspect-square relative"
                            @click="() => makeCover(file.path)"
                        >
                            <div
                                v-if="edit"
                                class="absolute bottom-2 right-2 drop-shadow-md"
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
                    </div>
                </template>
                <Upload
                    class="aspect-square w-full border border-dashed border-gray-400 flex items-center justify-center cursor-pointer font-bold text-center hover:bg-ferm-blue-dark-200 rounded-md p-6"
                    :edit="edit"
                    :multiple="multiple"
                    :files="uploadedFiles"
                    @startUpload="upload"
                    @done="getUploadedFiles"
                    @delete="deleteFromStorage"
                />
            </div>
        </div>
        <template
            v-slot:info
            v-if="$slots.info"
        >
            <slot name="info" />
        </template>
    </FormGroup>
</template>
