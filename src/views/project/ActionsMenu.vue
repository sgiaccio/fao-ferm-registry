<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';

import router from '@/router';
import { useRoute } from 'vue-router';

import * as projectUtils from '@/lib/project';

import { useProjectStore } from '@/stores/project';

import { submitForReview, publishProject, rejectProject, createNewProjectVersion } from '@/firebase/functions';

import {
    EllipsisVerticalIcon,
    PencilSquareIcon,
    TrashIcon,
    PrinterIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    CheckBadgeIcon,
    DocumentMagnifyingGlassIcon,
    EyeIcon,
    ChevronDownIcon,
    UserGroupIcon,
    WrenchIcon
} from '@heroicons/vue/20/solid';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';

import TwoStagesDialog from '@/components/TwoStagesDialog.vue';
import { canAddCollaborators } from '@/lib/project';


const props = withDefaults(defineProps<{
    project: any,
    excludeViewMenuItem?: boolean,
    label?: string,
    sections?: ('view' | 'edit' | 'publishing' | 'best-practices' | 'delete')[],
}>(), {
    excludeViewMenuItem: false
});

const emit = defineEmits(['done']);

const { t } = useI18n();

const route = useRoute();

const projectStore = useProjectStore();


async function print(projectId: string) {
    const routeData = router.resolve({ name: 'printInitiative', params: { id: projectId } });
    window.open(routeData.href, '_blank');
}

const submitDialog = ref();

function openSubmitDialog() {
    submitDialog.value.open();
}

async function submit() {
    await submitForReview(props.project.id);
}

function done() {
    projectStore.refetchProject(props.project.id);
    emit('done');
}

const publishDialog = ref();
const rejectDialog = ref();

function openPublishDialog() {
    publishDialog.value.open();
}

async function publish() {
    await publishProject(props.project.id);
}

const rejectReason = ref<string>('');

function openRejectDialog() {
    rejectDialog.value.open();
}

async function reject() {
    await rejectProject(props.project.id, rejectReason.value);
    rejectReason.value = '';
}

function cancelReject() {
    rejectReason.value = '';
}

async function deleteProject(projectId: string) {
    if (confirm(t('actionsMenu.deleteConfirm'))) {
        return projectStore.deleteProject(projectId);
    }
}

function goToEditRoute() {
    const routeName = route.name;
    if (routeName === 'initiatives') {
        router.push({ name: 'projectInfoEdit', params: { id: props.project.id } });
    } else {
        router.push({ name: `${String(routeName)}Edit`, params: { id: props.project.id } });
    }
}

function goToCollaboratorsRoute() {
    router.push({ name: 'projectCollaborators', params: { id: props.project.id } });
}

const createNewVersionDialog = ref();

function openCreateNewVersionDialog() {
    createNewVersionDialog.value.open();
}

async function createNewVersion() {
    await createNewProjectVersion(props.project.id);
}

function newVersionCreated() {
    projectStore.refetchProject(props.project.id);
    router.push({ name: 'projectInfoEdit', params: { id: props.project.id } });
}
</script>

