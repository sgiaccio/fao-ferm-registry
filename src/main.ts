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

    // Order is important here: load the router after the auth store is loaded and user is fetched
    app.use(router);

    app.mount("#app");
})();
