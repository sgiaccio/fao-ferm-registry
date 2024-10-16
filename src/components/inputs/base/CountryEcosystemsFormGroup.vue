<script setup lang="ts">
import { watch, ref, computed } from "vue";

import baseProps from "../formGroupProps"
// import FormGroup from "../FormGroup.vue"

// import trangle mark to indicate that the value is required
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';

import { getRecursiveMenuLabel, groupBiomesByRealm, getEcosystemColor } from "@/lib/util";

import { useMenusStore } from '@/stores/menus';

import { useGaul } from '@/hooks/useGaul';


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
    if (!props.modelValue) return;

    const totalPercentage = props.modelValue.reduce((acc: number, country: any) => {
        return acc + country.ecosystems.reduce((acc: number, ecosystem: any) => {
            return acc + (ecosystem.value || 0);
        }, 0);
    }, 0);

    if (totalPercentage < 99.99 || totalPercentage > 100.01) {
        return [`The total percentage must be 100. It is currently ${totalPercentage.toFixed(2)}`];
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
                    value: (e !== undefined && e !== null) ? e * (props.totalArea || 0) / 100 : undefined
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

    areaValues.value[countryIndex].ecosystems[ecosystemIndex].value = newValue;
    percentValues.value[countryIndex].ecosystems[ecosystemIndex].value = props.totalArea ? newValue / props.totalArea * 100 : 0

    emit('update:modelValue', percentValues.value);
}

watch(areaValues, value => {
    updateFromAreaValue.value = true;

    // update the related percent value
    value.forEach(country => {
        country.ecosystems.forEach(ecosystem => {
            const e = ecosystem.value;
            const countryIndex = percentValues.value.findIndex((c: any) => c.country === country.country);
            if (countryIndex === -1) {
                return;
            }
            const ecosystemIndex = percentValues.value[countryIndex].ecosystems.findIndex((e: any) => e.ecosystem === ecosystem.ecosystem);
            if (ecosystemIndex === -1) {
                return;
            }

            // using == null here to also catch undefined
            percentValues.value[countryIndex].ecosystems[ecosystemIndex].value = (props.totalArea == null || e == null) ?  undefined : e / props.totalArea * 100;
        });
    });
}, { deep: true });

function calculateSum(values: any[]) {
    try {
        return values.reduce((acc, country) => acc + country.ecosystems.reduce((acc, ecosystem) => acc + (ecosystem.value || 0), 0), 0);
    } catch (e) {
        alert();
        console.error(e);
    }
}
</script>

<template>
    <div class="flex flex-row items-center justify-between mb-2">
        <h2 class="text-2xl font-semibold">Area by {{ countries?.length > 1 ? 'country and' : '' }} ecosystem</h2>
        <div class="flex flex-row items-center gap-x-2">
            <div class="font-medium">Total area: {{ totalArea }}</div>
            <div class="font-medium">[{{ areaUnits }}]</div>
            -
            <div class="font-medium">Area sum: {{ Math.round(calculateSum(areaValues)) }}</div>
            <div class="font-medium">[{{ areaUnits }}]</div>
            -
            <div class="font-medium">Total percentage: {{ Math.round(calculateSum(percentValues)) }}</div>
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
                                <!-- <number-input
                                    v-model="ecosystem.value"
                                    :edit="edit"
                                    class="px-2 py-1"
                                /> -->
                                <input
                                    type="number"
                                    v-model.number="ecosystem.value"
                                    :placeholder="placeholder"
                                    class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
                                >
                            </div>
                            <div class="flex flex-row items-center gap-x-2">
                                <div class="text-nowrap text-white text-xs font-medium">Area [{{ areaUnits }}]</div>
                                <!-- <number-input
                                    :value="areaValues
                                        .find((c: any) => c.country === country.country)
                                        .ecosystems.find((e: any) => e.ecosystem === ecosystem.ecosystem).value"
                                    @input="event => updateAreaValue(country.country, ecosystem.ecosystem, event.target.value)"
                                    :edit="edit"
                                    class="px-2 py-1"
                                /> -->
                                <!-- <number-input
                                    v-model="areaValues
                                        .find((c: any) => c.country === country.country)
                                        .ecosystems.find((e: any) => e.ecosystem === ecosystem.ecosystem).value"
                                    :edit="edit"
                                    class="px-2 py-1"
                                /> -->
                                <input
                                    type="number"
                                    v-model.number="areaValues
                                        .find((c: any) => c.country === country.country)
                                        .ecosystems.find((e: any) => e.ecosystem === ecosystem.ecosystem).value"
                                    :placeholder="placeholder"
                                    class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
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
