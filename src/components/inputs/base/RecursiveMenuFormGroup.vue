<script setup lang="ts">
import type { PropType } from "vue";

import baseProps from "../formGroupProps";
import FormGroup from "../FormGroup.vue";

import RecursiveMenu from "./RecursiveMenu.vue";

import type {MenuValue, RecursiveMenu as RecursiveMenuType} from '@/types';


defineProps({
    ...baseProps,
    ...{
        options: { type: Array as PropType<RecursiveMenuType> },
        modelValue: { type: Array as PropType<MenuValue[]> },
        showSelection: { type: Boolean, default: true },
        searchable: { type: Boolean, default: true },
        // expandable: { type: Boolean, default: true }
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
        <RecursiveMenu :edit="edit"
                       :options="options"
                       :model-value="modelValue"
                       :showSelection="showSelection"
                       @update:modelValue="valueChanged"
                       :searchable="searchable" />
        <template #info
                  v-if="$slots.info">
            <slot name="info" />
        </template>
    </FormGroup>
</template>
