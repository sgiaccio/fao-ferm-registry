<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

import { PencilSquareIcon, PrinterIcon, ArrowSmallLeftIcon, ArrowSmallRightIcon } from '@heroicons/vue/20/solid';

import router from '@/router';

import { useProjectStore } from '@/stores/project';


const props = defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

const store = useProjectStore();

const route = useRoute();

onBeforeMount(async () => {
    await store.fetchProject(route.params.id as string);
});

// This is a hack to reset the project state when the user navigates away from the project view
// TODO: Find a better way to do this
// TODO: move to the parent route?
// onBeforeRouteLeave(() => {
//     store.resetProjectState();
// });

function edit() {
    router.push({ path: `/registry/initiatives/${route.params.id}/edit/info` });
}

async function print() {
    const routeData = router.resolve({ name: 'printInitiative' });
    window.open(routeData.href, '_blank');
}
</script>

<template>
    <div class="w-full pb-8 flex gap-x-6">
        <div v-if="store.loaded && store.canEdit()" class="shrink">
            <button @click="edit"
                    type="button"
                    class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500">
                <PencilSquareIcon class="-ml-0.5 h-5 w-5"
                                  aria-hidden="true" />
                Edit
            </button>
        </div>
        <div class="shrink">
            <button @click="previous"
                    :disabled="first"
                    type="button"
                    :class="[first ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-full py-2 px-3.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']">
                <ArrowSmallLeftIcon class="-ml-1.5 h-5 w-5"
                                    aria-hidden="true" />
                Previous
            </button>
        </div>
        <div class="shrink">
            <button @click="next"
                    :disabled="last"
                    type="button"
                    :class="[last ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-full py-2 px-3.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']">
                Next
                <ArrowSmallRightIcon class="-mr-1.5 h-5 w-5"
                                     aria-hidden="true" />
            </button>
        </div>
        <div class="grow relative flex flex-row">
            <div class="grow" />
            <!-- <button v-if="canSubmit"
                        @click="submit"
                        type="button"
                        class="inline-flex items-center gap-x-1.5 rounded-md bg-orange-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-orange-500">
                    <PaperAirplaneIcon class="-ml-0.5 h-5 w-5"
                                       aria-hidden="true" />
                    Submit for review
                </button> -->
            <button @click="print"
                    type="button"
                    class="ml-6 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-100 py-2 px-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500">
                <PrinterIcon class="-ml-0.5 h-5 w-5"
                             aria-hidden="true" />
                Print
            </button>
        </div>
    </div>

    <router-view v-if="store.loaded"
                 :edit="false" />
</template>
