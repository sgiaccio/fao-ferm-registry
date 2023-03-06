<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../stores/auth'
import { useUserPrefsStore } from '../../stores/userPreferences'

const { login, loginWithGoogle: googleLogin } = useAuthStore();
const { darkMode } = storeToRefs(useUserPrefsStore())

const loginForm = ref({
    email: null,
    // password: null
});
// const registerForm = ref({});

function authenticate() {
    const { email } = loginForm.value;
    if (email !== null) {
        login(email);
    }
}

// function togglePasswordReset() {
//     Non needed, we are using email based login
// }

function loginWithGoogle() {
    googleLogin();
}
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

                <div class="dark:text-gray-300 text-justify">
                    Welcome to the
                    <span class="font-bold dark:text-gray-200">FERM registry</span>!
                    The Framework for Ecosystem Restoration Monitoring Registry aims to provide a register of ecosystem restoration initiatives and initiatives, in the context of the
                    <span class="font-bold">United Nations Decade on Ecosystem Restoration</span>,
                    whilst ensuring interoperability with other restoration monitoring platforms and initiatives.
                </div>
                <!-- <h2 class="mt-4 text-center text-2xl font-extrabold text-gray-700 dark:text-gray-200">Sign up</h2> -->
            </div>
            <div>
                <div class="m-auto w-full max-w-sm mt-8 space-y-6 border-2 border-gray-300 dark:border-gray-600 shadow-md rounded-xl px-8 py-8">
                    <h2 class="text-center text-2xl font-extrabold text-gray-700 dark:text-gray-200">Sign in</h2>
                    <form @submit.prevent="authenticate">
                        <div>
                            <label for="email-address"
                                   class="sr-only">Email address</label>
                            <input id="email-address"
                                   name="email"
                                   type="email"
                                   autoComplete="email"
                                   required
                                   class="appearance-none rounded-lg relative block w-full px-6 py-3 border-2 border-gray-300 dark:border-transparent placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-lg"
                                   placeholder="Email address"
                                   v-model="loginForm.email">
                        </div>
                        <div>
                            <button type="submit"
                                    class="mt-6 group relative w-full flex justify-center py-3 px-6 border border-transparent text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                Login
                            </button>
                        </div>
                    </form>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center"
                             aria-hidden="true">
                            <div class="w-full border-t border-gray-300" />
                        </div>
                        <div class="relative flex justify-center">
                            <span class="bg-white dark:bg-zinc-800 px-2 text-sm text-gray-500">Or</span>
                        </div>
                    </div>

                    <button @click="loginWithGoogle"
                            class="mt-6 group relative w-full flex justify-center py-3 px-6 border-2 border-gray-300 text-base font-medium rounded-full text-gray-800 bg-white hover:bg-gray-200 focus:outline-none">

                        <svg class="mr-4"
                             xmlns="http://www.w3.org/2000/svg"
                             width="22"
                             height="24"
                             viewBox="0 0 22 24"
                             fill="none">
                            <path fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M12.1354 5.75C14.0004 5.75 15.4794 6.396 16.4204 7.33L19.0744 4.676C17.3544 3 14.9584 2 12.1354 2C8.1984 2 4.8554 4.148 3.1704 7.302L6.2004 9.7C7.0974 7.39 9.3304 5.75 12.1354 5.75Z"
                                  fill="#E94435"></path>
                            <path fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M5.7708 11.9896C5.7708 11.1806 5.9248 10.4106 6.2008 9.7006L3.1708 7.3016C2.4238 8.7006 1.9998 10.2946 1.9998 11.9896C1.9998 13.7206 2.4098 15.3266 3.1358 16.7256L6.1958 14.3026C5.9248 13.5956 5.7708 12.8206 5.7708 11.9896Z"
                                  fill="#F8BB15"></path>
                            <path fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M15.8107 17.3084C14.8667 17.8694 13.6267 18.2294 12.0107 18.2294C9.3627 18.2294 7.1007 16.6654 6.1957 14.3034L3.1357 16.7254C4.7837 19.9024 8.0767 22.0004 12.0107 22.0004C14.7537 22.0004 17.0727 21.1524 18.7877 19.6654L15.8107 17.3084Z"
                                  fill="#34A751"></path>
                            <path fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M22 11.9896C22 11.3086 21.931 10.6436 21.801 9.9996H12V13.9996H18.062L18.018 14.2496C17.784 15.4466 17.068 16.5606 15.811 17.3086L18.788 19.6656C20.818 17.9056 22 15.2466 22 11.9896Z"
                                  fill="#547DBE"></path>
                        </svg>
                        Sign in with Google
                    </button>

                    <!-- <button @click="loginWithGoogle"
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
                        Login with Google
                    </button> -->
                    <!-- <div class="flex items-center justify-between">
                        <div class="text-sm">
                            <span @click="togglePasswordReset" class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-200 dark:hover:text-indigo-300">
                                Forgot your password?
                            </span>
                        </div>
                    </div> -->

                </div>
            </div>
            <div class="font-semibold mt-10 dark:text-gray-200">
                No account?
                <a class="text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400 cursor-pointer"
                   href="https://forms.gle/BKDQzgtnfHEdvnHM8"
                   target="_blank">
                    Ask for one, you will be contacted soon.
                </a>
            </div>
        </div>
    </div>
</template>
