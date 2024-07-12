<script setup lang="ts">
import { multiFactor } from 'firebase/auth';
import { ref } from 'vue';

const props = defineProps({
    multiple: { type: Boolean, default: true },
    edit: { type: Boolean, default: false },
    label: { type: String, default: '' },
    accept: { type: String, default: '' },
});

const emit = defineEmits(['upload'])

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const dragEnter = (asdf) => {
    if (!props.edit) return;
    isDragging.value = true;
};

const dragLeave = () => {
    if (!props.edit) return;
    isDragging.value = false;
};

function handleDrop(event: DragEvent) {
    if (!props.edit) return;

    event.preventDefault();

    isDragging.value = false;

    const files = event.dataTransfer?.files;
    if (files) {
        if (!props.multiple && files.length > 1) {
            alert('Only one file allowed');
            return;
        }

        const acceptedExtensions = props.accept.split(',').map(ext => ext.trim());
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExtension = '.' + file.name.split('.').pop();
            if (!acceptedExtensions.includes(fileExtension)) {
                alert('Invalid file type: ' + file.name);
                return;
            }
        }
        fileInput.value!.files = files;
        handleFiles();
    }
};

function handleFiles() {
    if (!props.edit) return;

    const files = fileInput.value!.files;

    if (!files) return;

    emit('upload', files);
}

const openFileDialog = () => {
    if (!props.edit) return;

    fileInput.value!.click();
};
</script>

<template>
    <div
        @dragover.prevent
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @drop="handleDrop"
        @click="openFileDialog"
        class="w-full h-32 border-2 border-dashed border-gray-400 flex items-center justify-center font-bold text-center rounded-lg"
        :class="[edit ? 'hover:bg-ferm-blue-dark-200 cursor-pointer' : '', edit && isDragging ? 'bg-ferm-blue-dark-200' : '']"
    >
        <slot />
        <!-- {{ label || 'Drop file here or click to upload' }} -->
        <input
            ref="fileInput"
            type="file"
            :multiple="multiple"
            class="hidden"
            @change="handleFiles"
            :accept="accept"
        />
    </div>
</template>