<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/vue/20/solid'

import { useBestPracticesStore } from '../../stores/bestpractices';

const bestPracticeStore = useBestPracticesStore();

const bestPractices = ref([] as any []); // TODO - type
onMounted(async () => {
    const projects = await bestPracticeStore.fetchOwnedBestPractices();
    bestPractices.value = projects.map(p => ({ id: p.id, data: p.data() }));
});
</script>

<template>
<div v-if="bestPractices.length" class="overflow-hidden bg-white shadow sm:rounded-md">
    <ul role="list" class="divide-y divide-gray-200">
        <li v-for="bestPractice in bestPractices" :key="bestPractice.id">

            <!-- <router-link
                v-for="tab in tabs"
                :key="tab.name"
                :class="[route.name === tab.href ? 'border-indigo-500 text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']" :aria-current="route.name === tab.href ? 'page' : undefined"
                :to="tab.href">{{tab.name}}
            </router-link> -->


            <router-link :to="`/best-practices/${bestPractice.id}/objectives`" href="#" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                    <p class="truncate text-sm font-medium text-indigo-600">{{ bestPractice.data.title }}</p>
                        <div class="ml-2 flex flex-shrink-0">
                            <p class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">Type</p>
                        </div>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                        <div class="sm:flex">
                            <p class="flex items-center text-sm text-gray-500">
                                <UsersIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                Departement
                            </p>
                            <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <MapPinIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                Location
                            </p>
                        </div>
                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            <p>
                                Closing on
                                {{ ' ' }}
                                <time :datetime="bestPractice.closeDate">Close date</time>
                            </p>
                        </div>
                    </div>
                </div>
            </router-link>
        </li>
    </ul>
</div>
</template>

