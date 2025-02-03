<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions
} from '@headlessui/vue';

import { useI18n } from 'vue-i18n';

import { useAuthStore } from '@/stores/auth';

import { toast } from 'vue3-toastify';

import {
    requestGroupAssignment,
    getUserAssignmentRequests,
    fetchPublicGroups
} from '@/firebase/firestore';

import { submitNewGroup } from '@/firebase/functions';

import ConfirmModal from '@/views/ConfirmModal.vue';
import AlertModal from '@/views/AlertModal.vue';

import router from '@/router';


const props = withDefaults(defineProps<{
    onFinished?: () => void
}>(), {
    onFinished: () => {
    }
});

const { t } = useI18n();

const authStore = useAuthStore();
// const projectStore = useProjectStore();

const allGroups = ref<{ id: string, group: any }[]>([]);
// const userGroups = ref();

const assignmentRequests = ref<{ pending?: string[], approved?: string[], denied?: string[] }>({
    pending: [],
    approved: [],
    denied: []
});

async function refreshAssignments() {
    const requests = await getUserAssignmentRequests(authStore.user!.uid);
    const userGroups = authStore.userGroups ? Object.keys(authStore.userGroups) : [];

    assignmentRequests.value = {
        // pending groups are the ones the user has requested to join
        pending: requests.filter(r => r.status === 'pending').map(r => r.groupId),
        // approved groups are the ones the user is already a member of, even if they were not explicitly approved
        approved: [...requests.filter(r => r.status === 'approved').map(r => r.groupId), ...userGroups],
        // denied groups are the ones the user has requested to join but were denied, excluding the ones they are already a member of
        denied: requests.filter(r => r.status === 'denied').map(r => r.groupId).filter(g => !userGroups.includes(g))
    };
}

onMounted(async () => {
    await refreshAssignments();
    const fetchedGroups = (await fetchPublicGroups());
    allGroups.value = Object.entries(fetchedGroups).map(([id, group]) => ({ id, group }));
});

const query = ref('');

const selectedGroup = ref(null);
const reasons = ref('');

const filteredGroups = computed(() => {
    const queryResult = query.value === ''
        ? allGroups.value
        : allGroups.value.filter(group => group.group.name.toLowerCase().includes(query.value.toLowerCase()));

    return queryResult.filter(group => {
        return !assignmentRequests.value.approved.includes(group.id)
            && !assignmentRequests.value.pending.includes(group.id);
        // && !assignmentRequests.value.denied.includes(group.id)
    }).sort((a, b) => a.group.name.localeCompare(b.group.name));
});

const showConfirmDialog = ref(false);

function confirmAssignment() {
    // if (selectedGroup.value === null || reasons.value) return;
    if (selectedGroup.value === null) return;
    if (reasons.value === '') return;

    showConfirmDialog.value = false;
    requestAssignment();
}

const showAssignmentSuccess = ref(false);

async function requestAssignment() {
    // showConfirmDialog.value = false;
    try {
        const email = authStore.user!.email;
        await requestGroupAssignment(authStore.user!.uid, selectedGroup.value.id, reasons.value, email);
        showAssignmentSuccess.value = true;
    } catch (e) {
        console.error(e);
        showAssignmentError.value = true;
    } finally {
        await refreshAssignments();
        query.value = '';
        selectedGroup.value = null;
        reasons.value = '';
    }
}

function cancelAssignment() {
    showConfirmDialog.value = false;
    query.value = '';
    reasons.value = '';
    selectedGroup.value = null;
}

const showAssignmentError = ref(false);

const blankInstitution = {
    name: '',
    type: '',
    otherType: '',
    isa: {
        partner: false,
        actor: false,
        flagship: false
    },
    description: '',
    website: ''
};

const newInstitutionFormData = ref({ ...blankInstitution });

const otherTypeRef = ref();

watch(() => newInstitutionFormData.value.type, newVal => {
    if (newVal === 'Other') {
        nextTick(() => otherTypeRef.value?.focus());
    } else {
        newInstitutionFormData.value.otherType = '';
    }
});

