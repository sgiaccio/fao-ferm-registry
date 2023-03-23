<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import router from "../router";
import { storeToRefs } from 'pinia'

import { useUserPrefsStore } from '../stores/userPreferences'


const userPrefsStore = useUserPrefsStore();
const { register } = userPrefsStore;
const { darkMode } = storeToRefs(useUserPrefsStore())

// Signs up to the FERM platform by calling the signUp cloud function as an httpsCallable
// function. The function is called with the form data as a parameter.
// const functions = getFunctions();

// The form data is stored in a reactive object.
const formData = reactive({
    institution: "",
    ecosystem: false,
    flagship: false,
    partner: false,
    other: false,
    other_text: "",
    purpose: "",
});

// Reset other_text when other is unchecked
watch(formData, ({ other }) => {
    if (!other) {
        formData.other_text = '';
    }
});


// The form is submitted by calling the signUp function with the form data as a parameter.
// The function returns a promise that resolves to the result of the function call.

const submitForm = async () => {
    try {
        await register(formData);
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    }
};

// The form is validated by checking that the name and email fields are not empty.
const validateForm = () => {
    return formData.institution !== "" && (
        formData.ecosystem ||
        formData.flagship ||
        formData.partner ||
        formData.other && formData.other_text !== ''
    )
        && !(formData.other && formData.other_text === '')
        && formData.purpose !== '';
};

// The form is disabled if the form is not valid.
const isDisabled = computed(() => {
    return !validateForm();
});

// The form is submitted when the submit button is clicked.
const onSubmit = (event: Event) => {
    event.preventDefault();
    alert();
    if (!isDisabled.value) {
        submitForm();
    }
};

// The form is submitted when the enter key is pressed.
// const onKeydown = (event: KeyboardEvent) => {
//     if (event.key === "Enter") {
//         event.preventDefault();
//         submitForm();
//     }
// };

const cancel = () => {
    formData.institution = '';
    formData.ecosystem = false;
    formData.flagship = false;
    formData.partner = false;
    formData.other = false;
    formData.other_text = '';
    formData.purpose = '';

    router.push({ name: 'login' });
};
</script>




<template>
    <!--
                          This example requires updating your template:
  
                          ```
                          <html class="h-full bg-gray-50">
                          <body class="h-full">
                          ```
                        -->
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <img v-if="darkMode"
                 class="mx-auto h-28 w-auto"
                 src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                 alt="UN Decade">
            <img v-else
                 class="mx-auto h-28 w-auto"
                 src="@/assets/UNDecade_LOGO_MASTER_EN.svg"
                 alt="UN Decade">
            <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-200">First, we need to know something more about you</h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-slate-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form class="space-y-6"
                      action="#"
                      method="POST">
                    <div>
                        <label for="Institution"
                               class="block text-base font-medium leading-6 text-gray-900 dark:text-gray-100">Institution <span class="text-red-600">*</span></label>
                        <div class="mt-2">
                            <input v-model="formData.institution"
                                   id="institution"
                                   name="institution"
                                   type="text"
                                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>

                    <div>
                        <fieldset>
                            <legend class="sr-only">Institution affiliation</legend>
                            <div class="block text-base font-medium leading-6 text-gray-900 dark:text-gray-100"
                                 aria-hidden="true">Institution affiliation <span class="text-red-600">*</span></div>
                            <div class="mt-2 space-y-2">
                                <div class="relative flex items-start">
                                    <div class="flex h-6 items-center">
                                        <input v-model="formData.ecosystem"
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
                                        <input v-model="formData.flagship"
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
                                        <input v-model="formData.partner"
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
                                        <input v-model="formData.other"
                                               id="other"
                                               name="other"
                                               type="checkbox"
                                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div class="ml-3 text-sm leading-6">
                                        <label for="other"
                                               class="font-normal text-gray-900 dark:text-gray-100">Other <span v-if="formData.other" class="text-red-600">*</span></label>
                                    </div>

                                    <div>
                                        <div class="relative ml-2">
                                            <input v-model="formData.other_text"
                                                   :disabled="!formData.other"
                                                   :placeholder="formData.other ? 'Please specify' : ''"
                                                   type="text"
                                                   name="other_text"
                                                   id="other_text"
                                                   class="bg-transparent peer block w-full border-0 py-0 text-gray-900 dark:text-gray-100 focus:ring-0 sm:text-sm sm:leading-6" />
                                            <div :class="[formData.other ? 'border-t border-gray-300' : '', 'absolute inset-x-0 bottom-0 peer-focus:border-t-2 peer-focus:border-indigo-600']"
                                                 aria-hidden="true" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </fieldset>
                    </div>

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
                                @click="onSubmit"
                                type="submit"
                                :class="[isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600', 'flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white shadow-sm']"
                                class="">Submit</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</template>
  




