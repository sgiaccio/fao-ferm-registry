<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute();

// const currentTab = ref("objectives");

const tabs = computed (() => [
    { name: 'Objectives and Context', href: 'objectives', current: 'objectives' === route.name },
    { name: 'Methodology', href: 'methodology', current: 'methodology' === route.name },
    { name: 'Key Factors, Constraints and Lessons Learned', href: 'keyfactors', current: 'keyfactors' === route.name },
    { name: 'Benefits and Validation', href: 'benefits', current: 'benefits' === route.name },
    { name: 'Additional Resources', href: 'additionalresources', current: 'additionalresources' === route.name },
])
</script>

<template>
    <div>
        <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
            <select id="tabs" name="tabs" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option v-for="tab in tabs" :key="tab.name" :selected="route.name === tab.href">{{ tab.name }}</option>
            </select>
        </div>
        <div class="hidden sm:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <router-link
                        v-for="tab in tabs"
                        :key="tab.name"
                        :class="[route.name === tab.href ? 'border-indigo-500 text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']" :aria-current="tab.current ? 'page' : undefined"
                        :to="tab.href">{{tab.name}}
                    </router-link>
                </nav>
            </div>
        </div>
    </div>

    <router-view />

    <!-- TODO, important -->
    <!-- <router-view v-slot="{ Component, route }">
        <keep-alive include="BestPracticeObjectivesView">
            <component :is="Component" :key="route.path" />
        </keep-alive>
    </router-view> -->
</template>
