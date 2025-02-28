<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';
import ActionsMenu from '@/views/project/ActionsMenu.vue';


defineProps<{
    previous: () => void,
    next: () => void,
    first: boolean,
    last: boolean
}>();

const { t } = useI18n();

const store = useProjectStore();

const route = useRoute();

onBeforeMount(async () => {
    await store.fetchProject(route.params.id as string);
});
</script>

<template>
    <div class="w-full pb-8 flex gap-x-6">
        <div class="shrink">
            <button
                @click="previous"
                :disabled="first"
                type="button"
                :class="[first ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-md py-2 px-3.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']"
            >
                <ArrowLeftIcon
                    class="-ml-1.5 h-5 w-5"
                    aria-hidden="true"
                />
                {{ t('view.previous') }}
            </button>
        </div>
        <div class="shrink">
            <button
                @click="next"
                :disabled="last"
                type="button"
                :class="[last ? 'bg-gray-300 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white', 'inline-flex items-center gap-x-1.5 rounded-md py-2 px-3.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-indigo-500']"
            >
                {{ t('view.next') }}
                <ArrowRightIcon
                    class="-mr-1.5 h-5 w-5"
                    aria-hidden="true"
                />
            </button>
        </div>
        <div class="grow relative flex flex-row">
            <div class="grow" />
            <ActionsMenu
                :project="{ id: store.id, data: store.project }"
                :exclude-view-menu-item="true"
                :label="t('actionsMenu.button')"
            />
        </div>
    </div>

    <router-view
        v-if="store.loaded"
        :edit="false"
    />
</template>
