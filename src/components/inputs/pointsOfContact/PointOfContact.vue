<script setup lang="ts">
import TextFormGroup from "../base/TextFormGroup.vue"


withDefaults(defineProps<{
    modelValue: {
        organization: string,
        individualName: string,
        email: string,
    },
    edit?: boolean
}>(), { edit: true });
</script>

<template>
    <div>
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.individualName"
            label="Individual name"></TextFormGroup>
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.email"
            label="Email"></TextFormGroup>
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.organization"
            label="Organization"></TextFormGroup>
    </div>
</template>
