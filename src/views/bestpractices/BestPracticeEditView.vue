<script setup lang="ts">
import { onBeforeMount, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';

import router from '@/router';

import { useBestPracticesStore } from '@/stores/bestpractices';

import { ArrowRightCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/20/solid';

import { onBeforeRouteLeave } from 'vue-router';


const { t } = useI18n();

const props = defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

const store = useBestPracticesStore();

const route = useRoute();

function beforeUnloadHandler(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = true;
};

onBeforeMount(async () => {
    const projectId = route.params.projectId as string;
    const bestPracticeId = route.params.id as string;
    if (route.params.id === 'new') {
        store.createEmpty(projectId as string);
    } else {
        await store.fetch(projectId as string, bestPracticeId);
    }
    window.addEventListener("beforeunload", beforeUnloadHandler);
});

onUnmounted(() => {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
});

onBeforeRouteLeave((to, from) => {
    if (!store.bestPractice) return true

    const answer = window.confirm(
        'Do you really want to leave? you have unsaved changes!'
    )
    if (!answer) return false
})

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
            <button
                @click="saveAndExit"
                type="button"
                class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500"
            >
                <ArrowRightOnRectangleIcon
                    class="-ml-0.5 h-5 w-5"
                    aria-hidden="true"
                />
                {{ t('edit.saveAndExit') }}
            </button>
        </div>
        <div class="shrink">
            <button
                @click="saveAndNext"
                type="button"
                :disabled="last"
                :class="[last ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-md py-2 px-3 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']"
            >
                <ArrowRightCircleIcon
                    class="-ml-0.5 h-5 w-5"
                    aria-hidden="true"
                />
                {{ t('edit.saveAndNext') }}
            </button>
        </div>
        <div class="grow relative flex flex-row">
            <div class="grow"></div>
            <button
                @click="cancel"
                type="button"
                class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                {{ t('edit.cancel') }}
            </button>
        </div>
    </div>

    <router-view
        v-if="store.bestPractice"
        :edit="true"
    />
    <div class="w-full pb-8 flex gap-x-6">
        <div class="shrink">
            <button
                @click="saveAndExit"
                type="button"
                class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500"
            >
                <ArrowRightOnRectangleIcon
                    class="-ml-0.5 h-5 w-5"
                    aria-hidden="true"
                />
                {{ t('edit.saveAndExit') }}
            </button>
        </div>
        <div
            v-if="!last"
            class="shrink"
        >
            <button
                @click="saveAndNext"
                type="button"
                class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500"
            >
                <ArrowRightCircleIcon
                    class="-ml-0.5 h-5 w-5"
                    aria-hidden="true"
                />
                {{ t('edit.saveAndNext') }}
            </button>
        </div>
        <div class="grow relative flex flex-row">
            <div class="grow"></div>
            <button
                @click="cancel"
                type="button"
                class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                {{ t('edit.cancel') }}
            </button>
        </div>
    </div>
</template>
