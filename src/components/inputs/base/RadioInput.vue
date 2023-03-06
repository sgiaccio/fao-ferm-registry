<script setup lang="ts">
import { parserOptions } from "@vue/compiler-dom";
import { ref, computed, type PropType } from "vue";

import type { Menu, MenuValue } from '../../project/menus'


const props = defineProps({
    options: { type: Array as PropType<Menu> },
    placeholder: { type: String, default: 'Please select' },
    modelValue: [String, Number],
    required: { type: Boolean, default: false },
    edit: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

const showValidation = ref(false);

function onInput(event: Event) {
    console.log((event.target as HTMLInputElement).id); // DEBUG
    let value: string = (event.target as HTMLInputElement).id;
    emit('update:modelValue', value !== "" ? value : undefined);

    showValidation.value = true
}

const errorMessages = computed(() => {
    if (props.required && !props.modelValue) {
        return ["This field is mandatory."];
    }
    return [];
});

const selectedOption = computed(() => {
    // Even if it's number, id is stored as string
    return props.options?.find(o => '' + o.value == props.modelValue);
});
</script>

<template>
    <template v-if="edit">
        <div v-for="option in options" :key="option.value" class="flex items-center">
          <input @change="onInput" :id="option.value" name="notification-method" type="radio" :checked="'' + option.value === '' + modelValue" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label :for="option.value" class="ml-3 block text-sm font-medium text-gray-700">{{ option.label }}</label>
        </div>
        <template v-if="showValidation && errorMessages.length">
            <p v-for="message in errorMessages"
               class="mt-2 text-sm text-red-600"
               id="email-error">{{ message }}</p>
        </template>
    </template>
    <div v-else>
        <!-- <p v-for="option in options">{{option.value}}</p> -->
        {{ selectedOption?.label }}
    </div>
</template>
