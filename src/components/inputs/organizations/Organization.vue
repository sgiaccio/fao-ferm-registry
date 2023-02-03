<script setup lang="ts">
import TextFormGroup from "../base/TextFormGroup.vue"
import SelectFormGroup from "../base/SelectFormGroup.vue"

import { agencyTypes, agencyRoles } from "../../project/menus";


withDefaults(defineProps<{
    modelValue: {
        name: string,
        acronym: string,
        type: string,
        role: string
    },
    edit?: boolean
}>(), { edit: true });
</script>

<template>
    <div>
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.name"
            label="Name"></TextFormGroup>
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.acronym"
            label="Acronym"></TextFormGroup>
        <SelectFormGroup
            :edit="edit"
            v-model="modelValue.type"
            :options="agencyTypes"
            label="Type"></SelectFormGroup>
        <SelectFormGroup
            :edit="edit"
            v-model="modelValue.role"
            :options="agencyRoles"
            label="Role"></SelectFormGroup>

    </div>
</template>
