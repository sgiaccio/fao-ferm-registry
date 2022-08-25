<script setup lang="ts">
import MultiInputFormGroup from "../MultiInputFormGroup.vue"
import PointOfContact from "./PointOfContact.vue"

defineProps<{
    modelValue: {
        poc: {
            role: string,
            organization: string,
            individualName: string,
            email: string
        }
    }[];
}>();


const multiInputComponents = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: "POC",
    },
}

</script>

<template>
  <MultiInputFormGroup label="Points of contact"
                       :inputComponents="multiInputComponents"
                       v-model="modelValue"></MultiInputFormGroup>
</template>