<script setup lang="ts">
    import { storeToRefs } from 'pinia'

    import baseProps from "../formGroupProps"
    import FormGroup from "../FormGroup.vue"

    import { useEditingStore } from '../../../stores/editing.js'


    defineProps({
        ...baseProps,
        ...{
            modelValue: { type: String }
        }
    });

    const { editing } = storeToRefs(useEditingStore())
    const { toggleEditing } = useEditingStore()

    const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <p @click="toggleEditing" v-if="editing">Editing posts...</p>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <input v-if="edit"
            type="date"
            class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md"
               style="height:38px"
               :value="modelValue"
               @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
        <div v-else-if="modelValue">{{modelValue}}</div>
        <div v-else class="italic text-gray-400">{{ $t('notAvailable') }}</div>
    </FormGroup>
</template>
