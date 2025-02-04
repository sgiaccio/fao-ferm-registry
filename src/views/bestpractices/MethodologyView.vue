<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useBestPracticesStore } from '@/stores/bestpractices';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from "../TabTemplate.vue";

import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
import ImplementationStep from "@/components/inputs/ImplementationStep.vue";
import MultiInputFormGroup from "@/components/inputs/MultiInputFormGroup.vue";
import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue";
import RadioFormGroup from "@/components/inputs/base/RadioFormGroup.vue";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useBestPracticesStore();
const menus = useMenusStore().menus;

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
        addItemLabel: t('goodPractices.inputs.implementationSteps.addStep'),
    },
}

// function enableSpecifyReplicability() {
//     return store.bestPractice?.replicability && ["1"].includes(store.bestPractice.replicability.toString())
// }
</script>

<template>
    <TabTemplate :title="t('goodPractices.methodology.title')">
        <template #description>
            <h2 class="text-xl font-semibold">{{ t('goodPractices.methodology.title') }}</h2>
            <p class="italic pt-2 text-sm"><span class="font-bold">{{ t('goodPractices.methodology.description.text1') }}</span> {{ t('goodPractices.methodology.description.text2') }}</p>
        </template>
        <template #default>
            <template v-if="store.bestPractice">
                <TextareaFormGroup
                    v-model="store.bestPractice.description"
                    :label="`2.1 ${t('goodPractices.inputs.description.label')}`"
                    :description="t('goodPractices.inputs.description.description')"
                    :edit=edit
                />
                <div>
                    <p class="text-gray-600 mt-6 text-sm">
                        {{ t('goodPractices.methodology.stepsDescription') }}
                    </p>
                    <p class="text-gray-600 mt-2 text-sm">
                        <span class="font-bold">{{ t('goodPractices.methodology.stepsNoteTitle') }}</span>
                        {{ t('goodPractices.methodology.stepsNote') }}
                    </p>
                    <MultiInputFormGroup
                        :label="`2.2 ${t('goodPractices.inputs.implementationSteps.label')}`"
                        :inputComponents="multiInputComponents"
                        v-model="store.bestPractice.implementationSteps"
                        :numbering="(n: number) => `${t('goodPractices.inputs.implementationSteps.step')} ${n}`"
                        :required="true"
                        :edit=edit
                    />
                </div>
                <MultiSelectFormGroup
                    :options="menus.engagement"
                    v-model="store.bestPractice.engagement"
                    :label="`2.3 ${t('goodPractices.inputs.engagement.label')}`"
                    :description="t('goodPractices.inputs.engagement.description')"
                    :required="true"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.stakeholdersInfo"
                    :label="`2.4 ${t('goodPractices.inputs.stakeholdersInfo.label')}`"
                    :description="t('goodPractices.inputs.stakeholdersInfo.description')"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="menus.knowledgeTypes"
                    v-model="store.bestPractice.knowledgeTypes"
                    :label="`2.5 ${t('goodPractices.inputs.knowledgeTypes.label')}`"
                    :description="t('goodPractices.inputs.knowledgeTypes.description')"
                    :required="true"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.participatoryApproaches"
                    _label="2.6 Participatory approaches"
                    _dangerousHtmlDescription="Please describe to what extent the practice has meaningfully fostered engagement and knowledge integration from the stakeholders, right-holders, and under-represented groups (if any) selected above (e.g., local communities, Indigenous peoples, ethnic minorities, women, youth and LGBTIQ+ people). <br>NOTE: If Indigenous Peoples\' traditional knowledge was selected above, please explain how the practice has complied with the right of <a class='text-blue-700 hover:text-blue-800' target='_blank' href='https://www.fao.org/indigenous-peoples/our-pillars/fpic/en/'>Free, Prior and Informed Consent.</a>"
                    :label="`2.6 ${t('goodPractices.inputs.participatoryApproaches.label')}`"
                    :dangerousHtmlDescription="t('goodPractices.inputs.participatoryApproaches.description1') + '<br>' + t('goodPractices.inputs.participatoryApproaches.description2', { link: `<a class='text-blue-700 hover:text-blue-800' target='_blank' href='https://www.fao.org/indigenous-peoples/our-pillars/fpic/en/'>${ t('goodPractices.inputs.participatoryApproaches.link') }</a>` })"
                    :edit=edit
                />
                <MultiSelectFormGroup
                    :options="menus.scale"
                    v-model="store.bestPractice.scale"
                    :label="`2.7 ${t('goodPractices.inputs.scale.label')}`"
                    :description="t('goodPractices.inputs.scale.description')"
                    :required="true"
                    :edit=edit
                />
                <div>
                    <RadioFormGroup
                        :options="menus.replicability"
                        v-model="store.bestPractice.replicability"
                        :label="`2.8 ${t('goodPractices.inputs.replicability.label')}`"
                        :description="t('goodPractices.inputs.replicability.description')"
                        :required="true"
                        :edit=edit
                    />
                    <!-- <TextareaFormGroup v-model="store.bestPractice.specifyReplicability"
                                           label="2.9 Replicability additional information"
                                           description="Please briefly explain where it was replicated and tested, how many times, with what results and the future opportunities for replication or adaptation."
                                           :enabled="enableSpecifyReplicability"
                                           :edit=edit /> -->
                    <TextareaFormGroup
                        v-model="store.bestPractice.specifyReplicability"
                        :label="`2.9 ${t('goodPractices.inputs.replicabilityAdditionalInformation.label')}`"
                        :description="t('goodPractices.inputs.replicabilityAdditionalInformation.description')"
                        :edit=edit
                    />
                </div>
            </template>
        </template>
    </TabTemplate>
</template>