<!-- <template>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-xl">
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 divide-y divide-gray-200">
                <div class="sm:col-span-6">Please fill in the form below to start registering your initiatives with the FERM Registry.</div>
                <div class="sm:col-span-4">
                    <label for="Institution"
                           class="block text-sm font-medium leading-6 text-gray-900">Institution <span class="text-red-600">*</span></label>
                    <div class="mt-2">
                        <input v-model="formData.institution"
                               id="institution"
                               name="institution"
                               type="text"
                               class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div class="sm:col-span-4">
                    <fieldset>
                        <legend class="sr-only">Institution affiliation</legend>
                        <div class="block text-sm font-medium leading-6 text-gray-900"
                             aria-hidden="true">Institution affiliation <span class="text-red-600">*</span></div>
                        <div class="mt-4 space-y-4">
                            <div class="relative flex items-start">
                                <div class="flex h-6 items-center">
                                    <input v-model="formData.ecosystem"
                                           id="ecosystem"
                                           name="ecosystem"
                                           type="checkbox"
                                           class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                </div>
                                <div class="ml-3 text-sm leading-6">
                                    <label for="ecosystem"
                                           class="font-medium text-gray-900">UN Decade on Ecosystem Restoration partner or actor</label>
                                </div>
                            </div>
                            <div class="relative flex items-start">
                                <div class="flex h-6 items-center">
                                    <input v-model="formData.flagship"
                                           id="flagship"
                                           name="flagship"
                                           type="checkbox"
                                           class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                </div>
                                <div class="ml-3 text-sm leading-6">
                                    <label for="flagship"
                                           class="font-medium text-gray-900">UN Decade flagship</label>
                                </div>
                            </div>
                            <div class="relative flex items-start">
                                <div class="flex h-6 items-center">
                                    <input v-model="formData.partner"
                                           id="partner"
                                           name="partner"
                                           type="checkbox"
                                           class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                </div>
                                <div class="ml-3 text-sm leading-6">
                                    <label for="partner"
                                           class="font-medium text-gray-900">FERM partner government or initiative</label>
                                </div>
                            </div>
                            <div class="relative flex items-start">
                                <div class="flex h-6 items-center">
                                    <input v-model="formData.other"
                                           id="other"
                                           name="other"
                                           type="checkbox"
                                           class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                </div>
                                <div class="ml-3 text-sm leading-6">
                                    <label for="other"
                                           class="font-medium text-gray-900">Other:</label>
                                </div>

                                <div>
                                    <div class="relative ml-2">
                                        <input v-model="formData.other_text"
                                               :disabled="!formData.other"
                                               :placeholder="formData.other ? 'Please specify' : ''"
                                               type="text"
                                               name="other_text"
                                               id="other_text"
                                               :class="[formData.other ? 'bg-gray-100' : '', 'peer block w-full border-0  py-1.5 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6']" />
                                        <div :class="[formData.other ? 'border-blue-500' : '', 'absolute inset-x-0 bottom-0 border-t  peer-focus:border-t-2 peer-focus:border-indigo-600']"
                                             aria-hidden="true" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </fieldset>
                </div>

                <div class="sm:col-span-4">
                    <label for="purpose"
                           class="block text-sm font-medium leading-6 text-gray-900">How you would like to use the FERM platform? <span class="text-red-600">*</span></label>
                    <div class="mt-2">
                        <textarea v-model="formData.purpose"
                                  rows="4"
                                  name="purpose"
                                  id="purpose"
                                  class="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6" />
                    </div>
                </div>
            </div>
        </div>

        <div class="pt-5">
            <div class="flex justify-end">
                <button type="button"
                        :disabled="isDisabled"
                        @click="onSubmit"
                        :class="[isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600', 'ml-3 inline-flex justify-center rounded-md py-2 px-3 text-sm font-semibold text-white shadow-sm ']">Submit</button>
            </div>
        </div>
    </div>
</template> -->