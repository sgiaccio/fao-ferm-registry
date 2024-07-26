import { defineStore } from "pinia";
import { getMenus } from "@/firebase/firestore";

import type { Menu, RecursiveMenu } from "@/components/project/menus";

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
        async fetchMenus() {
            const tMenus = await getMenus();

            // iterate through the tMenus array
            Object.entries(tMenus).forEach(([id, menu]) => {
                this.menus[id] = menu;
            });
            // Object.entries(tMenus).forEach(([id, menu]) => {
            //     if (isRecursiveMenu(menu)) {
            //         this.recursiveMenus[id] = menu;
            //     } else if (isMenu(menu)) {
            //         this.menus[id] = menu;
            //     }
            // });
            this.loaded = true;
        },
        getRecursiveMenuItem(menu: RecursiveMenu, value: string): RecursiveMenuItem | null {
            for (const item of menu) {
                if (item.value === value) {
                    return item;
                }
                if ('items' in item) {
                    const found = this.getRecursiveMenuItem(item.items!, value);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        },
        flattenMenu(menu: RecursiveMenu): Menu {
            const result: Menu = [];
            for (const item of menu) {
                if (item.value) {
                    result.push(item);
                }
                if (item.items) {
                    result.push(...this.flattenMenu(item.items));
                }
            }
            return result;
        }
    }
});
