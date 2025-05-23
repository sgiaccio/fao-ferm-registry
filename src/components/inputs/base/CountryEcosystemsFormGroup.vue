<script setup lang="ts">
import { watch, ref, computed } from "vue";

import { useI18n } from "vue-i18n";

import baseProps from "../formGroupProps"

// import trangle mark to indicate that the value is required
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';

import { getRecursiveMenuLabel, groupBiomesByRealm, getEcosystemColor } from "@/lib/util";

import { useMenusStore } from '@/stores/menus';

import { useGaul } from '@/hooks/useGaul';


const { t } = useI18n();

const { getCountryNameByIso2 } = useGaul();

const menus = useMenusStore().menus;

const props = defineProps({
    ...baseProps,
    ...{
        modelValue: { type: null },
        placeholder: String,
        required: { type: Boolean, default: false },
        edit: { type: Boolean, default: true },
        countries: { type: Array },
        ecosystems: { type: Array },
        totalArea: { type: Number },
        areaUnits: { type: String }
    }
});

const emit = defineEmits(['update:modelValue']);

watch(() => props.enabled(), e => {
    if (!e) {
        emit('update:modelValue', undefined);
    }
});

const errorMessages = computed(() => {
    if (!props.modelValue || !props.modelValue.length || !props.ecosystems || !props.ecosystems.length) {
        return [];
    }

    const totalPercentage = props.modelValue.reduce((acc: number, country: any) => {
        return acc + country.ecosystems.reduce((acc: number, ecosystem: any) => {
            return acc + (ecosystem.value || 0);
        }, 0);
    }, 0);

    if (totalPercentage < 99.99 || totalPercentage > 100.01) {
        // return [`The total percentage must be 100. It is currently ${totalPercentage.toFixed(2)}`];
        // return [`The total percentage should equal 100%, but it currently sums to ${totalPercentage.toFixed(2)}%.`];
        return [t('areaAndEcosystems.areaByEcosystem.validation.percentageCheck', { totalPercentage: totalPercentage.toFixed(2) })];
    }
});

const showValidation = computed(() => !!(errorMessages.value?.length));

const percentValues = ref<any[]>([]);
const areaValues = ref<any[]>([]);


watch(() => [props.countries, props.ecosystems], ([countries, ecosystems]) => {
    // sort ecosystems by realm and internally
    const sortedBiomesByRealm = groupBiomesByRealm(ecosystems, menus.iucnEcosystems).flatMap(realm => realm.biomes || [])

    // build a new object with the countries and ecosystems and default value 0
    percentValues.value = countries?.map((country: any) => {
        if (!props.modelValue) {
            return {
                country: country,
                ecosystems: sortedBiomesByRealm?.map((ecosystem: any) => {
                    return {
                        ecosystem: ecosystem,
                        value: 0
                    }
                })
            }
        }
        return {
            country: country,
            ecosystems: sortedBiomesByRealm?.map((ecosystem: any) => {
                const oldCountry = props.modelValue.find((oldCountry: any) => oldCountry.country === country);
                if (!oldCountry) {
                    return {
                        ecosystem: ecosystem,
                        value: 0
                    }
                } else {
                    if (!oldCountry.ecosystems) {
                        return {
                            ecosystem: ecosystem,
                            value: 0
                        }
                    }
                    const oldEcosystem = oldCountry.ecosystems.find((oldEcosystem: any) => oldEcosystem.ecosystem === ecosystem);
                    if (!oldEcosystem) {
                        return {
                            ecosystem: ecosystem,
                            value: 0
                        }
                    }
                    return {
                        ecosystem: ecosystem,
                        value: oldEcosystem.value
                    }
                }
            })
        }

    });
}, { immediate: true, deep: true });

const updateFromAreaValue = ref(false);

watch(() => percentValues, value => {
    if (updateFromAreaValue.value) {
        updateFromAreaValue.value = false;
        return;
    }

    emit('update:modelValue', value);

    if (!percentValues) {
        return [];
    }

    // now build the areaValues array with the same structure as the percentValues
    areaValues.value = percentValues.value.map((country: any) => {
        return {
            country: country.country,
            ecosystems: country.ecosystems.map((ecosystem: any) => {
                const e = ecosystem.value
                return {
                    ecosystem: ecosystem.ecosystem,
                    value: (e !== undefined && e !== null) ? +(e * (props.totalArea || 0) / 100).toFixed(2) : undefined
                }
            })
        }
    });
}, { immediate: true, deep: true });

