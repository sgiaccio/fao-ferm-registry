  
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';

import { getMyNewGroupRequests, approveNewGroupRequest, rejectNewGroupRequest } from '@/firebase/functions';

import TabTemplate from '../TabTemplate.vue'


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
</script>
  
<template>
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
                                            <span class="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 bg-white">
                                    <tr v-for="item in newGroupRequests"
                                        :key="item.userName">
                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ item.userName }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.name }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.status }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.createTime }}</td>
                                        <!--  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.email }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.role }}</td> -->
                                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <template v-if="item.status === 'pending'">
                                                <button type="button"
                                                        @click="() => approveRequest(item.id)"
                                                        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 w-28 mr-4">Accept</button>
                                                <button type="button"
                                                        @click="() => rejectRequest(item.id)"
                                                        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 w-28">Reject</button>
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
