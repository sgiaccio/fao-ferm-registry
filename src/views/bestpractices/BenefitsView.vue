<script setup lang="ts">
import { ref } from 'vue'

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";

import * as menus from "../../components/project/menus";


type Benefits = {
    positiveOutcomes?: number[],
    negativeOutcomes?: string,
    validation?: string,
}

const data = ref<Benefits> ({});
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Benefits and validation</h1>
        
        <div class="divide-y divide-stone-900">
            <MultiSelectFormGroup
                :options="menus.positiveOutcomes"
                v-model="data.positiveOutcomes"
                label="Positive outcomes"
                description="Please select the positive environmental and/or socio-economic outcomes of implementing the practice."
                :required="true" />
            <TextareaFormGroup
                v-model="data.negativeOutcomes"
                label="Negative outcomes"
                :required="true"
                description="Does the practice have any negative natural and socio-economic impacts impact(s)? If so, please describe." />
            <TextareaFormGroup
                v-model="data.validation"
                label="Validation"
                :required="true"
                description="Please provide links to pictures, positive testimonials from the field, websites, and social media pages (Facebook, YouTube, Instagram etc.) related to the implementation and impacts of the good practice." />
        </div>
    </div>
    <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre>
</template>
