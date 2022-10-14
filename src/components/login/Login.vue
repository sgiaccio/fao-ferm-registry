<script setup lang="ts">
import { ref } from 'vue'

import { useAuthStore } from '../../stores/auth'


const loginForm = ref({
    email: null,
    // password: null
});
// const registerForm = ref({});
const { login } = useAuthStore();

function authenticate() {
    const { email } = loginForm.value;
    if (email !== null) {
        login(email);
    }
}

// function togglePasswordReset() {
//     alert('TODO');
// }
</script>

<template>
    <div class="min-h-screen flex items-center justify-center --bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <img class="mx-auto h-28 w-auto" src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg" alt="UN Decade">
                <div class="dark:text-gray-300">
                    Welcome to the
                    <span class="font-bold dark:text-gray-200">FERM registry</span>!
                    The Framework for Ecosystem Restoration Monitoring Registry aims to provide a register of ecosystem restoration initiatives and initiatives, in the context of the
                    <span class="font-bold">United Nations Decade on Ecosystem Restoration</span>,
                    whilst ensuring interoperability with other restoration monitoring platforms and initiatives.
                </div>
                <h2 class="mt-4 text-center text-2xl font-extrabold text-gray-700 dark:text-gray-200">Sign in to your account</h2>
                <!-- <h2 class="mt-4 text-center text-2xl font-extrabold text-gray-700 dark:text-gray-200">Sign up</h2> -->
            </div>
            <div class="mt-8 space-y-6">
                <form @submit.prevent="authenticate" class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email-address" class="sr-only">Email address</label>
                        <input id="email-address"
                               name="email"
                               type="email"
                               autoComplete="email"
                               required
                               class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm"
                               placeholder="Email address"
                               v-model="loginForm.email">
                    </div>
                    <!-- <div>
                        <label for="password" class="sr-only">Password</label>
                        <input id="password"
                               name="password"
                               type="password"
                               autoComplete="current-password"
                               required
                               :class="[false ? 'rounded-none' : 'rounded-b-md',
                                        'appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900focus:outline-none focus:z-10 sm:text-sm']"
                               placeholder="Password"
                               v-model="loginForm.password">
                    </div> -->
                    <div>
                        <button type="submit"
                               class="mt-6 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clip-rule="evenodd"></path>
                                </svg>
                            </span>
                            Login
                        </button>
                    </div>
                </form>
                <!-- <div class="flex items-center justify-between">
                    <div class="text-sm">
                        <span @click="togglePasswordReset" class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-200 dark:hover:text-indigo-300">
                            Forgot your password?
                        </span>
                    </div>
                </div> -->

                <div class="font-semibold mt-10 dark:text-gray-200">
                    No account?
                    <a class="text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400 cursor-pointer underline"
                            href="https://forms.gle/BKDQzgtnfHEdvnHM8">
                        Ask for one, you will be contacted soon.
                </a>
                </div>
            </div>
        </div>
    </div>
</template>
