<script setup lang="ts">
import { filterByLabel } from '@/components/project/menus';
import type { MenuValue, RecursiveMenu } from '@/components/project/menus';
import { computed, ref } from 'vue';


const props = withDefaults(defineProps<{
    uid?: string,
    modelValue?: Array<MenuValue>,
    options: RecursiveMenu,
    level?: number,
    expandLevel?: number,
    edit?: boolean,
    showSelectedValues?: boolean
}>(), {
    level: 0,
    expandLevel: 0,
    edit: true,
    showSelectedValues: true
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref<boolean[]>(new Array(props.options?.length).fill(+props.level < +props.expandLevel));

function toggle(i: number) {
    isOpen.value[i] = !isOpen.value[i];
}

function sortCheckedValues(a: any, b: any) {
    if ((a as String) > (b as String)) return 1;
    else if ((a as String) < (b as String)) return -1;
    return 0;
}

function sortCheckedValuesByLabel(a: any, b: any) {
    return flattenedOptions[a].localeCompare(flattenedOptions[b]);
}

let flattenedOptions: any = {};

function flatten(data: RecursiveMenu) {
    for (const item of data) {
        if (item.value) {
            flattenedOptions[item.value] = item.label;
        }
        if (item.items) {
            flatten(item.items);
        }
    }
}

function deleteOption(value: MenuValue) {
    if (!props.modelValue) return;
    emit('update:modelValue', props.modelValue.filter(v => v !== value).sort(sortCheckedValues));
}

function check(checked: boolean, value: MenuValue) {
    if (checked) {
        if (!props.modelValue?.includes(value)) {
            const tempModel = props.modelValue ? [...props.modelValue, value] : [value];
            emit('update:modelValue', tempModel.sort(sortCheckedValues));
        }
    } else {
        deleteOption(value);
    }
}

if (props.level === 0) {
    flatten(props.options);
}

const uid = props.uid || Math.ceil(Math.random() * 1e9); // TODO

function bubble(val: number[]) {
    emit('update:modelValue', val && val.length ? val : undefined);
}

const searchString = ref('');

const filteredOptions = computed<RecursiveMenu>(() => {
    if (!searchString.value) return props.options;
    return filterByLabel(props.options, searchString.value);
});
</script>

<template>
    <div v-if="!level && showSelectedValues">
        <div class="border border-slate-400 shadow-sm rounded-xl p-2 text-xs text-gray-900 flex flex-wrap gap-x-2 gap-y-2 mb-4">
            <div class="ml-2 text-gray-600 dark:text-gray-400"
                 v-if="!props.modelValue?.length">
                <template v-if="edit">Please select from the list below</template>
                <template v-else>None selected</template>
            </div>
            <div v-for="value in (props.modelValue || []).sort(sortCheckedValuesByLabel)"
                 class="text-white m-0 flex items-center rounded-lg pl-2.5 pr-1 bg-blue-500 min-h-7 p-1 border border-stone-800">
                <span class="align-middle">
                    {{ flattenedOptions[value] }}
                </span>
                <div v-if="edit">
                    <svg @click="deleteOption(value)"
                         class="ml-0.5 w-5 h-5 text-gray-300 hover:text-gray-400 cursor-pointer"
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                              clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
    <input v-if="!level && edit"
           type="text"
           class="w-80 text-sm font-bold text-gray-600 rounded-full border-2 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mb-2 mt-2"
           placeholder="Search"
           v-model="searchString" />
    <template v-if="edit">
        <ul v-for="(option, i) in filteredOptions"
            :class="level ? 'ml-10' : ''">
            <li>
                <div class="flex items-start">
                    <div v-if="option.items">
                        <div class="flex">
                            <svg v-if="option.items"
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
                        </div>
                    </div>
                    <div v-if="option.value"
                         class="flex items-start">
                        <div class="flex h-5 items-center">
                            <input :id="`${uid}_${option.value}`"
                                   @change="check(($event.target as HTMLInputElement).checked, option.value!)"
                                   aria-describedby="comments-description"
                                   name="`${uid}_${treeData?.value}`"
                                   type="checkbox"
                                   :checked="(modelValue || []).includes(option.value)"
                                   class="ml-1 cursor-pointer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        </div>
                        <div class="ml-2.5 text-sm">
                            <label :for="`${uid}_${option.value}`"
                                   class="font-normal dark:text-zinc-300 cursor-pointer">
                                   <span v-html="option.label"></span>
                            </label>
                        </div>
                    </div>
                    <div v-else
                         class="ml-2.5 text-sm dark:text-zinc-300 font-bold cursor-pointer"
                         @click="toggle(i)">
                         <span v-html="option.label"></span>
                    </div>
                </div>
                <div v-show="isOpen[i]">
                    <RecursiveMenu v-if="option.items"
                                   :modelValue="modelValue"
                                   @update:modelValue="bubble"
                                   :options="option.items"
                                   :level="level + 1"
                                   :edit="edit" />
                </div>
            </li>
        </ul>
    </template>
</template>
