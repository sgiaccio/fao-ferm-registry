<script setup lang="ts">
import TextFormGroup from "../base/TextFormGroup.vue"
import SelectFormGroup from "../base/SelectFormGroup.vue"

import { agencyTypes, agencyRoles } from "../../project/menus";


defineProps<{
    modelValue: {
        name: string,
        acronym: string,
        type: string,
        role: string
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
            label="Type"></SelectFormGroup>
        <SelectFormGroup
            v-model="modelValue.role"
            :options="agencyRoles"
            label="Role"></SelectFormGroup>

    </div>
</template>
