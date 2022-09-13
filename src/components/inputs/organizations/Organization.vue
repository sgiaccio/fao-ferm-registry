<script setup lang="ts">
import TextFormGroup from "../base/TextFormGroup.vue"
import SelectFormGroup from "../base/SelectFormGroup.vue"

import { agencyTypes } from "../../project/menus";


defineProps<{
    modelValue: {
        name: string,
        acronym: string,
        type: string
    };
}>();
</script>

<template>
    <div>
        <TextFormGroup
            v-model="modelValue.name"
            label="Name"></TextFormGroup>
        <TextFormGroup
            v-model="modelValue.acronym"
            label="Acronym"></TextFormGroup>
        <SelectFormGroup
            v-model="modelValue.type"
            :options="agencyTypes"
            label="Role"></SelectFormGroup>
    </div>
</template>
