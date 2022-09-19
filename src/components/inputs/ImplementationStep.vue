<script setup lang="ts">
import type { PropType } from "vue";
import TextFormGroup from "./base/TextFormGroup.vue"
import TextAreaFormGroup from "./base/TextareaFormGroup.vue"


defineProps({
    modelValue: {
        type: Object as PropType<{
            timing?: string,
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
            v-model="modelValue.timing"
            label="Details of the step" />
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
