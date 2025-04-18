<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { DocumentIcon, MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { XCircleIcon } from '@heroicons/vue/20/solid';
import {
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption,
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot
} from '@headlessui/vue';

import { fetchEditableProjects } from '@/firebase/firestore';

import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import { useUserGroups } from '@/hooks/useUserGroups';
import { useAuroraStore } from '@/stores/aurora';

import IndicatorsList from '@/views/project/IndicatorsList.vue';

import router from '@/router';

import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useGaul } from '@/hooks/useGaul';


const route = useRoute();

const authStore = useAuthStore();
const projectStore = useProjectStore();
const auroraStore = useAuroraStore();

const { findGaulByIso2 } = useGaul();

const editableProjects = ref<any>();
const indicatorsListModelValue = ref();

const loadError = ref<string>('');

const customAlert = useCustomAlert();

const { getGroupName } = useUserGroups();

onMounted(async () => {
    const userKey = route.params.userKey as string;
    const auroraProjectId = route.params.auroraProjectId as string;

    const auroraProjectPromise = auroraStore.fetchAuroraProject(userKey, auroraProjectId);
    const myProjectsPromise = fetchEditableProjects(authStore.uid!, authStore.privileges);

    await Promise.allSettled([auroraProjectPromise, myProjectsPromise]).then(([auroraProjectObj, myProjectsObj]) => {
        if (auroraProjectObj.status === 'rejected') {
            loadError.value = `The AURORA project could not be loaded: "${auroraProjectObj.reason}"`;
            return;
        }
        if (myProjectsObj.status === 'rejected') {
            loadError.value = `Your initiatives could not be loaded: "${myProjectsObj.reason}"`;
            return;
        }

        editableProjects.value = myProjectsObj.value;
        indicatorsListModelValue.value = auroraStore.goalIndicators.map(i => ({ indicator: i }));
    });
});

const closeCount = ref(0);

async function closeActionMenu(): Promise<void> {
    open.value = false;
    return new Promise(resolve => {
        const unwatch = watch(closeCount, () => {
            if (closeCount.value === 2) {
                closeCount.value = 0;
                unwatch();
                resolve();
            }
        });
    });
}

async function importAuroraIndicators(project: any) {
    const p1 = projectStore.fetchProject(project.id);
    const p2 = closeActionMenu();
    await Promise.all([p1, p2]);

    const projectAreas = projectStore.projectAreas;
    if (!projectAreas?.length) {
        customAlert('', 'This project has no areas defined. Please add at least one area to the project before importing indicators.', 'error');
        return;
    }
    await router.push({
        name: 'projectIndicatorsEdit',
        params: { id: project.id },
        query: { importAurora: 'true' }
    });
}

const open = ref(false);
const query = ref('');
const filteredProjects = computed(() => query.value === ''
    ? editableProjects.value
    : editableProjects.value.filter((p) => {
        return p.data.project.title.toLowerCase().includes(query.value.toLowerCase());
    }));

function getCountryNames(countries: string[]) {
    return countries ? countries.map(c => findGaulByIso2(c)).map(c => c?.label) : null;
}
</script>

