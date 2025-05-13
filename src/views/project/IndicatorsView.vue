<script setup lang="ts">
import { ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

import RecursiveRadio from '@/components/inputs/base/RecursiveRadio.vue';

import { roundToPrecisionAsString } from '@/lib/util';

import IndicatorsList from './IndicatorsList.vue';
import CustomIndicatorsList from './CustomIndicatorsList.vue';

import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';
import { getAreaValue } from '@/lib/areaUtil';

withDefaults(
    defineProps<{
        edit?: boolean;
    }>(),
    {
        edit: true,
    },
);

const { t } = useI18n();

const store = useProjectStore();
const menus = useMenusStore().menus;

function applyToAll() {
    if (
        !confirm(
            'Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.',
        )
    )
        return;

    if (store.projectAreas.length < 2) return;

    const areaValue = getAreaValue(store.projectAreas[0]);
    const gefIndicator = areaValue.gefIndicator;
    const goalIndicators = areaValue.goalIndicators;

    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            const areaToChange = getAreaValue(area);
            if (gefIndicator) {
                areaToChange.gefIndicator = gefIndicator;
            }
            if (goalIndicators && goalIndicators.length) {
                areaToChange.goalIndicators = goalIndicators.map((i) => ({
                    indicator: i.indicator.clone(),
                }));
            }
        }
    });
}

// Delete restorationType and tenureStatus for GEF3 indicators. This should be done in the store, but will be done here for now.
watch(
    () => store.projectAreas,
    (areas) =>
        areas.forEach((area) => {
            const areaValue = getAreaValue(area);
            if (!areaValue.gefIndicator?.startsWith('GEF3')) {
                delete areaValue.restorationType;
                delete areaValue.tenureStatus;
            }
        }),
    { deep: true },
);

ref(new Array(store.projectAreas.length).fill(new Map()));
</script>

