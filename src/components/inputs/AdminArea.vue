<script setup lang="ts">
import { ref, watch } from 'vue';
import json from '../project/gaul.json';
import FormGroup from './FormGroup.vue';
import SelectInput from './base/SelectInput.vue';
import TextInput from './base/TextInput.vue';


const props = defineProps<{
  modelValue: {
    siteName: string,
    admin0: number | null,
    admin1: number | null,
    admin2: number | null,
    activities: number[]
  }
}>()

const emit = defineEmits(['update:modelValue']);

const admin0 = ref(props.modelValue?.admin0);
const admin1 = ref(props.modelValue?.admin1);
const admin2 = ref(props.modelValue?.admin2);

const getSelectOptions = (a: any) => ({ label: a.name, value: a.code })

const admin0Menu = json.map(getSelectOptions);
const admin1Menu = ref();
const admin2Menu = ref();

const findInJson = (json, value) => (json.find(a => a.code === value))['children'];

// TODO
watch(admin0, (val, prev) => {
    if (val) {
        const t0 = findInJson(json, val);
        admin1Menu.value =t0.map(getSelectOptions);
    } else {
        admin1Menu.value = undefined;
    }

    // if prev is null it means that the page was just loaded, don't change values
    // only change values when the selection was changed by the user
    if (prev) {
        admin1.value = null;
        admin2.value = null;
    }

    if (!val) emit('update:modelValue', undefined)
    emit('update:modelValue', {
        // activities: props.modelValue.activities, // Preserve activities when the area changes
        // siteName: props.modelValue.siteName,
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined
    });
}, { immediate: true });

watch(admin1, (val, prev) => {
    if (val) {
        const t0 = findInJson(json, admin0.value);
        const t1 = findInJson(t0, val);
        admin2Menu.value = t1.map(getSelectOptions);
    } else {
        admin2Menu.value = undefined;
    }

    if (prev) {
       admin2.value = null;
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
            <TextInput v-model="modelValue.siteName" />
            <SelectInput v-model="admin0" :options="admin0Menu" placeholder="Please select Country" />
            <SelectInput v-model="admin1" :options="admin1Menu" placeholder="Please select Region" />
            <SelectInput v-model="admin2" :options="admin2Menu" placeholder="Please select Province" />
        </div>
    </FormGroup>
</template>
