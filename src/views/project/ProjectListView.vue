<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { fbTimestampToString } from '@/lib/util';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
    CalendarIcon,
    Cog6ToothIcon,
    ChevronDownIcon,
    PencilSquareIcon,
    MegaphoneIcon,
    DocumentMagnifyingGlassIcon
} from '@heroicons/vue/20/solid';

import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import { useBestPracticesStore } from '@/stores/bestpractices';

import InstitutionsAssignment from '../InstitutionsAssignment.vue';
import { fetchAllGroups } from '@/firebase/firestore';

import NewProjectDialog from '@/views/project/NewProjectDialog.vue';
import router from '@/router';

import ConfirmModal from '@/views/ConfirmModal.vue';

import * as projectUtils from '@/lib/project';
import ActionsMenu from './ActionsMenu.vue';


const projectStore = useProjectStore();
const authStore = useAuthStore();
const bestPracticesStore = useBestPracticesStore();

const userGroups = ref();

onMounted(async () => {
    // if (authStore.isAdmin || Object.keys(authStore.userGroups).length) {
    projectStore.fetchNextProjects(filterGroup.value, undefined, undefined, true);
    // }
    userGroups.value = authStore.isAdmin ? await fetchAllGroups() : authStore.userGroups;
});

const bestPractices = ref([]);

async function showBestPractices(projectId: string) {
    bestPractices.value = await bestPracticesStore.fetchProjectBestPractices(projectId);
}

function getAccessLevel(group: string): string {
    if (authStore.isAdmin) return 'admin';
    return authStore.privileges[group];
}

const filterGroup = ref<string | null>(null);

watch(filterGroup, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        if (authStore.isAdmin || Object.keys(authStore.userGroups).length) {
            projectStore.fetchNextProjects(filterGroup.value, undefined, undefined, true);
        }
    }
});

const showNewInitiativeDialog = ref(false);

