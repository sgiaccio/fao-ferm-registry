<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    // ComboboxLabel,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/vue'

import { useAuthStore } from '../stores/auth';
// import { useProjectStore } from '../../stores/project';

import { requestGroupAssignment, getUserAssignmentRequests, submitNewInstitution } from '@/firebase/firestore';

import ConfirmModal from '@/views/ConfirmModal.vue'
import AlertModal from '@/views/AlertModal.vue'


const props = withDefaults(defineProps<{
    onFinished?: () => void
}>(), {
    onFinished: () => { }
});

const authStore = useAuthStore();
// const projectStore = useProjectStore();

const allGroups = ref<{ id: string, name: string }[]>([])
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
    }
}

onMounted(async () => {
    await refreshAssignments();
    const fetchedGroups = (await authStore.fetchPublicGroups())
    allGroups.value = Object.entries(fetchedGroups).map(([id, name]) => ({ id, name }));

    // loaded.value = true;
});

// const props = defineProps<{
//     groups: any
// }>();

const query = ref('')

const selectedGroup = ref(null)
const reasons = ref('')

const filteredGroups = computed(() => {
    const queryResult = query.value === ''
        ? allGroups.value
        : allGroups.value.filter(group => group.name.toLowerCase().includes(query.value.toLowerCase()));

    return queryResult.filter(group => {
        return !assignmentRequests.value.approved.includes(group.id)
            && !assignmentRequests.value.pending.includes(group.id)
            && !assignmentRequests.value.denied.includes(group.id)
    }).sort((a, b) => a.name.localeCompare(b.name))
});

const showConfirmDialog = ref(false)
function confirmAssignment() {
    // if (selectedGroup.value === null || reasons.value) return;
    if (selectedGroup.value === null) return;
    if (reasons.value === '') return;

    showConfirmDialog.value = false
    requestAssignment();
}

const showAssignmentSuccess = ref(false)
async function requestAssignment() {
    // showConfirmDialog.value = false;
    try {
        // await requestGroupAssignment(authStore.user!.uid, selectedGroup.value.id, reasons.value);
        // uid: string, groupId: string, userName: string, email: string, reasons: string
        await requestGroupAssignment(authStore.user!.uid, selectedGroup.value.id, authStore.user!.displayName!, authStore.user!.email!, reasons.value);
        showAssignmentSuccess.value = true;
    } catch (e) {
        showAssignmentError.value = true;
    } finally {
        await refreshAssignments();
        query.value = '';
        selectedGroup.value = null;
        reasons.value = '';
    }
}

function cancelAssignment() {
    showConfirmDialog.value = false
    query.value = '';
    reasons.value = '';
    selectedGroup.value = null;
}

const showAssignmentError = ref(false)

const newInstitutionFormData = ref({
    name: '',
    type: '',
    otherType: '',
    isa: {
        partner: false,
        actor: false,
        flagship: false
    },
    status: 'pending'
});

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
}

const isDisabled = computed(() => {
    return !validateNewInstitution();
});

const showSubmitNew = ref(false)

function submitNewInstitutionRequest() {
    showSubmitNew.value = true;
}

const showSubmitSuccess = ref(false)

async function confirmSubmit() {
    if (!validateNewInstitution()) {
        return;
    }
    try {
        showSubmitNew.value = false;
        await submitNewInstitution({ ...newInstitutionFormData.value, userId: authStore.user!.uid });
        showSubmitSuccess.value = true;
        newInstitutionFormData.value = {
            name: '',
            type: '',
            otherType: '',
            isa: {
                partner: false,
                actor: false,
                flagship: false
            },
            status: 'pending'
        }
    } catch (e) {
        alert("There was an error submitting the request, please try again later.");
        throw (e);
    }
}

function cancelSubmit() {
    showSubmitNew.value = false;
    newInstitutionFormData.value = {
        name: '',
        type: '',
        otherType: '',
        isa: {
            partner: false,
            actor: false,
            flagship: false
        },
        status: 'pending'
    }
}
</script>

