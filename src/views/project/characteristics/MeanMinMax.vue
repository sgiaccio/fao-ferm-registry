<script setup lang="ts">
defineProps<{
    value: {
        mean: number
        min: number
        max: number
    }
}>()
</script>

<template>
    mean: {{value.mean}}
    min: {{value.min}}
    max: {{value.max}}
</template>
