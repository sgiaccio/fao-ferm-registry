<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

import ConfirmModal from '@/views/ConfirmModal.vue';
import { fetchAllGroupNames } from '@/firebase/firestore';


defineProps<{
    show: boolean;
}>();

const emit = defineEmits(['cancel', 'confirm']);

const authStore = useAuthStore();

// const groups = authStore.privileges;
const groups = ref({});

onMounted(async () => {
    const allGroups = await fetchAllGroupNames();
    const t = authStore.isAdmin ? allGroups : Object.keys(authStore.privileges).reduce((acc, key) => ({...acc, [key]: allGroups[key]}), {})
    groups.value = Object.entries(t).sort((a, b) => a[1].localeCompare(b[1]));
});

const formData = reactive<{
    title: string;
    reportingLine: ReportingLine | null;
    group: string;
}>({
    title: '',
    reportingLine: null,
    group: '',
});

function onConfirm() {
    emit('confirm', formData);
    formData.title = '';
    formData.group = '';
    formData.reportingLine = null;
}

function onCancel() {
    emit('cancel');
    formData.title = '';
    formData.group = '';
    formData.reportingLine = null;
}

const confirmButtonEnabled = computed(() => {
    return formData.title.length > 0 && formData.group.length > 0 && formData.reportingLine.length > 0;
});
</script>

<template>
    <ConfirmModal :open="show"
                  title="Create a new initiative"
                  @confirm="onConfirm"
                  @cancel="onCancel"
                  :ok-button-enabled="confirmButtonEnabled"
                  ok-button-text="Create">
        <div class="mt-3 max-w-xl text-sm text-gray-500">
            <p>Please provide the name and the reporting line for your new initiative.</p>
        </div>
        <form class="sm:flex sm:items-center text-left">
            <div class="w-full sm:max-w-xs">
                <div class="mt-6">
                    <label for="title"
                           class="block text-sm font-medium leading-6 text-gray-900">Name of the initiative</label>
                    <div class="mt-2">
                        <input type="text"
                               v-model="formData.title"
                               name="title"
                               id="title"
                               class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                </div>
                <div class="mt-6 mb-2">
                    <label for="reporting_line"
                           class="block text-sm font-medium leading-6 text-gray-900">Reporting line</label>
                    <select id="reporting_line"
                            v-model="formData.reportingLine"
                            name="reporting_line"
                            class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <option>FERM</option>
                        <option>GEF</option>
                    </select>
                </div>
                <div class="mt-6 mb-2">
                    <label for="groups"
                           class="block text-sm font-medium leading-6 text-gray-900">Institution</label>
                    <select id="groups"
                            v-model="formData.group"
                            name="groups"
                            class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <option v-for="group in groups"
                                :value="group[0]"
                                :key="group[0]">{{ group[1] }}</option>
                    </select>
                </div>
            </div>
        </form>
    </ConfirmModal>
</template>
