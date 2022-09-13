<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, computed } from 'vue'

import baseProps from "../formGroupProps"
import FormGroup from "../FormGroup.vue"
import MultiInput from "../MultiInput.vue"
import TextInput from "../base/TextInput.vue"


const props = defineProps({
    ...baseProps,
    ...{
        options: { type: Array as PropType<Array<{value: any, label: string}>> },
        placeholder: { type: String },
        modelValue: { type: Array as PropType<Array<any>>, required: true, default: [] },
        required: { type: Boolean, default: false },
        otherEnabled: { type: Boolean, default: false },
        others: { type: null, default: [] }, // TODO: string array
    }
});

const emit = defineEmits(["update:modelValue", "update:others"])


const focusedOut = ref(false);

const errorMessages = computed(() => {
    if (props.required && props.modelValue.length === 0) {
        return ["This field is mandatory."];
    }
    return [];
});

const showValidation = computed(() => !!errorMessages.value.length && focusedOut.value);

function isChecked(value: string): boolean {
    return props.modelValue.includes(value);
}

function check(event: Event, value: string) {
    // TODO - shouldn't change modelValue directly?

    if ((event.target as HTMLInputElement).checked) {
        if (props.modelValue.includes(value)) {
            return;
        } else {
            props.modelValue.push(value);
        }
    } else {
        let i = 0;
        while (i < props.modelValue.length) {
            if (props.modelValue[i] === value) {
                props.modelValue.splice(i, 1);
            }
            else {
                i += 1;
            }
        }
    }

    emit('update:modelValue', (props.modelValue.length ? props.modelValue : undefined));
}

const inputComponents = {
    other: {
        component: TextInput,
        // newData: "",
        addItemLabel: "other"
    }
}

</script>

<template>
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription"
        v-on:focusout="focusedOut = true">
        <fieldset class="space-y-5">
            <div v-for="option in options" class="relative flex items-start">
                <div class="flex items-center h-5">
                    <input 
                        :id="'comments_' + option.value"
                        type="checkbox"
                        :checked="isChecked(option.value)"
                        @change="check($event, option.value)"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                    <label
                        :for="'comments_' + option.value"
                        class="dark:text-zinc-400 font-font-medium text-gray-700">{{option.label}}
                    </label>
                </div>
            </div>
        </fieldset>
        <div v-if="otherEnabled" class="flex flex-row space-x-6 mt-3">
            <div class="dark:text-zinc-400 font-bold text-sm">Other:</div>
            <div class="flex-grow">
                <MultiInput
                    :modelValue="others"
                    @update:modelValue="val => emit('update:others', val)"
                    :inputComponents="inputComponents" />
            </div>
        </div>
        <div
            v-if="showValidation"
            class="mt-2 text-sm text-red-600">This field is mandatory.</div>
    </FormGroup>
</template>
