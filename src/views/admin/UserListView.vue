<script setup lang="ts">
import type { User } from 'firebase/auth';
import { httpsCallable } from "firebase/functions";

import { useI18n } from 'vue-i18n';

import { ref, onMounted, watch } from 'vue';

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    Switch,
    SwitchGroup,
    SwitchLabel,
} from '@headlessui/vue'

import { functions } from '@/firebase';
import { getAllUsers, getAdminGroupsUsers } from '@/firebase/functions';

import TabTemplate from '../TabTemplate.vue'

import { useAuthStore } from '@/stores/auth';
import { fetchAllGroupNames } from '@/firebase/firestore';

const { t } = useI18n();
const authStore = useAuthStore();

const users = ref();
const allGroups = ref();

async function refreshUsers() {
    const f = authStore.isAdmin ? getAllUsers : getAdminGroupsUsers;
    // Sort users by creation date
    users.value = ((await f()) as any).users.sort((a: User, b: User) => {
        try {
            const d1 = new Date(a.metadata.creationTime);
            const d2 = new Date(b.metadata.creationTime);

            return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
        } catch (e) {
            return 0;
        }
    });
}

onMounted(async () => {
    try {
        await refreshUsers();
        const groups = await fetchAllGroupNames();

        if (authStore.isAdmin) {
            allGroups.value = groups;
        } else {
            // Get from groups the ones where I am group admin
            const groupsWhereAdmin = Object.keys(authStore.privileges).filter(k => authStore.privileges[k] === 'admin');
            allGroups.value = Object.fromEntries(Object.entries(groups).filter(([gid]) => groupsWhereAdmin.includes(gid)));
        }
    } catch (e) {
        console.error(e);
        alert("Error getting users and groups");
    }
});


function hasNoGroup(user: User) {
    const privileges = user.customClaims?.privileges;
    return !privileges || !Object.keys(privileges).length;
}


const userToEdit = ref<any | null>(null)

const availableGroups = ref();

// Refreshes the list of available groups by removing the groups already assigned to the user
function refreshAvailableGroups(user) {
    const t = { ...allGroups.value }
    const assignedGroups = Object.keys(user.privileges);
    assignedGroups.forEach(k => { delete t[k] });
    availableGroups.value = t;
}

async function edit(user: User) {
    // TODO: Get user's customClaims from FireBase

    // console.log(JSON.stringify(user, null, 2));

    const isAdmin = authStore.isAdmin;
    let privileges = { ...user.customClaims?.privileges || {} };
    if (!isAdmin) {
        // If the user is not an admin, we need to remove all the groups where the user is not an admin
        const groupsWhereAdmin = Object.keys(authStore.privileges).filter(k => authStore.privileges[k] === 'admin');
        privileges = Object.fromEntries(Object.entries(privileges).filter(([gid]) => groupsWhereAdmin.includes(gid)));
    }

    userToEdit.value = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        admin: !!user.customClaims?.admin,
        privileges
    }

    refreshAvailableGroups(userToEdit.value);

    showEditDialog.value = true;
}

const groupToAdd = ref();
const levelToAdd = ref();


// Add the user to the selected group with the selected level
function addGroup(user) {
    if (groupToAdd.value && levelToAdd.value) {
        user.privileges[groupToAdd.value] = levelToAdd.value;
        refreshAvailableGroups(user);
    }
    groupToAdd.value = null;
    levelToAdd.value = null;
}

// Remove the user from the selected group and refresh the list of available groups
function deleteGroup(user, groupId: string) {
    delete user.privileges[groupId];
    refreshAvailableGroups(user);
}

const showEditDialog = ref(false);
function onAfterLeave() {
    userToEdit.value = null;
}

const isSaving = ref(false);

// TODO: move this function
async function save() {
    isSaving.value = true;
    if (authStore.isAdmin) {
        const addMessage = httpsCallable(functions, 'setUserPrivileges');
        return addMessage({
            admin: userToEdit.value.admin,
            email: userToEdit.value.email,
            privileges: userToEdit.value.privileges
        }).then(_result => {
            alert("User privileges saved");
            refreshUsers();
        }).catch(e => {
            alert('Error saving user privileges: ' + e.message);
            console.error(e);
        }).finally(() => {
            showEditDialog.value = false;
            isSaving.value = false;
        });
    } else {
        const addMessage = httpsCallable(functions, 'setUserPrivilegesGroupAdmin');
        addMessage({
            uid: userToEdit.value.uid,
            privileges: userToEdit.value.privileges
        }).then(_result => {
            alert("User privileges saved");
        }).catch(e => {
            alert('Error saving user privileges: ' + e.message);
            console.error(e);
        }).finally(() => {
            showEditDialog.value = false;
            isSaving.value = false;
        });
    }
}

