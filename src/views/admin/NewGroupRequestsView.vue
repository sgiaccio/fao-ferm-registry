  
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { getMyNewGroupRequests, approveNewGroupRequest, rejectNewGroupRequest } from '@/firebase/functions';

import TabTemplate from '../TabTemplate.vue'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
    EyeIcon,
    CheckCircleIcon,
    TrashIcon,
    ChevronDownIcon,
} from '@heroicons/vue/20/solid'

import AlertModal from "@/views/AlertModal.vue";


let newGroupRequests = ref<any>([]);

function refresh() {
    getMyNewGroupRequests().then((requests) => {
        newGroupRequests.value = requests;
    });
}

onMounted(refresh);

function approveRequest(requestId: string) {
    approveNewGroupRequest(requestId).then(() => {
        alert('Assignment approved. A notification email has been sent to the user.');
        refresh();
    }).catch((err) => {
        alert(err.message);
    });
}

function rejectRequest(requestId: string) {
    rejectNewGroupRequest(requestId).then(() => {
        alert('Assignment rejected. A notification email has been sent to the user.');
        refresh();
    }).catch((err) => {
        alert(err.message);
    });;
}

const viewRequest = ref(null);
function view(request: any) {
    viewRequest.value = request;
}
function close() {
    viewRequest.value = null;
}
// transform the isa value to a list of strings. isa is of the form { "actor": true, "partner": false, "flagship": false }
const isa = computed(() => {
    if (viewRequest.value) {
        const isa = viewRequest.value.isa;
        const isaList = [];
        if (isa.actor) {
            isaList.push('UN Decade actor');
        }
        if (isa.partner) {
            isaList.push('UN Decade partner');
        }
        if (isa.flagship) {
            isaList.push('Global Flagship');
        }
        return isaList.join(', ');
    }
    return '';
});
</script>
  
<template>
    <AlertModal type="info"
                :onClose="close"
                :open="!!viewRequest"
                title="Request for new institution"
                buttonText="Close">
        <div v-if="!!viewRequest"
             class="text-start">
            <div class="px-4 sm:px-0">
                <h3 class="text-base font-semibold leading-7 text-gray-900">{{ viewRequest.name }}</h3>
                <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{{ isa }}</p>
            </div>
            <div class="mt-6 border-t border-gray-100">
                <dl class="divide-y divide-gray-100">
                    <div class="px-3 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Type</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ viewRequest.type === 'Other' ? viewRequest.otherType : viewRequest.type }}</dd>
                    </div>
                    <div class="px-3 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Description</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ viewRequest.description }}</dd>
                    </div>
                    <div class="px-3 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Website</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ viewRequest.website }}</dd>
                    </div>
                </dl>
            </div>
        </div>

    </AlertModal>
    <tab-template title="New institution requests">
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="mt-8 flow-root">
                <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                                        <th scope="col"
                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Institution</th>
                                        <th scope="col"
                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col"
                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Requested on</th>
                                        <th scope="col"
                                            class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span class="sr-only">Action</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 bg-white">
                                    <tr v-for="item in newGroupRequests"
                                        :key="item.userName"
                                        :class="item.status === 'pending' ? 'bg-red-50' : ''">
                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ item.userName }}</td>
                                        <td class="px-3 py-4 text-sm text-gray-500">{{ item.name }}</td>
                                        <td :class="[item.status === 'approved' ? 'text-green-300' : item.status === 'rejected' ? 'text-red-300' : 'text-gray-700', 'whitespace-nowrap px-3 py-4 text-sm font-bold']">{{ item.status }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.createTime }}</td>
                                        <!--  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.email }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.role }}</td> -->
                                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-6">
                                            <template v-if="item.status === 'pending'">
                                                <Menu as="div"
                                                      class="relative inline-block text-left">
                                                    <div>
                                                        <MenuButton class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                            Actions
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
                                                        <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                            <div class="py-1">
                                                                <MenuItem v-slot="{ active }">
                                                                <span @click="() => view(item)"
                                                                      :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
                                                                    <EyeIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                                             aria-hidden="true" />
                                                                    View
                                                                </span>
                                                                </MenuItem>
                                                            </div>
                                                            <div class="py-1">
                                                                <MenuItem v-slot="{ active }">
                                                                <span @click="() => approveRequest(item.id)"
                                                                      :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
                                                                    <CheckCircleIcon class="mr-3 h-5 w-5 text-green-500 group-hover:text-green-600"
                                                                                     aria-hidden="true" />
                                                                    Approve
                                                                </span>
                                                                </MenuItem>
                                                                <MenuItem v-slot="{ active }">
                                                                <span @click="() => rejectRequest(item.id)"
                                                                      :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
                                                                    <TrashIcon class="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600"
                                                                               aria-hidden="true" />
                                                                    Reject
                                                                </span>
                                                                </MenuItem>
                                                            </div>
                                                        </MenuItems>
                                                    </transition>
                                                </Menu>
                                                <!-- <button type="button"
                                                        @click="() => approveRequest(item.id)"
                                                        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 w-28 mr-4">Accept</button>
                                                <button type="button"
                                                        @click="() => rejectRequest(item.id)"
                                                        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 w-28">Reject</button> -->
                                            </template>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </tab-template>
</template>
