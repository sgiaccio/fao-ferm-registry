<script setup lang="ts">
import { ref, watch } from 'vue';
import json from '../project/gaul.json';
import FormGroup from './FormGroup.vue';
import SelectInput from './base/SelectInput.vue';
// import TextInput from './base/TextInput.vue';
// import NumberInput from './base/NumberInput.vue';


type AdminArea = {
    code?: string,
    name?: string,
    children?: AdminArea
}[]

const props = withDefaults(defineProps<{
    modelValue: {
        siteName: string,
        admin0?: string,
        admin1?: string,
        admin2?: string,
        area: number,
        activities: number[]
    },
    edit?: boolean
}>(), { edit: true });

const emit = defineEmits(['update:modelValue']);

const admin0 = ref(props.modelValue?.admin0);
const admin1 = ref(props.modelValue?.admin1);
const admin2 = ref(props.modelValue?.admin2);

const getSelectOptions = (a: any) => ({ label: a.name, value: a.code })

const admin0Menu = json.map(getSelectOptions);
const admin1Menu = ref();
const admin2Menu = ref();

function findInJson(json: AdminArea, value?: string) {
    if (!value) return
    const item = (json.find(a => a.code === value));
    return item ? item['children'] : null;
}

watch(admin0, (val, prev) => {
    if (val) {
        const children = findInJson(json, val);
        admin1Menu.value = children ? children.map(getSelectOptions) : undefined
    } else {
        admin1Menu.value = undefined;
    }

    // if prev is null it means that the page was just loaded, don't change values
    // only change values when the selection was changed by the user
    if (prev) {
        admin1.value = undefined;
        admin2.value = undefined;
    }

    if (!val) emit('update:modelValue', undefined)
    emit('update:modelValue', {
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined
    });
}, { immediate: true });

watch(admin1, (val, prev) => {
    if (val) {
        const t0 = findInJson(json, admin0.value);
        if (!t0) return
        const t1 = findInJson(t0, val);
        if (!t1) return
        admin2Menu.value = t1.map(getSelectOptions);
    } else {
        admin2Menu.value = undefined;
    }

    if (prev) {
        admin2.value = undefined;
    }

    if (!admin0.value && !val) emit('update:modelValue', undefined);
    emit('update:modelValue', {
        // activities: props.modelValue.activities,
        // siteName: props.modelValue.siteName,
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined
    });
}, { immediate: true });

watch(admin2, val => {
    if (!admin0.value && !admin1.value && !val) emit('update:modelValue', undefined);
    emit('update:modelValue', {
        // activities: props.modelValue.activities,
        // siteName: props.modelValue.siteName,
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined
    });
}, { immediate: true });
</script>

<template>
    <FormGroup label="Administrative area">
        <div class="flex flex-col gap-y-3">
            <div>
                <legend class="block text-sm font-medium leading-6 text-gray-900">
                    Site name
                </legend>
                <template v-if="edit">
                    <div class="mt-2 flex rounded-md shadow-sm">
                        <div class="relative flex flex-grow items-stretch focus-within:z-10">
                            <input type="text"
                                   v-model="modelValue.siteName"
                                   name="siteName"
                                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                </template>
                <div v-else>{{ modelValue.siteName }}</div>
            </div>
            <!-- <FormGroup label="Site name">
                <TextInput :edit="edit"
                           v-model="modelValue.siteName" />
            </FormGroup> -->

            <div>
                <legend class="block text-sm font-medium leading-6 text-gray-900">
                    Area [ha]
                </legend>
                <template v-if="edit">
                    <div class="mt-2 flex rounded-md shadow-sm">
                        <div class="relative flex flex-grow items-stretch focus-within:z-10">
                            <input type="number"
                                   v-model="modelValue.area"
                                   name="area"
                                   class="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                </template>
                <div v-else>{{ modelValue.area }}</div>
            </div>
            <!-- <FormGroup label="Area [ha]">
                <NumberInput :edit="edit"
                             v-model="modelValue.area" />
            </FormGroup> -->

            <div class="block text-sm font-medium leading-6 text-gray-900">Administrative area</div>
            <SelectInput :edit="edit"
                         v-model="admin0"
                         :options="admin0Menu"
                         placeholder="Please select Country" />
            <SelectInput :edit="edit"
                         v-model="admin1"
                         :options="admin1Menu"
                         placeholder="Please select Region" />
            <SelectInput :edit="edit"
                         v-model="admin2"
                         :options="admin2Menu"
                         placeholder="Please select Province" />
        </div>
    </FormGroup>
</template>
