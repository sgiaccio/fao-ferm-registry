<script setup lang="ts">
import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"
import TextInput from "./TextInput.vue"

defineProps({
    ...baseProps,
    ...{
        modelValue: { type: String },
        placeholder: { type: String }
    }
});


const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <TextInput :value="modelValue"
                   :placeholder="placeholder"
                   @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"></TextInput>
    </FormGroup>
</template>