async function createProject({ title, reportingLine, group }) {
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

</script>

<template>
    <!-- Terms and conditions dialog -->
    <ConfirmModal :open="showTermsAndConditions"
                  title="Terms and Conditions for Adding an Initiative to the FERM Registry"
                  ok-button-text="Accept"
                  cancel-button-text="Reject"
                  :ok-button-enabled=true
                  @confirm="acceptTermsAndConditions"
                  @closed="checkTermsAndConditionsAndShowDialog"
                  @cancel="rejectTermsAndConditions">
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
                href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>.</p>
        </div>
    </ConfirmModal>

    <!-- New initiative dialog -->
    <NewProjectDialog :show="showNewInitiativeDialog"
                      @cancel="() => { showNewInitiativeDialog = false }"
                      @confirm="createProject" />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="mt-12 font-akrobat text-4xl text-gray-800 dark:text-white mb-8 font-extrabold uppercase">
                Initiatives</h1>

            <p class="dark:text-white">Restoration projects, programs and initiatives at all spatial scales, from
                individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global
                goals for
                sustaining life on Earth. The FERM registry allows you to consistently and transparently monitor,
                report, and share
                information on restoration initiatives good practices. The information published in the FERM
                Registry will be used to officially report on hectares under restoration during the United Nations
                Decade on Ecosystem
                Restoration and for the Convention on Biological Diversity Post-2020 Global Biodiversity Framework
                Target 2.</p>
            <!-- If the user is not an admin and not part of any group, show a message -->
            <!-- <div v-if="true" -->
            <div v-if="!(authStore.isAdmin || Object.keys(authStore.userGroups).length)"
                 class="mt-10 dark:text-gray-100">
                <InstitutionsAssignment />
            </div>

            <!-- If the user is an admin or part of a group, show the initiatives -->
            <template v-else>
                <div class="flex mt-6">
                    <!-- Search -->
                    <Menu as="div"
                          class="relative inline-block text-left">
                        <div>
                            <MenuButton
                                class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                Filter by institution
                                <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5"
                                                 aria-hidden="true" />
                            </MenuButton>
                        </div>
                        <transition v-if="userGroups"
                                    enter-active-class="transition ease-out duration-100"
                                    enter-from-class="transform opacity-0 scale-95"
                                    enter-to-class="transform opacity-100 scale-100"
                                    leave-active-class="transition ease-in duration-75"
                                    leave-from-class="transform opacity-100 scale-100"
                                    leave-to-class="transform opacity-0 scale-95">
                            <menu-items
                                class="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div class="py-1">
                                    <menu-item v-slot="{ active }">
                                        <span
                                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-12 py-2 text-sm', 'cursor-default']"
                                            @click="filterGroup = null">
                                            All
                                        </span>
                                    </menu-item>
                                    <menu-item
                                        v-for="[id, name] in Object.entries(userGroups).sort((a, b) => a[1].localeCompare(b[1]))"
                                        v-slot="{ active }">
                                        <div @click="filterGroup = id"
                                             :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm', 'cursor-default flex flex-row']">
                                            <div class="w-5 mr-3">
                                                <PencilSquareIcon
                                                    v-if="['admin', 'editor'].includes(getAccessLevel(id))"
                                                    class="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                    aria-hidden="true" />
                                            </div>
                                            <!-- <EyeIcon v-else class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" /> -->
                                            <div>{{ name }}</div>
                                        </div>
                                    </menu-item>
                                </div>
                            </menu-items>
                        </transition>
                    </Menu>

                    <!-- Create new initiative -->
                    <button v-if="authStore.isAdmin || Object.keys(authStore.userGroups).length"
                            type="button"
                            class="ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ferm-blue-dark-700 hover:bg-ferm-blue-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            @click="showTermsAndConditions = true">
                        Create new initiative
                    </button>
                </div>

                <template v-if="projectStore.projects && projectStore.projects.length">

                    <div class="text-lg text-center mt-2 mb-2 text-gray-900">{{ projectStore.projects.length }} of
                        {{ projectStore.nProjectsFound }} initiatives
                    </div>

                    <div class="mt-8 overflow-hidden_ bg-white shadow sm:rounded-md">
                        <ul role="list"
                            class="divide-y divide-gray-200">
                            <li v-for="project in projectStore.projects"
                                :key="project.id">
                                <div class="flex flex-row">
                                    <div class="px-4 py-4 sm:px-6 grow overflow-hidden">
                                        <div>
                                            <div class="flex items-center justify-between">
                                                <label :title="project.data.project?.title || 'No title'"
                                                       class="truncate">
                                                    <router-link
                                                        :to="{ name: 'projectInfo', params: { id: project.id } }"
                                                        :class="[project.data.project?.title ? 'text-indigo-600' : 'italic text-gray-400', 'text-sm font-medium hover:text-indigo-500 project-link']">
                                                        {{ project.data.project?.title || 'No title' }}
                                                    </router-link>
                                                </label>
                                            </div>
                                            <div class="mt-2 sm:flex sm:justify-between">
                                                <div class="sm:flex">
                                                    <p class="flex items-center text-sm text-gray-500">
                                                        <template v-if="projectUtils.getStatus(project) === 'draft'">
                                                            <Cog6ToothIcon
                                                                class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                aria-hidden="true" />
                                                            Draft
                                                        </template>
                                                        <template
                                                            v-if="projectUtils.getStatus(project) === 'submitted'">
                                                            <DocumentMagnifyingGlassIcon
                                                                class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                aria-hidden="true" />
                                                            Under review
                                                        </template>
                                                        <template v-if="projectUtils.getStatus(project) === 'public'">
                                                            <MegaphoneIcon
                                                                class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                aria-hidden="true" />
                                                            Public
                                                        </template>
                                                    </p>
                                                    <!-- Best practices menu -->
                                                    <Menu v-if="project.data.bestPracticesCount"
                                                          as="div"
                                                          class="relative inline-block text-left">
                                                        <div class="sm:mt-0 sm:ml-6 text-sm">
                                                            <MenuButton @click="showBestPractices(project.id)"
                                                                        class="flex items-center rounded-full  text-gray-500 hover:text-gray-600 focus:outline-none">
                                                            <span
                                                                class="text-gray-600">{{ project.data.bestPracticesCount
                                                                }} good
                                                                practice{{ project.data.bestPracticesCount === 1 ? '' : 's'
                                                                }}</span>
                                                                <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5"
                                                                                 aria-hidden="true" />
                                                            </MenuButton>
                                                        </div>
                                                        <transition
                                                            enter-active-class="transition ease-out duration-100"
                                                            enter-from-class="transform opacity-0 scale-95"
                                                            enter-to-class="transform opacity-100 scale-100"
                                                            leave-active-class="transition ease-in duration-75"
                                                            leave-from-class="transform opacity-100 scale-100"
                                                            leave-to-class="transform opacity-0 scale-95">
                                                            <menu-items
                                                                class="absolute left-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                <div v-if="bestPractices.length"
                                                                     class="py-1">
                                                                    <menu-item v-slot="{ active }"
                                                                               v-for="bp in bestPractices">
                                                                        <router-link
                                                                            :to="`/registry/good-practices/${bp.id}/objectives`"
                                                                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'px-4 py-2 text-sm block']">
                                                                            <div class="flex flex-row">
                                                                                <div>
                                                                                    <PencilSquareIcon
                                                                                        v-if="!bp.data.status || bp.data.status === 'draft'"
                                                                                        class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                        aria-hidden="true" />
                                                                                    <DocumentMagnifyingGlassIcon
                                                                                        v-else-if="bp.data.status === 'submitted'"
                                                                                        class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                        aria-hidden="true" />
                                                                                    <MegaphoneIcon
                                                                                        v-else-if="bp.data.status === 'published'"
                                                                                        class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                        aria-hidden="true" />
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
                                                    <!-- <div v-else
                                                         class="sm:mt-0 sm:ml-6 text-sm">
                                                        <router-link :to="{ name: 'goodPracticesObjectivesEdit', params: { id: 'new' }, query: { projectId: project.id } }"
                                                                     type="button"
                                                                     class="inline-flex items-center text-sm font-medium text-indigo-700">
                                                            New good practice
                                                        </router-link>
                                                    </div> -->
                                                </div>

                                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                  aria-hidden="true" />
                                                    <p>
                                                        Last updated on
                                                        {{ ' ' }}
                                                        <time
                                                            :datetime="fbTimestampToString(project.data['updateTime'])">
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
            </template>

            <div class="text-center mt-8">
                <div v-if="projectStore.projects.length > 10"
                     class="text-lg text-center mb-4 text-gray-900">{{ projectStore.projects.length }} of
                    {{ projectStore.nProjectsFound }} initiatives
                </div>
                <button v-if="!projectStore.isLastPage && !projectStore.loadingNext"
                        @click="projectStore.fetchNextProjects(filterGroup)"
                        class="rounded-md bg-ferm-blue-dark-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ferm-blue-dark-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ferm-blue-dark-500">
                    Load more
                </button>
                <template v-if="projectStore.loadingNext"
                          class="text-gray-500 text-lg">Loading...
                </template>
            </div>
        </div>
    </div>
</template>

