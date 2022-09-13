<script setup lang="ts">
import baseProps from "../formGroupProps"
import FormGroup from "../FormGroup.vue"
import TextInput from "./TextInput.vue"

defineProps({
    ...baseProps,
    ...{
        modelValue:  { type: String },
        placeholder: { type: String },
        required:    { type: Boolean, default: false }
    }
});



const emit = defineEmits(['update:modelValue'])

function valueChanged(value: string) {
    emit('update:modelValue', value)
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <TextInput
            :model-value="modelValue"
            :placeholder="placeholder"
            @update:modelValue="valueChanged"
            :required="required"
        />
    </FormGroup>
</template>
