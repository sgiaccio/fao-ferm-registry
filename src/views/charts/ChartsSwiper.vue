<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

import CCILCChart from './CCILCChart.vue';
import LPDChart from './LPDChart.vue';

const chartComnponents = [CCILCChart, LPDChart];

const modules = [Navigation];

const props = defineProps<{
    area: any
}>();

// Track active slide index and refs to each chart component
const activeIndex = ref(0);
const chartRefs = ref<Element[]>([]);

const emit = defineEmits(['zoomToArea']);

// onMounted(() => {
//     if (chartRefs.value) {
//         console.log(chartRefs);
//         chartRefs.value[0].loadData();
//     }
// });

function slideChanged(swiper) {
    activeIndex.value = swiper.activeIndex;
    // chartRefs.value[activeIndex.value].loadData();
}

// watch(
//     () => props.area,
//     (_newArea) => {
//         chartRefs.value[activeIndex.value].loadData();
//     }
// ); // it's not immediate because onMounted is already loading the first chart
</script>

<template>
    <swiper
        :navigation="true"
        :modules="modules"
        class="bg-white shadow rounded-md"
        @slideChange="slideChanged"
        :autoHeight="true"
        :preventClicks="false"
        :preventClicksPropagation="false"
        :touchStartPreventDefault="false"
    >
        <swiper-slide
            v-for="(component, index) in chartComnponents"
            :key="index"
            :area="area"
        >
            <component
                :is="component"
                :area="area"
                :isActive="+index === +activeIndex"
                ref="chartRefs"
            />
        </swiper-slide>
        <!-- <swiper-slide class="h-full">
            <CCILCChart
                ref="ccChartRef"
                :area="area"
            />
        </swiper-slide>
        <swiper-slide class="h-full">
            <LPDChart
                ref="lpdChartRef"
                :area="area"
            />
        </swiper-slide> -->
    </swiper>
</template>