import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './index.css'

import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

// import PrimeVue from 'primevue/config';
// import Lara from '@/presets/lara';

(async () => {
    const app = createApp(App);
    app.use(createPinia());

    app.use(Vue3Toasity, {
        autoClose: 3000
    } as ToastContainerOptions);

    // const auth = useAuthStore();
    // await auth.fetchUser();

    // !!! ORDER IS IMPORTANT !!!
    // !!! LOAD ROUTER AFTER THE AUTH STORE IS LOADED AND USER IS FETCHED !!!
    app.use(router);

    await router.isReady();
    // if (router.currentRoute.value.path === '/login' && auth.authLoaded) {
    //     await router.push(auth.returnUrl);
    // }


    app.config.errorHandler = (error, _vm, _info) => {
        // Handle the error globally
        if (process.env.NODE_ENV === 'development') {
            alert('An unexpected error occurred, please check the console log.');
        }
        console.error(error);
    };

    // app.use(PrimeVue, {
    //     unstyled: true,
    //     pt: Lara
    // });
    
    app.mount('#app');
})();
