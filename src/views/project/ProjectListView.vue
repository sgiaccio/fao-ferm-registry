<script setup lang="ts">
import { onMounted, ref, watch, computed, onBeforeMount } from 'vue';

import { useRoute } from 'vue-router'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxLabel, ComboboxOption, ComboboxOptions } from '@headlessui/vue';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'

import {
    Cog6ToothIcon,
    ChevronDownIcon,
    PencilSquareIcon,
    MegaphoneIcon,
    DocumentMagnifyingGlassIcon,
    CheckIcon,
    ChevronUpDownIcon
} from '@heroicons/vue/20/solid';
import { FaceFrownIcon } from '@heroicons/vue/24/outline';

import router from '@/router';

import { fbTimestampToString } from '@/lib/util';
import * as projectUtils from '@/lib/project';

import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import { useBestPracticesStore } from '@/stores/bestpractices';

import { useGaul } from '@/hooks/useGaul';

import { fetchAllGroupNames } from '@/firebase/firestore';

import InstitutionsAssignment from '../InstitutionsAssignment.vue';
import NewProjectDialog from '@/views/project/NewProjectDialog.vue';
import ConfirmModal from '@/views/ConfirmModal.vue';
import ActionsMenu from './ActionsMenu.vue';


const fermGroupId = import.meta.env.VITE_GEF_GROUP_ID;

const route = useRoute()

const projectStore = useProjectStore();
const authStore = useAuthStore();
const bestPracticesStore = useBestPracticesStore();

const userGroups = ref<{ [key: string]: string }>({});

// Search queries
const groupQuery = ref('')
const countryQuery = ref('')
const selectedGroup = ref<string>();
const selectedCountry = ref<string>();
const selectedGefCycle = ref<string>();

onBeforeMount(() => {
    // set the query values from the url
    const query = new URLSearchParams(decodeURIComponent(route.query.q as string));
    selectedGroup.value = query.get('institution') || '';
    selectedCountry.value = query.get('country') || '';
    selectedGefCycle.value = query.get('gef_cycle') || '';
});

onMounted(async () => {
    try {
        if (authStore.isAdmin) {
            userGroups.value = await fetchAllGroupNames();
        } else {
            userGroups.value = authStore.userGroups
        }
    } catch (e) {
        console.error(e);
    }
});

watch([selectedGroup, selectedCountry, selectedGefCycle], ([newGroup, newCountry, newGefCycle], [oldGroup, oldCountry, oldGefCycle]) => {
    if (newGroup !== fermGroupId && selectedGefCycle.value !== '') {
        selectedGefCycle.value = ''; // this will trigger another watch
        return;
    }
    if (newGroup !== oldGroup || newCountry !== oldCountry || newGefCycle !== oldGefCycle) {
        if (authStore.isAdmin || Object.keys(authStore.userGroups).length) {
            projectStore.fetchNextProjects(undefined, true, { group: newGroup, country: selectedCountry.value, gefCycle: selectedGefCycle.value });
        }
    }
});

// build a string representing the query, and add the query to the url
watch([selectedGroup, selectedCountry, selectedGefCycle], ([group, country, gefCycle]) => {
    const query = new URLSearchParams();
    if (group) query.set('institution', group);
    if (country) query.set('country', country);
    if (gefCycle) query.set('gef_cycle', gefCycle);
    router.replace({
        name: 'initiatives',
        query: {
            q: encodeURIComponent(query.toString())
        }
    });
    
    // delete the query from the url if all filters are empty
    if (!group && !country && !gefCycle) {
        router.replace({
            name: 'initiatives',
            query: {}
        });
    }
});

const bestPractices = ref();

async function showBestPractices(projectId: string) {
    bestPractices.value = await bestPracticesStore.fetchProjectBestPractices(projectId);
}

const showNewInitiativeDialog = ref(false);

async function createProject({ title, reportingLine, group }: { title: string, reportingLine: string, group: string }) {
    showNewInitiativeDialog.value = false;

    if (!title || !group || !reportingLine) {
        alert('Please fill in all fields');
        return;
    }

    if (!termsAndConditionAccepted.value) {
        alert('Please accept the terms and conditions');
        return;
    }

    try {
        await projectStore.createProject(group, title, reportingLine, termsAndConditionAccepted.value);
        router.push({ name: 'projectInfoEdit', params: { id: projectStore.id } });
    } catch (e) {
        alert('Error creating project');
        console.error(e);
    }
}

