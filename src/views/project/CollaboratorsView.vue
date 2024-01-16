<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';

import { CheckIcon, ChevronUpDownIcon, TrashIcon } from '@heroicons/vue/20/solid';

import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption
} from '@headlessui/vue';

import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';

import { saveProjectCollaborators, getGroupEditors } from '@/firebase/functions';
import router from '@/router';


const store = useProjectStore();
const authStore = useAuthStore();
const route = useRoute();

interface User {
    uid: string;
    displayName: string;
    email: string;
}

const collaborators = ref<User[]>([]);
const availableUsers = ref<User[] | null>();


onBeforeMount(async () => {
    await store.fetchProject(route.params.id as string);
    const users: any = await getGroupEditors(store.project.group);

    const collaboratorsIds = store.project.collaborators || [];

    const allUsers = users.users.map((u: any) => ({
        uid: u.uid,
        displayName: u.displayName,
        email: u.email
    }));

    availableUsers.value = allUsers.filter((user: any) => {
        return !collaboratorsIds.includes(user.uid) && user.uid !== authStore.user?.uid && user.uid !== store.project.created_by;
    });

    collaborators.value = allUsers.filter((user: any) => {
        return collaboratorsIds.includes(user.uid);
    });
});

onBeforeRouteLeave((_to, _from) => {
    store.resetProjectState();
});

const query = ref('');
const filteredUsers = computed(() => {
    if (!availableUsers.value) {
        return [];
    }
    return query.value === ''
        ? availableUsers.value
        : availableUsers.value.filter(user => user.displayName.toLowerCase().includes(query.value.toLowerCase()));
});

function addCollaborator(user: User) {
    if (user) {
        collaborators.value = [...collaborators.value, user].sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
        availableUsers.value = availableUsers.value.filter((u: any) => u.uid !== user.uid).sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
    }
}

function removeCollaborator(user: any) {
    collaborators.value = collaborators.value.filter((u: any) => u.uid !== user.uid).sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
    availableUsers.value = [...availableUsers.value, user].sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
}

const saving = ref(false);
async function save() {
    if (!saving.value) {
        saving.value = true;
        try {
            await saveProjectCollaborators(store.id, collaborators.value.map((u: any) => u.uid));
            alert('saved');
        } catch (e) {
            alert('Error saving collaborators');
            console.error(e);
        } finally {
            saving.value = false;
            router.push({ name: "initiatives" });
        }
    }
}
</script>

<template>
    <!-- <pre>{{ JSON.stringify(collaborators || [], null, 2) }}</pre>
    <pre>{{ JSON.stringify(availableUsers || [], null, 2) }}</pre> -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-1">
        <div class="max-w-3xl mx-auto">

            <!--            <h1 class="bg-ferm-blue-light-200 text-black py-3 md:py-5 rounded-md text-center text-3xl uppercase font-bold">Collaborators</h1>-->

            <div class="max-w-lg m-auto border rounded-lg mt-6 px-6 py-6">
                <h1 class="block text-xl mb-6 font-bold leading-6 text-gray-800">Collaborators of the
                    <span class="italic">{{ store.project?.project?.title }}</span> project</h1>
                <ul role="list"
                    class="divide-y divide-gray-100">
                    <li v-for="user in collaborators"
                        :key="user.uid"
                        class="flex items-center justify-between gap-x-6 pb-5">
                        <div class="flex min-w-0 gap-x-4">
                            <div class="min-w-0 flex-auto">
                                <p class="text-sm font-semibold leading-6 text-gray-900">{{ user.displayName }}</p>
                            </div>
                        </div>
                        <button @click="removeCollaborator(user)">
                            <TrashIcon
                                class="h-5 w-5 text-red-600 hover:text-red-500"
                                aria-hidden="true"
                                aria-label="Delete" />
                        </button>
                    </li>
                </ul>

                <Listbox v-if="availableUsers?.length > 0"
                         as="div"
                         @update:modelValue="value => addCollaborator(value)">
                    <div class="relative mt-2">
                        <ListboxButton
                            class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <span class="block truncate">Add a collaborator</span>
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon class="h-5 w-5 text-gray-400"
                                                   aria-hidden="true" />
                            </span>
                        </ListboxButton>

                        <transition leave-active-class="transition ease-in duration-100"
                                    leave-from-class="opacity-100"
                                    leave-to-class="opacity-0">
                            <ListboxOptions
                                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <ListboxOption as="template"
                                               v-for="user in filteredUsers"
                                               :key="user.uid"
                                               :value="user"
                                               v-slot="{ active, selected }">
                                    <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                                        <span
                                            :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ user.displayName
                                            }}</span>

                                        <span v-if="selected"
                                              :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                                            <CheckIcon class="h-5 w-5"
                                                       aria-hidden="true" />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
                <div class="text-gray-600 text-sm italic" v-else-if="availableUsers">
                    No more editors are available in your organization
                </div>
                <div v-else class="text-gray-600 text-md">Loading editors list...</div>
                <div class="flex pt-6 justify-end">
                    <button @click="() => router.push({ name: 'initiatives' })"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Cancel
                    </button>

                    <button
                        :class="['mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto']"
                        @click="save">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>