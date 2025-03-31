<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';

import router from '@/router';
import { useRoute } from 'vue-router';

// import * as projectUtils from '@/lib/project';

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
import ShapefileUploadDialog from '@/views/project/ShapefileUploadDialog.vue';
import KmlKmzUploadDialog from '@/views/project/KmlKmzUploadDialog.vue';

const props = withDefaults(defineProps<{
    components: any,
    project: any,
    area: any,
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

const shapefileUploadDialogOpen = ref(false);
const kmlUploadDialogOpen = ref(false);

function doneUploadingShapefile(areas: any) {
    const areaCopy = { ...props.area };
    delete areaCopy.admin0;
    delete areaCopy.admin1;
    delete areaCopy.admin2;

    if (areas.length === 1) {
        emit('done', {
            type: 'upload',
            ...areaCopy,
            uuid: areas[0].uuid,
            area: areas[0].area,
            siteName: areas[0].siteName,
            shapeId: areas[0].shapeId
        });
    } else if (areas.length > 1) {
        console.error('multiple areas', areas);
    } else {
        console.error('no areas', areas);
    }
    shapefileUploadDialogOpen.value = false;
}

function doneUploadingKml(areas: any) {
    const areaCopy = { ...props.area };
    delete areaCopy.admin0;
    delete areaCopy.admin1;
    delete areaCopy.admin2;

    if (areas.length === 1) {
        emit('done', {
            type: 'uploadKml',
            ...areaCopy,
            uuid: areas[0].uuid,
            area: areas[0].area,
            siteName: areas[0].siteName,
            shapeId: areas[0].shapeId
        });
    } else if (areas.length > 1) {
        console.error('multiple areas', areas);
    } else {
        console.error('no areas', areas);
    }
    kmlUploadDialogOpen.value = false;
}
</script>

<template>
    <!-- <TwoStagesDialog
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
                    {{ t('actionsMenu.submitError') }}
                </p>
            </div>
        </template>
</TwoStagesDialog> -->

    <!-- <TwoStagesDialog
        ref="publishDialog"
        title="Publish initiative?"
        success-title="Initiative Published"
        error-title="Error Publishing Initiative"
        :confirm-callback="publish"
        @complete="done"
    >
        <template #confirm>
            <div class="mt-3 max-w-xl text-sm text-gray-500">
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
                    {{ t('actionsMenu.publishError') }}
                </p>
            </div>
        </template>
    </TwoStagesDialog> -->

    <!-- <TwoStagesDialog
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
                    {{ t('actionsMenu.rejectError') }}
                </p>
            </div>
        </template>
    </TwoStagesDialog> -->


    <!-- create new version dialog -->
    <!-- <TwoStagesDialog
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
    </TwoStagesDialog> -->

    <!-- need to check if project.id is not null because ProjectView resets the project when leaving the page? -->
    <Menu
        as="div"
        class="relative inline-block text-left"
    >
        <div>
            <menu-button class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ml-6">
                <span class="sr-only">Update area</span>
                <!-- <EllipsisVerticalIcon
                    v-if="!label"
                    class="h-5 w-5"
                    aria-hidden="true"
                /> -->
                Update area
                <ChevronDownIcon
                    class="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                />
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
            <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-righ rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <!-- <menu-item
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
                </menu-item> -->
                <menu-item v-slot="{ active }">
                    <span
                        @click="() => emit('done', { type: 'adminArea' })"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Admin area
                    </span>
                </menu-item>
                <menu-item v-slot="{ active }">
                    <span
                        @click="() => emit('done', { type: 'draw' })"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Draw polygon
                    </span>
                </menu-item>
                <menu-item v-slot="{ active }">
                    <span
                        @click="() => { shapefileUploadDialogOpen = true }"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Upload shapefile
                    </span>
                </menu-item>
                <menu-item v-slot="{ active }">
                    <span
                        @click="() => { kmlUploadDialogOpen = true }"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Upload KML/KMZ/GeoJSON
                    </span>
                </menu-item>
            </MenuItems>
        </transition>
    </Menu>

    <ShapefileUploadDialog
        :open="shapefileUploadDialogOpen"
        @done="doneUploadingShapefile"
        @cancel="shapefileUploadDialogOpen = false"
    />
    <KmlKmzUploadDialog
        :open="kmlUploadDialogOpen"
        @done="doneUploadingKml"
        @cancel="kmlUploadDialogOpen = false"
    />
</template>
