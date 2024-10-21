<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = withDefaults(defineProps<{
    modelValue?: any,
    inputComponent?: any,
    labelFn?: (n: number, v: any) => string,
    edit?: boolean,
    ids: any[]
}>(), {
    deleteConfirmMessage: "Are you sure you want to delete this item?",
    required: false,
    edit: true,
});


const emit = defineEmits(["update:modelValue"]);

function addNewItem(newData: any) {
    const tempProp = props.modelValue ? [...props.modelValue] : [];


    const newModel = props.ids.map(v => {
        const oldItem = tempProp.find((t) => t.id === v);
        return oldItem ?? { id: v, value: newData }
    })

    emit('update:modelValue', newModel);
}

watch(() => props.ids, () => {
    addNewItem(props.inputComponent.newData);
}, { immediate: true, deep: true });

</script>

<template>
    <div
        v-if="props.modelValue?.length > 0"
        class="border border-gray-200 rounded-md divide-y"
    >
        <div
            v-for="(v, i) in props.modelValue || []"
            class="p-3"
        >
            <div>
                <h3 class="text-lg font-medium text-gray-900">
                    {{ inputComponent.labelFn ? inputComponent.labelFn(i, v) : "" }}
                </h3>
            </div>
            <component
                :key="v"
                :is="inputComponent.component"
                v-bind="{ ...props.inputComponent.props, edit, ...((props.inputComponent.calculatedProps || []).reduce((acc: any[], prop: any) => ({ ...acc, [prop.key]: prop.f(modelValue, i) }), {})) }"
                v-model="v.value"
            />
        </div>
    </div>
</template>
