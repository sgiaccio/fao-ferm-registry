<script setup lang="ts">
import { onMounted } from 'vue';

import { fbTimestampToString } from '../../lib/util'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { CalendarIcon, Cog6ToothIcon, DocumentCheckIcon, EllipsisVerticalIcon } from '@heroicons/vue/20/solid'

import { useProjectStore } from '../../stores/project';

const projectStore = useProjectStore();

onMounted(async () => {
    await projectStore.fetchGroupOwnedProjects();
    // bestPractices.value = projects.map(p => ({ id: p.id, data: p.data() }));
});

// function getLastModified(bestPractice: any) {
//     return '' + (new Date(bestPractice.data.lastModified?.seconds * 1000)).toLocaleDateString('default')
// }
</script>

<template>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
        <h1 class="mt-12 font-semibold text-4xl text-gray-800 dark:text-white mb-8">Initiatives</h1>

        <p class=" dark:text-white">Restoration projects, programs and initiatives at all spatial scales, from individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for sustaining life on Earth. The FERM registry allows you to consistently and transparently monitor, report, and share information on restoration initiatives and best practices. The information published in the FERM Registry will be used to officially report on hectares under restoration during the United Nations Decade on Ecosystem Restoration and for the Convention on Biological Diversity Post-2020 Global Biodiversity Framework Target 2.</p>

        <router-link
                :to="{ name: 'initiative', params: { id: 'new' }}"
                class="mt-6 cursor-pointer inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Add new initiative</router-link>

            <div class="mt-8 overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="project in projectStore.projects" :key="project.id">
                    <div class="sm:flex sm:flex-row">
                        <div class="px-4 py-4 sm:px-6 sm:grow">
                            <router-link :to="{ name: 'initiative-info', params: { id: project.id }}" href="#" class="block hover:bg-gray-50">
                            <div class="flex items-center justify-between">
                            <p class="truncate text-sm font-medium" :class="[project.data.project.title ? 'text-indigo-600' : 'italic text-gray-400']">{{ project.data.project.title || 'No title' }}</p>
                            <!-- <div class="ml-2 flex flex-shrink-0">
                            <p class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">{{ position.type }}</p>
                            </div> -->
                            </div>
                            <div class="mt-2 sm:flex sm:justify-between">
                                <div class="sm:flex">
                                        <p class="flex items-center text-sm text-gray-500">
                                        <Cog6ToothIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        Draft
                                        </p>
                                        <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                        <DocumentCheckIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        {{Math.ceil(Math.random() * 4)}} good practices
                                        </p>
                                </div>
                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    <p>
                                    Last updated on
                                    {{ ' ' }}
                                    <time :datetime="fbTimestampToString(project.data['update-time'])">{{ fbTimestampToString(project.data['update-time']) }}</time>
                                    </p>
                                </div>
                            </div>
                        </router-link>
                        </div>
                        <div class="self-center pr-4">
                            <Menu as="div" class="relative inline-block text-left">
                                <div>
                                    <MenuButton
                                        class="flex items-center rounded-full bg-gray-100_ text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                        <span class="sr-only">Open options</span>
                                        <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                                    </MenuButton>
                                </div>

                                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div class="py-1">
                                    <MenuItem v-slot="{ active }">
                                        <router-link
                                        :to="{ name: 'initiative-info', params: { id: project.id }}"
                                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm cursor-default']">Edit</router-link>
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm cursor-default']">Delete</div>
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <div :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm cursor-default']">Submit</div>
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <router-link
                                            :to="{ name: 'bestPractice', params: { id: 'new' }, query: { projectId: project.id }}"
                                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm cursor-default']">Add best practice
                                        </router-link>
                                    </MenuItem>
                                    <!-- <form method="POST" action="#">
                                        <MenuItem v-slot="{ active }">
                                        <button type="submit" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block w-full px-4 py-2 text-left text-sm']">Sign out</button>
                                        </MenuItem>
                                    </form> -->
                                    </div>
                                </MenuItems>
                                </transition>
                            </Menu>
                        </div>
                        <!-- <div class="self-center pr-4">
                            <EllipsisVerticalIcon class="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        </div> -->
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>
</template>

