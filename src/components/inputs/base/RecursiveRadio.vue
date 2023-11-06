<script setup lang="ts">
import { filterByLabel } from '@/components/project/menus';
import type { MenuValue, RecursiveMenu } from '@/components/project/menus';
import { ref, computed } from 'vue';
import AlertModal from '@/views/AlertModal.vue';

import { InformationCircleIcon } from '@heroicons/vue/20/solid';


const props = withDefaults(defineProps<{
    uid?: string,
    modelValue?: MenuValue,
    options?: RecursiveMenu,
    level?: number,
    expandLevel?: number,
    showSelection?: boolean,
    edit?: boolean,
    expandable?: boolean
    searchable?: boolean
}>(), {
    level: 0,
    expandLevel: 0,
    showSelection: true,
    edit: true,
    searchable: true,
    expandable: true
});

const emit = defineEmits(["update:modelValue"])

let flattenedOptions: any = {}
function flatten(data: RecursiveMenu) {
    for (const item of data) {
        if (item.items) {
            flatten(item.items);
        } else if (item.value !== undefined) {
            flattenedOptions[item.value] = item.label;
        }
    }
}

if (props.level === 0 && props.options) {
    flatten(props.options);
}

const isOpen = ref<boolean[]>(new Array(props.options?.length).fill(+props.level < +props.expandLevel || !props.expandable));
function toggle(i: number) {
    if (!props.expandable) return;
    isOpen.value[i] = !isOpen.value[i];
}

function check(checked: boolean, value: MenuValue) {
    emit('update:modelValue', value);
}

const uid = props.uid || Math.ceil(Math.random() * 1e9) // TODO

function bubble(val: MenuValue) {
    emit("update:modelValue", val);
}

const searchString = ref('');

const filteredOptions = computed<RecursiveMenu>(() => {
    if (!searchString.value) return props.options;
    return filterByLabel(props.options, searchString.value);
});

const infoTitle = ref<string | null>(null);
const infoText = ref<string | null>(null);
function showAlertModal(title: string, info: string) {
    infoTitle.value = title
    infoText.value = info;
}
</script>

<template>
    <AlertModal type="info"
                :onClose="() => infoText = null"
                :open="!!infoText"
                :title="infoTitle"
                buttonText="Close">
        <div class="text-left text-sm space-y-4 [&_a]:text-ferm-blue-dark-600"
             v-html="infoText" />
    </AlertModal>

    <div v-if="!level && showSelection || !edit" class="font-bold border px-2 py-1 bg-blue-50 border-blue-500 rounded-md">{{ modelValue !== undefined ? flattenedOptions[modelValue] : 'None selected' }}</div>
    <input v-if="!level && edit && searchable"
           type="text"
           class="w-80 text-sm font-bold text-gray-600 rounded-full border-2 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mb-2 mt-2"
           placeholder="Search"
           v-model="searchString" />
    <!-- <div v-if="!level && showSelection || !edit"
         class="border border-slate-400 rounded-xl p-2 text-xs text-gray-900 flex flex-wrap gap-x-2 gap-y-2 mb-4">
        <div class="ml-2 text-gray-600 dark:text-gray-400"
             v-if="!modelValue">
            <template v-if="edit">Please select from the list below</template>
            <template v-else>None selected</template>
        </div>
        <div v-else
             class="text-white m-0 flex items-center rounded-lg px-2.5 bg-blue-500 min-h-7 p-1 border border-stone-800">
            <span class="align-middle">
                {{ flattenedOptions[modelValue] }}
            </span>
        </div>
    </div> -->
    <template v-if="edit">
        <ul v-for="option, i in filteredOptions"
            :class="level ? 'ml-10' : ''">
            <li>
                <div v-if="option.items"
                     class="flex items-start">
                    <div class="flex">
                        <svg v-if="expandable"
                             @click="toggle(i)"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 20 20"
                             fill="currentColor"
                             class="w-5 h-5 self-center inline-block cursor-pointer text-black dark:text-gray-200">
                            <path v-if="!isOpen[i]"
                                  fill-rule="evenodd"
                                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                  clip-rule="evenodd" />
                            <path v-else
                                  fill-rule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                  clip-rule="evenodd" />
                        </svg>
                        <div v-else
                             class="w-5 h-5" />
                    </div>
                    <div class="ml-2">
                        <span :class="[expandable ? 'cursor-pointer' : 'cursor-default', 'text-gray-900 dark:text-gray-400 text-sm']"
                              @click="toggle(i)">

                            <span v-if="option.dangerousHtmlLabel"
                                  v-html="option.dangerousHtmlLabel" />
                            <span v-else
                                  class="font-bold"
                                  v-html="option.label" />
                        </span>
                        <template v-if="option.info">
                            @nbsp;
                            <InformationCircleIcon @click="() => showAlertModal(option.dangerousHtmlLabel || option.label, option.info)"
                                                   class="w-5 h-5 inline-block text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300 cursor-pointer" />
                        </template>
                    </div>
                </div>
                <div v-else
                     class="relative flex items-start"> <!-- was v-else-if="treeData.value", why? -->
                    <div class="flex items-center">
                        <input :id="`${uid}_${option.value}`"
                               :name="uid"
                               type="radio"
                               @change="check(($event.target as HTMLInputElement).checked, option.value!)"
                               :checked="('' + modelValue === '' + option.value)"
                               class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                        <label :for="`${uid}_${option.value}`"
                               class="ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-400 cursor-pointer">
                            <span v-if="option.dangerousHtmlLabel"
                                  v-html="option.dangerousHtmlLabel" />
                            <span v-else
                                  v-html="option.label" />
                        </label>
                        <template v-if="option.info">
                            &nbsp;
                            <InformationCircleIcon @click="() => showAlertModal(option.dangerousHtmlLabel || option.label, option.info)"
                                                   class="w-5 h-5 inline-block text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300 cursor-pointer" />
                        </template>
                    </div>
                </div>
            </li>
            <div v-show="isOpen[i]">
                <RecursiveRadio v-if="option.items"
                                :modelValue="modelValue"
                                @update:modelValue="bubble"
                                :options="option.items"
                                :level="level + 1"
                                :edit="edit" />
            </div>
        </ul>
    </template>
</template>
