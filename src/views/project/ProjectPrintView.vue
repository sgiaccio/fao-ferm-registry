<script setup lang="ts">
import { onBeforeMount, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import RegistrationView from './RegistrationView.vue';
import AoiView from './AoiView.vue';
import CharacteristicsView from './characteristics/CharacteristicsView.vue';
import ActivitiesView from './ActivitiesView.vue';
import EcosystemsView from './EcosystemsView.vue';
import IndicatorsView from './IndicatorsView.vue';
import ResultsView from './ResultsView.vue';


import { useProjectStore } from '@/stores/project';


const store = useProjectStore();
const route = useRoute();

const { loaded } = storeToRefs(store);

onBeforeMount(async () => {
    store.fetchProject(route.params.id as string);
});

watch(loaded, l => {
    if (l) {
        // Use nextTick to wait for the DOM to be updated
        nextTick(() => {
            window.print();
        });
    }
});
</script>

<template>
    <template v-if="store.loaded">
        <RegistrationView :edit="false" />
        <AoiView :edit="false" />
        <CharacteristicsView :edit="false" />
        <ActivitiesView :edit="false" />
        <EcosystemsView :edit="false" />
        <IndicatorsView :edit="false" />
        <ResultsView :edit="false" />
    </template>
</template>
