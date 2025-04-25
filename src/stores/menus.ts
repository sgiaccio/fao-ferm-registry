import { defineStore } from "pinia";

import { t } from "@/lib/i18n";

import keys from "@/assets/locales/menu_keys.json";

import { getI18n } from '@/lib/i18n';
import type {Menu} from '@/types';

export const useMenusStore = defineStore({
    id: "edit",
    state: () => ({
        loaded: false,
        menus: {} as { [key: string]: Menu },
    }),
    actions: {
        async fetchMenus() {
            const i18n = getI18n();
            // add the menus messages to vue-i18n dynamically
            const locale = i18n.global.locale.value;
            const menuMessages = await fetch(`https://cdn.tolg.ee/fa9930d246d28584262908e4edbb5568/${locale}.json`).then(res => res.json());;

            // Merge the menu messages into the existing messages
            const existingMessages = i18n.global.getLocaleMessage(locale);
            i18n.global.setLocaleMessage(locale, {
                ...existingMessages,
                ...menuMessages
            });

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
