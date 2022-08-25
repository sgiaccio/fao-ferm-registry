<script setup lang="ts">
import SelectFormGroup from "../base/SelectFormGroup.vue"
import TextFormGroup from "../base/TextFormGroup.vue"


defineProps<{
    modelValue: {
        role: string,
        organization: string,
        individualName: string,
        email: string
    };
}>();


const roles = [
    {value: "author", label: "Author"},
    {value: "custodian", label: "Custodian"},
    {value: "distributor", label: "Distributor"},
    {value: "originator", label: "Originator"},
    {value: "owner", label: "Owner"},
    {value: "pointOfContact", label: "Point of contact"},
    {value: "principalInvestigator", label: "Principal investigator"},
    {value: "processor", label: "Processor"},
    {value: "publisher", label: "Publisher"},
    {value: "resourceProvider", label: "Resource provider"},
    {value: "user", label: "User"}
]
</script>

<template>
    <div>
        <SelectFormGroup
            v-model="modelValue.role"
            :options="roles"
            label="Role"></SelectFormGroup>
        <TextFormGroup
            v-model="modelValue.organization"
            label="Organization"></TextFormGroup>
        <TextFormGroup
            v-model="modelValue.individualName"
            label="Individual name"></TextFormGroup>
        <TextFormGroup
            v-model="modelValue.email"
            label="Email"></TextFormGroup>
    </div>
</template>
