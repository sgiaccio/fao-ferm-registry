<script setup lang="ts">
import type { PropType } from "vue";

import baseProps from "./formGroupProps";
import FormGroup from "./FormGroup.vue";
import NumberInput from "./base/NumberInput.vue";


const props = defineProps({
    ...baseProps,
    ...{
        modelValue: {
            type: Object as PropType<{latitude: number, longitude: number}>,
            default: {}
        },
    }
});

const emit = defineEmits(["update:modelValue"]);

function updateLatitude(lat: number) {
    emit('update:modelValue', { ...props.modelValue, lat } )
}

function updateLongitude(lon: number) {
    emit('update:modelValue', { ...props.modelValue, lon } )
}
</script>

<template>
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription">
        <div class="flex gap-8">
            <div class="flex flex-col gap-1">
                <NumberInput
                    :modelValue="modelValue.latitude"
                    @update:modelValue="updateLatitude"
                    edit="edit"
                />
                <span class="text-gray-300 text-sm">Latitude</span>
            </div>
            <div class="flex flex-col gap-1">
                <NumberInput
                    :edit="edit"
                    :modelValue="modelValue.longitude"
                    @update:modelValue="updateLongitude"
                />
                <span class="text-gray-300 text-sm">Longitude</span>
            </div>
        </div>
    </FormGroup>
</template>
