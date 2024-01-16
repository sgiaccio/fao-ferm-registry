<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { Disclosure, DisclosureButton, DisclosurePanel, Switch, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'


import { useAuthStore } from "../stores/auth"
import { useUserPrefsStore } from "../stores/userPreferences"


const authStore = useAuthStore();
const prefsStore = useUserPrefsStore();

const route = useRoute();

function logout() {
    authStore.logout();
}

const { darkMode } = storeToRefs(prefsStore)

watch(darkMode, (mode) => {
    prefsStore.setDarkMode(!!mode);
    if (mode) {
        document.body.classList.add('dark');
        document.body.classList.add('bg-zinc-800');
    } else {
        document.body.classList.remove('dark');
        document.body.classList.remove('bg-zinc-800');
    }
}, { immediate: true });
</script>

<template>
    <Disclosure as="nav"
                class="bg-gray-800"
                style="margin_:0;padding_:0"
                v-slot="{ open }">
        <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div class="relative flex items-center justify-between h-16">
                <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    <!-- Mobile menu button-->
                    <DisclosureButton class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span class="sr-only">Open main menu</span>
                        <Bars3Icon v-if="!open"
                                   class="block h-6 w-6"
                                   aria-hidden="true" />
                        <XMarkIcon v-else
                                   class="block h-6 w-6"
                                   aria-hidden="true" />
                    </DisclosureButton>
                </div>
                <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                    <div class="flex-shrink-0 flex items-center">
                        <router-link to="/">
                            <img class="block lg:hidden h-8 w-auto"
                                 src="@/assets/FERM_LOGO_MASTER_colour_small.svg"
                                 alt="FERM" />
                        </router-link>
                        <router-link to="/">
                            <img class="hidden lg:block h-10 w-auto"
                                 src="@/assets/FERM_LOGO_MASTER_colour_small.svg"
                                 alt="FERM" />
                        </router-link>
                    </div>

                    <div class="hidden sm:block sm:ml-6">
                        <div class="flex space-x-4">
                            <router-link :to="{ name: 'initiatives' }"
                                         :class="[route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                         :aria-current="route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'page' : undefined">Initiatives
                            </router-link>
                            <router-link v-if="authStore.isAdmin"
                                         :to="{ name: 'users' }"
                                         :class="[route.matched.some(({ name }) => name === 'admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                         :aria-current="route.matched.some(({ name }) => name === 'users') ? 'page' : undefined">Admin
                            </router-link>
                            <router-link v-else-if="authStore.isGroupAdmin"
                                         :to="{ name: 'groupAssignments' }"
                                         :class="[route.matched.some(({ name }) => name === 'admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                         :aria-current="route.matched.some(({ name }) => name === 'users') ? 'page' : undefined">Admin
                            </router-link>
                            <!-- <router-link v-for="item in navigation"
                                         :key="item.name"
                                         :to="{ name: item.routeName }"
                                         :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                         :aria-current="item.current ? 'page' : undefined">{{ item.name }}
                            </router-link> -->
                        </div>
                    </div>

                </div>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <div id="content-specific"
                         class="flex flex-row items-center" />
                    <Switch v-model="darkMode"
                            :class="[darkMode ? 'bg-indigo-600' : 'bg-indigo-200', 'ml-3 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2_ focus:ring-indigo-500_ focus:ring-offset-2_']">
                        <span class="sr-only">Night mode</span>
                        <span :class="[darkMode ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']">
                            <span :class="[darkMode ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']"
                                  aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 20 20"
                                     fill="currentColor"
                                     class="h-3 w-3 text-orange-500">
                                    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                                </svg>
                            </span>
                            <span :class="[darkMode ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']"
                                  aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 20 20"
                                     fill="currentColor"
                                     class="h-3 w-3 text-yellow-500">
                                    <path fill-rule="evenodd"
                                          d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
                                          clip-rule="evenodd" />
                                </svg>
                            </span>
                        </span>
                    </Switch>

                    <!-- Profile dropdown -->
                    <Menu v-if="authStore.user"
                          as="div"
                          class="ml-3 relative z-10">
                        <div>
                            <menu-button class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white text-white">
                                <span class="sr-only">Open user menu</span>
                                <!-- <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" /> -->
                                <span class="inline-block h-6 w-6 overflow-hidden rounded-full bg-gray-600">
                                    <svg class="h-full w-full text-gray-300"
                                         fill="currentColor"
                                         viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                            </menu-button>
                        </div>
                        <transition enter-active-class="transition ease-out duration-100"
                                    enter-from-class="transform opacity-0 scale-95"
                                    enter-to-class="transform opacity-100 scale-100"
                                    leave-active-class="transition ease-in duration-75"
                                    leave-from-class="transform opacity-100 scale-100"
                                    leave-to-class="transform opacity-0 scale-95">
                            <menu-items class="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <menu-item>
                                    <div class="font-semibold block px-4 py-2 text-sm text-gray-400 cursor-default whitespace-nowrap">{{ authStore.user.displayName || authStore.user.email }}</div>
                                </menu-item>
                                <menu-item v-slot="{ active }">
                                    <a href="#"
                                       :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                                       @click="logout">Sign out</a>
                                </menu-item>
                            </menu-items>
                        </transition>
                    </Menu>
                </div>
            </div>
        </div>

        <!-- <div class="text-white"><pre>{{JSON.stringify(route.matched, null, 2)}}</pre></div> -->

        <DisclosurePanel class="sm:hidden">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <router-link :to="{ name: 'initiatives' }"
                             :class="[route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block px-3 py-2 rounded-md text-base font-medium']"
                             :aria-current="route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'page' : undefined">Initiatives</router-link>
                <!-- <router-link v-if="authStore.isAdmin"
                             :to="{ name: 'users' }"
                             :class="[route.matched.some(({ name }) => name === 'admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block px-3 py-2 rounded-md text-base font-medium']"
                             :aria-current="route.matched.some(({ name }) => name === 'admin') ? 'page' : undefined">Admin</router-link> -->
            </div>
        </DisclosurePanel>
    </Disclosure>
</template>
