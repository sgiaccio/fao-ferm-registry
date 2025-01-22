import { defineStore } from "pinia";

import type { Menu } from "@/components/project/menus";

// Define the type guard functions
// function isMenu(menu: Menu | RecursiveMenu): menu is Menu {
//     return !menu.some((item) => 'items' in item);
// }

// function isRecursiveMenu(menu: Menu | RecursiveMenu): menu is RecursiveMenu {
//     return !isMenu(menu);
// }

export const useMenusStore = defineStore({
    id: "edit",
    state: () => ({
        loaded: false,
        menus: {} as { [key: string]: Menu },
        // recursiveMenus: {} as { [key: string]: RecursiveMenu },
    }),
    actions: {
        async fetchMenus(locale: string) {
            // const tMenus = await getMenus();

            // import the json file dynamically from @/locales/menus/[locale].json
            const tMenus: Menu = await import(`@/locales/menus/${locale}.json`);

            // iterate through the tMenus array - for reactivity to work, we need to assign the values one by one
            Object.entries(tMenus).forEach(([id, menu]) => {
                this.menus[id] = menu;
            });

            this.loaded = true;
        }
    }
});