<template>
    <TabTemplate :title="t('indicators.title')">
        <template #description>
            <template v-if="store.project.reportingLine === 'GEF'">
                <p>
                    {{ t('indicators.description.gef.intro') }}
                </p>
                <p>
                    <i18n-t keypath="indicators.description.gef.links">
                        <template #gefCoreIndicatorsLink>
                            <a
                                href="https://www.thegef.org/sites/default/files/documents/2022-09/Results_Framework_Guidelines_2022_06_30.pdf"
                                target="_blank"
                                class="text-blue-600 underline hover:text-blue-500"
                            >
                                {{ t('indicators.description.gef.here') }}
                            </a>
                        </template>
                    </i18n-t>
                </p>
            </template>
            <template v-else>
                <p>
                    <i18n-t keypath="indicators.description.intro">
                        <template v-slot:auroraLink>
                            <a
                                href="https://www.auroramonitoring.org"
                                target="_blank"
                                class="text-ferm-blue-dark-700 underline hover:text-ferm-blue-dark-500"
                            >
                                {{ $t('indicators.auroraTool') }}
                            </a>
                        </template>
                    </i18n-t>
                </p>
                <p class="pt-4">
                    {{ t('indicators.description.noIndicators') }}
                </p>
                <p class="pt-4">
                    {{ t('indicators.description.selectIndicators') }}
                </p>
                <p class="pt-4">
                    {{ t('indicators.description.customIndicator') }}
                </p>
                <p class="pt-4">
                    {{ t('indicators.description.sdgContribution') }}
                </p>
                <p class="pt-4">
                    {{ t('references') }}
                </p>
                <p class="pt-1">
                    FAO and WRI. 2019. The Road to Restoration: A Guide to
                    Identifying Priorities and Indicators for Monitoring Forest
                    and Landscape Restoration. Rome, Washington, DC.
                </p>
                <p class="pt-4">
                    FAO and UNEP. 2022. Global indicators for monitoring
                    ecosystem restoration — A contribution to the UN Decade on
                    Ecosystem Restoration. Rome, FAO.
                    <a
                        href="https://doi.org/10.4060/cb9982en"
                        target="_blank"
                        class="text-ferm-blue-dark-700 underline hover:text-ferm-blue-dark-500"
                    >
                        https://doi.org/10.4060/cb9982en
                    </a>
                </p>
            </template>
        </template>
        <template #default>
            <div class="pt-8" v-if="store.project.reportingLine !== 'GEF'">
                <LabelFormGroup
                    :label="t('indicators.totalArea')"
                    :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`"
                />
                <div
                    v-if="store.projectAreas?.length"
                    class="flex flex-col gap-y-4"
                >
                    <div
                        v-for="(area, i) in store.projectAreas"
                        class="border-2 px-3 pt-2 pb-3 rounded-lg border-gray-300"
                    >
                        <div class="flex flex-row my-3">
                            <div
                                class="text-gray-500 text-lg font-bold mb-2 flex-grow"
                            >
                                {{ $t('areaAndEcosystems.area') }}
                                {{ i + 1
                                }}<span
                                    class="text-black"
                                    v-if="getAreaValue(area).siteName"
                                    >: {{ getAreaValue(area).siteName }}
                                </span>
                            </div>
                            <div v-if="edit">
                                <button
                                    v-if="
                                        i === 0 && store.projectAreas.length > 1
                                    "
                                    type="button"
                                    class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="applyToAll"
                                >
                                    {{ t('edit.applyToAll') }}
                                </button>
                            </div>
                        </div>

                        <IndicatorsList
                            v-model="getAreaValue(area).goalIndicators"
                            :edit="edit"
                        />

                        <CustomIndicatorsList
                            v-model="getAreaValue(area).customIndicators"
                            :edit="edit"
                            class="mt-4"
                        />
                    </div>
                </div>
                <i18n-t
                    v-else-if="edit"
                    keypath="inputs.validation.area.required"
                    tag="div"
                    class="text-red-600 font-bold text-lg pb-4 mt-6"
                >
                    <template #areaTabLink>
                        <router-link
                            class="text-blue-400 underline hover:text-blue-600"
                            :to="{ path: 'area' }"
                        >
                            {{ t('inputs.validation.area.areaTabLinkText') }}
                        </router-link>
                    </template>
                </i18n-t>
                <div v-else>
                    <div class="text-lg italic text-gray-600">
                        {{ $t('inputs.noneSelected') }}
                    </div>
                </div>
            </div>

            <!-- GEF -->
            <div v-else class="pt-8">
                <LabelFormGroup
                    :label="t('indicators.totalArea')"
                    :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`"
                />

                <!-- Area by indicator -->
                <div class="mb-6">
                    <!-- <h3 class="text-xl font-semibold leading-6 text-gray-900">Area by indicator</h3> -->
                    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div
                            v-for="[
                                indicator,
                                area,
                            ] in store.areaByGefIndicator()"
                            :key="indicator"
                            class="overflow-hidden rounded-lg bg-gray-100 px-4 py-5 shadow sm:p-6 flex flex-col"
                        >
                            <dt
                                class="flex-grow text-sm font-medium text-gray-500"
                            >
                                {{
                                    getRecursiveMenuLabel(
                                        indicator,
                                        menus.gefIndicators,
                                    )
                                }}
                            </dt>
                            <dd
                                class="mt-1 text-2xl font-semibold tracking-tight text-gray-900"
                            >
                                {{ area.toFixed(2) }} Ha
                            </dd>
                        </div>
                    </dl>
                </div>

                <div
                    v-if="store.projectAreas?.length"
                    class="flex flex-col gap-y-4"
                >
                    <div
                        v-for="(area, i) in store.projectAreas"
                        class="border-2 rounded-lg border-gray-300 divide-y-2"
                    >
                        <div class="flex flex-row px-3 py-5">
                            <div
                                class="text-gray-500 text-lg font-bold flex-grow"
                            >
                                {{ $t('areaAndEcosystems.area') }}
                                {{ i + 1
                                }}<span
                                    class="text-black"
                                    v-if="getAreaValue(area).siteName"
                                    >: {{ getAreaValue(area).siteName }}</span
                                >
                            </div>
                            <div v-if="edit">
                                <button
                                    v-if="
                                        i === 0 && store.projectAreas.length > 1
                                    "
                                    type="button"
                                    class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="applyToAll"
                                >
                                    {{ t('edit.applyToAll') }}
                                </button>
                            </div>
                        </div>
                        <div class="px-3 py-5">
                            <h1 class="akrobat text-2xl font-bold mb-3">
                                {{ $t('indicators.gef.indicators') }}
                            </h1>
                            <RecursiveRadio
                                v-model="getAreaValue(area).gefIndicator"
                                :options="menus.gefIndicators"
                                :edit="edit"
                            />
                        </div>
                        <div class="px-3 py-5">
                            <h1 class="akrobat text-2xl font-bold mb-3">
                                {{ $t('indicators.gef.projectIndicators') }}
                            </h1>
                            <IndicatorsList
                                v-model="getAreaValue(area).goalIndicators"
                                :edit="edit"
                            />
                            <CustomIndicatorsList
                                v-model="getAreaValue(area).customIndicators"
                                :edit="edit"
                                class="mt-4 bg-red-50"
                            />
                        </div>
                    </div>
                </div>
                <i18n-t
                    v-else-if="edit"
                    keypath="inputs.validation.area.required"
                    tag="div"
                    class="text-red-600 font-bold text-lg pb-4 mt-6"
                >
                    <template #areaTabLink>
                        <router-link
                            class="text-blue-400 underline hover:text-blue-600"
                            :to="{ path: 'area' }"
                        >
                            {{ t('inputs.validation.area.areaTabLinkText') }}
                        </router-link>
                    </template>
                </i18n-t>
                <div v-else>
                    <div class="text-lg italic text-gray-600">
                        {{ $t('inputs.noneSelected') }}
                    </div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
