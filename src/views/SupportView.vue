<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

import { handleSupportRequest } from '@/firebase/functions';

import Footer from '@/views/Footer.vue';
import ShittyDivider from '@/views/ShittyDivider.vue';
import AlertModal from '@/views/AlertModal.vue';

const formData = reactive({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
});

const submitEnabled = ref(false);
watch(formData, () => {
    submitEnabled.value = !!formData.firstName && !!formData.lastName && !!formData.email && !!formData.message;
});


async function onSubmit() {
    try {
        if (submitEnabled.value) {
            await handleSupportRequest(formData.firstName, formData.lastName, formData.email, formData.message);
            supportSuccess.value = true;
        }
    } catch (error) {
        supportError.value = true;
    }
}

const supportSuccess = ref(false);
const onCloseSuccess = () => {
    supportSuccess.value = false;
    formData.firstName = '';
    formData.lastName = '';
    formData.email = '';
    formData.message = '';

};

const supportError = ref(false);
const onCloseError = () => {
    supportError.value = false;
};
</script>
  
<template>
    <AlertModal type="success"
                :onClose="onCloseSuccess"
                :open="supportSuccess"
                title="Support request sent"
                buttonText="Ok">
        <p class="text-sm text-gray-500">Your support request has been submitted successfully. We will be in touch with you via email as soon as possible. Please check your inbox for further communications regarding your request.</p>
    </AlertModal>

    <AlertModal type="error"
                :onClose="onCloseError"
                :open="supportError"
                title="Support request failed"
                buttonText="Ok">
        <p class="text-sm text-gray-500">Apologies, there was an error in submitting your support request.</p>
    </AlertModal>
    <div class="relative isolate bg-gray-900">
        <img src="/seashore.jpg"
             class="w-full h-full _bg-[url('/seashore.jpg')] object-cover absolute brightness-50">
        <shitty-divider class="absolute -left-1 bottom-0" />
        <div class="px-4 sm:px-12 pt-12">
            <!-- Logos -->
            <div class="relative w-full pl-10 flex">
                <div class="mb-2 sm:mb-5 mt-2 grid grid-flow-col gap-x-6 mx-auto md:mx-0 divide-x divide-gray-300">
                    <div class="-ml-10 mr-3">
                        <a href="/">
                            <img src="@/assets/FERM_LOGO_MASTER_colour_white_EN.svg"
                                 alt="FERM logo"
                                 class="h-12 sm:h-16 w-auto scale-125" />
                        </a>
                    </div>
                    <div>
                        <a href="https://www.decadeonrestoration.org">
                            <img src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                                 alt="FERM logo"
                                 class="h-12 sm:h-16 w-auto scale-150 ml-10" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 relative">
            <div class="relative px-6 pt-24 lg:static lg:px-8">
                <div class="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                    <h2 class="text-3xl font-bold tracking-tight text-white">Get in touch</h2>
                    <p class="mt-6 text-lg leading-8 text-gray-200 ">Need assistance with the FERM? We're here to help! Fill out this form with your name, email, and a detailed description of your issue or question. Our support team will get back to you as soon as possible.</p>
                    <p class="mt-6 text-lg leading-8 text-gray-300">Thank you for using FERM!</p>
                    <!-- <dl class="mt-10 space-y-4 text-base leading-7 text-gray-300">
                        <div class="flex gap-x-4">
                            <dt class="flex-none">
                                <span class="sr-only">Address</span>
                                <BuildingOffice2Icon class="h-7 w-6 text-gray-400"
                                                     aria-hidden="true" />
                            </dt>
                            <dd>545 Mavis Island<br />Chicago, IL 99191</dd>
                        </div>
                        <div class="flex gap-x-4">
                            <dt class="flex-none">
                                <span class="sr-only">Telephone</span>
                                <PhoneIcon class="h-7 w-6 text-gray-400"
                                           aria-hidden="true" />
                            </dt>
                            <dd><a class="hover:text-white"
                                   href="tel:+1 (555) 234-5678">+1 (555) 234-5678</a></dd>
                        </div>
                        <div class="flex gap-x-4">
                            <dt class="flex-none">
                                <span class="sr-only">Email</span>
                                <EnvelopeIcon class="h-7 w-6 text-gray-400"
                                              aria-hidden="true" />
                            </dt>
                            <dd><a class="hover:text-white"
                                   href="mailto:hello@example.com">hello@example.com</a></dd>
                        </div>
                    </dl> -->
                </div>
            </div>
            <form @submit.prevent="onSubmit"
                  method="POST"
                  class="px-6 pb-24 pt-16 sm:pb-32 lg:px-8">
                <div class="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                    <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div>
                            <label for="firstName"
                                   class="block text-sm font-semibold leading-6 text-white">First name</label>
                            <div class="mt-2.5">
                                <input type="text"
                                       v-model="formData.firstName"
                                       name="first-name"
                                       id="firstName"
                                       autocomplete="given-name"
                                       class="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-ferm-blue-dark-800 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                        <div>
                            <label for="lastName"
                                   class="block text-sm font-semibold leading-6 text-white">Last name</label>
                            <div class="mt-2.5">
                                <input type="text"
                                       v-model="formData.lastName"
                                       name="last-name"
                                       id="lastName"
                                       autocomplete="family-name"
                                       class="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-ferm-blue-dark-800 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="email"
                                   class="block text-sm font-semibold leading-6 text-white">Email</label>
                            <div class="mt-2.5">
                                <input type="email"
                                       v-model="formData.email"
                                       name="email"
                                       id="email"
                                       autocomplete="email"
                                       class="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-ferm-blue-dark-800 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="message"
                                   class="block text-sm font-semibold leading-6 text-white">Message</label>
                            <div class="mt-2.5">
                                <textarea name="message"
                                          :value="formData.message"
                                          @input="formData.message = $event.target.value"
                                          id="message"
                                          rows="4"
                                          class="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-ferm-blue-dark-800 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-end">
                        <button type="submit"
                                :disabled="!submitEnabled"
                                :class="[submitEnabled ? 'bg-ferm-blue-light-700 hover:bg-ferm-blue-light-600 ' : 'bg-gray-500/90 text-gray-200', 'rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ferm-blue-light-700']">Send message</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <Footer />
</template>
