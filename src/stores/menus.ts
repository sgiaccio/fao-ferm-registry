import { defineStore } from "pinia";

import type { Menu } from "@/components/project/menus";


export const useMenusStore = defineStore({
    id: "edit",
    state: () => ({
        loaded: false,
        menus: {} as { [key: string]: Menu },
    }),
    actions: {
        async fetchMenus(locale: string) {
            // import the json file dynamically from @/locales/menus/[locale].json
            // const tMenus: Menu = await import(`@/locales/menus/${locale}.json`);

            // load dynamically the json file from /locales/menus/[locale].json - use fetch
            // This is a temporary solution to allow editing of the locale files
            const response = await fetch(`/locales/menus/${locale}.json`);
            const tMenus: { [key: string]: Menu } = await response.json();

            // Iterate through the tMenus array - for reactivity to work, we need to assign the values one by one
            Object.entries(tMenus).forEach(([id, menu]) => {
                this.menus[id] = menu;
            });

            this.loaded = true;
        }
    }
});