<template>
    <TwoStagesDialog
        ref="submitDialog"
        title="Publish Initiative"
        success-title="Initiative Submitted for Review"
        error-title="Error Submitting Initiative for Review"
        :confirm-callback="submit"
        @complete="done"
    >
        <template #confirm>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <i18n-t
                    keypath="actionsMenu.submitConfirm"
                    tag="p"
                >
                    <template #title>{{ project.data.project?.title }}</template>
                </i18n-t>
                <ol class="mt-2 list-decimal list-inside">
                    <li>
                        {{ t('actionsMenu.submitConfirmList1') }}
                    </li>
                    <li class="mt-1">
                        {{ t('actionsMenu.submitConfirmList2') }}
                    </li>
                </ol>
                <p class="mt-2">
                    {{ t('actionsMenu.submitProceed') }}
                </p>
            </div>
        </template>
        <template #success>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    {{ t('actionsMenu.submitSuccess') }}
                </p>
            </div>
        </template>
        <template #error>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    <!-- There was an error submitting your initiative. Please try again later. -->
                    {{ t('actionsMenu.submitError') }}
                </p>
            </div>
        </template>
    </TwoStagesDialog>

    <TwoStagesDialog
        ref="publishDialog"
        title="Publish initiative?"
        success-title="Initiative Published"
        error-title="Error Publishing Initiative"
        :confirm-callback="publish"
        @complete="done"
    >
        <template #confirm>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <!-- <p>
                </p> -->
                <vue-i18n-t
                    keypath="actionsMenu.publishConfirm"
                    tag="p"
                >
                    <template #title>{{ project.data.project?.title }}</template>
                </vue-i18n-t>
            </div>
        </template>
        <template #success>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    {{ t('actionsMenu.publishSuccess') }}
                </p>
            </div>
        </template>
        <template #error>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    <!-- There was an error publishing your initiative. Please try again later. -->
                    {{ t('actionsMenu.publishError') }}
                </p>
            </div>
        </template>
    </TwoStagesDialog>

    <TwoStagesDialog
        ref="rejectDialog"
        title="Reject Initiative?"
        success-title="Initiative Rejected"
        error-title="Error Rejecting Initiative"
        confirm-button-text="Reject"
        :confirm-button-enabled="rejectReason !== ''"
        :confirm-callback="reject"
        @complete="done"
        @cancel="cancelReject"
    >
        <template #confirm>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <i18n-t
                    keypath="actionsMenu.rejectConfirm"
                    tag="p"
                >
                    <template #title>{{ project.data.project?.title }}</template>
                </i18n-t>
                <p>
                    {{ t('actionsMenu.rejectProceed') }}
                    <textarea
                        v-model="rejectReason"
                        rows="4"
                        class="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        :placeholder="t('actionsMenu.rejectReasonPlaceholder')"
                    ></textarea>
                </p>
            </div>
        </template>
        <template #success>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    {{ t('actionsMenu.rejectSuccess') }}
                </p>
            </div>
        </template>
        <template #error>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    <!-- There was an error rejecting the initiative. Please try again later. -->
                    {{ t('actionsMenu.rejectError') }}
                </p>
            </div>
        </template>
    </TwoStagesDialog>


    <!-- create new version dialog -->
    <TwoStagesDialog
        ref="createNewVersionDialog"
        title="Start new revision"
        success-title="New Revision Created"
        error-title="Error Creating New Version"
        :confirm-callback="createNewVersion"
        @complete="newVersionCreated"
    >
        <template #confirm>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <i18n-t
                    keypath="actionsMenu.createNewVersionConfirm"
                    tag="p"
                >
                    <template #title>{{ project.data.project?.title }}</template>
                </i18n-t>
                <p class="mt-2">
                    {{ t('actionsMenu.createNewVersionExplanation') }}
                </p>
            </div>
        </template>
        <template #success>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    {{ t('actionsMenu.createNewVersionSuccess') }}
                </p>
            </div>
        </template>
        <template #error>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                    {{ t('actionsMenu.createNewVersionError') }}
                </p>
            </div>
        </template>
    </TwoStagesDialog>

    <!-- need to check if project.id is not null because ProjectView resets the project when leaving the page? -->
    <Menu
        as="div"
        class="relative inline-block text-left"
    >
        <div>
            <menu-button :class="[label ? 'inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ml-6' : 'flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none']">
                <span class="sr-only">{{ t('actionsMenu.button') }}</span>
                <EllipsisVerticalIcon
                    v-if="!label"
                    class="h-5 w-5"
                    aria-hidden="true"
                />
                <template v-else>
                    {{ label }}
                    <ChevronDownIcon
                        class="-mr-0.5 h-5 w-5"
                        aria-hidden="true"
                    />
                </template>
            </menu-button>
        </div>

        <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
        >
            <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div
                    v-if="!sections || sections.includes('view')"
                    class="py-1"
                >
                    <menu-item
                        v-if="!excludeViewMenuItem"
                        v-slot="{ active }"
                    >
                        <router-link
                            :to="{ name: 'projectInfo', params: { id: project.id } }"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']"
                        >
                            <EyeIcon
                                class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.view') }}
                        </router-link>
                    </menu-item>
                    <menu-item v-slot="{ active }">
                        <span
                            @click="() => print(project.id)"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <PrinterIcon
                                class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.print') }}
                        </span>
                    </menu-item>
                </div>
                <div
                    class="py-1"
                    v-if="(!sections || sections.includes('edit') || sections.includes('publishing')) && (projectUtils.canEdit(project) || projectUtils.canAddBestPractice(project))"
                >
                    <menu-item
                        v-if="projectUtils.canEdit(project) && (!sections || sections.includes('edit'))"
                        v-slot="{ active }"
                    >
                        <div
                            @click="goToEditRoute"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <pencil-square-icon
                                class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.edit') }}
                        </div>
                    </menu-item>
                    <menu-item
                        v-if="canAddCollaborators(project)"
                        v-slot="{ active }"
                    >
                        <div
                            @click="goToCollaboratorsRoute"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <user-group-icon
                                class="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            Collaborators
                        </div>
                    </menu-item>
                    <menu-item
                        v-if="projectUtils.canSubmit(project) && (!sections || sections.includes('publishing'))"
                        v-slot="{ active }"
                    >
                        <div
                            @click="openSubmitDialog"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <document-magnifying-glass-icon
                                class="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.submit') }}
                        </div>
                    </menu-item>
                    <menu-item
                        v-if="project.data.status === 'public' && projectUtils.canCreateVersion(project) && (!sections || sections.includes('publishing'))"
                        v-slot="{ active }"
                    >
                        <div
                            @click="openCreateNewVersionDialog"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <wrench-icon
                                class="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.createNewVersion') }}
                        </div>
                    </menu-item>
                    <menu-item
                        v-if="projectUtils.canPublish(project) && (!sections || sections.includes('publishing'))"
                        v-slot="{ active }"
                    >
                        <div
                            @click="openPublishDialog"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <hand-thumb-up-icon
                                class="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.publish') }}
                        </div>
                    </menu-item>

                    <menu-item
                        v-if="projectUtils.canReject(project) && (!sections || sections.includes('publishing'))"
                        v-slot="{ active }"
                    >
                        <div
                            @click="openRejectDialog"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <hand-thumb-down-icon
                                class="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.reject') }}
                        </div>
                    </menu-item>
                </div>
                <div v-if="!sections || sections.includes('best-practices')">
                    <menu-item
                        v-if="projectUtils.canAddBestPractice(project)"
                        v-slot="{ active }"
                    >
                        <router-link
                            :to="{ name: 'goodPracticesObjectivesEdit', params: { projectId: project.id, id: 'new' }, query: { projectId: project.id } }"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']"
                        >
                            <check-badge-icon
                                class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            {{ t('actionsMenu.addBestPractice') }}
                        </router-link>
                    </menu-item>
                </div>
                <div
                    v-if="(!sections || sections.includes('delete')) && projectUtils.canEdit(project)"
                    class="py-1"
                >
                    <menu-item v-slot="{ active }">
                        <span
                            @click="deleteProject(project.id)"
                            :class="[active ? 'bg-gray-100 text-ferm-red-light' : 'text-ferm-red-dark', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                        >
                            <TrashIcon
                                class="mr-3 h-5 w-5 text-ferm-red-dark group-hover:text-ferm-red-light"
                                aria-hidden="true"
                            />
                            {{ t('common.delete') }}
                        </span>
                    </menu-item>
                </div>
            </MenuItems>
        </transition>
    </Menu>
</template>
