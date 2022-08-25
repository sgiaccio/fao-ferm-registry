<script setup lang="ts">
import baseProps from "../formGroupProps"
import FormGroup from "../FormGroup.vue"
import TextInput from "./TextInput.vue"

defineProps({
    ...baseProps,
    ...{
        modelValue: { type: String },
        placeholder: { type: String }
    }
});


const emit = defineEmits(['update:modelValue'])

function azz(value: string) {
    emit('update:modelValue', value)
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <TextInput :value="modelValue"
                   class="text-black"
                   :placeholder="placeholder"
                   @update:modelValue="azz"></TextInput>
    </FormGroup>
</template>
