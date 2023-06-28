<script setup lang="ts">
import { onMounted, ref } from "vue";

import { fbTimestampToString } from "@/lib/util";

import {
    DocumentMagnifyingGlassIcon
} from "@heroicons/vue/20/solid";

import { useAuthStore } from "@/stores/auth";
import { useProjectStore } from "@/stores/project";


import ActionsMenu from "@/views/project/ActionsMenu.vue";

import { fetchSubmittedProjects, fetchAllSubmittedProjects } from "@/firebase/firestore";


const projectStore = useProjectStore();
const authStore = useAuthStore();

// const userGroups = ref();

const submittedProjects = ref();

async function fetchProjects() {
    if (authStore.isAdmin) {
        submittedProjects.value = await fetchAllSubmittedProjects();
    } else {
        const groupIds = Object.keys(authStore.userGroups);
        submittedProjects.value = await fetchSubmittedProjects(groupIds);
    }
}

onMounted(async () => {
    await fetchProjects();
});
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <h1 class="mt-12 font-akrobat text-4xl text-gray-800 dark:text-white mb-8 font-extrabold uppercase">
                Submitted Initiatives</h1>

            <template v-if="submittedProjects">
                <div class="mt-8 overflow-hidden_ bg-white shadow sm:rounded-md">
                    <ul role="list"
                        class="divide-y divide-gray-200">
                        <li v-for="project in submittedProjects"
                            :key="project.id">
                            <div class="flex flex-row">
                                <div class="px-4 py-4 sm:px-6 grow overflow-hidden">
                                    <div class="flex items-center justify-between">
                                        <label :title="project.data.project?.title || 'No title'"
                                               class="truncate">
                                            <router-link :to="{ name: 'projectInfo', params: { id: project.id } }"
                                                         :class="[project.data.project?.title ? 'text-indigo-600' : 'italic text-gray-400', 'text-sm font-medium hover:text-indigo-500 project-link']">
                                                {{ project.data.project?.title || "No title" }}
                                            </router-link>
                                        </label>
                                    </div>
                                    <div class="mt-2 sm:flex sm:justify-between">
                                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <DocumentMagnifyingGlassIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                         aria-hidden="true" />
                                            <p>
                                                Submitted on
                                                {{ " " }}
                                                <time :datetime="fbTimestampToString(project.data['submittedTime'])">
                                                    {{ fbTimestampToString(project.data["submittedTime"]) }}
                                                </time>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="self-center pr-4">
                                    <ActionsMenu :project="project"
                                                 :sections="['publishing']"
                                                 @done="fetchProjects"
                                                 label="Publish/Reject" />
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
    </div>
</template>