function validateNewInstitution() {
    return newInstitutionFormData.value.name !== ''
        && newInstitutionFormData.value.type !== ''
        && (newInstitutionFormData.value.type !== 'Other' || newInstitutionFormData.value.otherType !== '')
        && newInstitutionFormData.value.description !== '';
}

const isNewInstitutionRequestDisabled = computed(() => {
    return !validateNewInstitution();
});

const showSubmitNew = ref(false);

function submitNewInstitutionRequest() {
    showSubmitNew.value = true;
}

const showSubmitSuccess = ref(false);

function showExistsError(name: string) {
    toast.error(t('joinInstitution.submitNewInstitutionModal.existsError', { name }),
    {
        dangerouslyHTMLString: true,
        autoClose: false,
        closeOnClick: false
    });
}

async function confirmSubmit() {
    if (!validateNewInstitution()) {
        return;
    }

    const groupName = newInstitutionFormData.value.name;
    try {
        showSubmitNew.value = false;
        // check if a group with the same name already exists
        if (allGroups.value.some(g => g.group.name.toLowerCase() === groupName.toLowerCase())) {
            showExistsError(groupName);
            throw new Error('Group already exists');
        }

        await submitNewGroup(newInstitutionFormData.value);
        showSubmitSuccess.value = true;
    } catch (e) {
        if (e.code === 'functions/already-exists') {
            showExistsError(groupName);
        }
        console.error(e);
    } finally {
        newInstitutionFormData.value = { ...blankInstitution };
    }
}

function cancelSubmit() {
    showSubmitNew.value = false;
    newInstitutionFormData.value = { ...blankInstitution };
}
</script>

