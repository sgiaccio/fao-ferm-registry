<script setup lang="ts">
    import { storeToRefs } from 'pinia'

    import baseProps from "../formGroupProps"
    import FormGroup from "../FormGroup.vue"

    import { useEditingStore } from '../../../stores/editing.js'

    const { editing } = storeToRefs(useEditingStore())
    const { toggleEditing } = useEditingStore()

    const props = defineProps({
        ...baseProps,
        ...{
            modelValue: { type: String }
        }
    });

    const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <p @click="toggleEditing" v-if="editing">Editing posts...</p>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <input type="date"
               class="max-w-lg_ block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
               style="height:38px"
               :value="modelValue"
               @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
    </FormGroup>
</template>
