<script setup lang="ts">
import { ref } from "vue";
import ConfirmModal from "@/views/ConfirmModal.vue"; // TODO move ConfirmModal to components
import AlertModal from "@/views/AlertModal.vue";

const props = withDefaults(defineProps<{
    // open: boolean,
    title?: string
    successTitle?: string
    errorTitle?: string
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonEnabled?: boolean
    // Using a callback instead of an event because we need to wait for the confirm callback to finish
    confirmCallback: () => Promise<void>
}>(), {
    successTitle: 'Success',
    errorTitle: 'Error',
    confirmButtonEnabled: true,
});

const emit = defineEmits(['cancel', 'complete']);

const showConfirmDialog = ref(false);
const showSuccessDialog = ref(false);
const showErrorDialog = ref(false);

function open() {
    showConfirmDialog.value = true;
}

defineExpose({
    open
});

const succeeded = ref<boolean>();

const waiting = ref(false);

async function confirm() {
    try {
        // will show success dialog if no error is thrown. The success dialog needs to be shown
        // after the confirm dialog is closed, so we will open it in the confirmDialogClosed.
        // This is to avoid issues with the UI (scrolling not working after the second dialog is closed).
        waiting.value = true;
        await props.confirmCallback();
        succeeded.value = true;
        showConfirmDialog.value = false;
    } catch (e) {
        waiting.value = false;
        succeeded.value = false;
        showConfirmDialog.value = false;
        console.error(e);
    }
}
function confirmDialogClosed() {
    // if the user clicked cancel, succeeded will be undefined
    if (typeof succeeded.value === 'undefined') return;

    if (succeeded.value) {
        showSuccessDialog.value = true;
    } else {
        showErrorDialog.value = true;
    }

    // reset succeeded value
    succeeded.value = undefined;
}

function complete() {
    showSuccessDialog.value = false;
    waiting.value = false;
    emit('complete');
}

function cancel() {
    if (waiting.value) return;

    waiting.value = false;

    showConfirmDialog.value = false;
    emit('cancel');
}
</script>

<template>
    <ConfirmModal
        :open="showConfirmDialog"
        :title="title"
        :ok-button-text="confirmButtonText"
        :ok-button-enabled="confirmButtonEnabled && !waiting"
        :cancel-button-text="cancelButtonText"
        :cancel-button-enabled="!waiting"
        @confirm="confirm"
        @cancel="cancel"
        @closed="confirmDialogClosed"
    >
        <slot name="confirm" />
    </ConfirmModal>
    <AlertModal
        :open="showSuccessDialog"
        type="success"
        button-text="OK"
        :title="successTitle!"
        @close="complete"
    >
        <slot name="success" />
    </AlertModal>
    <AlertModal
        :open="showErrorDialog"
        type="error"
        button-text="OK"
        :title="errorTitle!"
        @close="() => { showErrorDialog = false }"
    >
        <slot name="error" />
    </AlertModal>
</template>
