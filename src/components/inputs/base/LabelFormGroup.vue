<script setup lang="ts">
import baseProps from '../formGroupProps';
import FormGroup from '@/components/inputs/FormGroup.vue';


defineProps({
    ...baseProps,
    value: { type: null, required: true }
});
</script>

<template>
    <FormGroup :label="label">
        <span class="text-black">{{value}}</span>
        <template #info v-if="$slots.info">
            <slot name="info" />
        </template>
    </FormGroup>
</template>
