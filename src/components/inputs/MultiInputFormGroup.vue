<script setup lang="ts">
import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"
import MultiInput from "./MultiInput.vue"

defineProps({
    ...baseProps,
    ...{
        modelValue: { type: null, default: [] },
        inputComponents: null,
        numbering: null,
        deleteConfirmMsg: String,
    }
});

const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <MultiInput :modelValue="modelValue"
                    @update:modelValue="val => emit('update:modelValue', val)"
                    :inputComponents="inputComponents"
                    :numbering="numbering"
                    :deleteConfirmMsg="deleteConfirmMsg"
                    :required="true"
                    :edit="edit" />
    </FormGroup>
</template>
