<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

import * as echarts from 'echarts/core';
import { GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// import { MapPinIcon } from '@heroicons/vue/24/outline'


const { t } = useI18n();
const props = defineProps<{
    areas: any
}>();

const emit = defineEmits(['zoomToArea']);

const modules = [Navigation];

echarts.use([GridComponent, BarChart, CanvasRenderer]);

function getAreasWithMonitoring(areas: any) {
    return areas
        .map((area: any) => Object.values(area)[0]).
        filter((areaData: any) => {
            if (!areaData) return false;
            const { goalIndicators, customIndicators } = areaData;

            let flag = false;
            if (goalIndicators) {
                flag = goalIndicators.some((indicator: any) => indicator.monitoring?.length > 0);
            }
            if (customIndicators) {
                flag ||= customIndicators.some((indicator: any) => indicator.monitoring?.length > 0);
            }
            return flag;
        });
}

const areasWithMonitoring = computed(() => {
    const areasWithMonitoring_ = getAreasWithMonitoring(props.areas);

    const areasWithMonitoringRet = [] as { areaData: any, indicator: any, monitoring: any, action?: any }[];
    areasWithMonitoring_.forEach((area: any) => {
        const areaClone = { ...area };
        delete (areaClone.goalIndicators);
        delete (areaClone.customIndicators);

        if (area.goalIndicators?.length > 0) {
            area.goalIndicators.forEach((indicator: any) => {
                if (indicator.monitoring?.length > 0) {
                    areasWithMonitoringRet.push({
                        areaData: areaClone,
                        indicator: indicator.indicator,
                        action: indicator.action,
                        monitoring: indicator.monitoring
                    });
                }
            });
        }
        if (area.customIndicators?.length > 0) {
            area.customIndicators.forEach((indicator: any) => {
                if (indicator.monitoring?.length > 0) {
                    areasWithMonitoringRet.push({
                        areaData: areaClone,
                        indicator: indicator.indicator,
                        monitoring: indicator.monitoring,
                    });
                }
            });
        }
    });
    return areasWithMonitoringRet;
});

const chartDivRefs = ref<HTMLDivElement[] | null>(null);

function slideChanged(swiper: any) {
    if (chartDivRefs.value?.length === 0) {
        return;
    }
    const slideIndex = swiper.activeIndex;

    // init the related chart
    const myChart = echarts.init(chartDivRefs.value[slideIndex]);
    const monitoring = areasWithMonitoring.value[slideIndex]?.monitoring || [];

    const option = {
        xAxis: {
            type: 'category',
            data: monitoring.map((item: any) => item.year),
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: monitoring.map((item: any) => item.value),
                type: 'bar',
                itemStyle: {
                    borderRadius: [8, 8, 0, 0]
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        }
    };

    myChart.setOption(option);
}

// when areasWithMonitoring changes, move to the first slide
watch([areasWithMonitoring, chartDivRefs], () => {
    if (chartDivRefs.value === null) {
        return;
    }
    slideChanged({ activeIndex: 0 });
}, { immediate: true });
</script>

<template>
    <swiper
        v-if="areasWithMonitoring?.length > 0"
        :navigation="true"
        :modules="modules"
        class="bg-white shadow rounded-md"
        @slideChange="slideChanged"
        :autoHeight="true"
        :effect="'cube'"
    >
        <template v-for="area in areasWithMonitoring">
            <swiper-slide
                v-if="area.monitoring?.length > 0"
                class="h-full"
            >
                <div class="px-0 py-5 sm:p-6">
                    <div class="px-4 sm:px-0 flex">
                        <h3
                            :class="['text-base font-semibold leading-7 text-gray-900 flex-grow', area.areaData.uuid ? 'cursor-pointer' : '']"
                            @click="area.areaData.uuid && emit('zoomToArea', area.areaData.uuid)"
                        >{{ area.areaData.siteName || 'Area without name' }}</h3>
                        <!-- <MapPinIcon
                            v-if="area.areaData.uuid"
                            class="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer"
                            @click="area.areaData.uuid && emit('zoomToArea', area.areaData.uuid)"
                        /> -->
                    </div>
                    <dl class="divide-y divide-gray-100">
                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt class="text-sm font-medium leading-6 text-gray-900">
                                {{ t('publicPagePreview.areasCharts.indicator') }}
                            </dt>
                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ area.indicator.indicator.trim() }}</dd>
                        </div>
                        <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt class="text-sm font-medium leading-6 text-gray-900">
                                {{ t('publicPagePreview.areasCharts.metric') }}
                            </dt>
                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ area.indicator.metric.trim() }} <span class="whitespace-nowrap">[{{ area.indicator.unit.trim() }}]</span></dd>
                        </div>
                        <div
                            v-if="area.indicator.action"
                            class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
                        >
                            <dt class="text-sm font-medium leading-6 text-gray-900">
                                {{ t('publicPagePreview.areasCharts.action') }}
                            </dt>
                            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ area.indicator.action.trim() }}</dd>
                        </div>
                    </dl>
                    <div
                        ref="chartDivRefs"
                        :class="`${area.monitoring.length < 2 ? 'h-0' : 'h-72'}`"
                    ></div>
                    <div
                        v-if="area.monitoring.length < 2"
                        class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mt-2"
                    >
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        {{ t('publicPagePreview.areasCharts.year') }}
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        Value
                                        {{ t('publicPagePreview.areasCharts.value') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr
                                    v-for="item in area.monitoring"
                                    :key="item.year"
                                >
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ item.year }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.value }} {{ area.indicator.unit }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </swiper-slide>
        </template>
    </swiper>
</template>
