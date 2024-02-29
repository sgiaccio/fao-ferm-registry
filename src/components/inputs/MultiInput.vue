<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrashIcon } from '@heroicons/vue/20/solid';


const openedDialog = ref<string | null>(null);

// const props_ = defineProps({
//     deleteConfirmMessage: { type: String, default: "Are you sure you want to delete this item?" },
//     modelValue: { type: null },
//     inputComponents: null,
//     numbering: null, // TODO fn(number) => string
//     deleteConfirmMsg: String,
//     required: { type: Boolean, default: false }, // TODO
//     edit: { type: Boolean, default: true }
// });

const props = withDefaults(defineProps<{
    deleteConfirmMessage?: string,
    modelValue?: any,
    inputComponents?: any,
    numbering?: (n: number, v: any) => string,
    deleteConfirmMsg?: string,
    required?: boolean,
    edit?: boolean,
    pagingSize?: number
}>(), {
    deleteConfirmMessage: "Are you sure you want to delete this item?",
    required: false,
    edit: true,
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

function addItemFromDialog(type: string, dataArr: any) {
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

const nShow = ref(props.pagingSize);

const hasMorePages = computed(() => nShow.value && nShow.value < props.modelValue.length);

function showMore() {
    if (hasMorePages.value && props.pagingSize && nShow.value) {
        nShow.value += props.pagingSize;
    }
}

</script>

<template>
    <component
        v-for="([k, d]) in dialogs"
        class="p-3"
        :is="d.addDialog"
        :open="openedDialog === k"
        @cancel="openedDialog = null"
        @done="(newData: any) => addItemFromDialog(k, newData)"
    />
    <div class="border-2 rounded-md divide-y-2 border-stone-300 divide-stone-300 bg-white overflow-hidden">
        <div
            v-for="(v, i) in nShow ? props.modelValue.slice(0, nShow) : props.modelValue"
            class="p-3"
        >

            <div
                class="text-gray-400 text-lg font-bold"
                v-if="numbering"
            >{{ numbering(i, v) }}</div>
            <component
                :key="v"
                :is="inputComponents[getKey(v)].component"
                v-bind="{ ...inputComponents[getKey(v)].props, edit, ...((inputComponents[getKey(v)].calculatedProps || []).reduce((acc: any[], prop: any) => ({ ...acc, [prop.key]: prop.f(modelValue, i) }), {})) }"
                v-model="v[getKey(v)]"
            />
            <!-- <component
                :key="v"
                :is="inputComponents[getKey(v)].component"
                v-bind="{ ...inputComponents[getKey(v)].props, edit }"
                v-model="v[getKey(v)]" /> -->
            <div
                v-if="edit"
                class="w-full text-orange-600 text-right hover:text-orange-500"
            >
                <button
                    type="button"
                    @click="deleteItem(i)"
                >
                    <TrashIcon class="h-5 w-5" />
                </button>
            </div>
        </div>
        <div
            v-if="edit"
            class="flex p-3 gap-x-3"
        >
            <button
                v-for="(componentDef, key) in props.inputComponents"
                type="button"
                @click="addButtonPushed('' + key)"
                class="inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {{ componentDef.addItemLabel }}
            </button>
        </div>
        <div
            v-if="pagingSize"
            class="flex flex-row flex-1 text-right py-4 pr-3 items-center justify-end gap-x-3 bg-slate-50"
        >
            <div>{{ Math.min(nShow!, props.modelValue.length) }} of {{ props.modelValue.length }}</div>
            <button
                v-if="hasMorePages"
                type="button"
                @click="showMore"
                class="inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Show more
            </button>
        </div>
    </div>
    <p
        v-if="errorMessages.length"
        v-for="message in errorMessages"
        class="mt-2 text-sm text-red-600"
        id="email-error"
    >{{ message }}</p>
</template>
