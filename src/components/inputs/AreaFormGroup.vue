<script setup lang="ts">
import type { PropType } from 'vue'

import baseProps from "./formGroupProps"
import FormGroup from './FormGroup.vue';
import NumberInput from './base/NumberInput.vue';
import SelectInput from './base/SelectInput.vue';


defineProps({
    ...baseProps,
    ...{
        modelValue: { type: Object as PropType<{value: any, units: string}> },
    }
});
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <div class="flex gap-8">
            <div class="flex flex-col gap-1">
                <NumberInput v-model="modelValue.value"></NumberInput>
                <span class="text-gray-300 text-sm">Area</span>
            </div>
            <div class="flex flex-col gap-1">
                <SelectInput v-model="modelValue.units" :options="[{value: 'ha', label: 'Hectare'}, {value: 'km2', label: 'Square km'}, {value: 'ac', label: 'Acre'}]"></SelectInput>
                <span class="text-gray-300 text-sm">Units</span>
            </div>
        </div>
    </FormGroup>
</template>
