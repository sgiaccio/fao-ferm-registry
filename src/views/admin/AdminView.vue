<script setup lang="ts">
const tabs = [
    { name: 'Users', routeName: 'users', current: false },
    { name: 'Groups', routeName: 'groups', current: false },
]
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
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
                        <router-link v-for="tab in tabs"
                                     :key="tab.name"
                                     :to="{ name: tab.routeName }"
                                     :class="[tab.current ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm']"
                                     :aria-current="tab.current ? 'page' : undefined">{{ tab.name }}</router-link>
                    </nav>
                </div>
            </div>
            <router-view />
        </div>
    </div>
</template>
