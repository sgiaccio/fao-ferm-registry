<script setup lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";

import baseProps from "../formGroupProps";
import FormGroup from "../FormGroup.vue";

import SelectInput from "./SelectInput.vue";


defineProps({
    ...baseProps,
    ...{
        options: { type: Array as PropType<Array<{value: any, label: String}>> },
        placeholder: { type: String },
        modelValue: { type: null },
        required: { type: Boolean, default: false }
    }
});

const emit = defineEmits(['update:modelValue']);

function valueChanged(value: string) {
    emit('update:modelValue', value);
}

</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <SelectInput
            :options="options"
            :model-value="modelValue"
            @update:modelValue="valueChanged"
            :required="required"></SelectInput>
    </FormGroup>
</template>
