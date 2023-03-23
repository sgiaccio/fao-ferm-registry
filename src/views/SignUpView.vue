<script setup lang="ts">
import { reactive, computed } from "vue";
import router from "../router";

import { storeToRefs } from 'pinia'

import { useAuthStore } from "../stores/auth"
import { useUserPrefsStore } from '../stores/userPreferences'


const { signUp } = useAuthStore();

const { darkMode } = storeToRefs(useUserPrefsStore())

// Signs up to the FERM platform by calling the signUp cloud function as an httpsCallable
// function. The function is called with the form data as a parameter.
// const functions = getFunctions();


// The form data is stored in a reactive object.
const formData = reactive({
    name: "",
    email: "",
    // institution: "",
    // ecosystem: false,
    // flagship: false,
    // partner: false,
    // other: false,
    // other_text: "",
    // purpose: "",
});

// The form is submitted by calling the signUp function with the form data as a parameter.
// The function returns a promise that resolves to the result of the function call.

const submitForm = async () => {
    try {
        const result = await signUp(formData.email, formData.name);
        console.log(result); // DEBUG
    } catch (error: any) {
        if (error.message === "auth/email-already-exists") {
            alert("Email already in use");
            formData.name = "";
            formData.email = "";
        } else {
            alert(`Error: ${error.message}`);
        }
    }
};

// The form is validated by checking that the name and email fields are not empty.
const validateForm = () => {
    return formData.name !== "" && formData.email !== "";
};

// The form is disabled if the form is not valid.
const isDisabled = computed(() => {
    return !validateForm();
});

// The form is submitted when the submit button is clicked.
const onSubmit = (event: Event) => {
    event.preventDefault();
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
    formData.name = "";
    formData.email = "";
    // formData.institution = "";
    // formData.ecosystem = false;
    // formData.flagship = false;
    // formData.partner = false;
    // formData.other = false;
    // formData.other_text = "";
    // formData.purpose = "";

    router.push({ name: 'login' });
};

</script>







<template>
    <div class="min-h-screen flex items-center justify-center --bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <img v-if="darkMode"
                     class="mx-auto h-28 w-auto"
                     src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                     alt="UN Decade">
                <img v-else
                     class="mx-auto h-28 w-auto"
                     src="@/assets/UNDecade_LOGO_MASTER_EN.svg"
                     alt="UN Decade">

                <!-- <div class="dark:text-gray-300 text-justify">
                        Welcome to the
                        <span class="font-bold dark:text-gray-200">FERM registry</span>!
                        The Framework for Ecosystem Restoration Monitoring Registry aims to provide a register of ecosystem restoration initiatives and initiatives, in the context of the
                        <span class="font-bold">United Nations Decade on Ecosystem Restoration</span>,
                        whilst ensuring interoperability with other restoration monitoring platforms and initiatives.
                    </div> -->
            </div>
            <div>
                <div class="m-auto w-full max-w-sm mt-8 space-y-6 border-2 border-gray-400 dark:border-gray-600 shadow-md rounded-xl px-8 py-8 bg-gradient-to-br from-green-300 to-blue-400">
                    <h2 class="text-center text-2xl font-extrabold text-gray-700 dark:text-gray-200">Sign up with your email</h2>
                    <form @submit.prevent="onSubmit">
                        <div>
                            <label for="name"
                                   class="sr-only">Full name</label>
                            <input id="full-name"
                                   name="name"
                                   type="text"
                                   autoComplete="full"
                                   required
                                   class="appearance-none rounded-lg relative block w-full px-6 py-3 border-2 border-gray-400 dark:border-transparent placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-lg"
                                   placeholder="Full name"
                                   v-model="formData.name">
                        </div>
                        <div class="mt-4">
                            <label for="email-address"
                                   class="sr-only">Email address</label>
                            <input id="email-address"
                                   name="email"
                                   type="email"
                                   autoComplete="email"
                                   required
                                   class="appearance-none rounded-lg relative block w-full px-6 py-3 border-2 border-gray-400 dark:border-transparent placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-lg"
                                   placeholder="Email address"
                                   v-model="formData.email">
                        </div>
                        <div class="mt-8">
                            <button type="submit"
                                    :disabled="isDisabled"
                                    :class="[isDisabled ? 'bg-gray-300' : 'bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600' ,'group relative w-full flex justify-center py-3 px-6 text-lg font-medium rounded-full text-white focus:outline-none border-2 border-gray-500']">
                                Sign up
                            </button>
                            <button @click="cancel()"
                                    type="submit"
                                    class="mt-4 group relative w-full flex justify-center py-3 px-6 text-lg font-medium rounded-full border-2 border-gray-500 focus:outline-none hover:backdrop-brightness-110">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>









<!-- <template_>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <form class="space-y-8 divide-y divide-gray-200">

                <div class="pt-8">
                    <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                        <div class="sm:col-span-4">
                            <label for="name"
                                   class="block text-sm font-medium leading-6 text-gray-900">Name (first and last)</label>
                            <div class="mt-2">
                                <input v-model="formData.name"
                                       type="text"
                                       name="name"
                                       id="name"
                                       autocomplete="full"
                                       class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        <div class="sm:col-span-4">
                            <label for="email"
                                   class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                            <div class="mt-2">
                                <input v-model="formData.email"
                                       id="email"
                                       name="email"
                                       type="email"
                                       autocomplete="email"
                                       class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        <!- - <div class="sm:col-span-4">
                            <label for="Institution"
                                   class="block text-sm font-medium leading-6 text-gray-900">institution</label>
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
                                     aria-hidden="true">Institution affiliation</div>
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
                                                       type="text"
                                                       name="other_text"
                                                       id="other_text"
                                                       class="peer block w-full border-0 bg-gray-50 py-1.5 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6" />
                                                <div class="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600"
                                                     aria-hidden="true" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <div class="sm:col-span-4">
                            <label for="purpose"
                                   class="block text-sm font-medium leading-6 text-gray-900">How you would like to use the FERM platform?</label>
                            <div class="mt-2">
                                <textarea v-model="formData.purpose"
                                          rows="4"
                                          name="purpose"
                                          id="purpose"
                                          class="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6" />
                            </div>
                        </div> - ->
                    </div>
                </div>

                <div class="pt-5">
                    <div class="flex justify-end">
                        <button type="button"
                                @click="cancel"
                                class="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                        <button type="button"
                                @click="submit"
                                class="ml-3 inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign up</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template_>
   -->