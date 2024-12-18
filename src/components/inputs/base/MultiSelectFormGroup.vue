<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'

import baseProps from '../formGroupProps'
import FormGroup from '../FormGroup.vue'
import MultiInput from '../MultiInput.vue'
import TextInput from '../base/TextInput.vue'

import type { Menu, MenuValue } from '../../project/menus'

const props = defineProps({
    ...baseProps,
    ...{
        options: { type: Object as PropType<Menu> },
        placeholder: { type: String },
        modelValue: { type: Array as PropType<Array<MenuValue>>, required: true, default: [] },
        required: { type: Boolean, default: false },
        otherEnabled: { type: Boolean, default: false },
        others: { type: Array as PropType<Array<string>>, default: [] },
    }
});

const emit = defineEmits(["update:modelValue", "update:others"])


const focusedOut = ref(false);

const errorMessages = computed(() => {
    if (props.required && props.modelValue.length === 0 && props.otherEnabled && props.others?.length === 0) {
        return ["This field is mandatory."];
    }
    return [];
});

const showValidation = computed(() => !!errorMessages.value.length && focusedOut.value);

function isChecked(value: MenuValue): boolean {
    return props.modelValue.includes(value);
}

// TODO simplify as in TreeItem.vue
function check(event: Event, value: MenuValue) {
    const tempModel = [...props.modelValue]
    if ((event.target as HTMLInputElement).checked) {
        if (tempModel.includes(value)) {
            return;
        } else {
            tempModel.push(value);
        }
    } else {
        let i = 0;
        while (i < tempModel.length) {
            if (tempModel[i] === value) {
                tempModel.splice(i, 1);
            } else {
                i += 1;
            }
        }
    }

    // Delete the attribute from parent if empty
    emit('update:modelValue', (tempModel.length ? tempModel : undefined));
}

const inputComponents = {
    other: {
        component: TextInput,
        // newData: "",
        addItemLabel: "Add other"
    }
}

const id_ = Math.ceil(Math.random() * 1e9) // TODO
</script>


<template>
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription"
        @focusout="focusedOut = true"
    >
        <template v-if="edit">
            <fieldset class="space-y-2">
                <div
                    v-for="option in options"
                    class="relative flex items-start"
                >
                    <div class="flex items-center h-5">
                        <input
                            :id="('' + option.value) + id_.toString()"
                            type="checkbox"
                            :checked="isChecked(option.value)"
                            @change="check($event, option.value)"
                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        >
                    </div>
                    <div class="ml-3 text-sm">
                        <label
                            :for="('' + option.value) + id_.toString()"
                            class="font-font-medium text-gray-700"
                        >
                            <span
                                v-if="option.dangerousHtmlLabel"
                                v-html="option.dangerousHtmlLabel"
                            ></span>
                            <template v-else>{{ option.label }}</template>
                        </label>
                    </div>
                </div>
            </fieldset>
            <div
                v-if="otherEnabled"
                class="flex flex-row space-x-6 mt-3"
            >
                <div class="font-bold text-sm">Other:</div>
                <div class="flex-grow">
                    <MultiInput
                        :modelValue="others"
                        @update:modelValue="val => emit('update:others', val)"
                        :inputComponents="inputComponents"
                    />
                </div>
            </div>
            <div
                v-if="showValidation"
                class="mt-2 text-sm text-red-600"
            >This field is mandatory.</div>
        </template>
        <template v-else-if="modelValue?.length">
            <ul
                class="list-disc list-inside"
                v-for="option in options"
            >
                <li v-if="isChecked(option.value)">
                    <span
                        v-if="option.dangerousHtmlLabel"
                        v-html="option.dangerousHtmlLabel"
                    ></span>
                    <template v-else>{{ option.label }}</template>
                </li>
            </ul>
        </template>
        <div
            v-else
            class="italic text-gray-400"
        >
            {{ $t('inputs.noneSelected') }}
        </div>
    </FormGroup>
</template>
