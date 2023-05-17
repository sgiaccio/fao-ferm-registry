<script setup lang="ts">
import { define } from 'mime';
import MapInput from './MapInput.vue'


// defineProps<{
//   modelValue: {
//     siteName: string,
//     uuid: string,
//     area: number,
//     activities: number[],
//     ecosystems: string[]
//   }
// }>()

withDefaults(defineProps<{
  modelValue: {
    siteName: string,
    uuid: string,
    area: number,
    activities: number[],
    ecosystems: string[]
  },
  edit?: boolean
}>(), {
  edit: true
});

const emit = defineEmits(['update:modelValue'])

function emitUpdateModelValue(value: any) {
  emit('update:modelValue', value)
}
</script>

<template>
    <div>
        <MapInput :model-value="modelValue" :edit="edit" @update:modelValue="emitUpdateModelValue"></MapInput>
    </div>
</template>
