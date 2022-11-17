<script setup lang="ts">
import { useBestPracticesStore } from '../../stores/bestpractices';

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import MultiInputFormGroup from "../../components/inputs/MultiInputFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";
import Constraint from "../../components/inputs/Constraint.vue"

import { keyFactors } from "../../components/project/menus";


type KeyFactors = {
    keyFactors?: number[],
    specifyKeyFactors?: string,
    constraints?: {
        constraint?: string,
        addressing?: string,
    }[],
    lessonsLearned?: string,
}

const store = useBestPracticesStore();

const constraintsComponents = {
    constraint: {
        component: Constraint,
        newData: {},
        addItemLabel: "Add constraint",
    }
}

</script>


<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Key factors, constraints and lessons learned</h1>
        
        <div class="divide-y divide-stone-300 dark:divide-stone-900">
            <div>
                <MultiSelectFormGroup
                    :options="keyFactors"
                    v-model="store.bestPractice.keyFactors"
                    label="3.1 Key factors"
                    description="What are the key factors that need to be in place for the successful implementation of the practice."
                    :required="true" />
                <TextareaFormGroup
                    label="3.2 Key factors additional information"
                    v-model="store.bestPractice.specifyKeyFactors"
                    description="Feel free to provide additional information on the key factors required for the successful implementation of the practice." />
            </div>
            <MultiInputFormGroup
                label="3.3 Constraints"
                description="What are the technical, economic, social and environmental challenges, constraints and/or risks encountered in applying the practice? How were they addressed?"
                :inputComponents="constraintsComponents"
                v-model="store.bestPractice.constraints" />
            <TextareaFormGroup
                v-model="store.bestPractice.lessonsLearned"
                label="3.4 Lessons learned/Recommendations"
                :required="true"
                description="What lessons learned/recommendations would you like to share with other practitioners intending to replicate, adapt or scale up this practice?" />
        </div>
    </div>
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
</template>
