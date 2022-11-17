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

const store = useBestPracticesStore();
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Benefits and validation</h1>
        
        <div class="divide-y divide-stone-300 dark:divide-stone-900">
            <MultiSelectFormGroup
                :options="positiveOutcomes"
                v-model="store.bestPractice.outcomes"
                label="4.1 Outcomes"
                description="Please select the ecological and/or cultural and/or socio-economic outcomes of implementing the practice."
                :required="true" />
            <TextareaFormGroup
                v-model="store.bestPractice.positiveImpacts"
                label="4.2 Positive impacts"
                description="Please describe the positive ecological and/or cultural and/or socio-economic impacts of the practice." />
            <TextareaFormGroup
                v-model="store.bestPractice.negativeImpacts"
                label="4.3 Negative impacts"
                :required="true"
                description="Does the practice have any negative ecological and/or cultural and/or socio-economic impact(s)? If so, please describe." />
            <TextareaFormGroup
                v-model="store.bestPractice.validation"
                label="4.4 Validation"
                :required="true"
                description="Please describe how the practice was validated from a technical and methodological point of view to measure its effectiveness, and how the practice was validated with the beneficiaries" />
        </div>
    </div>
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
</template>
