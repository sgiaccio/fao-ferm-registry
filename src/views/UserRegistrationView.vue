<script setup lang="ts">
import { reactive, computed, ref, onBeforeMount } from "vue";

import { useUserPrefsStore, type RegistrationData } from '@/stores/userPreferences'
import router from "@/router";

import AlertModal from "@/views/AlertModal.vue";
import { fetchAllGroupNames } from "@/firebase/firestore";


const userPrefsStore = useUserPrefsStore();
const { register } = userPrefsStore;

// Stores all groups in a reactive object.
const groups = reactive<{ [key: string]: string }>({});

// Fetches all groups from the auth store
onBeforeMount(async () => {
    Object.assign(groups, await fetchAllGroupNames())
});

// The form data is stored in a reactive object.
const formData = reactive<RegistrationData>({
    name: '',
    purpose: '',
});

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
                buttonText="Enter the registry">
        <p class="text-sm text-gray-500">To proceed, select a group and submit a join request. Administrators will review your request and notify you of their decision.</p>
    </AlertModal>

    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <img
                 class="mx-auto h-28 w-auto"
                 src="/UNDecade_LOGO_MASTER_EN.svg"
                 alt="UN Decade">
            <h2 class="mt-6 text-center text-3xl font-akrobat font-bold tracking-tight text-gray-800">Welcome to the FERM Registry!</h2>
            <h2 class="mt-2 text-center text-3xl font-akrobat font-bold tracking-tight text-sky-gray-800">Please introduce yourself.</h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-slate-50 border border-gray-200 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form @keydown="onKeydown"
                      @submit="onSubmit"
                      class="space-y-6"
                      action="#"
                      method="POST">
                    <div>
                        <label for="name"
                               class="block text-base font-medium leading-6 text-gray-900">Name <span class="text-red-600">*</span></label>
                        <div class="mt-2">
                            <input v-model="formData.name"
                                   id="full"
                                   name="full"
                                   type="text"
                                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                    <div>
                        <label for="purpose"
                               class="block text-base font-medium leading-6 text-gray-900">How you would like to use the FERM platform? <span class="text-red-600">*</span></label>
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