function createUser() {
    isSaving.value = true;
    const addMessage = httpsCallable(functions, 'createUser');
    addMessage({
        email: userToAdd.value.email,
        displayName: userToAdd.value.displayName,
        privileges: userToAdd.value.privileges,
        admin: userToAdd.value.admin
    }).then(_result => {
        alert("User created");
        refreshUsers();
    }).catch(e => {
        alert('Error creating user: ' + e.message);
        console.error(e);
    }).finally(() => {
        userToAdd.value = null
        isSaving.value = false;
    });
}

function deleteUser() {
    alert('Not implemented yet');
    showEditDialog.value = false;
}

// const registrationData = ref();
// async function toggleRegistrationData(userId: string) {
//     const userPrefs = await userPrefsStore.getRegistrationData(userId)
//     // alert(JSON.stringify(userPrefs, null, 2));
//     registrationData.value = userPrefs;
// }

const userToAdd = ref<any | null>(null);
function addUser() {
    userToAdd.value = {
        email: '',
        displayName: '',
        privileges: {},
        admin: false
    }
    refreshAvailableGroups(userToAdd.value);
}

// If an user is trying to unassign himself the superdmin privileges, we need to ask for confirmation
watch(() => userToEdit.value?.admin, (curr, prev) => {
    if (typeof prev !== 'undefined' && curr === false) {
        if (userToEdit.value.uid === authStore.user!.uid) {
            if (!confirm('You will lose your superadmin privileges. Are you sure?')) {
                userToEdit.value.admin = true;
            }
        }
    }
});

function cancelCreate() {
    userToAdd.value = null;
    groupToAdd.value = null;
    levelToAdd.value = null;
}

function cancelEdit() {
    userToEdit.value = null;
    groupToAdd.value = null;
    levelToAdd.value = null;
    showEditDialog.value = false;
}
</script>

