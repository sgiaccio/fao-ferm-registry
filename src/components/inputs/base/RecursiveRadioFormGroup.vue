<script setup lang="ts">
import type { PropType } from "vue";

import baseProps from "../formGroupProps";
import FormGroup from "../FormGroup.vue";

import RecursiveRadio from "./RecursiveRadio.vue";

import type { RecursiveMenu } from '../../project/menus'


defineProps({
    ...baseProps,
    ...{
        options: { type: Array as PropType<RecursiveMenu> },
        modelValue: [String, Number],
        showSelection: { type: Boolean, default: true },
        searchable: { type: Boolean, default: true },
        expandable: { type: Boolean, default: true }
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
        <RecursiveRadio :edit="edit"
                        :options="options"
                        :model-value="modelValue"
                        :showSelection="showSelection"
                        @update:modelValue="valueChanged"
                        :searchable="searchable"
                        :expandable="expandable" />
        <template v-slot:info
                  v-if="$slots.info">
            <slot name="info" />
        </template>
    </FormGroup>
</template>