function updateAreaValue(country: string, ecosystem: string, newValue: number) {
    updateFromAreaValue.value = true;

    // update the related percent value
    const countryIndex = areaValues.value.findIndex((c: any) => c.country === country);
    if (countryIndex === -1) {
        return;
    }
    const ecosystemIndex = areaValues.value[countryIndex].ecosystems.findIndex((e: any) => e.ecosystem === ecosystem);
    if (ecosystemIndex === -1) {
        return;
    }

    areaValues.value[countryIndex].ecosystems[ecosystemIndex].value = +newValue;
    const percentage = props.totalArea ? newValue / +props.totalArea * 100 : 0;
    percentValues.value[countryIndex].ecosystems[ecosystemIndex].value = +(percentage.toFixed(2));

    emit('update:modelValue', percentValues.value);
}

function calculateSum(values: any[]) {
    try {
        return values.reduce((acc, country) => acc + country.ecosystems.reduce((acc, ecosystem) => acc + (+ecosystem.value || 0), 0), 0);
    } catch (e) {
        console.error(e);
    }
}
</script>

<template>
    <template v-if="countries && countries.length && ecosystems && ecosystems.length">
        <div class="flex flex-row items-center justify-between mb-2">
            <h2 class="text-2xl font-semibold">
                <!-- Area by
                {{ countries?.length > 1 ? 'country and' : '' }} ecosystem -->
                <i18n-t keypath="areaAndEcosystems.areaByEcosystem.title">
                    <template v-slot:country v-if="countries?.length > 1">
                        {{ t('areaAndEcosystems.areaByEcosystem.countryAnd') }}
                    </template>
                </i18n-t>
            </h2>
            <div class="flex flex-row items-center gap-x-2">
                <div class="font-medium">
                    {{ t('areaAndEcosystems.areaByEcosystem.totalPercentage') }}
                    {{ Math.round(calculateSum(percentValues)) }}% ({{ Math.round(calculateSum(areaValues)) }}/{{ totalArea }})</div>
            </div>
        </div>

        <!-- Display Validation Messages -->
        <div :class="['mt-2 text-sm font-bold text-red-600', showValidation ? 'visible' : 'invisible']">
            <div>
                {{ errorMessages?.length ? errorMessages[0] : 'errors' }}
            </div>
        </div>

        <!-- Iterate Over Countries -->
        <div
            v-for="country in percentValues"
            :key="country.country"
            class="border rounded-xl shadow-md mb-6 overflow-hidden"
        >
            <!-- Country Header -->
            <div class="bg-gray-600 text-white h-12 flex items-center">
                <h2 class="text-lg font-semibold px-4">{{ getCountryNameByIso2(country.country) }}</h2>
            </div>

            <!-- Iterate Over Ecosystems -->
            <div class="flex flex-col divide-y_ divide-gray-200_">
                <div
                    v-for="ecosystem in country.ecosystems"
                    :key="ecosystem.ecosystem"
                    :style="`background-color: ${getEcosystemColor(ecosystem.ecosystem)}`"
                >
                    <div class="px-4 py-3.5">
                        <!-- Ecosystem Header export function getRecursiveMenuLabel(value: string | number, menu: RecursiveMenu): string { -->
                        <h3 class="text-xs font-medium mb-2 text-white">{{ getRecursiveMenuLabel(ecosystem.ecosystem, menus.iucnEcosystems) }}</h3>

                        <div class="flex flex-row items-center">
                            <!-- Input Group -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-grow">
                                <div class="flex flex-row items-center gap-x-2">
                                    <div class="text-white text-xs font-medium">%</div>
                                    <input
                                        v-if="edit"
                                        type="number"
                                        v-model.number="ecosystem.value"
                                        :placeholder="placeholder"
                                        class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
                                    >
                                    <div
                                        v-else
                                        class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
                                    >
                                        {{ ecosystem.value }}
                                    </div>
                                </div>
                                <div class="flex flex-row items-center gap-x-2">
                                    <div class="text-nowrap text-white text-xs font-medium">
                                        {{ t('inputs.areaSurface') }}
                                        [{{ areaUnits }}]
                                    </div>
                                    <input
                                        v-if="edit"
                                        type="number"
                                        :value="areaValues
                                            .find((c: any) => c.country === country.country)
                                            .ecosystems.find((e: any) => e.ecosystem === ecosystem.ecosystem).value"
                                        @input="event => updateAreaValue(country.country, ecosystem.ecosystem, event.target.value)"
                                        :edit="edit"
                                        class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
                                    />
                                    <div
                                        v-else
                                        class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
                                    >
                                        {{ areaValues
                                            .find((c: any) => c.country === country.country)
                                            .ecosystems.find((e: any) => e.ecosystem === ecosystem.ecosystem).value }}
                                    </div>
                                </div>
                            </div>
                            <!-- Validation Icon -->
                            <div :class="['text-red-600 flex-shrink ml-4', showValidation ? 'visible' : 'invisible']">
                                <ExclamationTriangleIcon class="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>
