<script setup lang="ts">

import { ref, computed } from 'vue'


import FormGroup from '../FormGroup.vue';


const props = defineProps({
    modelValue: null,
    treeData: Object,
    level: { type: Number, default: 0 }
});

const emit = defineEmits(["update:modelValue", "update:others"])

const isOpen = ref(props.level === 1)
const isFolder = computed(() => {
    return !!(props.treeData?.children && props.treeData.children.length)
});

function toggleFolder() {
    isOpen.value = !isOpen.value
}

function sortCheckedValues(a: number, b: number) {
    return Math.sign(a - b);
}

function check(checked: boolean, value: string) {
    if (checked) {
        if (!props.modelValue?.includes(value)) {
            const tempModel = props.modelValue ? [ ...props.modelValue,  value ] : [value]; // TODO - Deep copy?
            emit('update:modelValue', tempModel.sort(sortCheckedValues));
        }
    } else {
        deleteOption(value)
    }  
}

function deleteOption(value: string) {
    emit('update:modelValue', props.modelValue.filter(v => v !== value).sort(sortCheckedValues));
}

let flattenedOptions: number[] = []
function flatten(data) {
    if (data.value > -1) {
        flattenedOptions[data.value] = data.label;
    }
    if (data.children) {
        data.children.forEach(c => { flatten(c) });
    }
}

if (props.level === 0) {
    flatten(props.treeData);
}

function bubble(val: number[]) {
    emit("update:modelValue", val && val.length ? val : undefined);
}
</script>

<template>
    <li v-if="level" class="my-1">
        <div v-if="isFolder"
            class="font-semibold flex gap-0.5"
            @click="toggleFolder">
            <svg
                v-if="!isOpen"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-5 h-5 self-center">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
            <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-5 h-5 self-center">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>

            <span class="text-sm self-center dark:text-zinc-100">{{ treeData?.label }}</span>
        </div>
        <div v-else class="relative flex items-start">
            <div class="flex h-5 items-center">
                <input
                    :id="treeData?.value"
                    @change="check(($event.target as HTMLInputElement).checked, treeData?.value)"
                    aria-describedby="comments-description"
                    name="comments"
                    type="checkbox"
                    :checked="(modelValue || []).includes(treeData?.value)"
                    class="cursor-pointer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            </div>
            <div class="ml-3 text-sm">
                <label :for="treeData?.value" class="font-normal dark:text-zinc-300 cursor-pointer">{{ treeData?.label }}</label>
            </div>
        </div>
        <ul class="ml-10" v-show="isOpen" v-if="isFolder">
            <TreeItem
                v-for="child in treeData?.children"
                :modelValue="modelValue"
                @update:modelValue="bubble"
                :treeData="child"
                :level="props.level + 1">
            </TreeItem>

            <!-- <li class="add" @click="addChild">+</li> -->
        </ul>
    </li>
    <div v-else>
        <FormGroup
            label="Activities"
            description="Restoration activities to which the practice belongs to.">
            <div
                v-if="modelValue?.length"
                class="border border-slate-400 rounded-xl p-2 text-xs text-gray-900 flex flex-wrap gap-x-2 gap-y-2 mb-4">
                <div
                    v-for="value in (props.modelValue || []).sort(sortCheckedValues)"
                    class="text-stone-800 m-0 flex items-center rounded-full pl-2.5 pr-1 bg-pink-200 h-7 border border-stone-800">
                    <span class="align-middle">
                        {{flattenedOptions[value]}}
                    </span>
                    <svg @click="deleteOption(value)" class="ml-0.5 w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
            <ul class="text-white cursor-default">
                <TreeItem
                    v-for="child in treeData?.children"
                    :modelValue="modelValue"
                    @update:modelValue="bubble"
                    :treeData="child"
                    :level="props.level + 1" />
            </ul>
        </FormGroup>
    </div>
</template>
