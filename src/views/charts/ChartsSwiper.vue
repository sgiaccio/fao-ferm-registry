<script setup lang="ts">
import { ref } from 'vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

import CCILCChart from './CCILCChart.vue';
import GFCChart from './GFCChart.vue';
import LPDChart from './LPDChart.vue';
import LCMChart from './LCMChart.vue';
import BiodiversityChart from './BiodiversityChart.vue';
import BiomassChart from './BiomassChart.vue';


const chartComnponents = [ CCILCChart, GFCChart, LCMChart, LPDChart, BiodiversityChart, BiomassChart ];

const modules = [ Navigation ];

defineProps<{
    area: any
}>();

// Track active slide index and refs to each chart component
const activeIndex = ref(0);
const chartRefs = ref<Element[]>([]);

function slideChanged(swiper: any) {
    activeIndex.value = swiper.activeIndex;
}
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
    </swiper>
</template>
