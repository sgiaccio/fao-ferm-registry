<script setup lang="ts">
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
        default: {}
    },
});

</script>

<template>
    <div>
        <TextAreaFormGroup
            v-model="modelValue.details"
            label="Details of the step"
            :required="true" />
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
