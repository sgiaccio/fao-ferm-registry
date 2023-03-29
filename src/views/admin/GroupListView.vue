<script setup lang="ts">
import type { User } from 'firebase/auth';
import { getFunctions, httpsCallable } from "firebase/functions";

import { ref, onMounted } from 'vue';

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'

import { fetchAllUsers } from '../../firebase';

import TabTemplate from '../TabTemplate.vue'

import { useAuthStore } from '../../stores/auth';


const authStore = useAuthStore();

const users = ref();
const allGroups = ref();

async function refreshUsers() {
    users.value = ((await fetchAllUsers()) as any).users;
}

onMounted(async () => {
    refreshUsers();
    allGroups.value = authStore.isAdmin ? await authStore.fetchAllGroups() : authStore.userGroups;
});

const editGroup = ref<{ id: string, users: any[] } | null>(null)

const availableGroups = ref();

// Refreshes the list of available groups by removing the groups already assigned to the user
function refreshAvailableGroups() {
    const user = editGroup.value;
    const t = { ...allGroups.value }
    const assignedGroups = Object.keys(user.privileges);
    assignedGroups.forEach(k => { delete t[k] });
    availableGroups.value = t;
}

// Returns all users in the given group
async function edit(groupId: string) {
    const users = ((await fetchAllUsers()) as any).users;
    const groupUsers = users.filter((u: any) => {
        const privileges = u.customClaims?.privileges;
        return privileges && privileges[groupId];
    });
    editGroup.value = { id: groupId, users: groupUsers };
}


const selectedGroup = ref()
const selectedLevel = ref()

// Add the user to the selected group with the selected level
function addGroup() {
    alert('Not implemented yet');
}

// Remove the user from the selected group and refresh the list of available groups
function deleteGroup(groupId: string) {
    delete editUser.value.privileges[groupId];
    refreshAvailableGroups();
}

function save() {
    const functions = getFunctions(); // TODO get functions from firebase module
    const addMessage = httpsCallable(functions, 'setUserPrivileges');
    addMessage({
        admin: editUser.value.admin,
        email: editUser.value.email,
        privileges: editUser.value.privileges
    }).then(_result => {
        alert("User privileges saved");
    }).catch(e => {
        alert('Error saving user privileges: ' + e.message);
        console.log(e);
    }).finally(() => editUser.value = null);
}

function deleteUser() {
    alert('Not implemented yet');
    editUser.value = null;
}

</script>

<template>
    <TabTemplate title="Groups">
        <!-- <pre>{{ JSON.stringify(allGroups, null, 2) }}</pre> -->

        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div>
                        <button type="button"
                                @click="addGroup()"
                                class="rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-6">Add group</button>
                    </div>

                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <!-- Empty state -->
                        <div v-if="!allGroups">
                            Loading...
                        </div>
                        <table v-else
                               class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                    <th scope="col"
                                        class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span class="sr-only">Show</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody v-if="allGroups"
                                   class="divide-y divide-gray-200 bg-white">
                                <tr v-for="[id, name] in Object.entries(allGroups).sort((a, b) => a[1].localeCompare(b[1]))"
                                    :key="id">
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:pl-6">
                                        <div class="text-gray-900">{{ name }}</div>
                                    </td>

                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button @click="edit(id)"
                                                class="text-indigo-600 hover:text-indigo-900">Show<span class="sr-only">, {{ name }}</span></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </TabTemplate>


    <!-- Group view dialog -->
    <TransitionRoot as="template"
                    :show="!!editGroup">
        <Dialog as="div"
                class="relative z-10"
                @close="editGroup = null">
            <TransitionChild as="template"
                             enter="ease-out duration-300"
                             enter-from="opacity-0"
                             enter-to="opacity-100"
                             leave="ease-in duration-200"
                             leave-from="opacity-100"
                             leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template"
                                     enter="ease-out duration-300"
                                     enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                     enter-to="opacity-100 translate-y-0 sm:scale-100"
                                     leave="ease-in duration-200"
                                     leave-from="opacity-100 translate-y-0 sm:scale-100"
                                     leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div v-if="editGroup"
                                 class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3"
                                                 class="text-lg font-medium leading-6 text-gray-900">{{ allGroups[editGroup.id] }}</DialogTitle>
                                </div>
                                <!-- empty state -->
                                <div class="mt-2"
                                     v-if="!editGroup.users.length">
                                    This group has no users - id = {{ editGroup.id }}
                                </div>

                                <template v-else>
                                    <div class="mt-2">
                                        <p class="text-base text-gray-700">
                                            Users in this group:
                                        </p>
                                    </div>
                                    <ul>
                                        <li v-for="user in editGroup.users">
                                            {{ user.displayName || user.email }}
                                        </li>
                                    </ul>
                                </template>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button"
                                        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="editGroup = null"
                                        ref="cancelButtonRef">Close</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