<template>
    <TabTemplate title="Users">
        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div
                        v-if="authStore.isAdmin"
                        class="pb-6"
                    >
                        <button
                            @click="addUser"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded "
                        >Add user</button>
                    </div>
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <div v-if="!users">
                            Loading...
                        </div>
                        <table
                            v-else
                            class="min-w-full divide-y divide-gray-300"
                        >
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >Name</th>
                                    <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >Last sign in</th>
                                    <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >Created</th>
                                    <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >Status</th>
                                    <th
                                        scope="col"
                                        class="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                    >
                                        <span class="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr
                                    v-for="user in users"
                                    :key="user.uid"
                                    :class="[hasNoGroup(user) ? 'bg-red-100' : '']"
                                >
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                        <div class="flex items-center">
                                            <div class="h-10 w-10 flex-shrink-0">
                                                <img
                                                    v-if="user.photoUrl"
                                                    class="h-10 w-10 rounded-full"
                                                    :src="user.photoUrl"
                                                    alt=""
                                                />
                                                <span
                                                    v-else
                                                    class="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-600"
                                                >
                                                    <svg
                                                        class="h-full w-full text-gray-300"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </span>

                                            </div>
                                            <div class="ml-4">
                                                <div :class="[user.displayName ? 'text-gray-900' : 'text-gray-600', 'font-medium']">{{ user.displayName || user.email }}</div>
                                                <div
                                                    v-if="user.displayName"
                                                    class="text-gray-500"
                                                >{{ user.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div class="text-gray-900">{{ user.metadata.lastSignInTime?.substring(0, 16) || '-' }}</div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div class="text-gray-900">{{ user.metadata.creationTime.substring(0, 16) }}</div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span
                                            v-if="!user.disabled"
                                            class="inline-flex rounded-full bg-green-300 px-2 text-xs font-semibold leading-5 text-green-900"
                                        >Enabled</span>
                                        <span
                                            v-else
                                            class="inline-flex rounded-full bg-red-300 px-2 text-xs font-semibold leading-5 text-green-900"
                                        >Disabled</span>
                                    </td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button
                                            @click="() => edit(user)"
                                            class="text-indigo-600 hover:text-indigo-900"
                                        >Edit<span class="sr-only">, {{ user.displayName }}</span></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </TabTemplate>

    <!-- User edit dialog -->
    <TransitionRoot
        as="template"
        :show="showEditDialog"
        @after-leave="onAfterLeave"
    >
        <Dialog
            as="div"
            class="relative z-10"
            @close=""
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div
                                v-if="userToEdit"
                                class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
                            >
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle
                                        as="h3"
                                        class="text-lg font-medium leading-6 text-gray-900"
                                    >Edit user {{ userToEdit.displayName || userToEdit.email }}</DialogTitle>
                                    <div
                                        v-if="authStore.isAdmin"
                                        class="mt-2"
                                    >
                                        <!-- <button @click="toggleRegistrationData(userToEdit.uid)">Show registration data</button> -->
                                        <SwitchGroup
                                            as="div"
                                            class="mt-4 flex items-center"
                                        >
                                            <Switch
                                                v-model="userToEdit.admin"
                                                :class="[userToEdit.admin ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2']"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    :class="[userToEdit.admin ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']"
                                                />
                                            </Switch>
                                            <SwitchLabel
                                                as="span"
                                                class="ml-3"
                                            >
                                                <span class="cursor-pointer text-sm font-medium text-gray-900">Administrator</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>

                                    <div
                                        class="mt-4 text-lg font-semibold"
                                        v-if="!Object.keys(userToEdit.privileges || []).length"
                                    >
                                        No institution assigned
                                    </div>
                                    <div class="mt-2">
                                        <div class="px-6 lg:px-8">
                                            <div class="mt-4 flow-root">
                                                <div class="-my-2 -mx-6 overflow-x-auto lg:-mx-8">
                                                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                                        <table class="min-w-full divide-y divide-gray-300">
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        scope="col"
                                                                        class="whitespace-nowrap py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                                                    >Institution</th>
                                                                    <th
                                                                        scope="col"
                                                                        class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                                    >Level</th>
                                                                    <th
                                                                        scope="col"
                                                                        class="relative whitespace-nowrap py-3.5 pl-3 pr-6 sm:pr-0"
                                                                    >
                                                                        <span class="sr-only">Edit</span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody class="divide-y divide-gray-200 bg-white">
                                                                <tr
                                                                    v-for="(level, group) in userToEdit.privileges || []"
                                                                    :key="group"
                                                                >
                                                                    <td class="whitespace-nowrap py-2 pl-6 pr-3 text-sm text-gray-500 sm:pl-0">{{ allGroups[group] }}</td>
                                                                    <td class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                                                                        <select
                                                                            v-model="userToEdit.privileges[group]"
                                                                            id="level"
                                                                            name="level"
                                                                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                                        >
                                                                            <option value="guest">Guest</option>
                                                                            <option value="editor">Editor</option>
                                                                            <option value="admin">Admin</option>
                                                                        </select>
                                                                    </td>
                                                                    <td class="relative whitespace-nowrap py-2 pl-3 pr-6 text-right text-sm font-medium sm:pr-0">
                                                                        <span
                                                                            @click="() => deleteGroup(userToEdit, group)"
                                                                            class="cursor-pointer text-indigo-600 hover:text-indigo-900"
                                                                        >Delete<span class="sr-only">, {{ allGroups[group] }}</span></span>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-6 py-3 px-4 bg-gray-100 border border-1 border-gray-300 rounded-lg">
                                    <h1 class="text-lg font-semibold">Assign to institution</h1>
                                    <div class="mt-3">
                                        <label
                                            for="group"
                                            class="block text-sm font-medium text-gray-700"
                                        >Institution</label>
                                        <select
                                            v-model="groupToAdd"
                                            id="group"
                                            name="group"
                                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option
                                                v-for="[group, name] in Object.entries(availableGroups).sort((a, b) => a[1].localeCompare(b[1]))"
                                                :value="group"
                                            >{{ name }}</option>
                                        </select>
                                    </div>
                                    <div class="mt-3">
                                        <label
                                            for="level"
                                            class="block text-sm font-medium text-gray-700"
                                        >Level</label>
                                        <select
                                            v-model="levelToAdd"
                                            id="level"
                                            name="level"
                                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="guest">Guest</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button
                                        @click="() => addGroup(userToEdit)"
                                        type="button"
                                        class="mt-6 inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >Add</button>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    :class="[isSaving ? 'bg-gray-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:indigo-600 focus:ring-offset-2', 'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:w-auto sm:text-sm sm:ml-3']"
                                    @click="save"
                                    :disabled="isSaving"
                                >Save</button>
                                <button
                                    type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    @click="cancelEdit"
                                >{{ t('edit.cancel') }}</button>
                                <!-- <button type="button"
                                        class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="deleteUser">Delete user</button> -->
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>

    <!-- User add dialog -->
    <TransitionRoot
        as="template"
        :show="!!userToAdd"
    >
        <Dialog
            as="div"
            class="relative z-10"
            @close=""
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <!-- <pre>{{ JSON.stringify(userToAdd, null, 2) }}</pre> -->
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div
                                v-if="userToAdd"
                                class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
                            >
                                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                                    <DialogTitle
                                        as="h3"
                                        class="text-lg font-medium leading-6 text-gray-900"
                                    >Edit user {{ userToAdd.displayName || userToAdd.email }}</DialogTitle>
                                    <div class="mt-2">
                                        <SwitchGroup
                                            as="div"
                                            class="mt-4 flex items-center"
                                        >
                                            <Switch
                                                v-model="userToAdd.admin"
                                                :class="[userToAdd.admin ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2']"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    :class="[userToAdd.admin ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']"
                                                />
                                            </Switch>
                                            <SwitchLabel
                                                as="span"
                                                class="ml-3"
                                            >
                                                <span class="cursor-pointer text-sm font-medium text-gray-900">Administrator</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>

                                    <div class="mt-6">
                                        <label
                                            for="name"
                                            class="block text-sm font-medium leading-6 text-gray-900"
                                        >Full name</label>
                                        <div class="mt-2">
                                            <input
                                                type="text"
                                                v-model="userToAdd.displayName"
                                                name="name"
                                                id="name"
                                                autocomplete="name"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                placeholder="Your name"
                                            />
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <label
                                            for="email"
                                            class="block text-sm font-medium leading-6 text-gray-900"
                                        >Email</label>
                                        <div class="mt-2">
                                            <input
                                                type="email"
                                                v-model="userToAdd.email"
                                                name="email"
                                                id="email"
                                                autocomplete="email"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>



                                    <div
                                        class="mt-6 text-lg font-semibold"
                                        v-if="!Object.keys(userToAdd.privileges || []).length"
                                    >
                                        No institution assigned
                                    </div>
                                    <div class="mt-2">
                                        <div class="px-6 lg:px-8">
                                            <div class="mt-4 flow-root">
                                                <div class="-my-2 -mx-6 overflow-x-auto lg:-mx-8">
                                                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                                        <table class="min-w-full divide-y divide-gray-300">
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        scope="col"
                                                                        class="whitespace-nowrap py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                                                    >Institution</th>
                                                                    <th
                                                                        scope="col"
                                                                        class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                                    >Level</th>
                                                                    <th
                                                                        scope="col"
                                                                        class="relative whitespace-nowrap py-3.5 pl-3 pr-6 sm:pr-0"
                                                                    >
                                                                        <span class="sr-only">Edit</span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody class="divide-y divide-gray-200 bg-white">
                                                                <tr
                                                                    v-for="(level, group) in userToAdd.privileges || {}"
                                                                    :key="group"
                                                                >
                                                                    <td class="whitespace-nowrap py-2 pl-6 pr-3 text-sm text-gray-500 sm:pl-0">{{ allGroups[group] }}</td>
                                                                    <td class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                                                                        <select
                                                                            v-model="userToAdd.privileges[group]"
                                                                            id="level"
                                                                            name="level"
                                                                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                                        >
                                                                            <option value="guest">Guest</option>
                                                                            <option value="editor">Editor</option>
                                                                            <option value="admin">Admin</option>
                                                                        </select>
                                                                    </td>
                                                                    <td class="relative whitespace-nowrap py-2 pl-3 pr-6 text-right text-sm font-medium sm:pr-0">
                                                                        <span
                                                                            @click="() => deleteGroup(userToAdd, group)"
                                                                            class="cursor-pointer text-indigo-600 hover:text-indigo-900"
                                                                        >Delete<span class="sr-only">, {{ allGroups[group] }}</span></span>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-6 py-3 px-4 bg-gray-100 border border-1 border-gray-300 rounded-lg">
                                    <h1 class="text-lg font-semibold">Assign to institution</h1>
                                    <div class="mt-3">
                                        <label
                                            for="group"
                                            class="block text-sm font-medium text-gray-700"
                                        >Institution</label>
                                        <select
                                            v-model="groupToAdd"
                                            id="group"
                                            name="group"
                                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option
                                                v-for="[group, name] in Object.entries(availableGroups)"
                                                :value="group"
                                            >{{ name }}</option>
                                        </select>
                                    </div>
                                    <div class="mt-3">
                                        <label
                                            for="level"
                                            class="block text-sm font-medium text-gray-700"
                                        >Level</label>
                                        <select
                                            v-model="levelToAdd"
                                            id="level"
                                            name="level"
                                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="guest">Guest</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button
                                        @click="() => addGroup(userToAdd)"
                                        type="button"
                                        class="mt-6 inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >Add</button>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    :class="[isSaving ? 'bg-gray-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:indigo-600 focus:ring-offset-2', 'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:w-auto sm:text-sm sm:ml-3']"
                                    @click="createUser"
                                    :disabled="isSaving"
                                >Save</button>
                                <button
                                    type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    @click="cancelCreate"
                                >Cancel</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
