<script setup lang="ts">
import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"
import MultiInput from "./MultiInput.vue"

defineProps({
    ...baseProps,
    ...{
        modelValue: null,
        inputComponents: null,
        numbering: Boolean,
        deleteConfirmMsg: String
    }
});


// const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <MultiInput v-model="modelValue"
                    :inputComponents="inputComponents"
                    :numbering="numbering"
                    :deleteConfirmMsg="deleteConfirmMsg"></MultiInput>
    </FormGroup>
</template>
