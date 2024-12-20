<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';

import ResultPanel from './ResultPanel.vue';


defineProps<{
    sdgs: number[]
}>();

const { t } = useI18n();

// SDG images
import sdg1 from '@/assets/SDG/E_GIF_01_small_static.gif';
import sdg2 from '@/assets/SDG/E_GIF_02_small_static.gif';
import sdg3 from '@/assets/SDG/E_GIF_03_small_static.gif';
import sdg4 from '@/assets/SDG/E_GIF_04_small_static.gif';
import sdg5 from '@/assets/SDG/E_GIF_05_small_static.gif';
import sdg6 from '@/assets/SDG/E_GIF_06_small_static.gif';
import sdg7 from '@/assets/SDG/E_GIF_07_small_static.gif';
import sdg8 from '@/assets/SDG/E_GIF_08_small_static.gif';
import sdg9 from '@/assets/SDG/E_GIF_09_small_static.gif';
import sdg10 from '@/assets/SDG/E_GIF_10_small_static.gif';
import sdg11 from '@/assets/SDG/E_GIF_11_small_static.gif';
import sdg12 from '@/assets/SDG/E_GIF_12_small_static.gif';
import sdg13 from '@/assets/SDG/E_GIF_13_small_static.gif';
import sdg14 from '@/assets/SDG/E_GIF_14_small_static.gif';
import sdg15 from '@/assets/SDG/E_GIF_15_small_static.gif';
import sdg16 from '@/assets/SDG/E_GIF_16_small_static.gif';
import sdg17 from '@/assets/SDG/E_GIF_17_small_static.gif';
import sdg1hover from '@/assets/SDG/E_GIF_01_small.gif';
import sdg2hover from '@/assets/SDG/E_GIF_02_small.gif';
import sdg3hover from '@/assets/SDG/E_GIF_03_small.gif';
import sdg4hover from '@/assets/SDG/E_GIF_04_small.gif';
import sdg5hover from '@/assets/SDG/E_GIF_05_small.gif';
import sdg6hover from '@/assets/SDG/E_GIF_06_small.gif';
import sdg7hover from '@/assets/SDG/E_GIF_07_small.gif';
import sdg8hover from '@/assets/SDG/E_GIF_08_small.gif';
import sdg9hover from '@/assets/SDG/E_GIF_09_small.gif';
import sdg10hover from '@/assets/SDG/E_GIF_10_small.gif';
import sdg11hover from '@/assets/SDG/E_GIF_11_small.gif';
import sdg12hover from '@/assets/SDG/E_GIF_12_small.gif';
import sdg13hover from '@/assets/SDG/E_GIF_13_small.gif';
import sdg14hover from '@/assets/SDG/E_GIF_14_small.gif';
import sdg15hover from '@/assets/SDG/E_GIF_15_small.gif';
import sdg16hover from '@/assets/SDG/E_GIF_16_small.gif';
import sdg17hover from '@/assets/SDG/E_GIF_17_small.gif';
const sdgsSources = [sdg1, sdg2, sdg3, sdg4, sdg5, sdg6, sdg7, sdg8, sdg9, sdg10, sdg11, sdg12, sdg13, sdg14, sdg15, sdg16, sdg17];
const sdgsSourcesHover = [sdg1hover, sdg2hover, sdg3hover, sdg4hover, sdg5hover, sdg6hover, sdg7hover, sdg8hover, sdg9hover, sdg10hover, sdg11hover, sdg12hover, sdg13hover, sdg14hover, sdg15hover, sdg16hover, sdg17hover];
const sdgLinks = ['poverty', 'hunger', 'health', 'education', 'gender-equality', 'water-and-sanitation', 'energy', 'economic-growth', 'infrastructure-industrialization', 'inequality', 'cities', 'sustainable-consumption-production', 'climate-change', 'oceans', 'biodiversity', 'peace-justice', 'globalpartnerships'];

const currentSrcs = ref([...sdgsSources]);
function changeSrc(index: number, isHover: boolean) {
    currentSrcs.value[index] = isHover ? sdgsSourcesHover[index] : sdgsSources[index];
}
</script>

<template>
    <ResultPanel
        :title="t('publicPagePreview.sdgPanel.title')"
        titleLink="https://www.un.org/sustainabledevelopment/"
    >
        <div
            v-if="sdgs?.length > 0"
            class="grid grid-cols-4 gap-4"
        >
            <a
                :href="`https://www.un.org/sustainabledevelopment/${sdgLinks[sdg - 1]}`"
                target="_blank"
                v-for="sdg in sdgs"
                :key="sdg"
                class="rounded overflow-hidden shadow-sm hover:scale-110 transition-all hover:shadow-md hover:brightness-105"
            >
                <img
                    :key="sdg"
                    :src="currentSrcs[sdg - 1]"
                    :alt="`SDG ${sdg}`"
                    @mouseover="changeSrc(sdg - 1, true)"
                    @mouseleave="changeSrc(sdg - 1, false)"
                />
            </a>
        </div>
        <div
            v-else
            class="italic text-gray-500"
        >
            {{ t('publicPagePreview.sdgPanel.noContributions') }}
        </div>
    </ResultPanel>
</template>