<script setup lang="ts">
import { ref, type PropType } from 'vue';

import baseProps from "./formGroupProps";
import FormGroup from './FormGroup.vue';
import NumberInput from './base/NumberInput.vue';
import SelectInput from './base/SelectInput.vue';


const props = defineProps({
    ...baseProps,
    ...{
        modelValue: { type: Object as PropType<{value: any, units: string}>, default: {} },
    }
});

const emit = defineEmits(['update:modelValue'])

const area = ref(props.modelValue.value);
const units = ref(props.modelValue.units);

function updateArea(newValue) {
    area.value = newValue;
    if (newValue && units.value)
        emit('update:modelValue', { value: area.value, units: units.value });
    else
        emit('update:modelValue', undefined);
}
function updateUnits(newUnits) {
    units.value = newUnits;
    if (newUnits && area.value)
        emit('update:modelValue', { value: area.value, units: units.value });
    else
        emit('update:modelValue', undefined);
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <div class="flex gap-8">
            <div class="flex flex-col gap-1">
                <NumberInput
                    :modelValue="modelValue.value"
                    @update:modelValue="updateArea"
                    :edit="edit" />
                <span class="text-gray-300 text-sm">Area</span>
            </div>
            <div class="flex flex-col gap-1">
                <SelectInput
                    :modelValue="modelValue.units"
                    @update:modelValue="updateUnits"
                    :options="[{value: 'ha', label: 'Hectare'}, {value: 'km2', label: 'Square km'}, {value: 'ac', label: 'Acre'}]"
                    :edit="edit" />
                <span class="text-gray-300 text-sm">Units</span>
            </div>
        </div>
        <template v-slot:info v-if="$slots.info">
            <slot name="info" />
        </template>
    </FormGroup>
</template>
