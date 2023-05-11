<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';

import router from '@/router';

import { useBestPracticesStore } from '@/stores/bestpractices';

import { ArrowRightCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/20/solid';


const props = defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

const store = useBestPracticesStore();

const route = useRoute();

onBeforeMount(async () => {
    if (route.params.id === 'new') {
        if (!route.query.projectId) {
            throw Error('Didn\'t get project id in request query');
        }
        store.createEmpty(route.query.projectId as string);
    } else {
        await store.fetch(route.params.id as string);
    }
});

async function saveAndExit() {
    await store.save();
    await router.push({ name: 'initiatives' });

    store.resetBestPracticeState();
}

async function saveAndNext() {
    await store.save();

    props.next();
}

function cancel() {
    if (confirm("Are you sure you want to cancel? You will loose the last changes you made.")) {
        store.resetBestPracticeState();
        router.push({ name: 'initiatives' });
    }
}
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

    <router-view v-if="store.bestPractice"
                 :edit="true"></router-view>

    <!-- TODO, important - but what? -->
    <!-- <router-view v-slot="{ Component, route }"
                                                             v-if="store.bestPractice">
                                                    <keep-alive include="BestPracticeObjectivesView">
                                                        <component :is="Component"
                                                                   :key="route.path" />
                                                    </keep-alive>
                                                </router-view> -->
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
        <div v-if="!last"
             class="shrink">
            <button @click="saveAndNext"
                    type="button"
                    class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500">
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
</template>
