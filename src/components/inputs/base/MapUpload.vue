<script setup lang="ts">
import MapInput from "./MapInput.vue";

withDefaults(
  defineProps<{
    modelValue: {
      siteName: string;
      uuid: string;
      area: number;
      activities: number[];
      ecosystems: string[];
      startingYear: number;
    };
    edit?: boolean;
    index: number;
    nAreas: number;
  }>(),
  {
    edit: true,
  },
);

const emit = defineEmits(["update:modelValue"]);

function emitUpdateModelValue(value: any) {
  emit("update:modelValue", value);
}
</script>

<template>
  <div>
    <MapInput
      :model-value="modelValue"
      :edit="edit"
      @update:modelValue="emitUpdateModelValue"
      :index="index"
      :nAreas="nAreas"
    />
  </div>
</template>
