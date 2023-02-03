<script setup lang="ts">
import { onMounted } from 'vue'

import RegistrationView from '../../views/project/RegistrationView.vue';
import AoiView from '../../views/project/AoiView.vue';
import CharacteristicsView from '../../views/project/characteristics/CharacteristicsView.vue';
import ActivitiesView from '../../views/project/ActivitiesView.vue';
import EcosystemsView from '../../views/project/EcosystemsView.vue';
import IndicatorsView from '../../views/project/IndicatorsView.vue';
import ResultsView from '../../views/project/ResultsView.vue';

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
