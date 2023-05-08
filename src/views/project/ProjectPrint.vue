<script setup lang="ts">
import { onMounted } from 'vue'

import RegistrationView from './RegistrationView.vue';
import AoiView from './AoiView.vue';
import CharacteristicsView from './characteristics/CharacteristicsView.vue';
import ActivitiesView from './ActivitiesView.vue';
import EcosystemsView from './EcosystemsView.vue';
import IndicatorsView from './IndicatorsView.vue';
import ResultsView from './ResultsView.vue';

onMounted(async () => {
    window.print();
});
</script>

<template>
    <RegistrationView :edit="false" />
    <AoiView :edit="false" />
    <CharacteristicsView :edit="false" />
    <ActivitiesView :edit="false" />
    <EcosystemsView :edit="false" />
    <IndicatorsView :edit="false" />
    <ResultsView :edit="false" />
</template>
