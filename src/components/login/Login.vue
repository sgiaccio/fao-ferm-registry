<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../stores/auth'
import { useUserPrefsStore } from '../../stores/userPreferences'

import router from '../../router'

import AlertModal from "@/views/AlertModal.vue";


const { signInWithEmail, signInWithGoogle } = useAuthStore();
const { darkMode } = storeToRefs(useUserPrefsStore())

const loginForm = ref({
    email: null,
});

// Passwortless login with email
async function authenticateWithEmail() {
    const { email } = loginForm.value;
    if (email !== null) {
        try {
            await signInWithEmail(email);
            loginSuccess.value = true;
        } catch (error) {
            // Account creation is disabled on the server.
            // Firebase throws Firebase throws Error (auth/admin-restricted-operation) if the email doesn't exist
            // Since it's the only error we're expecting, we assume that the account doesn't exist.
            loginError.value = true;
        }
    }
}

const loginSuccess = ref(false);
function onClose() {
    loginSuccess.value = false;
    router.push({ name: 'initiatives' });
}


const loginError = ref(false);
function onCloseLoginError() {
    loginError.value = false;
}
</script>

<template>
    <AlertModal type="success"
                :onClose="onClose"
                :open="loginSuccess"
                title="Please check your inbox"
                buttonText="Ok">
        <p class="text-sm text-gray-500">We've sent you an email with instructions to complete your sign-in process. <br>Kindly check your inbox and click on the link provided.</p>
    </AlertModal>

    <AlertModal type="info"
                :onClose="onCloseLoginError"
                :open="loginError"
                title="Account does not exist"
                buttonText="Ok">
        <p class="text-sm text-gray-500">Sign in error, please try again</p>
    </AlertModal>

    <div>
        <div class="relative isolate overflow-hidden">
            <div class="mx-auto max-w-6xl pt-10 pb-24 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:py-20 lg:px-8">
                <div class="px-6 lg:px-0 lg:pt-4">
                    <div class="mx-auto max-w-2xl">
                        <div class="max-w-lg">
                            <img v-if="darkMode"
                                 class="h-28 w-auto"
                                 src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                                 alt="UN Decade">
                            <img v-else
                                 class="h-28 w-auto"
                                 src="@/assets/UNDecade_LOGO_MASTER_EN.svg"
                                 alt="UN Decade">
                            <h1 class="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-200 font-akrobat uppercase">Welcome to the<br>FERM Registry</h1>
                            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-200">The Framework for Ecosystem Restoration Monitoring Registry aims to provide a register of ecosystem restoration initiatives and good practices, in the context of the
                                <span class="font-bold">United Nations Decade on Ecosystem Restoration</span>,
                                whilst ensuring interoperability with other restoration monitoring platforms and initiatives.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-20 sm:mt-24 mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 w-full max-w-sm">
                    <div class="m-auto w-full max-w-sm mt-8 space-y-6 shadow-lg rounded-xl px-8 py-8 bg-slate-700">
                        <h2 class="text-center text-2xl font-bold text-gray-100">Sign up or login to the registry</h2>

                        <!-- Email sign in form -->
                        <div>
                            <div>
                                <label for="email-address"
                                       class="sr-only">Email address</label>
                                <input id="email-address"
                                       name="email"
                                       type="email"
                                       autoComplete="email"
                                       required
                                       class="appearance-none rounded-full relative block w-full px-6 py-3 border-2 border-transparent placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-lg"
                                       placeholder="Email address"
                                       v-model="loginForm.email">
                            </div>
                            <div>
                                <button @click="authenticateWithEmail()"
                                        type="submit"
                                        class="mt-6 group relative w-full flex justify-center py-3 px-6 border border-transparent text-lg font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none">
                                    Email me a sign-in link
                                </button>
                            </div>

                        </div>

                        <div class="relative">
                            <div class="absolute inset-0 flex items-center"
                                 aria-hidden="true">
                                <div class="w-full border-t border-gray-300" />
                            </div>
                            <div class="relative flex justify-center">
                                <span class="bg-slate-700 px-2 text-sm text-gray-300">Or</span>
                            </div>
                        </div>

                        <!-- Google sign in button -->
                        <button @click="signInWithGoogle"
                                class="mt-6 group relative w-full flex justify-center py-3 px-6 border-2 border-transparent text-base font-medium rounded-full text-gray-800 bg-white hover:bg-gray-200 focus:outline-none">
                            <!-- Google logo -->
                            <svg class="mr-4"
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="22"
                                 height="24"
                                 viewBox="0 0 22 24"
                                 fill="none">
                                <path fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M12.1354 5.75C14.0004 5.75 15.4794 6.396 16.4204 7.33L19.0744 4.676C17.3544 3 14.9584 2 12.1354 2C8.1984 2 4.8554 4.148 3.1704 7.302L6.2004 9.7C7.0974 7.39 9.3304 5.75 12.1354 5.75Z"
                                      fill="#E94435">
                                </path>
                                <path fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M5.7708 11.9896C5.7708 11.1806 5.9248 10.4106 6.2008 9.7006L3.1708 7.3016C2.4238 8.7006 1.9998 10.2946 1.9998 11.9896C1.9998 13.7206 2.4098 15.3266 3.1358 16.7256L6.1958 14.3026C5.9248 13.5956 5.7708 12.8206 5.7708 11.9896Z"
                                      fill="#F8BB15">
                                </path>
                                <path fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M15.8107 17.3084C14.8667 17.8694 13.6267 18.2294 12.0107 18.2294C9.3627 18.2294 7.1007 16.6654 6.1957 14.3034L3.1357 16.7254C4.7837 19.9024 8.0767 22.0004 12.0107 22.0004C14.7537 22.0004 17.0727 21.1524 18.7877 19.6654L15.8107 17.3084Z"
                                      fill="#34A751">
                                </path>
                                <path fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M22 11.9896C22 11.3086 21.931 10.6436 21.801 9.9996H12V13.9996H18.062L18.018 14.2496C17.784 15.4466 17.068 16.5606 15.811 17.3086L18.788 19.6656C20.818 17.9056 22 15.2466 22 11.9896Z"
                                      fill="#547DBE">
                                </path>
                            </svg>
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
