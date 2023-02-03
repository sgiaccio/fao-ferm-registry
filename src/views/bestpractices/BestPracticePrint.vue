<script setup lang="ts">
import { onMounted } from 'vue'

import ObjectivesView from '../../views/bestpractices/ObjectivesView.vue';
import MethodologyView from '../../views/bestpractices/MethodologyView.vue';
import KeyFactorsView from '../../views/bestpractices/KeyFactorsView.vue';
import BenefitsView from '../../views/bestpractices/BenefitsView.vue';
import AdditionalResourcesView from '../../views/bestpractices/AdditionalResourcesView.vue';

onMounted(async () => {
    window.print();
});
</script>

<template>
    <ObjectivesView :edit="false" />
    <MethodologyView :edit="false" />
    <KeyFactorsView :edit="false" />
    <BenefitsView :edit="false" />
    <AdditionalResourcesView :edit="false" />
</template>
