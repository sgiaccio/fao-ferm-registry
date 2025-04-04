<script setup lang="ts">

import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'


withDefaults(defineProps<{
    open: boolean
    type?: 'success' | 'error' | 'warning' | 'info'
    title?: string
    buttonText: string
    onClose: () => void,
}>(), {
    open: false,
});

</script>

<template>
    <TransitionRoot
        as="template"
        :show="open"
    >
        <Dialog
            as="div"
            class="relative z-50"
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity w-screen" />
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
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-0 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div>
                                <div
                                    v-if="type === 'success'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
                                >
                                    <CheckIcon
                                        class="h-6 w-6 text-green-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div
                                    v-else-if="type === 'error'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
                                >
                                    <ExclamationTriangleIcon
                                        class="h-6 w-6 text-red-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div
                                    v-else-if="type === 'warning'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100"
                                >
                                    <ExclamationTriangleIcon
                                        class="h-6 w-6 text-yellow-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div
                                    v-else-if="type === 'info'"
                                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100"
                                >
                                    <InformationCircleIcon
                                        class="h-6 w-6 text-yellow-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div :class="['text-center', type ? 'mt-3 sm:mt-5' : '']">
                                    <DialogTitle
                                        v-if="title"
                                        as="h3"
                                        class="text-base font-semibold leading-6 text-gray-900 mb-2"
                                    >
                                        {{ title }}
                                    </DialogTitle>
                                    <div class="">
                                        <slot />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="onClose"
                                >{{ buttonText }}</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>