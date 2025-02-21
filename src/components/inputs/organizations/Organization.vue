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
            :label="$t('inputs.organization.name')"
        />
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.acronym"
            :label="$t('inputs.organization.acronym')"
        />
        <SelectFormGroup
            :edit="edit"
            v-model="modelValue.type"
            :options="menus.agencyTypes"
            :label="$t('inputs.organization.type')"
        />
        <SelectFormGroup
            :edit="edit"
            v-model="modelValue.role"
            :options="menus.agencyRoles"
            :label="$t('inputs.organization.role')"
        />
    </div>
</template>
