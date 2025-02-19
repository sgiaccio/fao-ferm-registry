import { defineStore } from "pinia";

import type { Menu } from "@/components/project/menus";

import { t } from "@/lib/i18n";

import keys from "@/assets/locales/menu_keys.json";

export const useMenusStore = defineStore({
    id: "edit",
    state: () => ({
        loaded: false,
        menus: {} as { [key: string]: Menu },
    }),
    actions: {
        async fetchMenus() {
            const recurseMenuKeys = function (menu: any, path: string) {
                const ret: any[] = []
                Object.values(menu).forEach((menuItem: any) => {
                    const newItem: any = {};
                    if (menuItem.value) {
                        newItem.value = menuItem.value;
                    }
                    if (menuItem.label) {
                        newItem.label = t(menuItem.label)
                    }
                    // if (menuItem.info) {
                    //     newItem.info = t(menuItem.info)
                    // }
                    if (menuItem.dangerousHtmlLabel) {
                        newItem.dangerousHtmlLabel = t(menuItem.dangerousHtmlLabel, menuItem.templates)
                    }
                    if (menuItem.items) {
                        newItem.items = recurseMenuKeys(menuItem.items, `${path}.${menuItem.label}`);
                    }
                    ret.push(newItem);
                });
                return ret;
            }

            Object.entries(keys).forEach(([id, menu]) => {
                this.menus[id] = recurseMenuKeys(menu, '');
            });

            this.loaded = true;
        }
    }
});
