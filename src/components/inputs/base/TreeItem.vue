<script setup lang="ts">

import { ref, computed, type PropType } from 'vue'
import type { MenuValue, RecursiveMenu } from '../../project/menus';

// import FormGroup from '../FormGroup.vue';

const props = defineProps({
    uid: null,
    modelValue: Array as PropType<Array<MenuValue>>,
    treeData: { type: Object as PropType<RecursiveMenu>, required: true },
    level: { type: Number, default: 0 },
    expandLevel: { type: Number, default: 1 },
    edit: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "update:others"])

const isOpen = ref(+props.level <= +props.expandLevel)
const isFolder = computed(() => {
    return !!(props.treeData?.children && props.treeData.children.length)
});

function toggleFolder() {
    isOpen.value = !isOpen.value
}

function sortCheckedValues(a: any, b: any) {
    // if (a instanceof Number && b instanceof Number) {
    //     return Math.sign((a as number) - (b as number));
    // }
    // else {
        if ((a as String) > (b as String)) return 1
        else if ((a as String) < (b as String)) return -1
        return 0;
    // }
}

function check(checked: boolean, value: MenuValue) {
    if (checked) {
        if (!props.modelValue?.includes(value)) {
            const tempModel = props.modelValue ? [ ...props.modelValue,  value ] : [value]; // TODO - Deep copy?
            emit('update:modelValue', tempModel.sort(sortCheckedValues));
        }
    } else {
        deleteOption(value)
    }  
}

function deleteOption(value: MenuValue) {
    if (!props.modelValue) return;
    emit('update:modelValue', props.modelValue.filter(v => v !== value).sort(sortCheckedValues));
}

let flattenedOptions: any = {}
function flatten(data: RecursiveMenu) {
    if (!data.children) {
        if (data.value) {
            flattenedOptions[data.value] = data.label;
        }
    } else {
        data.children.forEach(flatten);
    }
}

// TODO search text
// const searchText = ref("");
// const filteredTree = ref();
// watch(searchText, function rec() {})


if (props.level === 0) {
    flatten(props.treeData);
}

const uid = props.uid || Math.ceil(Math.random() * 1e9) // TODO

function bubble(val: number[]) {
    emit("update:modelValue", val && val.length ? val : undefined);
}
</script>

<template>
    <dl v-if="level" class="my-1">
        <div v-if="isFolder"
            class="font-semibold flex gap-0.5"
            @click="toggleFolder">
            <div>
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
            </div>
            <span class="text-sm self-center dark:text-zinc-100">{{ treeData?.label }}</span>
        </div>
        <div v-else-if="treeData.value" class="relative flex items-start">
            <div class="flex h-5 items-center">
                <input
                    :id="`${uid}_${treeData.value}`"
                    @change="check(($event.target as HTMLInputElement).checked, treeData.value!)"
                    aria-describedby="comments-description"
                    name="`${uid}_${treeData?.value}`"
                    type="checkbox"
                    :checked="(modelValue || []).includes(treeData.value)"
                    class="cursor-pointer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            </div>
            <div class="ml-3 text-sm">
                <label :for="`${uid}_${treeData?.value}`" class="font-normal dark:text-zinc-300 cursor-pointer">{{ treeData?.label }}</label>
            </div>
        </div>
        <ul class="ml-10" v-show="isOpen" v-if="isFolder">
            <TreeItem
                v-for="child in treeData?.children"
                :uid="uid"
                :modelValue="modelValue"
                @update:modelValue="bubble"
                :treeData="child"
                :level="props.level + 1"
                :expandLevel="expandLevel">
            </TreeItem>

            <!-- <li class="add" @click="addChild">+</li> -->
        </ul>
    </dl>
    <div v-else>

        <div
            class="border border-slate-400 rounded-xl p-2 text-xs text-gray-900 flex flex-wrap gap-x-2 gap-y-2 mb-4">
            <div class="ml-2 text-gray-600 dark:text-gray-400" v-if="!props.modelValue?.length">
                <template v-if="edit">Please select from the list below</template>
                <template v-else>None selected</template>
            </div>
            <div
                v-for="value in (props.modelValue || []).sort(sortCheckedValues)"
                class="text-white m-0 flex items-center rounded-lg pl-2.5 pr-1 bg-blue-500 min-h-7 p-1 border border-stone-800">
                <span class="align-middle">
                    {{flattenedOptions[value]}}
                </span>
                <div v-if="edit">
                    <svg @click="deleteOption(value)" class="ml-0.5 w-5 h-5 text-gray-300 hover:text-gray-400 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
        <ul v-if="edit" class="dark:text-white cursor-default">
            <TreeItem
                v-for="child in treeData?.children"
                :uid="uid"
                :modelValue="modelValue"
                @update:modelValue="bubble"
                :treeData="child"
                :level="props.level + 1"
                :expandLevel="expandLevel" />
        </ul>
    </div>
</template>
