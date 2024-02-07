<script setup lang="ts">
import { onBeforeMount, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, onBeforeRouteLeave } from 'vue-router'

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

// This is a hack to reset the project state when the user navigates away from the project view
onBeforeRouteLeave((_to, _from) => {
    store.resetProjectState();
});

watch(loaded, l => {
    if (l) {
        // Use nextTick to wait for the DOM to be updated
        nextTick(async () => {
            window.print();
            // Wait 1 second before closing the window - it seems that Safari needs this otherwise it closes the window before the print dialog is shown
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.close();
        });
    }
});
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <template v-if="store.loaded">
                <RegistrationView :edit="false" />
                <AoiView :edit="false" />
                <CharacteristicsView :edit="false" />
                <ActivitiesView :edit="false" />
                <EcosystemsView :edit="false" />
                <IndicatorsView :edit="false" />
                <ResultsView :edit="false" />
            </template>
        </div>
    </div>
</template>
