<script setup lang="ts">
import MapInput from './MapInput.vue'


defineProps<{
  modelValue: {
    siteName: string,
    uuid: string,
    activities: number[],
    ecosystems: string[]
  }
}>()
</script>

<template>
    <div>
        <MapInput :model-value="modelValue"></MapInput>
    </div>
</template>
