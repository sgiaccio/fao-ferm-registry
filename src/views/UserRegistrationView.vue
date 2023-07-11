<script setup lang="ts">
import { reactive, computed, watch, ref, nextTick, onBeforeMount } from "vue";
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useUserPrefsStore, type RegistrationData } from '@/stores/userPreferences'
import router from "@/router";

import AlertModal from "@/views/AlertModal.vue";
import { fetchAllGroupNames } from "@/firebase/firestore";


const authStore = useAuthStore();

const userPrefsStore = useUserPrefsStore();
const { register } = userPrefsStore;
const { darkMode } = storeToRefs(useUserPrefsStore())

// Stores all groups in a reactive object.
const groups = reactive<{ [key: string]: string }>({});


// Fetches all groups from the auth store
onBeforeMount(async () => {
    Object.assign(groups, await fetchAllGroupNames())
});

// The form data is stored in a reactive object.
const formData = reactive<RegistrationData>({
    name: '',
    // affiliation: {
    //     ecosystem: false,
    //     flagship: false,
    //     partner: false,
    //     otherAffiliationText: ''
    // },
    purpose: '',
    // group: null,
    // otherGroupText: ''
});

// Stores the selected group in a reactive object.
// We are storing it here so that we can watch it and save both group id and name in the form data.
// const selectedGroup = ref<string>('');

// Stores the value of the other affiliation checkbox in a reactive object. We don't need to save this value in the form data.
// const otherAffiliation = ref<boolean>(false);

// const otherInstitutionTextRef = ref<HTMLInputElement>();
// const otherGroupTextRef = ref<HTMLInputElement>();

// Focuses the other institution text input field when the other affiliation checkbox is checked.
// watch(() => otherAffiliation.value, newVal => {
//     if (newVal) {
//         nextTick(() => otherInstitutionTextRef.value?.focus());
//     } else {
//         formData.affiliation.otherAffiliationText = '';
//     }
// });

// Handles change in the selected group.
// watch(selectedGroup, newGroup => {
//     // Sets the group id and name in the form data.
//     if (newGroup === '' || newGroup === 'other') {
//         formData.group = null;
//     } else {
//         formData.group = { id: newGroup, name: groups[newGroup] };
//     }

//     // Focuses the other group text input field when the other group is selected.
//     if (newGroup === 'other') {
//         nextTick(() => otherGroupTextRef.value?.focus());
//     } else {
//         formData.otherGroupText = '';
//     }
// });

// The form is submitted when the submit button is clicked or the enter key is pressed.
// The form is validated before submission.
// If the form is not valid, an error message is displayed.
// If the form is valid, the form data is sent to the auth store.
// If the submission is successful, the user is redirected to the home page.
async function submitForm() {
    try {
        await register(formData);
        showTanksDialog.value = true;
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    }
};

// The form is validated by checking that the name and email fields are not empty.
function validateForm() {
    return formData.name !== ''
        // (formData.affiliation.ecosystem ||
        //     formData.affiliation.flagship ||
        //     formData.affiliation.partner ||
        //     otherAffiliation.value && formData.affiliation.otherAffiliationText !== '')
        // && !(otherAffiliation.value && formData.affiliation.otherAffiliationText === '')
        // && (formData.group || !formData.group && formData.otherGroupText !== '')
        && formData.purpose !== '';
};

// The form is disabled if the form is not valid.
const isDisabled = computed(() => {
    return !validateForm();
});

// The form is submitted when the submit button is clicked.
function onSubmit(event: Event) {
    // Prevent the default form submission.
    event.preventDefault();
    if (!isDisabled.value) {
        submitForm();
    }
};

// The form is submitted when the enter key is pressed.
function onKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
        // Prevent the default keydown behavior.
        event.preventDefault();
        if (!isDisabled.value) {
            submitForm();
        }
    }
};

const showTanksDialog = ref(false);

// Close the dialog and redirect to the home page.
function onClose() {
    showTanksDialog.value = false;
    router.push({ name: 'initiatives' });
}
</script>

