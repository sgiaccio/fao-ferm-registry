import { createApp } from 'vue';
import { createPinia } from 'pinia';

// import i18n from '@/lib/i18n';

import { setupI18n } from '@/lib/i18n';

import App from './App.vue';
import router from './router';

import './index.css'

import Vue3Toasity, { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


// const i18nConfig: any = {
//     locale: 'fr',
//     fallbackLocale: 'en',
//     messages,
//     legacy: false,
//     globalInjection: true,
// };

// if (process.env.NODE_ENV === 'development') {
//     console.log('Development mode');
//     i18nConfig.postTranslation = (str: any, key: string) => {
//         if (typeof str === 'string') {
//             return str ? `${str} (i18n)` : key;
//         }
//         return str;
//     }
// }

// const i18n = createI18n(i18nConfig);

// (async () => {
const app = createApp(App);
app.use(createPinia());

const i18n = setupI18n();
app.use(i18n);

app.use(Vue3Toasity, {
    autoClose: 3000,
    position: 'bottom-right',
});

app.use(router);
// await router.isReady();

app.config.errorHandler = (error, _vm, _info) => {
    // Handle the error globally
    if (process.env.NODE_ENV === 'development') {
        toast.error('An unexpected error occurred, please check the console for more information.');
    }
    console.error(error);
};

app.mount('#app');
// })();
