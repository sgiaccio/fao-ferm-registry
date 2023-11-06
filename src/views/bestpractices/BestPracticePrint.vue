<script setup lang="ts">
import { onBeforeMount, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router';

import ObjectivesView from '../../views/bestpractices/ObjectivesView.vue';
import MethodologyView from '../../views/bestpractices/MethodologyView.vue';
import KeyFactorsView from '../../views/bestpractices/KeyFactorsView.vue';
import BenefitsView from '../../views/bestpractices/BenefitsView.vue';
import AdditionalResourcesView from '../../views/bestpractices/AdditionalResourcesView.vue';

import { useBestPracticesStore } from '../../stores/bestpractices';


const store = useBestPracticesStore();
const route = useRoute();

const { bestPractice } = storeToRefs(store);

onBeforeMount(async () => {
    await store.fetch(route.params.id as string);
});

watch(bestPractice, bp => {
    if (bp) {
        nextTick(window.print);
    }
});

// const thumbnailReady = ref(false);

// watch([bestPractice, thumbnailReady], ([bp, tr]) => {
//     console.log(bp, tr);
//     if (bp && tr) {
//         // Use nextTick to wait for the DOM to be updated
//         nextTick(() => {
//             window.print();
//         });
//     }
// });

// function thumbnailLoaded() {
//     thumbnailReady.value = true;
// }
</script>

<template>
    <ObjectivesView :edit="false" />
    <MethodologyView :edit="false" />
    <KeyFactorsView :edit="false" />
    <BenefitsView :edit="false" />
    <AdditionalResourcesView :edit="false"/>
</template>
