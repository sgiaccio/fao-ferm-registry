<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useBestPracticesStore } from '@/stores/bestpractices';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from "../TabTemplate.vue"

import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue";

// import { positiveOutcomes } from "../../components/project/menus";


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

const { t } = useI18n();

const store = useBestPracticesStore();
const menus = useMenusStore().menus;
</script>

<template>
    <TabTemplate :title="$t('goodPractices.benefitsAndValidation.title')">
        <template #default>
            <template v-if="store.bestPractice">
                <MultiSelectFormGroup
                    :options="menus.outcomes"
                    v-model="store.bestPractice.outcomes"
                    :label="`4.1 ${t('goodPractices.inputs.positiveImpacts.label')}`"
                    :description="t('goodPractices.inputs.positiveImpacts.description')"
                    :required="true"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.positiveImpacts"
                    :label="`4.2 ${t('goodPractices.inputs.positiveImpactsAdditionalInformation.label')}`"
                    :description="t('goodPractices.inputs.positiveImpactsAdditionalInformation.description')"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.negativeImpacts"
                    :required="true"
                    :label="`4.3 ${t('goodPractices.inputs.negativeImpacts.label')}`"
                    :description="t('goodPractices.inputs.negativeImpacts.description')"
                    :edit=edit
                />
                <TextareaFormGroup
                    v-model="store.bestPractice.validation"
                    :required="true"
                    :label="`4.4 ${t('goodPractices.inputs.validation.label')}`"
                    :description="t('goodPractices.inputs.validation.description')"
                    :edit=edit
                />
            </template>
        </template>
    </TabTemplate>
</template>
