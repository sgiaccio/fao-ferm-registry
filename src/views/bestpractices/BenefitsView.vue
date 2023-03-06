<script setup lang="ts">
import { useBestPracticesStore } from '../../stores/bestpractices';

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";

import { positiveOutcomes } from "../../components/project/menus";


// type Benefits = {
//     positiveOutcomes?: number[],
//     negativeOutcomes?: string,
//     validation?: string,
// }

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useBestPracticesStore();
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300 font-roboto-slab">Benefits and validation</h1>
        
        <div v-if="store.bestPractice" class="divide-y divide-stone-300 dark:divide-stone-900">
            <MultiSelectFormGroup
                :options="positiveOutcomes"
                v-model="store.bestPractice.outcomes"
                label="4.1 Positive impacts"
                description="Please select the main ecological and/or cultural and/or socio-economic positive impacts of implementing the practice."
                :required="true"
                :edit=edit />
            <TextareaFormGroup
                v-model="store.bestPractice.positiveImpacts"
                label="4.2 Positive impacts additional information"
                description="Please describe and provide metrics about the positive ecological and/or cultural and/or socio-economic impacts of the practice (e.g., area of cultural/sacred land protected, number of beneficiaries, aboveground biomass stock per hectare, abundance of indicator species, % accessing financial services, etc.)."
                :edit=edit />
            <TextareaFormGroup
                v-model="store.bestPractice.negativeImpacts"
                label="4.3 Negative impacts"
                :required="true"
                description="Does the practice have any negative ecological and/or cultural and/or socio-economic impact(s)? If so, please describe."
                :edit=edit />
            <TextareaFormGroup
                v-model="store.bestPractice.validation"
                label="4.4 Validation"
                :required="true"
                description="Please describe how the practice was evaluated (e.g., meta-analysis, expert review, cost-efficiency analysis) from a technical and methodological point of view to measure its effectiveness, and how the impacts of the practice have been validated with the beneficiaries, and how the lessons learned have been integrated."
                :edit=edit />
        </div>
    </div>
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
</template>
