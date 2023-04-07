import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { useAuthStore } from "./stores/auth";

import './index.css'


(async () => {
    const app = createApp(App);
    app.use(createPinia());

    const auth = useAuthStore();
    await auth.fetchUser();

    // !!! ORDER IS IMPORTANT !!!
    // !!! LOAD ROUTER AFTER THE AUTH STORE IS LOADED AND USER IS FETCHED !!!
    app.use(router);

    await router.isReady();
    if (router.currentRoute.value.path === "/login") {
        auth.authLoaded = true;
        router.push(auth.returnUrl);
    }

    app.mount("#app");
})();
