<script setup lang="ts">
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems
} from '@headlessui/vue'

import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

import { useAuthStore } from "../stores/auth"


const { locale } = useI18n();

const authStore = useAuthStore();

const route = useRoute();

function logout() {
    authStore.logout();
}
</script>

<template>
    <Disclosure
        as="nav"
        class="bg-gray-800 z-40"
        style="margin_:0;padding_:0"
        v-slot="{ open }"
    >
        <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div class="relative flex items-center justify-between h-12 sm:h-16">
                <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    <!-- Mobile menu button-->
                    <DisclosureButton class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span class="sr-only">Open main menu</span>
                        <Bars3Icon
                            v-if="!open"
                            class="block h-6 w-6"
                            aria-hidden="true"
                        />
                        <XMarkIcon
                            v-else
                            class="block h-6 w-6"
                            aria-hidden="true"
                        />
                    </DisclosureButton>
                </div>
                <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                    <div class="flex-shrink-0 flex items-center">
                        <router-link to="/">
                            <img
                                class="block h-6 md:h-8 lg:h-10 w-auto"
                                src="@/assets/FERM_LOGO_MASTER_colour_small.svg"
                                alt="FERM"
                            />
                        </router-link>
                        <!-- <router-link to="/">
                            <img class="hidden lg:block h-10 w-auto"
                                 src="@/assets/FERM_LOGO_MASTER_colour_small.svg"
                                 alt="FERM" />
                        </router-link> -->
                    </div>

                    <div class="hidden sm:block sm:ml-6">
                        <div class="flex space-x-4">
                            <router-link
                                :to="{ name: 'initiatives' }"
                                :class="[route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                :aria-current="route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'page' : undefined"
                            >Initiatives
                            </router-link>
                            <router-link
                                v-if="authStore.isAdmin"
                                :to="{ name: 'users' }"
                                :class="[route.matched.some(({ name }) => name === 'admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                :aria-current="route.matched.some(({ name }) => name === 'users') ? 'page' : undefined"
                            >Admin
                            </router-link>
                            <router-link
                                v-else-if="authStore.isGroupAdmin"
                                :to="{ name: 'groupAssignments' }"
                                :class="[route.matched.some(({ name }) => name === 'admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium']"
                                :aria-current="route.matched.some(({ name }) => name === 'users') ? 'page' : undefined"
                            >Admin
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
                    <div
                        id="content-specific"
                        class="flex flex-row items-center"
                    />

                    <!-- Language Links -->
                    <div class="flex space-x-4 text-gray-50 font-semibold">
                        <button
                            :class="[locale === 'en' ? 'underline' : '', 'hover:underline']"
                            @click="() => locale = 'en'"
                        >
                            EN
                        </button>
                        <button
                            :class="[locale === 'es' ? 'underline' : '', 'hover:underline']"
                            @click="() => locale = 'es'"
                        >
                            ES
                        </button>
                        <button
                            :class="[locale === 'fr' ? 'underline' : '', 'hover:underline']"
                            @click="() => locale = 'fr'"
                        >
                            FR
                        </button>
                    </div>


                    <!-- Profile dropdown -->
                    <Menu
                        v-if="authStore.user"
                        as="div"
                        class="ml-3 relative z-10"
                    >
                        <div>
                            <menu-button class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white text-white">
                                <span class="sr-only">Open user menu</span>
                                <span class="inline-block h-6 w-6 overflow-hidden rounded-full bg-gray-600">
                                    <svg
                                        class="h-full w-full text-gray-300"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                            </menu-button>
                        </div>
                        <transition
                            enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95"
                        >
                            <menu-items class="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <menu-item>
                                    <div class="font-semibold block px-4 py-2 text-sm text-gray-400 cursor-default whitespace-nowrap">{{ authStore.user.displayName || authStore.user.email }}</div>
                                </menu-item>
                                <menu-item v-slot="{ active }">
                                    <a
                                        href="#"
                                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                                        @click="logout"
                                    >Sign out</a>
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
                <router-link
                    :to="{ name: 'initiatives' }"
                    :class="[route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block px-3 py-2 rounded-md text-base font-medium']"
                    :aria-current="route.matched.some(({ name }) => ['initiatives', 'initiative'].includes(name)) ? 'page' : undefined"
                >Initiatives</router-link>
                <!-- <router-link v-if="authStore.isAdmin"
                             :to="{ name: 'users' }"
                             :class="[route.matched.some(({ name }) => name === 'admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block px-3 py-2 rounded-md text-base font-medium']"
                             :aria-current="route.matched.some(({ name }) => name === 'admin') ? 'page' : undefined">Admin</router-link> -->
            </div>
        </DisclosurePanel>
    </Disclosure>
</template>
