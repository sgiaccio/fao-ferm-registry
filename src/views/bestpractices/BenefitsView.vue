<script setup lang="ts">
import { useBestPracticesStore } from '../../stores/bestpractices';

import TabTemplate from "../TabTemplate.vue"

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
    <TabTemplate title="Benefits and validation">
        <template #default>
            <template v-if="store.bestPractice">
                <MultiSelectFormGroup :options="positiveOutcomes"
                                      v-model="store.bestPractice.outcomes"
                                      label="4.1 Positive impacts"
                                      description="Please select the main ecological and/or cultural and/or socio-economic positive impacts of implementing the practice."
                                      :required="true"
                                      :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.positiveImpacts"
                                   label="4.2 Positive impacts additional information"
                                   description="Please describe and provide metrics about the positive ecological and/or cultural and/or socio-economic impacts of the practice (e.g., area of cultural/sacred land protected, number of beneficiaries, aboveground biomass stock per hectare, abundance of indicator species, % accessing financial services, etc.)."
                                   :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.negativeImpacts"
                                   label="4.3 Negative impacts"
                                   :required="true"
                                   description="Does the practice have any negative ecological and/or cultural and/or socio-economic impact(s)? If so, please describe."
                                   :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.validation"
                                   label="4.4 Validation"
                                   :required="true"
                                   description="Please describe how the practice was evaluated (e.g., meta-analysis, expert review, cost-efficiency analysis) from a technical and methodological point of view to demonstrate that it has achieved its measurable objectives, how the impacts of the practice have been validated with the beneficiaries, and how the lessons learned have been integrated."
                                   :edit=edit />
            </template>
        </template>
    </TabTemplate>
</template>
