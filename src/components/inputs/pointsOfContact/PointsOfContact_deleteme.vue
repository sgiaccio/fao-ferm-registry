<script setup lang="ts">
import MultiInputFormGroup from "../MultiInputFormGroup.vue"
import PointOfContact from "./PointOfContact.vue"

defineProps<{
    modelValue: {
        poc: {
            individualName: string,
            organization: string,
            email: string
        }
    }[];
}>();


const multiInputComponents = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: "Add POC",
    },
}
</script>

<template>
  <MultiInputFormGroup label="Points of contact"
                       :inputComponents="multiInputComponents"
                       v-model="modelValue"></MultiInputFormGroup>
</template>