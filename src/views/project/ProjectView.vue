<script setup lang="ts">
import { onBeforeMount, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import router from '@/router';

import { useProjectStore } from '../../stores/project';


const props = withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: false
});

const store = useProjectStore();

const route = useRoute();


async function fetchData() {
    if (route.params.id === 'new') {
        store.createEmptyProject(route.query.groupId as string);
    } else {
        await store.fetchProject(route.params.id as string);
    }
}

onBeforeMount(async () => {
    if (route.params.id === 'new') {
        store.createEmptyProject(route.query.groupId as string)
    } else {
        await store.fetchProject(route.params.id as string);
    }
});

// await fetchData();
// watch(
//     () => route.params, () => {
//         if (route.params.id) {
//             fetchData();
//         }
//     },
//     // fetch the data when the view is created and the data is
//     // already being observed
//     { immediate: true }
// );


const tabs = [
    { name: 'Initiative', path: 'info' },
    { name: 'Area', path: 'aoi' },
    { name: 'Characteristics', path: 'characteristics' },
    { name: 'Activities', path: 'activities' },
    { name: 'Ecosystems', path: 'ecosystems' },
    { name: 'Indicators', path: 'indicators' },
    { name: 'Results', path: 'results' }
];

const currentRouteIdx = computed(() => tabs.findIndex(tab => route.path.endsWith(tab.path)));

const lastTab = computed(() => {
    return (currentRouteIdx.value === tabs.length - 1);
});

// const showJson = ref(false);
// function toggleJson() { showJson.value = !showJson.value }

function startEdit() {
    router.push({ path: `/initiatives/${route.params.id}/edit/info` });
}

async function saveAndExit() {
    await store.saveAndExit();
    router.push({ name: 'initiatives' });
}

async function saveAndNext() {
    await store.save();

    if (lastTab.value) {
        router.push({ name: 'initiatives' });
    } else {
        router.push({ path: tabs[currentRouteIdx.value + 1].path });
    }
}

async function cancel() {
    if (!props.edit || confirm("Are you sure you want to cancel? You will loose the changes you made.")) {
        store.resetProjectState();
        router.push({ name: 'initiatives' });
    }
}

async function print() {
    const routeData = router.resolve({ name: 'printProject' });
    window.open(routeData.href, '_blank');
}
</script>

<template>
    <div v-if="store.project"
         class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">

            <!-- <div>
                <div class="sm:hidden">
                    <label for="tabs" class="sr-only">Select a tab</label>
                    <!- - Use an "onChange" listener to redirect the user to the selected tab URL. - ->
                    <select id="tabs" name="tabs"
                        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option v-for="tab in tabs" :key="tab.name" :selected="tab.current">{{ tab.name }}</option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                            <router-link v-for="tab in tabs" :key="tab.name" :href="tab.href"
                                :class="[tab.current ? 'border-indigo-500 text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
                                :aria-current="tab.current ? 'page' : undefined" :to="tab.href">{{
                                    tab.name
                                }}</router-link>
                        </nav>
                    </div>
                </div>
            </div> -->


            <nav aria-label="Section">
                <ol role="list"
                    class="mt-4 md:mt-6 divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                    <li v-for="(step, stepIdx) in tabs"
                        :key="step.name"
                        class="relative md:flex md:flex-1">
                        <router-link v-if="route.path === step.path"
                                     :to="{ path: step.path }"
                                     class="flex items-center py-4 text-sm font-medium"
                                     aria-current="step">
                            <span class="justify-self-start ml-1 text-sm font-medium text-indigo-600">{{ step.name }}</span>
                        </router-link>

                        <router-link v-else
                                     :to="{ path: step.path }"
                                     :key="step.path"
                                     class="group flex items-center">
                            <span class="flex items-center py-4 text-sm font-medium">
                                <span class="justify-self-start ml-1 text-sm font-medium text-gray-500 group-hover:text-gray-900">{{ step.name }}</span>
                            </span>
                        </router-link>
                        <template v-if="stepIdx !== tabs.length - 1">
                            <!-- Arrow separator for lg screens and up -->
                            <div class="absolute top-0 right-0 hidden h-full w-5 md:block"
                                 aria-hidden="true">
                                <svg class="h-full w-full text-gray-300"
                                     viewBox="0 0 22 80"
                                     fill="none"
                                     preserveAspectRatio="none">
                                    <path d="M0 -2L20 40L0 82"
                                          vector-effect="non-scaling-stroke"
                                          stroke="currentcolor"
                                          stroke-linejoin="round" />
                                </svg>
                            </div>
                        </template>
                    </li>
                </ol>
            </nav>

            <router-view v-if="store.project"
                         :edit="edit" />

            <div class="w-full mb-8 flex gap-x-6">
                <div v-if="edit"
                     class="shrink">
                    <button @click="saveAndExit"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Save and exit
                    </button>
                </div>
                <div v-if="edit && !lastTab"
                     class="shrink">
                    <button @click="saveAndNext"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Save and next
                    </button>
                </div>
                <div
                     class="shrink">
                    <button @click="cancel"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Cancel
                    </button>
                </div>
                <div v-if="store.canEdit() && !edit"
                     class="shrink">
                    <button @click="startEdit()"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Edit
                    </button>
                </div>

                <div class="grow relative flex flex-row">
                    <div class="grow"></div>
                    <button @click="print"
                            type="button"
                            class="ml-6 shrink inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Print
                    </button>
                </div>
                <!-- <button 
                class="absolute left-0 border hover:text-amber-800 text-amber-500 dark:text-amber-900 font-semibold border-gray-300 dark:border-gray-900 bg-gray-200 dark:bg-gray-800 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
                @click="toggleJson">JSON</button>
                <pre v-if="showJson" class="text-xs font-medium absolute text-amber-700 dark:text-amber-600 top-20">{{JSON.stringify(store.project, null, 2)}}</pre> -->
            </div>


        </div>
    </div>
</template>
