<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TrashIcon } from '@heroicons/vue/20/solid';


const openedDialog = ref<string | null>(null);

const props = defineProps({
    deleteConfirmMessage: { type: String, default: "Are you sure you want to delete this item?" },
    modelValue: { type: null },
    inputComponents: null,
    numbering: null, // TODO fn(number) => string
    deleteConfirmMsg: String,
    required: { type: Boolean, default: false }, // TODO
    edit: { type: Boolean, default: true }
});

// Sample inputComponents:
// [
//     keyword: {
//         component: "TextInput",
//         props: { placeholder: "Please write some text" }
//         newData: "",
//         addItemLabel: "text"
//     }
// ]

const emit = defineEmits(["update:modelValue"]);

function getKey(obj: any) {
    const kyz = Object.keys(obj);
    if (kyz.length === 1) {
        return kyz[0];
    } else {
       throw Error(`One and only one key is allowed - found ${kyz.length}`);
    }
}


function addNewItem(type: string, newData: any) {
    const tempProp = props.modelValue ? [...props.modelValue] : []
    tempProp.push({ [type]: newData ? JSON.parse(JSON.stringify(newData)) : undefined });

    emit('update:modelValue', tempProp);
}

function addButtonPushed(type: string) {
    const newData = props.inputComponents[type].newData;
    if (props.inputComponents[type].addDialog) {
        openedDialog.value = type;
    } else {
        addNewItem(type, newData)
    }
}

function addFromDialog(type: string, dataArr: any) {
    const newValues = dataArr.map(d => ({ [type]: d }));
    const tempProp = props.modelValue ? [...props.modelValue, ...newValues] : newValues

    emit('update:modelValue', tempProp);

    openedDialog.value = null;
}

function deleteItem(i: number) {
    if (confirm(props.deleteConfirmMessage)) {
        const tempProp = props.modelValue ? [...props.modelValue] : []
        tempProp.splice(i, 1);
        emit('update:modelValue', tempProp);
    }
}

const dialogs = computed(() => Object.entries(props.inputComponents).filter((entry: any) => entry[1].addDialog));

const errorMessages = computed(() => {
    if (props.required && !props.modelValue.length) {
        return ["This field is mandatory."];
    }
    return [];
});
</script>

<template>
    <div class="border-2 rounded-md divide-y-2 border-stone-300 divide-stone-300 dark:border-stone-700 dark:divide-stone-700">
        <component
            v-for="([k, d]) in dialogs" class="p-3"
            :is="d.addDialog"
            :open="openedDialog === k"
            @cancel="openedDialog = null"
            @done="(newData: any)=> addFromDialog(k, newData)" />
        <div v-for="v, i in modelValue" class="p-3">
            <div class="text-gray-400 dark:text-gray-100 text-lg font-bold" v-if="numbering">{{numbering(i + 1)}}</div>
            <component
                :key="v"
                :is="inputComponents[getKey(v)].component"
                v-bind="{ ...inputComponents[getKey(v)].props, edit }"
                v-model="v[getKey(v)]" />
            <div
                v-if="edit" 
                class="w-full text-orange-600 text-right hover:text-orange-500">
                <button
                    type="button"
                    @click="deleteItem(i)">
                    <TrashIcon class="h-5 w-5" />
                </button>
            </div>
        </div>
        <div v-if="edit" class="flex p-3 gap-x-3">
            <button
                v-for="(value, key) in props.inputComponents"
                type="button"
                @click="addButtonPushed('' + key)"
                class="inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {{value.addItemLabel}}
            </button>
        </div>
    </div>
    <p v-if="errorMessages.length" v-for="message in errorMessages" class="mt-2 text-sm text-red-600" id="email-error">{{message}}</p>
</template>
