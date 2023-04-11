<script setup lang="ts">
import { onBeforeMount, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router';

import { useBestPracticesStore } from '../../stores/bestpractices';

import ObjectivesView from '../../views/bestpractices/ObjectivesView.vue';
import MethodologyView from '../../views/bestpractices/MethodologyView.vue';
import KeyFactorsView from '../../views/bestpractices/KeyFactorsView.vue';
import BenefitsView from '../../views/bestpractices/BenefitsView.vue';
import AdditionalResourcesView from '../../views/bestpractices/AdditionalResourcesView.vue';


const store = useBestPracticesStore();
const route = useRoute();

const { bestPractice } = storeToRefs(store);

onBeforeMount(async () => {
    store.fetch(route.params.id as string);
});

watch(bestPractice, bestPractice => {
    if (bestPractice) {
        // Use nextTick to wait for the DOM to be updated
        nextTick(() => {
            window.print();
        });
    }
});
</script>

<template>
    <ObjectivesView :edit="false" />
    <MethodologyView :edit="false" />
    <KeyFactorsView :edit="false" />
    <BenefitsView :edit="false" />
    <AdditionalResourcesView :edit="false" />
</template>
