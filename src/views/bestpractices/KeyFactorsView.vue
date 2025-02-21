<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useBestPracticesStore } from '@/stores/bestpractices';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from "../TabTemplate.vue"

import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
import MultiInputFormGroup from "@/components/inputs/MultiInputFormGroup.vue";
import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue";
import Constraint from "@/components/inputs/Constraint.vue"

// import { keyFactors } from "../../components/project/menus";


// type KeyFactors = {
//     keyFactors?: number[],
//     specifyKeyFactors?: string,
//     constraints?: {
//         constraint?: string,
//         addressing?: string,
//     }[],
//     lessonsLearned?: string,
// }

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useBestPracticesStore();
const menus = useMenusStore().menus;

const constraintsComponents = {
    constraint: {
        component: Constraint,
        newData: {},
        addItemLabel: t('goodPractices.inputs.constraints.addConstraint'),
    }
}

</script>

<template>
    <TabTemplate :title="$t('goodPractices.keyFactors.title')">
        <template #default>
            <template v-if="store.bestPractice">
                <div>
                    <MultiSelectFormGroup
                        :options="menus.keyFactors"
                        v-model="store.bestPractice.keyFactors"
                        :label="`3.1 ${t('goodPractices.inputs.keyFactors.label')}`"
                        :description="t('goodPractices.inputs.keyFactors.description')"
                        :required="true"
                        :edit=edit
                    />
                    <TextareaFormGroup
                        v-model="store.bestPractice.specifyKeyFactors"
                        :label="`3.2 ${t('goodPractices.inputs.keyFactorsAdditionalInformation.label')}`"
                        :description="t('goodPractices.inputs.keyFactorsAdditionalInformation.description')"
                        :edit=edit
                    />
                </div>
                <MultiInputFormGroup
                    v-model="store.bestPractice.constraints"
                    :inputComponents="constraintsComponents"
                    :label="`3.3 ${t('goodPractices.inputs.constraints.label')}`"
                    :description="t('goodPractices.inputs.constraints.description')"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.lessonsLearned"
                    :required="true"
                    :label="`3.4 ${t('goodPractices.inputs.lessonsLearned.label')}`"
                    :description="t('goodPractices.inputs.lessonsLearned.description')"
                    :edit=edit
                />
            </template>
        </template>
    </TabTemplate>
    <!-- <pre class="text-white">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
