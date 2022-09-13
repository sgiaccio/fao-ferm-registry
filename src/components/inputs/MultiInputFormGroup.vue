<script setup lang="ts">
import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"
import MultiInput from "./MultiInput.vue"

defineProps({
    ...baseProps,
    ...{
        modelValue: { type: null, default: [] },
        inputComponents: null,
        numbering: Boolean,
        deleteConfirmMsg: String,
    }
});

// TODO is this needed?
// const emit = defineEmits(["update:modelValue"]);
// watch(
//     () => props.modelValue,
//     () => {
//         debugger;
//         emit('update:modelValue', props.modelValue);
//     },
//     // fetch the data when the view is created and the data is already being observed
//     { immediate: true },
// )


const emit = defineEmits(['update:modelValue'])
function update(val) {
    console.log(val);
    emit('update:modelValue', val)
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <MultiInput :modelValue="modelValue"
                    @update:modelValue="update"
                    :inputComponents="inputComponents"
                    :numbering="numbering"
                    :deleteConfirmMsg="deleteConfirmMsg" />
    </FormGroup>
</template>
