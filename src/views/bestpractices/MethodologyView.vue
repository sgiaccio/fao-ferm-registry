<script setup lang="ts">
import { useBestPracticesStore } from '../../stores/bestpractices';

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import ImplementationStep from "../../components/inputs/ImplementationStep.vue";
import MultiInputFormGroup from "../../components/inputs/MultiInputFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";
import SelectFormGroup from "../../components/inputs/base/SelectFormGroup.vue";

import { engagement, knowledgeTypes, scale, replicability } from "../../components/project/menus";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useBestPracticesStore();

// type Methodology = {
//     description?: string,
//     implementationSteps?: {
//         details?: string
//         // timing?: string,
//         // equipment?: string,
//         // labour?: string,
//         // species?: string,
//         // additionalInformation?: string
//     }[],
//     engagement?: number[],
//     knowledgeTypes?: number[],
//     participatoryApproaches?: string,
//     scale?: number[],
//     replicability?: number,
//     specifyReplicability?: string
// }

// const props = defineProps<{
//   modelValue: Methodology
// }>()

// const { bestPractice } = storeToRefs(useBestPracticesStore());

// type Methodology = {
//     description?: string,
//     implementationSteps?: {
//         timing?: string,
//         equipment?: string,
//         labour?: string,
//         species?: string,
//         additionalInformation?: string
//     }[],
//     engagement?: number[],
//     knowledgeTypes?: number[],
//     participatoryApproaches?: string,
//     scale?: number[],
//     replicability?: number,
//     specifyReplicability?: string
// }

// const data = ref<Methodology> ({
//     implementationSteps: [],
//     engagement: [7],
//     replicability: 1
// });

const multiInputComponents = {
    step: {
        component: ImplementationStep,
        newData: {},
        addItemLabel: "Add step",
    },
}

function enableSpecifyReplicability() {
    return store.bestPractice?.replicability && ["1", "2"].includes(store.bestPractice.replicability.toString())
}
</script>


<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Methodology</h1>
        
        <h2 class="text-2xl pt-6 dark:text-zinc-300">Implementation of the practice</h2>
        
        <p class="dark:text-zinc-300 italic"><span class="font-bold">Please provide all the information that another practitioner needs to have in order to be able to replicate this practice</span>. Please provide a description of the practice and explain in detail the steps for its implementation including when applicable: timing, equipment, labour, species used, and all other relevant information.</p>

        <div class="divide-y divide-stone-300 dark:divide-stone-900">
            <TextareaFormGroup
                v-model="store.bestPractice.description"
                label="2.1 Description"
                description="Description of the practice." />
            <div>
                <p class="text-gray-600 dark:text-white mt-6">Please provide for each step (if applicable): timing, equipment, labour, species used, and all other relevant information</p>
                <MultiInputFormGroup
                    label="2.2 Steps for implementation"
                    :inputComponents="multiInputComponents"
                    v-model="store.bestPractice.implementationSteps"
                    :numbering="(n: number) => `Step ${n}`"
                    :required="true"
                    :edit=edit />
            </div>
            <MultiSelectFormGroup
                :options="engagement"
                v-model="store.bestPractice.engagement"
                label="2.3 Stakeholder engagement"
                description="Please indicate which stakeholder groups were/are actively involved in the practice."
                :required="true"
                :edit=edit />
            <TextareaFormGroup
                v-model="store.bestPractice.stakeholdersInfo"
                label="2.4 Stakeholder's additional information"
                description="Feel free to provide additional information on stakeholder's engagement in the practice"
                :edit=edit />
            <MultiSelectFormGroup
                :options="knowledgeTypes"
                v-model="store.bestPractice.knowledgeTypes"
                label="2.5 Types of knowledge"
                description="What types of knowledge have been included in the practice?"
                :required="true"
                :edit=edit />
            <TextareaFormGroup
                v-model="store.bestPractice.participatoryApproaches"
                label="2.6 Participatory approaches"
                description="Please describe who are the implementers and beneficiaries of the practice, and to what extent the practice has meaningfully fostered engagement and knowledge integration from the stakeholders, right-holders, and under-represented groups (if any) selected above."
                :edit=edit />
            <MultiSelectFormGroup
                :options="scale"
                v-model="store.bestPractice.scale"
                label="2.7 Scale"
                description="Please indicate the scale(s) at which the practice has been implemented and/or replicated."
                :required="true"
                :edit=edit />
            <div>
                <SelectFormGroup
                    :options="replicability"
                    v-model="store.bestPractice.replicability"
                    label="2.8 Replicability"
                    description="Has this practice been replicated? In the same context or different contexts?"
                    :required="true"
                    :edit=edit />
                <TextareaFormGroup
                    v-model="store.bestPractice.specifyReplicability"
                    label="2.9 Replicability additional information"
                    description="If yes, please briefly explain where it was replicated, how many times, and with what results."
                    :enabled="enableSpecifyReplicability"
                    :edit=edit />
            </div>
        </div>
    </div>
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
</template>
