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
            :label="$t('inputs.pointOfContact.individualName')"
        />
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.email"
            :label="$t('inputs.pointOfContact.email')"
        />
        <TextFormGroup
            :edit="edit"
            v-model="modelValue.organization"
            :label="$t('inputs.pointOfContact.organization')"
        />
    </div>
</template>
