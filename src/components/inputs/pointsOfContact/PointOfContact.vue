<script setup lang="ts">
import TextFormGroup from "../base/TextFormGroup.vue"


defineProps<{
    modelValue: {
        organization: string,
        individualName: string,
        email: string
    };
}>();
</script>

<template>
    <div>
        <TextFormGroup
            v-model="modelValue.individualName"
            label="Individual name"></TextFormGroup>
        <TextFormGroup
            v-model="modelValue.email"
            label="Email"></TextFormGroup>
        <TextFormGroup
            v-model="modelValue.organization"
            label="Organization"></TextFormGroup>
    </div>
</template>
