<script setup lang="ts">
import { ref, computed, type PropType } from "vue";

import type { Menu } from '../../project/menus'

import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'


const props = defineProps({
    options: { type: Array as PropType<Menu> },
    placeholder: { type: String, default: 'Please select' },
    modelValue: [String, Number],
    required: { type: Boolean, default: false },
    edit: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

const showValidation = ref(false);

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
        <RadioGroup :modelValue="modelValue"
                    @update:modelValue="value => emit('update:modelValue', value)"
                    class="mt-2_">
            <RadioGroupLabel class="sr-only">Choose a memory option</RadioGroupLabel>
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
                <RadioGroupOption as="template"
                                  v-for="option in options"
                                  :key="option.value"
                                  :value="option.value"
                                  v-slot="{ active, checked }">
                    <div :class="['cursor-pointer focus:outline-none', active ? 'ring-2 ring-ferm-blue-dark-700 ring-offset-2' : '', checked ? 'bg-ferm-blue-dark-700 text-white hover:bg-ferm-blue-dark-600' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1']">
                        <RadioGroupLabel as="span">{{ option.label }}</RadioGroupLabel>
                    </div>
                </RadioGroupOption>
            </div>
        </RadioGroup>
        <!-- <div v-for="option in options" :key="option.value" class="flex items-center">
          <input @change="onInput" :id="option.value" name="notification-method" type="radio" :checked="'' + option.value === '' + modelValue" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label :for="option.value" class="ml-3 block text-sm font-medium text-gray-700">{{ option.label }}</label>
        </div> -->
        <template v-if="showValidation && errorMessages.length">
            <p v-for="message in errorMessages"
               class="mt-2 text-sm text-red-600"
               id="error">{{ message }}</p>
        </template>
    </template>
    <div v-else>
        <!-- <p v-for="option in options">{{option.value}}</p> -->
        {{ selectedOption?.label }}
    </div>
</template>
