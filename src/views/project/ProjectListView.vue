<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { fbTimestampToString } from '../../lib/util'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
    CalendarIcon,
    Cog6ToothIcon,
    EllipsisVerticalIcon,
    ChevronDownIcon,
    PencilSquareIcon,
    EyeIcon
} from '@heroicons/vue/20/solid'

import { useAuthStore } from '../../stores/auth';
import { useProjectStore } from '../../stores/project';
import { useBestPracticesStore } from '../../stores/bestpractices';

const projectStore = useProjectStore();
const authStore = useAuthStore();
const bestPracticesStore = useBestPracticesStore();


const groups = ref();
onMounted(async () => {
    await projectStore.fetchGroupOwnedProjects(null);
    groups.value = authStore.isAdmin ? await authStore.getAllGroups() : authStore.userGroups;
    // bestPractices.value = projects.map(p => ({ id: p.id, data: p.data() }));
});

// function getLastModified(bestPractice: any) {
//     return '' + (new Date(bestPractice.data.lastModified?.seconds * 1000)).toLocaleDateString('default')
// }

const bestPractices = ref([]);
async function showBestPractices(projectId: string) {
    bestPractices.value = await bestPracticesStore.fetchProjectBestPractices(projectId);
    // console.log(bestPractices.value)
}

function canEdit(project) {
    if (authStore.isAdmin) return true;

    const level = authStore.privileges[project.data.group];
    if (level === 'admin') return true;
    if (level === 'editor' && project.data.created_by === authStore.user.uid) return true

    return false;
}

function getAccessLevel(group: string): string {
    if (authStore.isAdmin) return 'admin';
    return authStore.privileges[group];
}

function canAddBestPractice(project) {
    if (authStore.isAdmin) return true;
    const level = authStore.privileges[project.data.group];
    return ['admin', 'editor'].includes(level);
}

async function deleteProject(projectId: string) {
    if (confirm('Are you sure you want to delete this initiative? You will releted the related areas and best practices'))
        return projectStore.deleteProject(projectId)
}


// const filterGroup = ref<string | null>(null);
async function filterByGroup(groupId: string | null) {
    await projectStore.fetchGroupOwnedProjects(groupId);
}