<template>
    <!-- Group assignment confirmation modal -->
    <ConfirmModal type="warning"
                  :title="`Join ${selectedGroup?.name}`"
                  :onConfirm="() => { confirmAssignment() }"
                  :onCancel="() => { cancelAssignment() }"
                  :okButtonEnabled="selectedGroup !== null && reasons !== ''"
                  :open="showConfirmDialog"
                  ok-button-text="Join">
        <p class="text-sm text-gray-700">Please provide your reasons for joining <span class="font-bold">{{ selectedGroup?.name }}</span>; your response will be sent to the administrator for review.</p>
        <div>
            <div class="mt-2">
                <textarea rows="2"
                          v-model="reasons"
                          name="reasons"
                          id="reasons"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
        </div>
    </ConfirmModal>

    <!-- Group assignment success modal -->
    <AlertModal type="success"
                title="Request sent"
                :onClose="() => { showAssignmentSuccess = false; props.onFinished() }"
                :open="showAssignmentSuccess"
                buttonText="Ok">
        <p class="text-sm text-gray-500">Your request has been sent to the administrator. You will be notified by email once it is processed.</p>
    </AlertModal>

    <!-- Group assignment error modal -->
    <AlertModal type="error"
                title="Error sending request"
                :onClose="() => { showAssignmentError = false; props.onFinished() }"
                :open="showAssignmentError"
                buttonText="Ok">
        <p class="text-sm text-gray-500">There was an error sending the request, please try again later.</p>
    </AlertModal>

    <!-- Submit new institution modal -->
    <ConfirmModal type="info"
                  title="Submit new institution"
                  :onConfirm="() => { confirmSubmit() }"
                  :onCancel="() => cancelSubmit()"
                  :open="showSubmitNew"
                  okButtonText="Submit"
                  :okButtonEnabled="!isDisabled">
        <p class="text-sm text-gray-700">Please submit your institution for inclusion in the registry.</p>
        <div class="mt-2">
            <label for="name"
                   class="block text-sm font-medium leading-6 text-gray-900">Name <span class="text-red-600">*</span></label>
            <div class="mt-2">
                <input v-model="newInstitutionFormData.name"
                       id="institution"
                       placeholder="Please enter the name of the institution"
                       name="institution"
                       type="text"
                       class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
        </div>
        <div class="mt-2">
            <label for="institutionType"
                   class="block text-sm font-medium leading-6 text-gray-900">Type <span class="text-red-600">*</span></label>
            <select v-model="newInstitutionFormData.type"
                    id="institutionType"
                    name="institutionType"
                    class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option value=""
                        disabled
                        selected>Select type</option>
                <option>Government</option>
                <option>NGO</option>
                <option>Public Private Partnership</option>
                <option>Multilateral</option>
                <option>Foundation</option>
                <option>Private sector</option>
                <option>Academic & research</option>
                <option>Other</option>
            </select>
        </div>
        <div class="mt-2">
            <label for="institutionTypeOther"
                   :class="[newInstitutionFormData.type === 'Other' ? 'text-gray-900' : 'text-gray-400', 'block text-sm font-medium leading-6']">Please specify type <span v-if="newInstitutionFormData.type === 'Other'"
                      class="text-red-600">*</span></label>
            <div class="mt-2">
                <input v-model="newInstitutionFormData.otherType"
                       ref="otherTypeRef"
                       :disabled="newInstitutionFormData.type !== 'Other'"
                       id="institution"
                       name="institution"
                       type="text"
                       class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
        </div>
        <div class="pt-4">
            <fieldset>
                <legend class="sr-only">The institution is a</legend>
                <div class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                     aria-hidden="true">The institution is a</div>
                <div class="mt-2 space-y-2">
                    <div class="relative flex items-start">
                        <div class="flex h-6 items-center">
                            <input v-model="newInstitutionFormData.isa.partner"
                                   id="partner"
                                   name="partner"
                                   type="checkbox"
                                   class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        </div>
                        <div class="ml-3 text-sm leading-6">
                            <label for="partner"
                                   class="font-normal text-gray-900 dark:text-gray-100">UN Decade partner</label>
                        </div>
                    </div>
                    <div class="relative flex items-start">
                        <div class="flex h-6 items-center">
                            <input v-model="newInstitutionFormData.isa.actor"
                                   id="actor"
                                   name="actor"
                                   type="checkbox"
                                   class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        </div>
                        <div class="ml-3 text-sm leading-6">
                            <label for="actor"
                                   class="font-normal text-gray-900 dark:text-gray-100">UN Decade actor</label>
                        </div>
                    </div>
                    <div class="relative flex items-start">
                        <div class="flex h-6 items-center">
                            <input v-model="newInstitutionFormData.isa.flagship"
                                   id="flagship"
                                   name="flagship"
                                   type="checkbox"
                                   class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        </div>
                        <div class="ml-3 text-sm leading-6">
                            <label for="flagship"
                                   class="font-normal text-gray-900 dark:text-gray-100">Global Flagship </label>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    </ConfirmModal>

    <!-- Group submit success modal -->
    <AlertModal type="success"
                title="Request sent"
                :onClose="() => { showSubmitSuccess = false; props.onFinished() }"
                :open="showSubmitSuccess"
                buttonText="Ok">
        <p class="text-sm text-gray-500">Your request has been sent to the administrator. You will be notified by email once it is processed.</p>
    </AlertModal>

    <div class="shadow sm:rounded-lg max-w-2xl mx-auto bg-ferm-blue-dark-100">
        <div class="px-4 py-5 sm:p-6">
            <h3 class="text-3xl font-bold leading-6 text-gray-900 font-akrobat">Join an instituition</h3>
            <div class="mt-6 max-w-xl text-sm text-gray-700">
                <p>
                    To request an institution assignment, simply select one from the list provided. Administrators will be notified of your request and can either approve or deny it. You will be informed of their decision regardless of the outcome.
                </p>
                <p class="mt-4">
                    Once an admin assigns you to an institution, you will be able to create new initiatives and make changes to existing ones.
                </p>
                <p class="mt-4">
                    If you don't see your institution listed, you can submit a request to add it. The administrators will then evaluate your request and inform you of the decision.
                </p>
            </div>

            <div class="mt-5 sm:flex sm:items-center">
                <Combobox as="div"
                          v-model="selectedGroup">
                    <div class="relative">
                        <ComboboxInput class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                       @change="query = $event.target.value"
                                       :display-value="(group) => group?.name" />
                        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400"
                                               aria-hidden="true" />
                        </ComboboxButton>

                        <ComboboxOptions v-if="filteredGroups.length > 0"
                                         class="bottom-10 absolute z-10 mt-1 max-h-60 w-full_ w-96 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <ComboboxOption v-for="group in filteredGroups"
                                            :key="group.id"
                                            :value="group"
                                            as="template"
                                            v-slot="{ active, selected }">
                                <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                                    <span :class="['block truncate_', selected && 'font-semibold']">
                                        {{ group.name }}
                                    </span>

                                    <span v-if="selected"
                                          :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
                                        <CheckIcon class="h-5 w-5"
                                                   aria-hidden="true" />
                                    </span>
                                </li>
                            </ComboboxOption>
                        </ComboboxOptions>
                    </div>
                </Combobox>


                <!-- <Combobox as="div"
                          v-model="selectedGroup">
                    <!- - <ComboboxLabel class="block text-sm font-medium leading-6 text-gray-900">Assigned to</ComboboxLabel> - ->
                    <div class="relative">
                        <ComboboxInput class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                       @change="query = $event.target.value"
                                       :display-value="(group) => group?.name" />
                        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400"
                                               aria-hidden="true" />
                        </ComboboxButton>

                        <ComboboxOptions v-if="filteredGroups.length > 0"
                                         class="bottom-10 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <ComboboxOption v-for="group in filteredGroups"
                                            :key="group.id"
                                            :value="group"
                                            as="template"
                                            v-slot="{ active, selected }">
                                <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                                    <div class="flex items-center">
                                        <span :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full', group.online ? 'bg-green-400' : 'bg-gray-200']"
                                              aria-hidden="true" />
                                        <span :class="['ml-3 truncate', selected && 'font-semibold']">
                                            {{ group.name }}
                                            <span class="sr-only"> is {{ group.online ? 'online' : 'offline' }}</span>
                                        </span>
                                    </div>

                                    <span v-if="selected"
                                          :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
                                        <CheckIcon class="h-5 w-5"
                                                   aria-hidden="true" />
                                    </span>
                                </li>
                            </ComboboxOption>
                        </ComboboxOptions>
                    </div>
                </Combobox> -->
                <button @click="() => selectedGroup && (showConfirmDialog = true)"
                        :class="[selectedGroup ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-400', 'mt-3 inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto']">Join</button>
                <div class="sm:flex-grow sm:justify-items-end sm:text-right">
                    <button @click.prevent="submitNewInstitutionRequest"
                            :class="['mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto']">Submit new institution</button>
                </div>
            </div>
            <!-- <div class="mt-6">
                                    <p>You have requested to join the following institutions:</p>


                                    <p>You have requested to create the following institutions:</p>
                                </div> -->
        </div>
    </div>
</template>
  