const showTermsAndConditions = ref(false);
// I'm not sure if this make sense, I could just send the flag to the backend set to true without storing it.
const termsAndConditionAccepted = ref(false);

function acceptTermsAndConditions() {
    termsAndConditionAccepted.value = true;
    showTermsAndConditions.value = false;
}

function rejectTermsAndConditions() {
    termsAndConditionAccepted.value = false;
    showTermsAndConditions.value = false;
}

// Using a separate function to check the terms and conditions and show the dialog.
// This is needed because setting the value of showNewInitiativeDialog.value in the acceptTermsAndConditions function causes problems with scrolling. I don't know why.
async function checkTermsAndConditionsAndShowDialog() {
    showNewInitiativeDialog.value = termsAndConditionAccepted.value;
}

const filteredGroups = computed(() => {
    return groupQuery.value === ''
        ? userGroups.value
        : Object.entries(userGroups.value)
            .filter(([id, name]) => name.toLowerCase().includes(groupQuery.value.toLowerCase()))
            .reduce((obj, [id, name]) => {
                obj[id] = name;
                return obj;
            }, {} as { [key: string]: string });
});

// get the list of countries with iso 2 names
const { gaulLevel0 } = useGaul();

const filteredCountries = computed(() => {
    return countryQuery.value === ''
        ? gaulLevel0.value
        : gaulLevel0.value
            .filter(({ label }: { label: string }) => label.toLowerCase().includes(countryQuery.value.toLowerCase()));
});

function resetFilters() {
    selectedGroup.value = '';
    selectedCountry.value = '';
    selectedGefCycle.value = '';
}
</script>