</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="mt-12 font-semibold text-4xl text-gray-800 dark:text-white mb-8">Initiatives</h1>

            <p class=" dark:text-white">Restoration projects, programs and initiatives at all spatial scales, from
                individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for
                sustaining life on Earth. The FERM registry allows you to consistently and transparently monitor, report, and share
                information on restoration initiatives good practices. The information published in the FERM
                Registry will be used to officially report on hectares under restoration during the United Nations Decade on Ecosystem
                Restoration and for the Convention on Biological Diversity Post-2020 Global Biodiversity Framework Target 2.</p>
            <div class="flex mt-6">
                <Menu as="div" class="relative inline-block text-left">
                    <div>
                        <MenuButton class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                            Filter by group
                            <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                        </MenuButton>
                    </div>


                    <transition
                        v-if="groups"
                        enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <MenuItems class="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                    <span
                                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-12 py-2 text-sm', 'cursor-default']"
                                        @click="() => filterByGroup(null)" 
                                        href="#" >
                                        All
                                    </span>
                                </MenuItem>
                                <MenuItem v-for="[id, name] in Object.entries(groups)" v-slot="{ active }">
                                    <span
                                        @click="() => filterByGroup(id)" 
                                        href="#" 
                                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm', 'cursor-default']">
                                        <PencilSquareIcon v-if="['admin', 'editor'].includes(getAccessLevel(id))" class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                        <!-- <EyeIcon v-else class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" /> -->
                                        {{ name }}
                                    </span>
                                </MenuItem>
                                <!-- <MenuItem v-slot="{ active }">
                                <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                    <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                    Edit
                                </a>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                    <DocumentDuplicateIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                    Duplicate
                                </a>
                                </MenuItem> -->
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
                <Menu as="div" class="ml-auto relative inline-block text-left">
                    <div>
                        <MenuButton class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                            Add new initiative
                            <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                        </MenuButton>
                    </div>

                    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div class="px-4 py-3">
                                <p class="text-sm font-medium text-gray-900">Your organizations:</p>
                            </div>
                            <div class="py-1">
                                <MenuItem v-for="[id, name] in Object.entries(authStore.userGroups)" v-slot="{ active }">
                                <router-link :to="{ name: 'initiative-info', params: { id: 'new' }, query: { groupId: id } }" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">
                                    {{ name }}
                                </router-link>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>




            <!-- <router-link
                :to="{ name: 'initiative', params: { id: 'new' }}"
                class="mt-6 cursor-pointer inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Add new initiative</router-link> -->

            <div class="mt-8 overflow-hidden_ bg-white shadow sm:rounded-md">
                <ul role="list" class="divide-y divide-gray-200">
                    <li v-for="project in projectStore.projects" :key="project.id">
                        <div class="sm:flex sm:flex-row">
                            <div class="px-4 py-4 sm:px-6 sm:grow">
                                <span class="block hover:bg-gray-50_">
                                    <div class="flex items-center justify-between">
                                        <router-link :to="{ name: 'initiative-info', params: { id: project.id } }" :class="[project.data.project?.title ? 'text-indigo-600' : 'italic text-gray-400', 'truncate_ text-sm font-medium hover:text-indigo-500']">{{
                                            project.data.project?.title
                                                || 'No title'
                                        }}</router-link>
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
                                            <Menu v-if="project.nBestPractices" as="p" class="relative inline-block text-left">
                                                <div class="sm:mt-0 sm:ml-6 text-sm">
                                                    <MenuButton @click="showBestPractices(project.id)" class="flex items-center rounded-full  text-gray-500 hover:text-gray-600 focus:outline-none">
                                                        <span class="text-gray-600">{{ project.nBestPractices }} good
                                                            practices</span>
                                                        <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                                    </MenuButton>
                                                </div>
                                                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                                    <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <div v-if="bestPractices.length" class="py-1">
                                                            <MenuItem v-slot="{ active }" v-for="bp in bestPractices">
                                                            <router-link :to="`/good-practices/${bp.id}/objectives`" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">{{
                                                                bp.data.title
                                                                    || "No title"
                                                            }}</router-link>
                                                            </MenuItem>
                                                        </div>
                                                        <div class="py-1">
                                                            <MenuItem v-slot="{ active }">
                                                            <router-link :to="{ name: 'objectives', params: { id: 'new' }, query: { projectId: project.id } }" href="#" :class="[active ? 'bg-gray-100 text-blue-900' : 'text-blue-700', 'block px-4 py-2 text-sm font-bold']">Add
                                                                new good practice</router-link>
                                                            </MenuItem>
                                                        </div>
                                                    </MenuItems>
                                                </transition>
                                            </Menu>
                                            <div v-else class="sm:ml-6">
                                                <router-link :to="{ name: 'objectives', params: { id: 'new' }, query: { projectId: project.id } }" type="button" class="inline-flex items-center rounded border border-transparent py-1.5 text-xs font-medium text-indigo-700">Add
                                                    good practice</router-link>
                                            </div>
                                        </div>

                                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                            <p>
                                                Last updated on
                                                {{ ' ' }}
                                                <time :datetime="fbTimestampToString(project.data['updateTime'])">{{
                                                    fbTimestampToString(project.data['updateTime'])
                                                }}</time>
                                            </p>
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div class="self-center pr-4">
                                <Menu as="div" class="relative inline-block text-left">
                                    <div>
                                        <MenuButton class="flex items-center rounded-full bg-gray-100_ text-gray-400 hover:text-gray-600 focus:outline-none">
                                            <span class="sr-only">Open options</span>
                                            <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                                        </MenuButton>
                                    </div>

                                    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                        <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div class="py-1">
                                                <MenuItem v-slot="{ active }">
                                                <router-link :to="{ name: 'initiative-info', params: { id: project.id } }" :class="[canEdit(project) ? (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') : 'text-gray-300', 'block px-4 py-2 text-sm cursor-default']">
                                                    Edit</router-link>
                                                </MenuItem>
                                                <MenuItem v-slot="{ active }">
                                                <div @click="deleteProject(project.id)" :class="[canEdit(project) ? (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') : 'text-gray-300', 'block px-4 py-2 text-sm cursor-default']">
                                                    Delete</div>
                                                </MenuItem>
                                                <!-- <MenuItem v-slot="{ active }">
                                        <div
                                            :class="[canEdit(project) ? (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') : 'text-gray-300', 'block px-4 py-2 text-sm cursor-default']">Submit</div>
                                    </MenuItem> -->
                                                <MenuItem v-slot="{ active }">
                                                <router-link :to="{ name: 'objectives', params: { id: 'new' }, query: { projectId: project.id } }" :class="[canAddBestPractice(project) ? (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') : 'text-gray-300', 'block px-4 py-2 text-sm cursor-default']">
                                                    Add good practice
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

