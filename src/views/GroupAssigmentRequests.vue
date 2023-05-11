<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';

import { fetchAllGroups, getUserAssignmentRequests } from '@/firebase/firestore';

import { useAuthStore } from '@/stores/auth';


const props = defineProps<{
    onRequest: (groupId: string) => void
}>();

const authStore = useAuthStore();

const allGroups = reactive<{ [key: string]: string }>({});

const assignmentRequests = ref<{ pending?: string[], approved?: string[], denied?: string[] }>({
    pending: [],
    approved: [],
    denied: []
});

async function refreshAssignments() {
    const requests = await getUserAssignmentRequests(authStore.user!.uid);
    assignmentRequests.value = {
        pending: requests.filter(r => r.status === 'pending').map(r => r.group),
        approved: requests.filter(r => r.status === 'approved').map(r => r.group),
        denied: requests.filter(r => r.status === 'denied').map(r => r.group)
    }

    console.log(assignmentRequests.value);
}

onMounted(async () => {
    refreshAssignments();
    Object.assign(allGroups, await fetchAllGroups());
});

function getRequestStatus(groupId: string) {
    if (assignmentRequests.value.approved?.includes(groupId)) return 'approved';
    if (assignmentRequests.value.denied?.includes(groupId)) return 'denied';
    if (assignmentRequests.value.pending?.includes(groupId)) return 'pending';
    return null;
}

async function requestAssignment(groupId: string) {
    // if (confirm(`Are you sure you want to request assignment to ${allGroups[groupId]}? Once submitted, the administrators will be notified, and they will review your request. You will be notified of their decision. Click 'Confirm' to proceed or 'Cancel' to change your selection.`)) {
    //     console.log(authStore.user!.uid);
    //     await requestGroupAssignment(authStore.user!.uid, groupId);
    // }

    props.onRequest(groupId);
}
</script>

<template>
    <div class="divide-y w-full sm:max-w-md mx-auto _max-h-72 overflow-y-auto_ border rounded-lg shadow-md mt-6">
        <div class="overflow-y-auto">
            <div class="mt-6 flow-root max-h-60">
                <ul role="list"
                    class="-my-5 divide-y divide-gray-200">
                    <li v-for="[groupId, groupName] in Object.entries(allGroups).sort((a, b) => a[1].localeCompare(b[1]))"
                        :key="groupId"
                        class="py-4 px-4">
                        <div class="flex items-center space-x-4">
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-medium text-gray-900">{{ groupName }}</p>
                                <!-- <p class="truncate text-sm text-gray-500">{{ '@' + groupName }}</p> -->
                            </div>
                            <div>
                                <span @click="getRequestStatus(groupId) || requestAssignment(groupId)"
                                      :class="[!getRequestStatus(groupId) ? 'cursor-pointer bg-blue-100 hover:bg-blue-200 cursor=pointer ring-gray-400' : 'cursor-default ring-gray-300',
                                          'inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset']">
                                    <span v-if="getRequestStatus(groupId) === 'approved'">
                                        Approved
                                    </span>
                                    <span v-else-if="getRequestStatus(groupId) === 'denied'">
                                        Denied
                                    </span>
                                    <span v-else-if="getRequestStatus(groupId) === 'pending'">
                                        Pending
                                    </span>
                                    <span v-else>
                                        Join
                                    </span>
                                </span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <!-- <div class="mt-6">
                <a href="#"
                    class="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0">View all</a>
            </div> -->
    </div>
</template>