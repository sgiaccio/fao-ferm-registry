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

// async function print(projectId: string) {
//     const routeData = router.resolve({ name: 'printInitiative', params: { id: projectId } });
//     window.open(routeData.href, '_blank');
// }


// const projectToSubmitId = ref<string | null>(null);
// const projectToSubmitName = ref<string | null>(null);
// async function submitProject(projectId: string) {
//     try {
//         await submitForReview(projectId);
//     } catch (e) {
//         alert('Error submitting project');
//         console.error(e);
//     } finally {
//         projectToSubmitId.value = null;
//         projectToSubmitName.value = null;
//     }
//     // refetch the project to update the status and replace the current
//     projectStore.refetchProject(projectId);
// }

// const showSubmitConfirmDialog = ref(false);
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
            <p>By adding your initiative to the Framework for Ecosystem Restoration Monitoring (FERM) Registry, you agree to abide by the following terms and conditions:</p>
            <ul class="mt-3">
                <li><span class="font-bold">Ownership and Responsibility:</span>
                    You affirm that you are authorized to represent the institution associated with the initiative, and that you hold all necessary rights to share information pertaining to the initiative.</li>
                <li class="mt-2"><span class="font-bold">Accuracy of Information:</span>
                    You affirm that all information provided to the FERM Registry is accurate, complete, and up-to-date. You agree to promptly update any information should changes occur.</li>
                <li class="mt-2"><span class="font-bold">Data Sharing:</span>
                    You understand that the initiative data will be publicly available and shared with other FERM users. The data may be used for monitoring restoration activities, research purposes, informing policy decisions, and furthering the cause of ecosystem restoration.</li>
                <li class="mt-2"><span class="font-bold">Privacy:</span>
                    All personal data provided will be processed in accordance with our Privacy Policy. We will take appropriate measures to ensure your personal data remains secure.</li>
                <li class="mt-2"><span class="font-bold">Compliance with Laws:</span>
                    You agree to comply with all applicable local, national, and international laws and regulations pertaining to environmental conservation and data sharing.</li>
            </ul>
            <p class="mt-3">By clicking "Accept", you agree to these terms and conditions.</p>

            <p class="mt-3">For any further questions regarding these terms, please contact us at <a class="font-bold underline"
                   href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>.</p>
        </div>
    </ConfirmModal>

    <!-- New initiative dialog -->
    <NewProjectDialog :show="showNewInitiativeDialog"
                      @cancel="() => { showNewInitiativeDialog = false }"
                      @confirm="createProject" />

    <!-- Submit for review dialog -->
    <!-- <ConfirmModal :open="!!projectToSubmitId"
                  title="Submit Initiative for Review?"
                  ok-button-text="Submit"
                  cancel-button-text="Cancel"
                  @confirm="() => { submitProject(projectToSubmitId!); }"
                  @cancel="() => { projectToSubmitId = null; }"
                  @closed="() => { showSubmitConfirmDialog = true }">
        <div class="mt-3 max-w-xl text-sm text-gray-500">
            <p>Are you sure you want to submit your initiative, <span class="font-bold">'{{projectToSubmitName}}'</span>, for review? Please note that by proceeding:</p>
            <ol class="mt-2 list-decimal list-inside">
                <li>An email will be sent to your institution administrators for review. They will have the authority to either accept or reject your initiative.</li>
                <li class="mt-1">You will not be able to make further edits to the initiative once it's submitted for review.</li>
            </ol>
            <p class="mt-2">Please review your submission thoroughly to ensure all information is accurate and complete before proceeding. Do you wish to proceed?"</p>
        </div>
    </ConfirmModal>

    <AlertModal :open="showSubmitConfirmDialog"
                type="success"
                button-text="OK"
                title="Initiative Submitted for Review"
                
                @close="() => { showSubmitConfirmDialog = false }">
        <div class="mt-3 max-w-xl text-sm text-gray-500">
            <p>Your initiative has been submitted for review. An email will be sent to your institution administrators for review. They will have the authority to either accept or reject your initiative.</p>
        </div>
    </AlertModal> -->

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="mt-12 font-akrobat text-4xl text-gray-800 dark:text-white mb-8 font-extrabold uppercase">Initiatives</h1>

            <p class="dark:text-white">Restoration projects, programs and initiatives at all spatial scales, from
                individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for
                sustaining life on Earth. The FERM registry allows you to consistently and transparently monitor, report, and share
                information on restoration initiatives good practices. The information published in the FERM
                Registry will be used to officially report on hectares under restoration during the United Nations Decade on Ecosystem
                Restoration and for the Convention on Biological Diversity Post-2020 Global Biodiversity Framework Target 2.</p>
            <!-- If the user is not an admin and not part of any group, show a message -->
            <!-- <div v-if="true" -->
            <div v-if="!(authStore.isAdmin || Object.keys(authStore.userGroups).length)"
                 class="mt-10 dark:text-gray-100">
                <InstitutionsAssignment />
            </div>


            <template v-else-if="projectStore.projects && projectStore.projects.length">
                <div class="flex mt-6">
                    <Menu as="div"
                          class="relative inline-block text-left">
                        <div>
                            <MenuButton class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
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
                            <menu-items class="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div class="py-1">
                                    <menu-item v-slot="{ active }">
                                        <span :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-12 py-2 text-sm', 'cursor-default']"
                                              @click="filterGroup = null"
                                              href="#">
                                            All
                                        </span>
                                    </menu-item>
                                    <menu-item v-for="[id, name] in Object.entries(userGroups).sort((a, b) => a[1].localeCompare(b[1]))"
                                               v-slot="{ active }">
                                        <div @click="filterGroup = id"
                                             :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm', 'cursor-default flex flex-row']">
                                            <div class="w-5 mr-3">
                                                <PencilSquareIcon v-if="['admin', 'editor'].includes(getAccessLevel(id))"
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
                    <button v-if="authStore.isAdmin || Object.keys(authStore.userGroups).length"
                            type="button"
                            class="ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ferm-blue-dark-700 hover:bg-ferm-blue-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            @click="showTermsAndConditions = true">
                        Create new initiative
                    </button>
                </div>

                <div class="text-lg text-center mt-2 mb-2 text-gray-900">{{ projectStore.projects.length }} of {{ projectStore.nProjectsFound }} initiatives</div>

                <div class="mt-8 overflow-hidden_ bg-white shadow sm:rounded-md">
                    <ul role="list"
                        class="divide-y divide-gray-200">
                        <li v-for="project in projectStore.projects"
                            :key="project.id">
                            <div class="flex flex-row">
                                <div class="px-4 py-4 sm:px-6 grow overflow-hidden">
                                    <span class="block hover:bg-gray-50_">
                                        <div class="flex items-center justify-between">
                                            <label :title="project.data.project?.title || 'No title'"
                                                   class="truncate">
                                                <router-link :to="{ name: 'projectInfo', params: { id: project.id } }"
                                                             :class="[project.data.project?.title ? 'text-indigo-600' : 'italic text-gray-400', 'text-sm font-medium hover:text-indigo-500 project-link']">
                                                    {{ project.data.project?.title || 'No title' }}
                                                </router-link>
                                            </label>
                                        </div>
                                        <div class="mt-2 sm:flex sm:justify-between">
                                            <div class="sm:flex">
                                                <p class="flex items-center text-sm text-gray-500">
                                                    <template v-if="projectUtils.getStatus(project) === 'draft'">
                                                        <Cog6ToothIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                       aria-hidden="true" />
                                                        Draft
                                                    </template>
                                                    <template v-if="projectUtils.getStatus(project) === 'submitted'">
                                                        <DocumentMagnifyingGlassIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                                     aria-hidden="true" />
                                                        Under review
                                                    </template>
                                                    <template v-if="projectUtils.getStatus(project) === 'public'">
                                                        <MegaphoneIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
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
                                                            <span class="text-gray-600">{{ project.data.bestPracticesCount }} good
                                                                practice{{ project.data.bestPracticesCount === 1 ? '' : 's' }}</span>
                                                            <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5"
                                                                             aria-hidden="true" />
                                                        </MenuButton>
                                                    </div>
                                                    <transition enter-active-class="transition ease-out duration-100"
                                                                enter-from-class="transform opacity-0 scale-95"
                                                                enter-to-class="transform opacity-100 scale-100"
                                                                leave-active-class="transition ease-in duration-75"
                                                                leave-from-class="transform opacity-100 scale-100"
                                                                leave-to-class="transform opacity-0 scale-95">
                                                        <menu-items class="absolute left-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                            <div v-if="bestPractices.length"
                                                                 class="py-1">
                                                                <menu-item v-slot="{ active }"
                                                                           v-for="bp in bestPractices">
                                                                    <router-link :to="`/registry/good-practices/${bp.id}/objectives`"
                                                                                 :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'px-4 py-2 text-sm block']">
                                                                        <div class="flex flex-row">
                                                                            <div>
                                                                                <PencilSquareIcon v-if="!bp.data.status || bp.data.status === 'draft'"
                                                                                                  class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                                  aria-hidden="true" />
                                                                                <DocumentMagnifyingGlassIcon v-else-if="bp.data.status === 'submitted'"
                                                                                                             class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                                             aria-hidden="true" />
                                                                                <MegaphoneIcon v-else-if="bp.data.status === 'published'"
                                                                                               class="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                               aria-hidden="true" />
                                                                            </div>
                                                                            <div class="truncate">{{ bp.data.title || "No title" }}</div>
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
                                                    <time :datetime="fbTimestampToString(project.data['updateTime'])">
                                                        {{ fbTimestampToString(project.data['updateTime']) }}
                                                    </time>
                                                </p>
                                            </div>
                                        </div>
                                    </span>
                                </div>

                                <div class="self-center pr-4">
                                    <ActionsMenu :project="project" />
                                    <!-- Operations menu -->
                                    <!-- <Menu as="div"
                                          class="relative inline-block text-left">
                                        <div>
                                            <menu-button class="flex items-center rounded-full bg-gray-100_ text-gray-400 hover:text-gray-600 focus:outline-none">
                                                <span class="sr-only">Open options</span>
                                                <EllipsisVerticalIcon class="h-5 w-5"
                                                                      aria-hidden="true" />
                                            </menu-button>
                                        </div>

                                        <transition enter-active-class="transition ease-out duration-100"
                                                    enter-from-class="transform opacity-0 scale-95"
                                                    enter-to-class="transform opacity-100 scale-100"
                                                    leave-active-class="transition ease-in duration-75"
                                                    leave-from-class="transform opacity-100 scale-100"
                                                    leave-to-class="transform opacity-0 scale-95">
                                            <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div class="py-1">
                                                    <menu-item v-slot="{ active }">
                                                        <router-link :to="{ name: 'projectInfo', params: { id: project.id } }"
                                                                     :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                            <EyeIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                     aria-hidden="true" />
                                                            View
                                                        </router-link>
                                                    </menu-item>
                                                    <menu-item v-slot="{ active }">
                                                        <span @click="() => print(project.id)"
                                                              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                            <PrinterIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                         aria-hidden="true" />
                                                            Print
                                                        </span>
                                                    </menu-item>
                                                </div>
                                                <div class="py-1"
                                                     v-if="projectAsdf.canEdit(project) || projectAsdf.canAddBestPractice(project)">
                                                    <menu-item v-if="projectAsdf.canEdit(project)"
                                                               v-slot="{ active }">
                                                        <router-link :to="{ name: 'projectInfoEdit', params: { id: project.id } }"
                                                                     :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                            <pencil-square-icon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                aria-hidden="true" />
                                                            Edit
                                                        </router-link>
                                                    </menu-item>
                                                    <menu-item v-if="projectAsdf.canSubmit(project)"
                                                               v-slot="{ active }">
                                                        <div @click="() => { projectToSubmitId = project.id; projectToSubmitName = project.data.project?.title; }"
                                                             :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                            <document-magnifying-glass-icon class="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                                            aria-hidden="true" />
                                                            Submit for review
                                                        </div>
                                                    </menu-item>
                                                    <menu-item v-if="projectAsdf.canAddBestPractice(project)"
                                                               v-slot="{ active }">
                                                        <router-link :to="{ name: 'goodPracticesObjectivesEdit', params: { id: 'new' }, query: { projectId: project.id } }"
                                                                     :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                            <HandThumbUpIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                             aria-hidden="true" />
                                                            Add Good Practice
                                                        </router-link>
                                                    </menu-item>
                                                </div>
                                                <div v-if="projectStore.canEdit()"
                                                     class="py-1">
                                                    <menu-item v-slot="{ active }">
                                                        <span @click="deleteProject(project.id)"
                                                              :class="[active ? 'bg-gray-100 text-ferm-red-light' : 'text-ferm-red-dark', 'group flex items-center px-4 py-2 text-sm']">
                                                            <TrashIcon class="mr-3 h-5 w-5 text-ferm-red-dark group-hover:text-ferm-red-light"
                                                                       aria-hidden="true" />
                                                            Delete
                                                        </span>
                                                    </menu-item>
                                                </div>
                                            </MenuItems>
                                        </transition>
                                    </Menu> -->
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>

            <div class="text-center mt-8">
                <div v-if="projectStore.projects.length > 10"
                     class="text-lg text-center mb-4 text-gray-900">{{ projectStore.projects.length }} of {{ projectStore.nProjectsFound }} initiatives</div>
                <button v-if="!projectStore.isLastPage && !projectStore.loadingNext"
                        @click="projectStore.fetchNextProjects(filterGroup)"
                        class="rounded-md bg-ferm-blue-dark-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ferm-blue-dark-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ferm-blue-dark-500">
                    Load more
                </button>
                <template v-if="projectStore.loadingNext"
                          class="text-gray-500 text-lg">Loading...</template>
            </div>

            <!-- <div v-else
                 class="text-center pt-12">
                <svg class="mx-auto h-12 w-12 text-gray-400"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     aria-hidden="true">
                    <path vector-effect="non-scaling-stroke"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-semibold text-gray-900">No initiatives</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by creating a new initiative.</p>
                <div class="mt-6">
                    <Menu as="div"
                          class="ml-auto relative inline-block text-left">
                        <div>
                            <MenuButton class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                New initiative
                                <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5"
                                                 aria-hidden="true" />
                            </MenuButton>
                        </div>

                        <transition enter-active-class="transition ease-out duration-100"
                                    enter-from-class="transform opacity-0 scale-95"
                                    enter-to-class="transform opacity-100 scale-100"
                                    leave-active-class="transition ease-in duration-75"
                                    leave-from-class="transform opacity-100 scale-100"
                                    leave-to-class="transform opacity-0 scale-95">
                            <menu-items class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div class="px-4 py-3">
                                    <p class="text-sm font-medium text-gray-900">Your institutions:</p>
                                </div>
                                <div class="py-1">
                                    <menu-item v-for="[id, name] in Object.entries(authStore.userGroups)"
                                               v-slot="{ active }">
                                        <router-link :to="{ path: '/registry/initiatives/new/edit/info', query: { groupId: id } }"
                                                     :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">
                                            {{ name }}
                                        </router-link>
                                    </menu-item>
                                </div>
                                <div class="py-1">
                                    <menu-item v-slot="{ active }">
                                        <router-link :to="{ name: 'newOrganization' }"
                                                     :class="[active ? 'bg-gray-100 text-ferm-blue-dark-900' : 'text-ferm-blue-dark-900', 'block px-4 py-2 text-sm font-semibold']">
                                            Join or create new institution
                                        </router-link>
                                    </menu-item>
                                </div>
                            </menu-items>
                        </transition>
                    </Menu>
                    <!- - <button type="button"
                            class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5"
                                  aria-hidden="true" />
                        New Initiative
                    </button> - ->
                </div>
            </div> -->
        </div>
    </div>
</template>

