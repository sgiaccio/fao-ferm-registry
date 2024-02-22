<script setup lang="ts">
import { ref, nextTick } from 'vue';

import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';


const open = ref(false);
const type = ref<string>('info');
const title = ref<string>('');
const message = ref<string>('');
let closedCallback = ref<(() => void)>(() => {});

function show(t: string, m: string, ty: string = 'info', options: any = {}) {
    type.value = ty;
    open.value = true;
    title.value = t;
    message.value = m;
    closedCallback.value = options.onClose || (() => {});
}

defineExpose({
    show,
    closedCallback
});

function close() {
    open.value = false;
}

function closed() {
    type.value = 'info';
    title.value = '';
    message.value = '';
    closedCallback.value();
}
</script>

<template>
    <TransitionRoot
        as="template"
        :show="open"
        @after-leave="closed">
        <Dialog
            as="div"
            class="relative z-50">
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                            <div>
                                <div
                                    v-if="type === 'success'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <CheckIcon
                                        class="h-6 w-6 text-green-600"
                                        aria-hidden="true" />
                                </div>
                                <div
                                    v-else-if="type === 'error'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <ExclamationTriangleIcon
                                        class="h-6 w-6 text-red-600"
                                        aria-hidden="true" />
                                </div>
                                <div
                                    v-else-if="type === 'warning'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                    <ExclamationTriangleIcon
                                        class="h-6 w-6 text-yellow-600"
                                        aria-hidden="true" />
                                </div>
                                <div
                                    v-else-if="type === 'info'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                    <InformationCircleIcon
                                        class="h-6 w-6 text-yellow-600"
                                        aria-hidden="true" />
                                </div>
                                <div class="mt-3 text-center sm:mt-5">
                                    <DialogTitle
                                        v-if="title"
                                        as="h3"
                                        class="text-base font-semibold leading-6 text-gray-900">
                                        {{ title }}
                                    </DialogTitle>
                                    <div
                                        v-if="message"
                                        class="mt-2 whitespace-pre-wrap">
                                        {{ message }}
                                    </div>
                                </div>
                            </div>
                            <div class="mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="close">OK
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