<template>
    <TransitionRoot
        :show="open"
        as="template"
        @after-leave="query = ''"
        appear
    >
        <Dialog
            as="div"
            class="relative z-10"
            @close="open = false"
        >
            <TransitionChild
                @after-leave="closeCount++"
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
                <TransitionChild
                    @after-leave="closeCount++"
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 scale-95"
                    enter-to="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 scale-100"
                    leave-to="opacity-0 scale-95"
                >
                    <DialogPanel class="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                        <Combobox
                            v-slot="{ activeOption }"
                            @update:modelValue="importAuroraIndicators"
                        >
                            <div class="relative">
                                <MagnifyingGlassIcon
                                    class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                                <ComboboxInput
                                    class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                                    placeholder="Search..."
                                    change="query = $event.target.value"
                                />
                            </div>

                            <ComboboxOptions
                                v-if="query === '' || filteredProjects.length > 0"
                                class="flex transform-gpu divide-x divide-gray-100"
                                as="div"
                                static
                                hold
                            >
                                <div :class="['max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4', activeOption && 'sm:h-96']">
                                    <h2
                                        v-if="filteredProjects.length > 0"
                                        class="mb-4 mt-2 text-xs font-semibold text-gray-500"
                                    >Your initiatives</h2>
                                    <h2
                                        v-else
                                        class="mb-4 mt-2 text-sm font-semibold text-gray-500"
                                    >You are currently not an editor or collaborator of any initiative.</h2>
                                    <div
                                        hold
                                        class="-mx-2 text-sm text-gray-700"
                                    >
                                        <ComboboxOption
                                            v-for="project in filteredProjects"
                                            :key="project.id"
                                            :value="project"
                                            as="template"
                                            v-slot="{ active }"
                                        >
                                            <div :class="['group flex cursor-default select-none items-center rounded-md p-2', active && 'bg-gray-100 text-gray-900']">
                                                <span class="ml-3 flex-auto truncate">{{ project.data.project.title }}</span>
                                                <ChevronRightIcon
                                                    v-if="active"
                                                    class="ml-3   h-5 w-5 flex-none text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        </ComboboxOption>
                                    </div>
                                </div>

                                <div
                                    v-if="activeOption"
                                    class="hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex"
                                >
                                    <div class="flex-none p-6 text-center">
                                        <h2 class="mt-3 font-semibold text-gray-900">
                                            {{ activeOption.data.project.title }}
                                        </h2>
                                    </div>
                                    <div class="flex flex-auto flex-col justify-between p-6">
                                        <dl class="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700">
                                            <dt class="col-end-1 font-semibold text-gray-900">Countries</dt>
                                            <dd>{{ getCountryNames(activeOption.data.project.countries) ? getCountryNames(activeOption.data.project.countries).join(', ') : 'None' }}</dd>
                                            <dt class="col-end-1 font-semibold text-gray-900">Created by</dt>
                                            <dd class="truncate">
                                                {{ activeOption.data.created_by_name || 'No name' }}
                                            </dd>
                                            <dt class="col-end-1 font-semibold text-gray-900">Group</dt>
                                            <dd class="truncate">
                                                {{ getGroupName(activeOption.data.group) || 'No group' }}
                                            </dd>
                                        </dl>
                                        <button
                                            @click="importAuroraIndicators(activeOption)"
                                            type="button"
                                            class="mt-6 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                            Import indicators
                                        </button>
                                    </div>
                                </div>
                            </ComboboxOptions>

                            <div
                                v-if="query !== '' && filteredProjects.length === 0"
                                class="px-6 py-14 text-center text-sm sm:px-14"
                            >
                                <DocumentIcon
                                    class="mx-auto h-6 w-6 text-gray-400"
                                    aria-hidden="true"
                                />
                                <p class="mt-4 font-semibold text-gray-900">No initiatives found</p>
                                <p class="mt-2 text-gray-500">We couldn’t find anything with that term. Please try again.</p>
                            </div>
                        </Combobox>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>

    <div
        v-if="loadError !== ''"
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center items-center h-screen"
    >
        <div class="mx-auto max-w-xl">
            <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <XCircleIcon
                            class="h-5 w-5 text-red-400"
                            aria-hidden="true"
                        />
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error</h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>{{ loadError }}</p>
                        </div>
                        <div class="mt-4">
                            <div class="-mx-2 -my-1.5 flex">
                                <button
                                    @click="router.push({ 'name': 'registry' })"
                                    type="button"
                                    class="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-red-50"
                                >Enter the registry
                                </button>
                                <button
                                    @click="router.push({ 'name': 'support' })"
                                    type="button"
                                    class="ml-3 rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-red-50"
                                >Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl">
            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mt-10 border border-gray-200">
                <template v-if="auroraStore.auroraProject">
                    <div class="px-4 py-5 sm:px-6 sm:mt-2 font-akrobat text-xl text-center font-bold text-ferm-blue-light-800">
                        Import indicators from the
                        <span class="font-extrabold italic ">{{ auroraStore.auroraProject.name }}</span>
                        AURORA project
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <!-- goal indicators -->
                        <IndicatorsList
                            v-if="indicatorsListModelValue"
                            v-model="indicatorsListModelValue"
                            :edit="false"
                        />
                        <!-- custom indicators -->
                        <div
                            v-if="auroraStore.customIndicators"
                            class="border-2 border-gray-300 rounded-md px-4 py-4 bg-red-50 mt-4"
                        >
                            <h1 class="font-bold text-gray-700 text-lg pb-3">Custom indicators</h1>
                            <div class="flex flex-col mb-4 gap-y-1 text-xs font-bold text-black">
                                <div
                                    v-for="(indicator, i) in auroraStore.customIndicators"
                                    class="rounded px-3 py-2 flex shadow-sm shadow-gray-300 bg-gray-200"
                                >
                                    <div class="flex-grow ">
                                        {{ indicator.indicator }} &mdash;
                                        {{ indicator.metric }} &mdash;
                                        {{ indicator.unit }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="px-4 py-4 sm:px-6 w-full">
                        <button
                            class="w-full sm:w-auto inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            @click="open = true"
                        >Choose initiative
                        </button>
                    </div>
                </template>
                <div v-else
                class="font-akrobat text-xl text-center font-bold text-ferm-blue-light-800 py-10">
                    Loading the AURORA project...
                </div>
            </div>
        </div>
    </div>
</template>