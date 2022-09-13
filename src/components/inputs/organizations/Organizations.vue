<script setup lang="ts">
import MultiInputFormGroup from "../MultiInputFormGroup.vue"
import Organization from "./Organization.vue"

defineProps<{
    modelValue: {
        organization: {
            name: string,
            acronym: string,
            type: string
        }
    }[];
}>();


const multiInputComponents = {
    organization: {
        component: Organization,
        newData: {},
        addItemLabel: "organization",
    },
}

</script>

<template>
  <MultiInputFormGroup label="Organizations"
                       description="Organizations that implement the project/initiative"
                       :inputComponents="multiInputComponents"
                       v-model="modelValue"></MultiInputFormGroup>
</template>