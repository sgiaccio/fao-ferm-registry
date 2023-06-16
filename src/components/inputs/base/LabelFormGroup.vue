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
        {{value}}
    </FormGroup>
</template>
