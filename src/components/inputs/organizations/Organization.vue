<script setup lang="ts">
import TextFormGroup from "../base/TextFormGroup.vue"
import SelectFormGroup from "../base/SelectFormGroup.vue"

// import { agencyTypes, agencyRoles } from "../../project/menus";

import { useMenusStore } from '@/stores/menus';
import type { Menu } from "@/components/project/menus";


const menus = useMenusStore().menus;

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
            :options="menus.agencyTypes"
            label="Type"></SelectFormGroup>
        <SelectFormGroup
            :edit="edit"
            v-model="modelValue.role"
            :options="menus.agencyRoles"
            label="Role"></SelectFormGroup>

    </div>
</template>
