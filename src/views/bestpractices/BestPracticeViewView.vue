<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';

import router from '@/router';

import { useBestPracticesStore } from '@/stores/bestpractices';

import { PencilSquareIcon, PaperAirplaneIcon, PrinterIcon, ArrowSmallLeftIcon, ArrowSmallRightIcon } from '@heroicons/vue/20/solid';

const store = useBestPracticesStore();

const canSubmit = ref<boolean>()
const route = useRoute();

defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

onBeforeMount(async () => {
    await store.fetch(route.params.id as string);
    canSubmit.value = await store.canSetStatus('submitted');
});

function edit() {
    router.push({ name: 'goodPracticesObjectivesEdit', params: { id: route.params.id } });
}

async function submit() {
    if (confirm("Are you sure you want submit this Good Practice for review?")) {
        try {
            await store.submit(store.id!);
            alert('The Good Practice was submitted for review.');
        } catch (e) {
            alert(`Error updating status: ${e}.`)
        }
        router.push({ name: 'initiatives' });
    }
}

function print() {
    const routeData = router.resolve({ name: 'printBestPractice' });
    window.open(routeData.href, '_blank');
}
</script>

<template>
    <!-- Buttons -->
    <div class="w-full pb-8 flex gap-x-6">
        <div class="shrink">
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
            <button v-if="canSubmit"
                    @click="submit"
                    type="button"
                    class="inline-flex items-center gap-x-1.5 rounded-md bg-orange-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-orange-500">
                <PaperAirplaneIcon class="-ml-0.5 h-5 w-5"
                                   aria-hidden="true" />
                Submit for review
            </button>
            <button @click="print"
                    type="button"
                    class="ml-6 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-100 py-2 px-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500">
                <PrinterIcon class="-ml-0.5 h-5 w-5"
                             aria-hidden="true" />
                Print
            </button>
        </div>
    </div>

    <router-view v-if="store.bestPractice"
                 :edit="false" />

    <!-- TODO, important - but what? -->
    <!-- <router-view v-slot="{ Component, route }"
                             v-if="store.bestPractice">
                    <keep-alive include="BestPracticeObjectivesView">
                        <component :is="Component"
                                   :key="route.path" />
                    </keep-alive>
                </router-view> -->
</template>
