<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router'

import Navbar from '@/views/Navbar.vue';


const route = useRoute();

const tabs = [
    { name: 'Users', routeName: 'users', current: false, superAdminOnly: false },
    { name: 'Groups', routeName: 'groups', current: false, superAdminOnly: true },
    { name: 'Submitted initiatives', routeName: 'submittedInitiatives', current: false, superAdminOnly: false },
    { name: 'Institution assignments requests', routeName: 'groupAssignments', current: false, superAdminOnly: false },
]

const store = useAuthStore();

const filteredTabs = tabs.filter(tab => !tab.superAdminOnly || (tab.superAdminOnly && store.isAdmin));

// Check if user is super admin
if (store.user) {
    if (store.isAdmin) {
        tabs[0].current = true;
    } else {
        tabs[2].current = true;
    }
}
</script>

<template>
    <Navbar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto mt-6">
            <div class="sm:hidden">
                <label for="tabs"
                       class="sr-only">Select a tab</label>
                <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                <select id="tabs"
                        name="tabs"
                        class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <option v-for="tab in tabs"
                            :key="tab.name"
                            :selected="tab.current">{{ tab.name }}</option>
                </select>
            </div>
            <div class="hidden sm:block">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex"
                         aria-label="Tabs">
                        <router-link v-for="tab in filteredTabs"
                                     :key="tab.name"
                                     :to="{ name: tab.routeName }"
                                     :class="[route.name === tab.routeName ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium']"
                                         :aria-current="route.name === tab.routeName ? 'page' : undefined">{{ tab.name }}</router-link>
                    </nav>
                </div>
            </div>

            <router-view />
        </div>
    </div>
</template>
