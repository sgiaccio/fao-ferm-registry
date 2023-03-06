<script setup lang="ts">
import type { PropType } from "vue";

import baseProps from "../formGroupProps";
import FormGroup from "../FormGroup.vue";

import RadioInput from "./RadioInput.vue";

import type { Menu } from '../../project/menus'


defineProps({
    ...baseProps,
    ...{
        options: { type: Array as PropType<Menu> },
        placeholder: { type: String },
        modelValue: [ String, Number ],
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
        <RadioInput
            :edit="edit"
            :options="options"
            :model-value="modelValue"
            @update:modelValue="valueChanged"
            :required="required" />
    </FormGroup>
</template>
