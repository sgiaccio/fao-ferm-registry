<script setup lang="ts">
import { computed, ref } from "vue";

import { useI18n } from "vue-i18n";

import { TrashIcon, PencilSquareIcon } from "@heroicons/vue/20/solid";

import ConfirmModal from "@/views/ConfirmModal.vue";

const props = defineProps({
    modelValue: { type: null, default: undefined },
    edit: { type: Boolean, default: true },
});

const { t } = useI18n();

const emit = defineEmits(["update:modelValue"]);

interface CustomIndicator {
    indicator: string;
    metric: string;
    unit: string;
}

function addIndicator() {
    const newIndicators = props.modelValue || [];
    emit("update:modelValue", [
        ...newIndicators,
        { indicator: { ...newIndicator.value } },
    ]);
    newIndicator.value = {
        indicator: "",
        metric: "",
        unit: "",
    };
    showIndicatorDialog.value = false;
    editingExistingIndicator.value = false;
}

function confirmEditIndicator() {
    const indicators = [...props.modelValue];
    indicators[editingExistingIndicatorIndex.value] = {
        indicator: { ...newIndicator.value },
    };
    emit("update:modelValue", indicators);

    newIndicator.value = {
        indicator: "",
        metric: "",
        unit: "",
    };
    showIndicatorDialog.value = false;
    editingExistingIndicator.value = false;
}

function cancelAddIndicator() {
    showIndicatorDialog.value = false;
    newIndicator.value = {
        indicator: "",
        metric: "",
        unit: "",
    };

    editingExistingIndicator.value = false;
}

function removeIndicator(i: number) {
    const newIndicators = props.modelValue.filter((_, index) => index !== i);
    emit("update:modelValue", newIndicators.length ? newIndicators : undefined);
}

const showIndicatorDialog = ref(false);

const newIndicator = ref<CustomIndicator>({
    indicator: "",
    metric: "",
    unit: "",
});

const newIndicatorValid = computed(() => {
    return (
        !!newIndicator.value.indicator &&
        !!newIndicator.value.metric &&
        !!newIndicator.value.unit
    );
});

const editingExistingIndicator = ref(false);
const editingExistingIndicatorIndex = ref();
function editIndicator(i: number) {
    editingExistingIndicator.value = true;
    editingExistingIndicatorIndex.value = i;
    const indicators = props.modelValue;
    const indicator = indicators[i];

    // set the newIndicator values (still using the same as in the addIndicator - have no time)
    newIndicator.value = {
        indicator: indicator.indicator.indicator,
        metric: indicator.indicator.metric,
        unit: indicator.indicator.unit,
    };

    showIndicatorDialog.value = true;
}
</script>

<template>
    <ConfirmModal
        :open="showIndicatorDialog"
        @confirm="
            () =>
                editingExistingIndicator
                    ? confirmEditIndicator()
                    : addIndicator()
        "
        @cancel="cancelAddIndicator"
        :title="
            editingExistingIndicator
                ? t('indicators.editCustomIndicator.title')
                : t('indicators.addCustomIndicator.title')
        "
        :okButtonText="
            editingExistingIndicator
                ? t('indicators.editCustomIndicator.title')
                : t('indicators.addCustomIndicator.title')
        "
        :okButtonEnabled="newIndicatorValid"
        cancelText="Cancel"
    >
        <div class="flex flex-col gap-y-6 mt-6">
            <div class="relative">
                <label
                    for="indicator"
                    class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
                >
                    {{ $t("indicators.addCustomIndicator.indicator") }}
                </label>
                <input
                    type="text"
                    name="indicator"
                    id="indicator"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    :placeholder="
                        t('indicators.addCustomIndicator.indicatorPlaceholder')
                    "
                    v-model="newIndicator.indicator"
                />
            </div>
            <div class="relative">
                <label
                    for="metric"
                    class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
                >
                    {{ $t("indicators.addCustomIndicator.metric") }}
                </label>
                <input
                    type="text"
                    name="metric"
                    id="metric"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    :placeholder="
                        $t('indicators.addCustomIndicator.metricPlaceholder')
                    "
                    v-model="newIndicator.metric"
                />
            </div>
            <div class="relative">
                <label
                    for="unit"
                    class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
                >
                    {{ $t("indicators.addCustomIndicator.unit") }}
                </label>
                <input
                    type="text"
                    name="unit"
                    id="unit"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    :placeholder="
                        $t('indicators.addCustomIndicator.unitPlaceholder')
                    "
                    v-model="newIndicator.unit"
                />
            </div>
        </div>
    </ConfirmModal>
    <div
        :class="$attrs.class"
        class="border-2 border-gray-300 rounded-md px-4 py-4 bg-gray-100"
    >
        <h1 class="font-bold text-gray-700 text-lg pb-3">
            {{ $t("inputs.customIndicatorsList.title") }}
        </h1>
        <div
            class="flex flex-col mb-4 gap-y-1 text-xs font-bold text-black"
            v-if="modelValue"
        >
            <div
                v-for="(indicator, i) in modelValue"
                class="rounded px-3 py-2 flex shadow-sm shadow-gray-300 bg-gray-200"
            >
                <div class="flex-grow">
                    {{ indicator.indicator.indicator }} &mdash;
                    {{ indicator.indicator.metric }} &mdash;
                    {{ indicator.indicator.unit }}
                </div>
                <div v-if="edit" class="gap-x-1 flex flex-row">
                    <div @click="editIndicator(i)" class="cursor-pointer">
                        <PencilSquareIcon
                            class="w-4 h-4 cursor-pointer self-center text-black hover:text-green-500"
                        />
                    </div>
                    <div @click="removeIndicator(i)" class="cursor-pointer">
                        <TrashIcon
                            class="w-4 h-4 cursor-pointer self-center text-black hover:text-red-600"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="-mt-2 mb-2 text-gray-500 italic">
            {{ $t("inputs.customIndicatorsList.noIndicators") }}
        </div>

        <button
            v-if="edit"
            @click="
                () => {
                    showIndicatorDialog = true;
                }
            "
            class="mt-4 px-3 text-sm py-1 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
        >
            {{ $t("inputs.customIndicatorsList.addIndicator") }}
        </button>
    </div>
</template>
