<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { CalendarIcon } from '@heroicons/vue/20/solid'

import { fbTimestampToString } from '../../lib/util'

import { useBestPracticesStore } from '../../stores/bestpractices';


const bestPracticeStore = useBestPracticesStore();

const bestPractices = ref([] as any []); // TODO - type
onMounted(async () => {
    const projects = await bestPracticeStore.fetchOwnedBestPractices();
    bestPractices.value = projects.map(p => { 
        return {id: p.id, data: p.data }
    });
});


</script>

<template>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
        <h1 class="mt-12 font-semibold text-4xl text-gray-800 dark:text-white mb-8">Good Practices</h1>
        <!-- <router-link
            :to="{ name: 'bestPractice', params: { id: 'new' }}"
            class="cursor-pointer inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Add new good practice</router-link> -->
        <div v-if="bestPractices.length" class="mt-8 overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="bestPractice in bestPractices" :key="bestPractice.id">
                    <router-link :to="`/good-practices/${bestPractice.id}/objectives`" href="#" class="block hover:bg-gray-50">
                        <div class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                            <p class="truncate text-sm font-medium" :class="[bestPractice.data.title ? 'text-indigo-600' : 'italic text-gray-400']">{{ bestPractice.data.title || 'No title'}}</p>
                                <div class="ml-2 flex flex-shrink-0">
                                    <p class="inline-flex rounded-full bg-yellow-400 px-2 text-xs font-semibold leading-5 text-gray-800">Draft</p>
                                </div>
                            </div>
                            <div class="mt-2 sm:flex sm:justify-between">
                                <div class="sm:flex">
                                    <!-- <p class="flex items-center text-sm text-gray-500">
                                        <UsersIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        User
                                    </p> -->
                                    <!-- <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                        <MapPinIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        Location
                                    </p> -->
                                </div>
                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    <p>
                                        Last updated on
                                        {{ ' ' }}
                                        <time :datetime="fbTimestampToString(bestPractice.data.lastModified)">{{fbTimestampToString(bestPractice.data.lastModified)}}</time>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </router-link>
                </li>
            </ul>
        </div>
    </div>
</div>
</template>

