<script setup lang="ts">
import { onBeforeMount, onUnmounted, watch } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';

import { storeToRefs } from 'pinia';

import { ArrowRightCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/20/solid';

import router from '@/router';

import { useProjectStore } from '@/stores/project';
import { useAuroraStore } from '@/stores/aurora';

import { useCustomAlert } from '@/hooks/useCustomAlert';
import { GoalIndicator, type CustomIndicator } from '@/lib/auroraIndicators';
import { getAreaValue } from "@/lib/areaUtil";


const { t } = useI18n();

const props = defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

const store = useProjectStore();
const auroraStore = useAuroraStore();

const route = useRoute();

const customAlert = useCustomAlert();

function beforeUnloadHandler(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = true;
};


// import { ref } from 'vue'
// const { project, loaded } = storeToRefs(store)
// const projectChanged = ref(false);


onBeforeMount(async () => {
    if (route.params.id === 'new') {
        store.createEmptyProject(route.query.groupId as string);
    } else {
        await store.fetchProject(route.params.id as string);
    }
    window.addEventListener('beforeunload', beforeUnloadHandler);

    if (route.query.importAurora === 'true' && auroraStore.customIndicators && auroraStore.goalIndicators) {
        await importAuroraIndicators();
    }

    // watch([loaded, project], () => {
    //     projectChanged.value = true;
    // }, { deep: true });
    // watch([loaded, projectAreas], () => {
    //     projectChanged.value = true;
    // }, { deep: true });
});

onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
});


onBeforeRouteLeave((to, from) => {
    if (!store.loaded) return true;

    const answer = window.confirm(
        t('edit.confirmLeave')
    );
    if (!answer) return false;
});

// const showJson = ref(false);
// function toggleJson() {
//     showJson.value = !showJson.value;
// }

async function saveAndExit() {
    try {
        await store.saveAndExit();
        await router.push({ name: 'initiatives' });
    } catch (error) {
        customAlert('Error', 'An error occurred while saving the project. Please try again. Contact support if the problem persists.', 'error');
        return;
    }
}

async function saveAndNext() {
    try {
        await store.save();
        props.next();
    } catch (error) {
        customAlert('Error', 'An error occurred while saving the project. Please try again. Contact support if the problem persists.', 'error');
    }
}

async function cancel() {
    if (confirm('Are you sure you want to cancel? You will loose the changes you made.')) {
        store.resetProjectState();
        await router.push({ name: 'initiatives' });
    }
}

const { projectAreas } = storeToRefs(store);
watch(projectAreas, (projectAreas, oldProjectAreas) => {
    if (!store.project) return;

    if (projectAreas.length < oldProjectAreas.length) {
        // an element has been deleted, update countries list
        store.updateCountries();
    }
});

async function importAuroraIndicators() {
    store.project.auroraProject = {
        userKey: auroraStore.userKey,
        projectId: auroraStore.projectId,
    };

    const projectAreas = store.projectAreas;
    // const areaObj: any = Object.values(projectAreas[0])[0];
    const areaObj = getAreaValue(projectAreas[0]);
    const oldIndicators = (areaObj.goalIndicators || []) as { indicator: GoalIndicator, monitoring: any }[];
    const oldCustomIndicators = (areaObj.customIndicators || []) as { indicator: CustomIndicator, monitoring: any }[];

    const intersection = oldIndicators.filter(i => !!auroraStore.goalIndicators.find(oi => oi.equals(i.indicator)));
    const customIntersection = oldCustomIndicators.filter(i => !!auroraStore.customIndicators.find(oi => {
        return oi.indicator === i.indicator.indicator
            && oi.metric === i.indicator.metric
            && oi.unit === i.indicator.unit;
    }));

    const added = auroraStore.goalIndicators.filter(i => !oldIndicators.find(oi => oi.indicator.equals(i)));
    const customAdded = auroraStore.customIndicators.filter(i => !oldCustomIndicators.find(oi => {
        return oi.indicator.indicator === i.indicator
            && oi.indicator.metric === i.metric
            && oi.indicator.unit === i.unit;
    }));

    const discarded = oldIndicators.filter(i => !intersection.find(oi => oi.indicator.equals(i.indicator)));
    const customDiscarded = oldCustomIndicators.filter(i => !customIntersection.find(oi => {
        return oi.indicator.indicator === i.indicator.indicator
            && oi.indicator.metric === i.indicator.metric
            && oi.indicator.unit === i.indicator.unit;
    }));

    areaObj.goalIndicators = [...intersection, ...added.map(i => ({ indicator: i }))];
    areaObj.customIndicators = [...customIntersection, ...customAdded.map(indicator => ({ indicator }))];

    auroraStore.reset();

    let message = '';
    if (intersection.length || customIntersection.length) {
        message += 'Indicators that already existed in this initiative were merged and monitoring data was not affected.';
    }
    if (discarded.length || customDiscarded.length) {
        if (message) message += '\n';
        message += 'Indicators that existed in this initiative and were not in the Aurora project were discarded, together with their monitoring data.';
    }
    if (message) message += '\n\n'
    message += 'Please save your work to retain these changes.';
}
</script>

<template>
    <!-- <div v-if="projectChanged">Project changed</div> -->
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
        v-if="store.loaded"
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
        <!-- <button
            class="absolute left-0 border hover:text-amber-800 text-amber-500 font-semibold border-gray-300 bg-gray-200 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
            @click="toggleJson">
            JSON
        </button> -->
        <!-- <pre v-if="true"
             class="text-xs font-medium text-amber-700">
            {{ JSON.stringify(store.project, null, 2) }}
        </pre> -->
    </div>
</template>