<template>
    <!-- Group assignment confirmation modal -->
    <ConfirmModal
        :title="`Join ${selectedGroup?.group.name}`"
        :onConfirm="confirmAssignment()"
        :onCancel="() => { cancelAssignment() }"
        :okButtonEnabled="selectedGroup !== null && reasons !== ''"
        :open="showConfirmDialog"
        ok-button-text="Join"
    >
        <i18n-t
            keypath="institutions.assignment.reasons"
            tag="p"
            class="text-sm text-gray-700"
        >
            <tempalte #groupName>{{ selectedGroup?.group.name }}</tempalte>
        </i18n-t>
        <div>
            <div class="mt-2">
                <textarea
                    rows="2"
                    v-model="reasons"
                    name="reasons"
                    id="reasons"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
    </ConfirmModal>

    <!-- Group assignment success modal -->
    <AlertModal
        type="success"
        :title="t('joinInstitution.requestSent.title')"
        :onClose="() => { showAssignmentSuccess = false; props.onFinished() }"
        :open="showAssignmentSuccess"
        buttonText="Ok"
    >
        <p class="text-sm text-gray-500">
            {{ t('joinInstitution.requestSent.text') }}
        </p>
    </AlertModal>

    <!-- Group assignment error modal -->
    <AlertModal
        type="error"
        :title="t('joinInstitution.requestError.title')"
        :onClose="() => { showAssignmentError = false; props.onFinished() }"
        :open="showAssignmentError"
        buttonText="Ok"
    >
        <p class="text-sm text-gray-500">
            {{ t('joinInstitution.requestError.text') }}
        </p>
    </AlertModal>

    <!-- Submit new institution modal -->
    <ConfirmModal
        :title="t('joinInstitution.submitNewInstitutionModal.title')"
        :onConfirm="confirmSubmit"
        :onCancel="cancelSubmit"
        :open="showSubmitNew"
        okButtonText="Submit"
        :okButtonEnabled="!isNewInstitutionRequestDisabled"
    >
        <p class="text-sm text-gray-700">
            <!-- Please submit your institution for inclusion in the registry. Your request will be reviewed. -->
            {{ t('joinInstitution.submitNewInstitutionModal.text') }}
        </p>
        <div class="mt-2">
            <label
                for="institution"
                class="block text-sm font-medium leading-6 text-gray-900"
            >{{ t('joinInstitution.submitNewInstitutionModal.name') }} <span class="text-red-600">*</span></label>
            <div class="mt-2">
                <input
                    v-model="newInstitutionFormData.name"
                    id="institution"
                    placeholder="Please enter the name of the institution"
                    name="institution"
                    type="text"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
        <div class="mt-2">
            <label
                for="institutionType"
                class="block text-sm font-medium leading-6 text-gray-900"
            >{{ t('joinInstitution.submitNewInstitutionModal.type') }} <span class="text-red-600">*</span></label>
            <select
                v-model="newInstitutionFormData.type"
                id="institutionType"
                name="institutionType"
                class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
                <option
                    value=""
                    disabled
                    selected
                >{{ t('joinInstitution.submitNewInstitutionModal.selectType') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.government') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.ngo') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.publicPrivatePartnership') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.multilateral') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.foundation') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.privateSector') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.academicAndResearch') }}</option>
                <option>{{ t('joinInstitution.submitNewInstitutionModal.types.other') }}</option>
            </select>
        </div>
        <div class="mt-2">
            <label
                for="institutionTypeOther"
                :class="[newInstitutionFormData.type === 'Other' ? 'text-gray-900' : 'text-gray-400', 'block text-sm font-medium leading-6']"
            >{{ t('joinInstitution.submitNewInstitutionModal.specifyIfOther') }} <span
                    v-if="newInstitutionFormData.type === 'Other'"
                    class="text-red-600"
                >*</span></label>
            <div class="mt-2">
                <input
                    v-model="newInstitutionFormData.otherType"
                    ref="otherTypeRef"
                    :disabled="newInstitutionFormData.type !== 'Other'"
                    id="institutionTypeOther"
                    name="institutionTypeOther"
                    type="text"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
        <div class="pt-4">
            <fieldset>
                <legend class="sr-only">
                    {{ t('joinInstitution.submitNewInstitutionModal.institutionIsA') }}
                </legend>
                <div
                    class="block text-sm font-medium leading-6 text-gray-900"
                    aria-hidden="true"
                >
                    {{ t('joinInstitution.submitNewInstitutionModal.institutionIsA') }}
                </div>
                <div class="mt-2">
                    <div class="relative flex items-start">
                        <div class="flex h-6 items-center">
                            <input
                                v-model="newInstitutionFormData.isa.partner"
                                id="partner"
                                name="partner"
                                type="checkbox"
                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                        </div>
                        <div class="ml-3 text-sm leading-6">
                            <label
                                for="partner"
                                class="font-normal text-gray-900"
                            >
                                {{ t('joinInstitution.submitNewInstitutionModal.roles.partner') }}
                            </label>
                        </div>
                    </div>
                    <div class="relative flex items-start">
                        <div class="flex h-6 items-center">
                            <input
                                v-model="newInstitutionFormData.isa.actor"
                                id="actor"
                                name="actor"
                                type="checkbox"
                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                        </div>
                        <div class="ml-3 text-sm leading-6">
                            <label
                                for="actor"
                                class="font-normal text-gray-900"
                            >
                                {{ t('joinInstitution.submitNewInstitutionModal.roles.actor') }}
                            </label>
                        </div>
                    </div>
                    <div class="relative flex items-start">
                        <div class="flex h-6 items-center">
                            <input
                                v-model="newInstitutionFormData.isa.flagship"
                                id="flagship"
                                name="flagship"
                                type="checkbox"
                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                        </div>
                        <div class="ml-3 text-sm leading-6">
                            <label
                                for="flagship"
                                class="font-normal text-gray-900"
                            >
                                {{ t('joinInstitution.submitNewInstitutionModal.roles.flagship') }}
                            </label>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
        <div class="pt-4">
            <label
                for="description"
                class="block text-sm font-medium leading-6 text-gray-900"
            >
                {{ t('joinInstitution.submitNewInstitutionModal.description') }}
                <span class="text-red-600">*</span></label>
            <div class="mt-2">
                <textarea
                    v-model="newInstitutionFormData.description"
                    id="description"
                    :placeholder="t('joinInstitution.submitNewInstitutionModal.descriptionPlaceholder')"
                    name="description"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
        <div class="mt-2">
            <label
                for="website"
                class="block text-sm font-medium leading-6 text-gray-900"
            >
                {{ t('joinInstitution.submitNewInstitutionModal.website') }}
            </label>
            <div class="mt-2">
                <input
                    v-model="newInstitutionFormData.website"
                    id="website"
                    :placeholder="t('joinInstitution.submitNewInstitutionModal.websitePlaceholder')"
                    name="website"
                    type="text"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
    </ConfirmModal>

    <!-- Group submit success modal -->
    <AlertModal
        type="success"
        title="Request sent"
        :onClose="() => { showSubmitSuccess = false; props.onFinished() }"
        :open="showSubmitSuccess"
        buttonText="Ok"
    >
        <p class="text-sm text-gray-500">Your request has been sent to the administrator. You will be notified by email
            once it is processed.</p>
    </AlertModal>

    <div class="shadow sm:rounded-lg max-w-2xl mx-auto bg-ferm-blue-dark-100">
        <div class="px-4 py-5 sm:p-6">
            <h3 class="text-3xl font-bold leading-6 text-gray-900">{{ t('joinInstitution.title') }}</h3>
            <div class="mt-6 max-w-xl text-sm text-gray-700">
                <i18n-t
                    keypath="joinInstitution.text.intro"
                    tag="p"
                >
                    <template #onlyIfAffiliated>
                        <span class="font-bold">
                            {{ t('joinInstitution.text.onlyIfAffiliated') }}
                        </span>
                    </template>
                </i18n-t>
                <p class="mt-3">
                    {{ t('joinInstitution.text.reviewRequest') }}
                </p>
                <p class="mt-3">
                    {{ t('joinInstitution.text.approval') }}
                </p>
                <!-- <p class="mt-3">
                    {{ t('joinInstitution.text.approvalCreate') }}
                </p> -->
                <i18n-t
                    keypath="joinInstitution.text.notListed"
                    tag="p"
                    class="mt-3"
                >
                    <template #submitNewInstitution>
                        <span class="font-bold">
                            {{ t('joinInstitution.submitNewInstitution') }}
                        </span>
                    </template>
                </i18n-t>
                <p class="mt-3">
                    {{ t('joinInstitution.text.ensureAccurate') }}
                </p>
            </div>

            <div class="mt-5 sm:flex sm:items-center">
                <Combobox
                    as="div"
                    v-model="selectedGroup"
                >
                    <div class="relative">
                        <ComboboxInput
                            class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            @change="query = $event.target.value"
                            :display-value="(group) => group?.group.name"
                        />
                        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                            <ChevronUpDownIcon
                                class="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </ComboboxButton>

                        <ComboboxOptions
                            v-if="filteredGroups.length > 0"
                            class="bottom-10 absolute z-10 mt-1 max-h-60 w-full_ w-96 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                            <ComboboxOption
                                v-for="group in filteredGroups"
                                :key="group.id"
                                :value="group"
                                as="template"
                                v-slot="{ active, selected }"
                            >
                                <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                                    <span :class="['block truncate_', selected && 'font-semibold']">
                                        {{ group.group.name }}
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


                <button
                    @click="() => selectedGroup && (showConfirmDialog = true)"
                    :class="[selectedGroup ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-400', 'mt-3 inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto']"
                >
                    {{ t('joinInstitution.join') }}
                </button>
                <div class="sm:justify-items-end sm:text-right flex-grow">
                    <button
                        v-if="Object.keys(authStore.userGroups).length || authStore.isAdmin"
                        @click.prevent="router.push({ name: 'initiatives' })"
                        class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {{ t('edit.cancel') }}
                    </button>
                    <button
                        @click.prevent="submitNewInstitutionRequest"
                        :class="['mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto']"
                    >
                        {{ t('joinInstitution.submitNewInstitution') }}
                    </button>
                </div>
            </div>

            <div
                v-if="selectedGroup && selectedGroup.group.description"
                class="mt-6 text-sm border border-gray-400 rounded-md px-3 py-2"
            >
                <h1 class="font-bold mb-1">{{ selectedGroup.group.name }}</h1>
                <span class="italic">{{ selectedGroup.group.description }}</span>
            </div>
        </div>
    </div>
</template>