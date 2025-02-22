<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useBestPracticesStore } from "../../stores/bestpractices";

import TabTemplate from "../TabTemplate.vue";

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import SelectFormGroup from "../../components/inputs/base/SelectFormGroup.vue";
import BpImageUploadFormGroup from "../../components/inputs/base/BpImageUploadFormGroup.vue";

withDefaults(
    defineProps<{
        edit?: boolean;
    }>(),
    {
        edit: true,
    },
);

const { t } = useI18n();

// type AdditionalResources = {
//     links?: string,
//     details?: string,
// }

const bpStore = useBestPracticesStore();

const yesNo = [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
];
</script>

<template>
    <TabTemplate :title="$t('goodPractices.additionalResources.title')">
        <template #default>
            <template v-if="bpStore.bestPractice">
                <TextareaFormGroup
                    v-model="bpStore.bestPractice.links"
                    :label="`5.1 ${t('goodPractices.inputs.links.label')}`"
                    :description="t('goodPractices.inputs.links.description')"
                    :edit="edit"
                />
                <SelectFormGroup
                    v-model="bpStore.bestPractice.details"
                    :options="yesNo"
                    :required="true"
                    :label="`5.2 ${t('goodPractices.inputs.additionalInformationCostsBenefits.label')}`"
                    :description="t('goodPractices.inputs.additionalInformationCostsBenefits.description')"
                    :edit="edit"
                />
                <TextareaFormGroup
                    v-model="bpStore.bestPractice.additionalComments"
                    :label="`5.3 ${t('goodPractices.inputs.additionalComments.label')}`"
                    :description="t('goodPractices.inputs.additionalComments.description')"
                    :edit="edit"
                />
                <BpImageUploadFormGroup
                    :label="`5.4 ${t('goodPractices.inputs.image.label')}`"
                    bucket-url="gs://fao-ferm-goodpractices"
                    :bpId="bpStore.id!"
                    :edit="edit"
                />
            </template>
        </template>
    </TabTemplate>
</template>
