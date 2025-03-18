<script setup lang="ts">
// import type { User } from 'firebase/auth';
// import { getFunctions, httpsCallable } from "firebase/functions";

import { ref, onMounted } from 'vue';

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'

import { db } from '@/firebase';
import { getAllUsers } from '@/firebase/functions';

import TabTemplate from '../TabTemplate.vue'

import { useAuthStore } from '@/stores/auth';
import { collection, doc, setDoc } from 'firebase/firestore/lite';
import { fetchAllGroups } from '@/firebase/firestore';
import { t } from '@/lib/i18n';


const authStore = useAuthStore();
const allGroups = ref();
const showGroup = ref<{ id: string, users: any[] } | null>(null)
const showDialog = ref(false)
const name = ref('');

onMounted(async () => {
    await fetchGroups()
});

// Returns all users in the given group
async function edit(groupId: string) {
    const users = ((await getAllUsers()) as any).users;
    const groupUsers = users.filter((u: any) => {
        const privileges = u.customClaims?.privileges;
        return privileges && privileges[groupId];
    });
    showGroup.value = { id: groupId, users: groupUsers };
}

async function fetchGroups() {
    allGroups.value = authStore.isAdmin ? await fetchAllGroups() : authStore.userGroups;
}

// Adds a new group to the database
// TODO: Move to a separate file
async function addGroup() {
    if (name.value.length < 3) {
        alert('Group name must be at least 3 characters long');
        return;
    }

    // TODO check if group already exists

    // Add the group to the database
    const groupsCollection = collection(db, 'groups');
    const newGroup = doc(groupsCollection);
    await setDoc(newGroup, {
        name: name.value
    });

    alert('Group added successfully');
    showDialog.value = false;
    await fetchGroups();
}
</script>

<template>
    <TabTemplate title="Groups">
        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div>
                        <button type="button"
                                @click="showDialog = true"
                                class="rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-6">Add institution</button>
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
                                <tr v-for="[id, group] in Object.entries(allGroups).sort((a, b) => a[1].name.localeCompare(b[1].name))"
                                :key="id">
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:pl-6">
                                    <div class="text-gray-900">{{ group.name }}</div>
                                    </td>

                                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button @click="edit(id)"
                                            class="text-indigo-600 hover:text-indigo-900">Show<span class="sr-only">, {{ group.name }}</span></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    </TabTemplate>


    <!-- Add group dialog -->
    <TransitionRoot as="template"
                    :show="showDialog">
        <Dialog as="div"
                class="relative z-10"
                @close="showDialog = false">
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
                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3"
                                                 class="text-lg font-medium leading-6 text-gray-900">Add Institution</DialogTitle>
                                </div>
                                <div>
                                    <label for="group"
                                           class="sr-only">Name</label>
                                    <input id="group"
                                           name="group"
                                           type="text"
                                           required
                                           class="appearance-none rounded-lg relative block w-full px-6 py-3 border-2 border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-lg"
                                           placeholder="Full name"
                                           v-model="name">
                                </div> 
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button"
                                        class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:indigo-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="addGroup()">Save</button>
                                <button type="button"
                                        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="showDialog = false"
                                        ref="cancelButtonRef">{{ t('edit.cancel') }}</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>

    <!-- Group view dialog -->
    <TransitionRoot as="template"
                    :show="!!showGroup">
        <Dialog as="div"
                class="relative z-10"
                @close="showGroup = null">
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
                            <div v-if="showGroup"
                                 class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3"
                                                 class="text-lg font-medium leading-6 text-gray-900">{{ allGroups[showGroup.id].name }}</DialogTitle>
                                </div>

                                <div>Description: {{allGroups[showGroup.id].description || 'No description available'}}</div>

                                <!-- empty state -->
                                <div class="mt-2"
                                     v-if="!showGroup.users.length">
                                    This group has no users
                                </div>

                                <template v-else>
                                    <div class="mt-2">
                                        <p class="text-base text-gray-700">
                                            Users in this group:
                                        </p>
                                    </div>
                                    <table>
                                        <tr v-for="user in showGroup.users">
                                            <td>
                                                {{ user.displayName}}
                                            </td>
                                            <td>
                                                {{ user.email }}
                                            </td>
                                            <td>
                                                {{  user.customClaims.privileges[showGroup.id] }}
                                            </td>
                                        </tr>
                                    </table>
                                </template>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button"
                                        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="showGroup = null"
                                        ref="cancelButtonRef">Close</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