<template>
    <!-- Terms and conditions dialog -->
    <ConfirmModal
        :open="showTermsAndConditions"
        title="Terms and Conditions for Adding an Initiative to the FERM Registry"
        ok-button-text="Accept"
        cancel-button-text="Reject"
        :ok-button-enabled=true
        :onConfirm="acceptTermsAndConditions"
        @closed="checkTermsAndConditionsAndShowDialog"
        @cancel="rejectTermsAndConditions"
    >
        <!-- <h1 class="font-akrobat text-xl font-bold ">Terms and Conditions for Adding a Project/Initiative to the FERM Registry</h1> -->
        <div class="mt-3 max-w-xl text-sm text-gray-500 text-left">
            <p>By adding your initiative to the Framework for Ecosystem Restoration Monitoring (FERM) Registry, you
                agree to abide by the following terms and conditions:</p>
            <ul class="mt-3">
                <li><span class="font-bold">Ownership and Responsibility:</span>
                    You affirm that you are authorized to represent the institution associated with the initiative, and
                    that you hold all necessary rights to share information pertaining to the initiative.
                </li>
                <li class="mt-2"><span class="font-bold">Accuracy of Information:</span>
                    You affirm that all information provided to the FERM Registry is accurate, complete, and up-to-date.
                    You agree to promptly update any information should changes occur.
                </li>
                <li class="mt-2"><span class="font-bold">Data Sharing:</span>
                    You understand that the initiative data will be publicly available and shared with other FERM users.
                    The data may be used for monitoring restoration activities, research purposes, informing policy
                    decisions, and furthering the cause of ecosystem restoration.
                </li>
                <li class="mt-2"><span class="font-bold">Privacy:</span>
                    All personal data provided will be processed in accordance with our Privacy Policy. We will take
                    appropriate measures to ensure your personal data remains secure.
                </li>
                <li class="mt-2"><span class="font-bold">Compliance with Laws:</span>
                    You agree to comply with all applicable local, national, and international laws and regulations
                    pertaining to environmental conservation and data sharing.
                </li>
            </ul>
            <p class="mt-3">By clicking "Accept", you agree to these terms and conditions.</p>

            <p class="mt-3">For any further questions regarding these terms, please contact us at <a
                    class="font-bold underline"
                    href="mailto:ferm-support@fao.org"
                >ferm-support@fao.org</a>.</p>
        </div>
    </ConfirmModal>

    <!-- New initiative dialog -->
    <NewProjectDialog
        :show="showNewInitiativeDialog"
        @cancel="() => { showNewInitiativeDialog = false }"
        @confirm="createProject"
    />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="mt-12 font-akrobat text-4xl text-gray-800 mb-8 font-extrabold uppercase">
                Initiatives</h1>

            <p>Restoration projects, programs, and initiatives at all spatial scales, from individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for sustaining life on Earth. The FERM registry allows for consistent and transparent monitoring, reporting, and sharing information on restoration initiatives and good practices. The information published in the FERM Registry will be used to officially report on areas under restoration during the United Nations Decade on Ecosystem Restoration and towards the data collection for the Convention on Biological Diversity Post-2020 Global Biodiversity Framework Target 2.</p>
            <!-- If the user is not an admin and not part of any group, show a message -->
            <div
                v-if="!(authStore.isAdmin || Object.keys(authStore.userGroups).length)"
                class="mt-10"
            >
                <InstitutionsAssignment />
            </div>

            <!-- If the user is an admin or part of a group, show the initiatives -->
            <template v-else>
                <div class="flex mt-6 space-x-4 justify-end">
                    <!-- Join/create an institution -->
                    <button
                        v-if="authStore.isAdmin || Object.keys(authStore.userGroups).length"
                        type="button"
                        class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        @click="() => router.push({ name: 'newOrganization' })"
                    >
                        Join or create institution
                    </button>
                    <!-- Create new initiative -->
                    <button
                        v-if="authStore.isAdmin || Object.keys(authStore.userGroups).length"
                        type="button"
                        class="ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ferm-blue-dark-700 hover:bg-ferm-blue-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        @click="showTermsAndConditions = true"
                    >
                        Create new initiative
                    </button>
                </div>
                <!-- Search -->
                <div
                    class="mt-6 mb-6"
                    v-if="Object.keys(userGroups).length"
                >
                    <div class="flex flex-col md:flex-row gap-x-4">
                        <!-- countries -->
                        <Combobox
                            as="div"
                            class="max-w-sm"
                            v-model="selectedCountry"
                            :nullable="true"
                        >
                            <ComboboxLabel class="block text-sm font-medium leading-6 text-gray-700">Filter by country</ComboboxLabel>
                            <div class="relative mt-2">
                                <ComboboxInput
                                    class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    @change="countryQuery = $event.target.value"
                                    :display-value="() => gaulLevel0.find(c => c.iso2 === selectedCountry)?.label"
                                />
                                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                    <ChevronUpDownIcon
                                        class="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </ComboboxButton>

                                <ComboboxOptions
                                    v-if="[1].length > 0"
                                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                    <ComboboxOption
                                        v-for="{ label, iso2 } in filteredCountries.sort((a, b) => a.label.localeCompare(b.label))"
                                        :key="iso2"
                                        :value="iso2"
                                        as="template"
                                        v-slot="{ active, selected }"
                                    >
                                        <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                                            <span :class="['block truncate', selected && 'font-semibold']">
                                                {{ label }}
                                            </span>

                                            <span
                                                v-if="selected"
                                                :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']"
                                            >
                                                <CheckIcon
                                                    class="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </li>
                                    </ComboboxOption>
                                </ComboboxOptions>
                            </div>
                        </Combobox>

                        <!-- institutions -->
                        <Combobox
                            as="div"
                            class="max-w-sm pt-3 md:pt-0"
                            v-model="selectedGroup"
                            :nullable=true
                        >
                            <ComboboxLabel class="block text-sm font-medium leading-6 text-gray-700">Filter by institution</ComboboxLabel>
                            <div class="relative mt-2">
                                <ComboboxInput
                                    class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    @change="groupQuery = $event.target.value"
                                    :display-value="() => userGroups[selectedGroup || '']"
                                />
                                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                    <ChevronUpDownIcon
                                        class="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </ComboboxButton>

                                <ComboboxOptions
                                    v-if="[1].length > 0"
                                    class="absolute z-10 mt-1 max-h-60 w-auto max-w-md overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                    <ComboboxOption
                                        v-for="[id, name] in Object.entries(filteredGroups).sort((a, b) => a[1].localeCompare(b[1]))"
                                        :key="id"
                                        :value="id"
                                        as="template"
                                        v-slot="{ active, selected }"
                                    >
                                        <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                                            <span :class="['block truncate', selected && 'font-semibold']">
                                                {{ name }}
                                            </span>

                                            <span
                                                v-if="selected"
                                                :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']"
                                            >
                                                <CheckIcon
                                                    class="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </li>
                                    </ComboboxOption>
                                </ComboboxOptions>
                            </div>
                        </Combobox>

                        <div
                            v-if="selectedGroup === fermGroupId"
                            class="max-w-xs  pt-3 md:pt-0"
                        >
                            <div class="flex items-center justify-between">
                                <h2 class="text-sm font-medium leading-6 text-gray-700">GEF cycle</h2>
                            </div>

                            <RadioGroup
                                v-model="selectedGefCycle"
                                class="mt-2"
                            >
                                <RadioGroupLabel class="sr-only">Filter by GEF cycle</RadioGroupLabel>
                                <div class="grid grid-cols-3 gap-3">
                                    <RadioGroupOption
                                        as="template"
                                        v-for="option in [{ value: 6, label: 'GEF 6' }, { value: 7, label: 'GEF 7' }, { value: 8, label: 'GEF 8' }]"
                                        :key="option.value"
                                        :value="option.value"
                                        v-slot="{ active, checked }"
                                    >
                                        <div :class="['cursor-pointer focus:outline-none', active ? 'ring-2 ring-indigo-600 ring-offset-2' : '', checked ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-700 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-2 px-3 text-sm font-semibold uppercase sm:flex-1']">
                                            <RadioGroupLabel as="span">{{ option.label }}</RadioGroupLabel>
                                        </div>
                                    </RadioGroupOption>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <!-- <div v-if="selectedGroup === fermGroupId">
                        <SmallCardsFormGroup
                            v-model="selectedGefCycle"
                            :options="menusStore.gefCycles"
                            :edit="true"
                        />
                    </div> -->
                </div>

                <template v-if="projectStore.projects && projectStore.projects.length">
                    <div class="text-md font-bold text-center mt-2 mb-2 text-gray-700">{{ projectStore.projects.length }} of {{ projectStore.nProjectsFound }} initiatives
                    </div>

                    <div class="mt-8 overflow-hidden_ bg-gray-50 shadow sm:rounded-md">
                        <ul
                            role="list"
                            class="divide-y divide-gray-200"
                        >
                            <li
                                v-for="project in projectStore.projects"
                                :key="project.id"
                            >
                                <div class="flex flex-row">
                                    <div class="px-4 py-4 sm:px-6 grow overflow-hidden">
                                        <div>
                                            <div class="flex items-center justify-between">
                                                <label
                                                    :title="project.data.project?.title || 'No title'"
                                                    class="truncate"
                                                >
                                                    <router-link
                                                        :to="{ name: 'projectInfo', params: { id: project.id } }"
                                                        :class="[project.data.project?.title ? 'text-ferm-blue-dark-800' : 'italic text-gray-400', 'text-sm font-medium hover:text-indigo-500 project-link']"
                                                    >
                                                        {{ project.data.project?.title || 'No title' }}
                                                    </router-link>
                                                </label>
                                            </div>
                                            <div class="mt-2 sm:flex sm:justify-between">
                                                <div class="sm:flex">
                                                    <p class="flex items-center text-sm text-gray-500">
                                                        {{ project.data.created_by_name }}
                                                        &middot;
                                                        {{ userGroups[project.data.group] }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="mt-2 sm:flex sm:justify-between">
                                                <div class="sm:flex">
                                                    <p class="flex items-center text-sm text-gray-500">
                                                        <template v-if="project.data.publishedVersion">
                                                            <MegaphoneIcon
                                                                class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                aria-hidden="true"
                                                            />
                                                            Public
                                                        </template>
                                                        <template v-if="projectUtils.getStatus(project) === 'draft'">
                                                            <Cog6ToothIcon
                                                                class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                :class="{ 'ml-2': project.data.publishedVersion }"
                                                                aria-hidden="true"
                                                            />
                                                            <template v-if="project.data.publishedVersion">
                                                                New revision
                                                            </template>
                                                            <template v-else>
                                                                Draft
                                                            </template>
                                                        </template>
                                                        <template v-if="projectUtils.getStatus(project) === 'submitted'">
                                                            <DocumentMagnifyingGlassIcon
                                                                class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                aria-hidden="true"
                                                            />
                                                            Under review
                                                        </template>
                                                    </p>
                                                    <!-- Best practices menu -->
                                                    <Menu
                                                        v-if="project.data.bestPracticesCount"
                                                        as="div"
                                                        class="relative_ inline-block text-left"
                                                    >
                                                        <div class="sm:mt-0 sm:ml-6 text-sm">
                                                            <MenuButton
                                                                @click="showBestPractices(project.id)"
                                                                class="flex items-center rounded-full  text-gray-500 hover:text-gray-600 focus:outline-none"
                                                            >
                                                                <span class="text-gray-600">{{ project.data.bestPracticesCount
                                                                    }} good
                                                                    practice{{ project.data.bestPracticesCount === 1 ? '' : 's'
                                                                    }}</span>
                                                                <ChevronDownIcon
                                                                    class="-mr-1 ml-2 h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            </MenuButton>
                                                        </div>
                                                        <transition
                                                            enter-active-class="transition ease-out duration-100"
                                                            enter-from-class="transform opacity-0 scale-95"
                                                            enter-to-class="transform opacity-100 scale-100"
                                                            leave-active-class="transition ease-in duration-75"
                                                            leave-from-class="transform opacity-100 scale-100"
                                                            leave-to-class="transform opacity-0 scale-95"
                                                        >
                                                            <menu-items class="absolute z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                <div
                                                                    v-if="bestPractices.length"
                                                                    class="py-1"
                                                                >
                                                                    <menu-item
                                                                        v-slot="{ active }"
                                                                        v-for="bp in bestPractices"
                                                                    >
                                                                        <router-link
                                                                            :to="`/registry/good-practices/${project.id}/${bp.id}/objectives`"
                                                                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'px-4 py-2 text-sm block']"
                                                                        >
                                                                            <div class="flex flex-row">
                                                                                <div>
                                                                                    <PencilSquareIcon
                                                                                        v-if="!bp.data.status || bp.data.status === 'draft'"
                                                                                        class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                    <DocumentMagnifyingGlassIcon
                                                                                        v-else-if="bp.data.status === 'submitted'"
                                                                                        class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                    <MegaphoneIcon
                                                                                        v-else-if="bp.data.status === 'published'"
                                                                                        class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </div>
                                                                                <div class="truncate">
                                                                                    {{ bp.data.title || 'No title' }}
                                                                                </div>
                                                                            </div>
                                                                        </router-link>
                                                                    </menu-item>
                                                                </div>
                                                                <!-- <div class="py-1">
                                                                    <menu-item v-slot="{ active }">
                                                                        <router-link :to="{ name: 'goodPracticesObjectivesEdit', params: { id: 'new' }, query: { projectId: project.id } }"
                                                                                     :class="[active ? 'bg-gray-100 text-blue-900' : 'text-blue-700', 'block px-4 py-2 text-sm font-medium']">New good practice</router-link>
                                                                    </menu-item>
                                                                </div> -->
                                                            </menu-items>
                                                        </transition>
                                                    </Menu>
                                                    <div
                                                        v-else
                                                        class="sm:mt-0 sm:ml-6 text-sm"
                                                    >
                                                        <router-link
                                                            :to="{ name: 'goodPracticesObjectivesEdit', params: { projectId: project.id, id: 'new' } }"
                                                            type="button"
                                                            class="inline-flex items-center text-sm font-normal text-ferm-blue-dark-700"
                                                        >
                                                            Add good practice
                                                        </router-link>
                                                    </div>
                                                </div>

                                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <!-- <CalendarIcon
                                                        class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    /> -->
                                                    <p>
                                                        Date modified:
                                                        {{ ' ' }}
                                                        <time :datetime="fbTimestampToString(project.data['updateTime'])">
                                                            {{ fbTimestampToString(project.data['updateTime']) }}
                                                        </time>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="self-center pr-4">
                                        <ActionsMenu :project="project" />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </template>

                <div v-if="projectStore.projects && !projectStore.projects.length && !projectStore.loadingNext">
                    <div class="mt-8">
                        <div class="flex flex-col items-center">
                            <div class="flex-shrink-0">
                                <FaceFrownIcon
                                    class="h-12 w-12 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <div class="mt-3 text-center sm:mt-5">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">
                                    No initiatives found
                                </h3>
                                <div class="mt-4">
                                    <button
                                        type="button"
                                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ferm-blue-dark-700 hover:bg-ferm-blue-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        @click="resetFilters"
                                    >
                                        Reset filters
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <div class="text-center mt-8">
                <div
                    v-if="projectStore.projects.length > 10"
                    class="text-md font-bold text-center mb-4 text-gray-700"
                >{{ projectStore.projects.length }} of
                    {{ projectStore.nProjectsFound }} initiatives
                </div>
                <button
                    v-if="!projectStore.isLastPage && !projectStore.loadingNext"
                    @click="projectStore.fetchNextProjects(undefined, undefined, { group: selectedGroup, country: selectedCountry, gefCycle: selectedGefCycle })"
                    class="rounded-md bg-ferm-blue-dark-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ferm-blue-dark-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ferm-blue-dark-500"
                >
                    Load more
                </button>
                <template
                    v-if="projectStore.loadingNext"
                    class="text-gray-500 text-lg"
                >Loading...
                </template>
            </div>
        </div>
    </div>
</template>
