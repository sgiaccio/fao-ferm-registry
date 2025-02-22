<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { PropType } from "vue";
import TextAreaFormGroup from "./base/TextareaFormGroup.vue"


defineProps({
    modelValue: {
        type: Object as PropType<{
            details?: string,
            // timing?: string,
            // equipment?: string,
            // labour?: string,
            // species?: string,
            // additionalInformation?: string
        }>,
        default: {},
    },
    edit: { type: Boolean, default: true }
});

const { t } = useI18n();
</script>

<template>
    <div>
        <TextAreaFormGroup
            v-model="modelValue.details"
            :label="t('goodPractices.inputs.implementationSteps.stepDetails')"
            :required="true"
            :edit="edit" />
        <!-- <TextAreaFormGroup
            v-model="modelValue.equipment"
            label="Equipment / Material used (If applicable)" />
        <TextAreaFormGroup
            v-model="modelValue.labour"
            label="Labour (If applicable)" />
        <TextAreaFormGroup
            v-model="modelValue.species"
            label="Species used (If applicable)" />
        <TextAreaFormGroup
            v-model="modelValue.additionalInformation"
            label="Additional information (If applicable)" /> -->
    </div>
</template>
