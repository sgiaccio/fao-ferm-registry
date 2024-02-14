<script setup lang="ts">
import { nextTick } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue';


withDefaults(defineProps<{
    open: boolean
    type?: 'success' | 'error' | 'warning' | 'info'
    title?: string
    okButtonText?: string
    okButtonEnabled?: boolean,
    cancelButtonText?: string
    onConfirm: () => void,
    onCancel: () => void
}>(), {
    open: false,
    okButtonText: 'OK',
    okButtonEnabled: true,
    cancelButtonText: 'Cancel'
});

const emit = defineEmits(['closed', 'cancel']); // TODO: add 'close' event

// 2x closing is needed because of the 2x TransitionChild and 1 in TransitionRoot.
// Setting after-leave in TransitionRoot only, causes it to be called three times. I don't know why.
const closingCount = ref(0);

function closing() {
    closingCount.value++;
    if (closingCount.value === 3) {
        closingCount.value = 0;
        nextTick(() => {
            emit('closed');
        });
    }
}

function cancel() {
    emit('cancel');
}
</script>

<template>
    <TransitionRoot as="template"
                    :show="open"
                    @after-leave="closing">
        <Dialog as="div"
                class="relative z-10">
            <TransitionChild as="template"
                             enter="ease-out duration-300"
                             enter-from="opacity-0"
                             enter-to="opacity-100"
                             leave="ease-in duration-200"
                             leave-from="opacity-100"
                             leave-to="opacity-0"
                             @after-leave="closing">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template"
                                     enter="ease-out duration-300"
                                     enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                     enter-to="opacity-100 translate-y-0 sm:scale-100"
                                     leave="ease-in duration-200"
                                     leave-from="opacity-100 translate-y-0 sm:scale-100"
                                     leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                     @after-leave="closing">
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div class="sm:flex sm:items-start">
                                <template v-if="type">
                                    <div v-if="type === 'success'"
                                         class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-green-100">
                                        <CheckIcon class="h-6 w-6 text-green-600"
                                                   aria-hidden="true" />
                                    </div>
                                    <div v-else-if="type === 'error'"
                                         class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-red-100">
                                        <ExclamationTriangleIcon class="h-6 w-6 text-red-600"
                                                                 aria-hidden="true" />
                                    </div>
                                    <div v-else-if="type === 'warning'"
                                         class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-yellow-100">
                                        <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600"
                                                                 aria-hidden="true" />
                                    </div>
                                    <div v-else-if="type === 'info'"
                                         class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-yellow-100">
                                        <InformationCircleIcon class="h-6 w-6 text-yellow-600"
                                                               aria-hidden="true" />
                                    </div>
                                </template>

                                <div :class="[type ? 'sm:ml-4 sm:flex-grow' : '', 'mt-12 text-center sm:mt-0 sm:text-left sm:flex-grow']">
                                    <DialogTitle v-if="title"
                                                 as="h3"
                                                 class="sm:mt-2 font-akrobat text-3xl font-bold _leading-6 text-ferm-blue-light-800">{{ title }}</DialogTitle>
                                    <div class="mt-2">
                                        <slot />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button type="button"
                                        :disabled="!okButtonEnabled"
                                        :class="[okButtonEnabled ? 'bg-ferm-blue-dark-700 hover:bg-ferm-blue-dark-600' : 'bg-gray-400', 'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto']"
                                        @click="onConfirm">{{ okButtonText }}</button>
                                <button type="button"
                                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        @click="cancel()"
                                        ref="cancelButtonRef">{{ cancelButtonText }}</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
