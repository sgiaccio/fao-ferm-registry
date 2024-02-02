<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../stores/auth'

import router from '../../router'

import AlertModal from "@/views/AlertModal.vue";


const { signInWithEmail, signInWithGoogle, returnUrl } = useAuthStore();

const loginForm = ref({ email: null });

// Passwordless login with email
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
    <AlertModal
        type="success"
        :onClose="onClose"
        :open="loginSuccess"
        title="Please check your inbox"
        buttonText="Ok"
    >
        <p class="text-sm text-gray-500">We've sent you an email with instructions to complete your sign-in process. <br>Kindly check your inbox and click on the link provided.</p>
    </AlertModal>

    <AlertModal
        type="info"
        :onClose="onCloseLoginError"
        :open="loginError"
        title="Account does not exist"
        buttonText="Ok"
    >
        <p class="text-sm text-gray-500">Sign in error, please try again</p>
    </AlertModal>

    <div class="flex min-h-full flex-1">
        <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div class="mx-auto w-full max-w-sm lg:w-96">
                <div>
                    <img
                        class="h-28 w-full"
                        src="@/assets/UNDecade_LOGO_MASTER_EN.svg"
                        alt="UN Decade"
                    >
                    <h2 class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900 text-center">Sign up or login to the registry</h2>
                    <!-- <p class="mt-2 text-sm leading-6 text-gray-500">
                        Not a member?
                        {{ ' ' }}
                        <a
                            href="#"
                            class="font-semibold text-indigo-600 hover:text-indigo-500"
                        >Start a 14 day free trial</a>
                    </p> -->
                </div>

                <div class="mt-10">
                    <div>
                        <div class="space-y-6">
                            <div>
                                <label
                                    for="email-address"
                                    class="block text-sm font-medium leading-6 text-gray-900"
                                >Email address</label>
                                <div class="mt-2">
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        v-model="loginForm.email"
                                        autocomplete="email"
                                        required=""
                                        class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <!-- <div>
                                <label
                                    for="password"
                                    class="block text-sm font-medium leading-6 text-gray-900"
                                >Password</label>
                                <div class="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autocomplete="current-password"
                                        required=""
                                        class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div> -->

                            <!-- <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label
                                        for="remember-me"
                                        class="ml-3 block text-sm leading-6 text-gray-700"
                                    >Remember me</label>
                                </div>

                                <div class="text-sm leading-6">
                                    <a
                                        href="#"
                                        class="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >Forgot password?</a>
                                </div>
                            </div> -->

                            <div>
                                <button
                                    @click="authenticateWithEmail"
                                    type="submit"
                                    class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >Email me a sign-in link</button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10">
                        <div class="relative">
                            <div
                                class="absolute inset-0 flex items-center"
                                aria-hidden="true"
                            >
                                <div class="w-full border-t border-gray-200" />
                            </div>
                            <div class="relative flex justify-center text-sm font-medium leading-6">
                                <span class="bg-white px-6 text-gray-900">Or continue with</span>
                            </div>
                        </div>

                        <div class="mt-6 grid grid-cols-1 gap-4">
                            <button
                                @click="signInWithGoogle"
                                class="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                            >
                                <svg
                                    class="h-5 w-5"
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                                        fill="#EA4335"
                                    />
                                    <path
                                        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                                        fill="#34A853"
                                    />
                                </svg>
                                <span class="text-sm font-semibold leading-6">Google</span>
                            </button>

                            <!-- <a
                                href="#"
                                class="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                            >
                                <svg
                                    class="h-5 w-5 fill-[#24292F]"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                <span class="text-sm font-semibold leading-6">GitHub</span>
                            </a> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="relative hidden w-0 flex-1 lg:block">
            <img
                class="absolute inset-0 h-full w-full object-cover"
                src="@/assets/login_image.jpg"
                alt=""
            />
        </div>
    </div>
</template>
  
<!-- <template>
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
                            <img
                                 class="h-28 w-full"
                                 src="@/assets/UNDecade_LOGO_MASTER_EN.svg"
                                 alt="UN Decade">
                            <h1 class="w-full text-center mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-akrobat uppercase">Welcome to the<br>FERM Registry</h1>
                            <p class="mt-6 text-lg leading-8 text-gray-800">The Framework for Ecosystem Restoration Monitoring Registry aims to provide a register of ecosystem restoration initiatives and good practices, in the context of the
                                <span class="font-bold">United Nations Decade on Ecosystem Restoration</span>,
                                whilst ensuring interoperability with other restoration monitoring platforms and initiatives.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-20 sm:mt-24 mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 w-full max-w-sm">
                    <div class="m-auto w-full max-w-sm mt-8 space-y-6 shadow-lg rounded-xl px-8 py-8 bg-slate-700">
                        <h2 class="text-center text-2xl font-bold text-gray-100">Sign up or login to the registry</h2>

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

                        <button @click="signInWithGoogle"
                                class="mt-6 group relative w-full flex justify-center py-3 px-6 border-2 border-transparent text-base font-medium rounded-full text-gray-800 bg-white hover:bg-gray-200 focus:outline-none">
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
</template> -->
