import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './index.css'

import Vue3Toasity, { type ToastContainerOptions, toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

(async () => {
    const app = createApp(App);
    app.use(createPinia());

    app.use(Vue3Toasity, {
        autoClose: 3000
    } as ToastContainerOptions);

    app.use(router);
    await router.isReady();

    app.config.errorHandler = (error, _vm, _info) => {
        // Handle the error globally
        if (process.env.NODE_ENV === 'development') {
            toast.error('An unexpected error occurred, please check the console for more information.', {
            });
        }
        console.error(error);
    };

    app.mount('#app');
})();