<template>
    <AlertModal type="success"
                :onClose="onClose"
                :open="showTanksDialog"
                title="Thank you for registering"
                buttonText="Go to the registry">
        <p class="text-sm text-gray-500">To proceed, select a group and submit a join request. Administrators will review your request and notify you of their decision.</p>
    </AlertModal>

    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <img v-if="darkMode"
                 class="mx-auto h-28 w-auto"
                 src="/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                 alt="UN Decade">
            <img v-else
                 class="mx-auto h-28 w-auto"
                 src="/UNDecade_LOGO_MASTER_EN.svg"
                 alt="UN Decade">
            <h2 class="mt-6 text-center text-3xl font-akrobat font-bold tracking-tight text-gray-800 dark:text-gray-200">Welcome to the FERM Registry!</h2>
            <h2 class="mt-2 text-center text-3xl font-akrobat font-bold tracking-tight text-sky-gray-800 dark:text-gray-200">Please introduce yourself.</h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-slate-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form @keydown="onKeydown"
                      @submit="onSubmit"
                      class="space-y-6"
                      action="#"
                      method="POST">
                    <div>
                        <label for="name"
                               class="block text-base font-medium leading-6 text-gray-900 dark:text-gray-100">Name <span class="text-red-600">*</span></label>
                        <div class="mt-2">
                            <input v-model="formData.name"
                                   id="full"
                                   name="full"
                                   type="text"
                                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>

                    <!-- <div>
                        <label for="institution"
                               class="block text-base font-medium leading-6 text-gray-900">Institution <span class="text-red-600">*</span></label>
                        <select v-model="selectedGroup"
                                id="institution"
                                name="institution"
                                class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <option value=""
                                    disabled>Select an institution</option>
                            <option v-for="[id, label] in Object.entries(groups).sort((a, b) => a[1].localeCompare(b[1]))"
                                    :value="id">{{ label }}</option>
                            <option value="other">Other</option>
                        </select>
                    </div> -->
                    <!-- <div v-if="selectedGroup === 'other'">
                        <label for="other-group"
                               class="block text-base font-medium leading-6 text-gray-900">Please specify your institution <span class="text-red-600">*</span></label>
                        <div class="mt-2">
                            <input v-model="formData.otherGroupText"
                                   ref="otherGroupTextRef"
                                   type="text"
                                   name="other institution"
                                   id="other-group"
                                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                   placeholder="Your institution" />
                        </div>
                    </div> -->
                    <!-- <div>
                        <fieldset>
                            <legend class="sr-only">Institution affiliation</legend>
                            <div class="block text-base font-medium leading-6 text-gray-900 dark:text-gray-100"
                                 aria-hidden="true">Institution affiliation <span class="text-red-600">*</span></div>
                            <div class="mt-2 space-y-2">
                                <div class="relative flex items-start">
                                    <div class="flex h-6 items-center">
                                        <input v-model="formData.affiliation.ecosystem"
                                               id="ecosystem"
                                               name="ecosystem"
                                               type="checkbox"
                                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div class="ml-3 text-sm leading-6">
                                        <label for="ecosystem"
                                               class="font-normal text-gray-900 dark:text-gray-100">UN Decade on Ecosystem Restoration partner or actor</label>
                                    </div>
                                </div>
                                <div class="relative flex items-start">
                                    <div class="flex h-6 items-center">
                                        <input v-model="formData.affiliation.flagship"
                                               id="flagship"
                                               name="flagship"
                                               type="checkbox"
                                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div class="ml-3 text-sm leading-6">
                                        <label for="flagship"
                                               class="font-normal text-gray-900 dark:text-gray-100">UN Decade flagship</label>
                                    </div>
                                </div>
                                <div class="relative flex items-start">
                                    <div class="flex h-6 items-center">
                                        <input v-model="formData.affiliation.partner"
                                               id="partner"
                                               name="partner"
                                               type="checkbox"
                                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div class="ml-3 text-sm leading-6">
                                        <label for="partner"
                                               class="font-normal text-gray-900 dark:text-gray-100">FERM partner government or initiative</label>
                                    </div>
                                </div>
                                <div class="relative flex items-start">
                                    <div class="flex h-6 items-center">
                                        <input v-model="otherAffiliation"
                                               id="other"
                                               name="other"
                                               type="checkbox"
                                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div class="ml-3 text-sm leading-6">
                                        <label for="other"
                                               class="font-normal text-gray-900 dark:text-gray-100">Other <span v-if="otherAffiliation"
                                                  class="text-red-600">*</span></label>
                                    </div>

                                    <div>
                                        <div class="relative ml-2">
                                            <input v-model="formData.affiliation.otherAffiliationText"
                                                   ref="otherInstitutionTextRef"
                                                   :disabled="!otherAffiliation"
                                                   :placeholder="otherAffiliation ? 'Please specify' : ''"
                                                   type="text"
                                                   name="otherText"
                                                   id="otherText"
                                                   class="bg-transparent peer block w-full border-0 py-0 text-gray-900 dark:text-gray-100 focus:ring-0 sm:text-sm sm:leading-6" />
                                            <div :class="[otherAffiliation ? 'border-t border-gray-300' : '', 'absolute inset-x-0 bottom-0 peer-focus:border-t-2 peer-focus:border-indigo-600']"
                                                 aria-hidden="true" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </fieldset>
                    </div> -->

                    <div>
                        <label for="purpose"
                               class="block text-base font-medium leading-6 text-gray-900 dark:text-gray-100">How you would like to use the FERM platform? <span class="text-red-600">*</span></label>
                        <div class="mt-2">
                            <textarea v-model="formData.purpose"
                                      rows="3"
                                      name="purpose"
                                      id="purpose"
                                      class="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6" />
                        </div>

                    </div>
                    <div>
                        <button :disabled="isDisabled"
                                type="submit"
                                :class="[isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600', 'flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white shadow-sm']"
                                class="">Submit</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</template>
