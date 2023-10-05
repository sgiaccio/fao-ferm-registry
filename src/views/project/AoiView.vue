<script setup lang="ts">
import StdAoiView from './StdAoiView.vue';
import GefAoiView from './GefAoiView.vue';

import { useProjectStore } from '@/stores/project';

const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});
</script>

<template>
    <div>
        <GefAoiView v-if="store.project.reportingLine === 'GEF'"
                    :edit="edit" />
        <StdAoiView v-else
                    :edit="edit" />
    </div>
</template>