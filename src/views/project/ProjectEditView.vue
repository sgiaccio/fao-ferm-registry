<script setup lang="ts">
import { onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';

import { storeToRefs } from 'pinia'

import router from '@/router';

import { useProjectStore } from '@/stores/project';

import { ArrowRightCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/20/solid';


const props = defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

const store = useProjectStore();

const route = useRoute();

onBeforeMount(async () => {
    if (route.params.id === 'new') {
        store.createEmptyProject(route.query.groupId as string);
    } else {
        await store.fetchProject(route.params.id as string);
    }
});

// const showJson = ref(false);
// function toggleJson() {
//     showJson.value = !showJson.value;
// }

async function saveAndExit() {
    await store.saveAndExit();
    await router.push({ name: 'initiatives' });
}

async function saveAndNext() {
    await store.save();

    props.next();
}

async function cancel() {
    if (confirm('Are you sure you want to cancel? You will loose the changes you made.')) {
        store.resetProjectState();
        await router.push({ name: 'initiatives' });
    }
}

const { projectAreas } = storeToRefs(store)
watch(projectAreas, (projectAreas, oldProjectAreas) => {
    if (projectAreas.length < oldProjectAreas.length) {
        // an element has been deleted, update countries list
        store.updateCountries();
    }
});
</script>

<template>
    <!-- buttons -->
    <div class="w-full pb-8 flex gap-x-6">
        <div class="shrink">
            <button @click="saveAndExit"
                    type="button"
                    class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500">
                <ArrowRightOnRectangleIcon class="-ml-0.5 h-5 w-5"
                                           aria-hidden="true" />
                Save and Exit
            </button>
        </div>
        <div class="shrink">
            <button @click="saveAndNext"
                    type="button"
                    :disabled="last"
                    :class="[last ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-md py-2 px-3 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']">
                <ArrowRightCircleIcon class="-ml-0.5 h-5 w-5"
                                      aria-hidden="true" />
                Save and Next
            </button>
        </div>
        <div class="grow relative flex flex-row">
            <div class="grow"></div>
            <button @click="cancel"
                    type="button"
                    class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Cancel
            </button>
        </div>
    </div>

    <!-- <router-view v-if="store.loaded"
                 :edit="true" /> -->
    <router-view v-slot="{ Component }" v-if="store.loaded">
        <keep-alive>
            <component :is="Component"
                       :key="$route.fullPath"></component>
        </keep-alive>
    </router-view>

    <!-- buttons -->
    <div class="w-full pb-8 flex gap-x-6">
        <div class="shrink">
            <button @click="saveAndExit"
                    type="button"
                    class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500">
                <ArrowRightOnRectangleIcon class="-ml-0.5 h-5 w-5"
                                           aria-hidden="true" />
                Save and Exit
            </button>
        </div>
        <div class="shrink">
            <button @click="saveAndNext"
                    type="button"
                    :disabled="last"
                    :class="[last ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-md py-2 px-3 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']">
                <ArrowRightCircleIcon class="-ml-0.5 h-5 w-5"
                                      aria-hidden="true" />
                Save and Next
            </button>
        </div>
        <div class="grow relative flex flex-row">
            <div class="grow"></div>
            <button @click="cancel"
                    type="button"
                    class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Cancel
            </button>
        </div>
        <!-- <button
            class="absolute left-0 border hover:text-amber-800 text-amber-500 dark:text-amber-900 font-semibold border-gray-300 dark:border-gray-900 bg-gray-200 dark:bg-gray-800 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
            @click="toggleJson">
            JSON
        </button> -->
        <!-- <pre v-if="true"
             class="text-xs font-medium text-amber-700 dark:text-amber-600">
            {{ JSON.stringify(store.project, null, 2) }}
        </pre> -->
    </div>
</template>
