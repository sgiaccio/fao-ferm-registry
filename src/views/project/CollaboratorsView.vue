<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

import {
    // Combobox,
    // ComboboxButton,
    // ComboboxInput,
    // ComboboxLabel,
    // ComboboxOption,
    // ComboboxOptions,
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue'

// import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
// import { ChevronDownIcon } from '@heroicons/vue/20/solid'

import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';

import { getAdminGroupsUsers, getAllUsers, getGroupEditors } from '@/firebase/functions';


const store = useProjectStore();
const authStore = useAuthStore();
const route = useRoute();

interface User {
    uid: string;
    displayName: string;
    email: string;
}

const collaborators = ref<User[]>([]);
const availableUsers = ref<User[]>([]);


onBeforeMount(async () => {
    await store.fetchProject(route.params.id as string);
    const users: any = await getGroupEditors(store.project.group);

    const collaboratorsIds = store.project.collaborators || [];

    const allUsers = users.users.map((u: any) => ({
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
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

const query = ref('')
const filteredUsers = computed(() => {
    if (!availableUsers.value) {
        return [];
    }
    return query.value === ''
        ? availableUsers.value
        : availableUsers.value.filter(user => user.displayName.toLowerCase().includes(query.value.toLowerCase()))
})

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
</script>

<template>
    <!-- <pre>{{ JSON.stringify(collaborators || [], null, 2) }}</pre>
    <pre>{{ JSON.stringify(availableUsers || [], null, 2) }}</pre> -->
    <div>
        Collaborators
    </div>

    <div class="max-w-lg m-auto">
        <ul role="list"
            class="divide-y divide-gray-100">
            <li v-for="user in collaborators"
                :key="user.uid"
                class="flex items-center justify-between gap-x-6 py-5">
                <div class="flex min-w-0 gap-x-4">
                    <!-- <img class="h-12 w-12 flex-none rounded-full bg-gray-50"
                         :src="person.imageUrl"
                         alt="" /> -->
                    <div class="min-w-0 flex-auto">
                        <p class="text-sm font-semibold leading-6 text-gray-900">{{ user.displayName }}</p>
                        <!-- <p class="mt-1 truncate text-xs leading-5 text-gray-500">{{ person.email }}</p> -->
                    </div>
                </div>
                <button @click="removeCollaborator(user)"
                        class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Remove</button>
            </li>
        </ul>


        <!-- <Combobox v-if="availableUsers.length > 0"
                  as="div"
                  @update:modelValue="value => addCollaborator(value)">
            <ComboboxLabel class="block text-sm font-medium leading-6 text-gray-900">Add collaborator</ComboboxLabel>
            <div class="relative mt-2">
                <ComboboxInput class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                               @change="query = $event.target.value" />
                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400"
                                       aria-hidden="true" />
                </ComboboxButton>

                <ComboboxOptions v-if="filteredUsers.length > 0"
                                 class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <ComboboxOption v-for="user in filteredUsers"
                                    :key="user.uid"
                                    :value="user"
                                    as="template"
                                    v-slot="{ active, selected }">
                        <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                            <span :class="['block truncate', selected && 'font-semibold']">
                                {{ user.displayName }}
                            </span>

                            <span v-if="selected"
                                  :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
                                <CheckIcon class="h-5 w-5"
                                           aria-hidden="true" />
                            </span>
                        </li>
                    </ComboboxOption>
                </ComboboxOptions>
            </div>
        </Combobox> -->


        <Listbox v-if="availableUsers.length > 0"
                 as="div"
                 @update:modelValue="value => addCollaborator(value)">
            <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900">Add collaborator</ListboxLabel>
            <div class="relative mt-2">
                <ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <span class="block truncate">Collaborators</span>
                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400"
                                           aria-hidden="true" />
                    </span>
                </ListboxButton>

                <transition leave-active-class="transition ease-in duration-100"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0">
                    <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <ListboxOption as="template"
                        v-for="user in filteredUsers"
                                       :key="user.uid"
                                       :value="user"
                                       v-slot="{ active, selected }">
                            <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ user.displayName }}</span>

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


        <Listbox v-if="availableUsers.length > 0"
                 @update:modelValue="value => addCollaborator(value)">
            <ListboxButton>Add collaborator</ListboxButton>
            <ListboxOptions>
                <ListboxOption v-for="user in filteredUsers"
                               :key="user.uid"
                               :value="user">
                    {{ user.displayName }}
                </ListboxOption>
            </ListboxOptions>
        </Listbox>

        <!-- <Menu v-if="availableUsers.length > 0"
              as="div"
              class="relative inline-block text-left">
            <div>
                <MenuButton class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Add collaborator
                    <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400"
                                     aria-hidden="true" />
                </MenuButton>
            </div>

            <transition enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95"
                        enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95">
                <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="py-1">
                        <MenuItem v-slot="{ active }"
                                  v-for="user in filteredUsers"
                                  :key="user.uid"
                                  @click="addCollaborator(user)">
                        <span :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm cursor-pointer']">{{ user.displayName }}</span>
                        </MenuItem>
                    </div>
                </MenuItems>
            </transition>
        </Menu> -->
        <div v-else>
            No more users available in your organization.
        </div>
    </div>
</template>