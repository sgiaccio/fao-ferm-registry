import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import './index.css'


(async () => {
    const app = createApp(App);
    app.use(createPinia());

    // const auth = useAuthStore();
    // await auth.fetchUser();

    // !!! ORDER IS IMPORTANT !!!
    // !!! LOAD ROUTER AFTER THE AUTH STORE IS LOADED AND USER IS FETCHED !!!
    app.use(router);

    await router.isReady();
    // if (router.currentRoute.value.path === "/login" && auth.authLoaded) {
    //     await router.push(auth.returnUrl);
    // }

    
    app.config.errorHandler = (error, vm, info) => {
        // Handle the error globally
        if (process.env.NODE_ENV === 'development') {
            alert('An unexpected error occurred, please check the console log.');
        }
        console.error(error);
    };

    app.mount("#app");
})();
