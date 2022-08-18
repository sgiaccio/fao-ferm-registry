<script setup lang="ts">
import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"


defineProps({
    ...baseProps,
    ...{
        modelValue: { type: String },
        placeholder: String
    }
});

const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <textarea rows="3"
                  value=""
                  :placeholder="placeholder"
                  class="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
               @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"></textarea>
    </FormGroup>
</template>
