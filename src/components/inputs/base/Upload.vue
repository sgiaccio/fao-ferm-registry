<script setup lang="ts">
import { ref, withDefaults, defineProps } from 'vue';


const props = withDefaults(defineProps<{
    files: { name: string, path: string }[]
    multiple?: boolean
    edit?: boolean
}>(), {
    edit: false,
    files: () => [],
    multiple: false
});

const emit = defineEmits(['startUpload', 'download', 'delete']);

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref<boolean>(false);

const openFileDialog = () => {
    fileInput.value!.click();
};

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
    if (!props.edit) return;

    const files = fileInput.value!.files;
    if (files?.length) {
        emit('startUpload', files);
    }
}
</script>

<template>
    <div
        v-if="edit && (multiple || files.length === 0)"
        @dragover.prevent
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @drop="handleDrop"
        @click="openFileDialog"
        :class="isDragging ? 'bg-ferm-blue-dark-200' : ''"
    >
        <i18n-t keypath="inputs.upload.uploadPrompt">
            <template #fileText>
                {{
                    files?.length
                        ? $t('inputs.upload.fileText.more')
                        : $t(`inputs.upload.fileText.${multiple ? 'multiple' : 'single'}`)
                }}
            </template>
        </i18n-t>
        <input
            ref="fileInput"
            type="file"
            :multiple="multiple"
            class="hidden"
            @change="handleFiles"
        />
    </div>
</template>
