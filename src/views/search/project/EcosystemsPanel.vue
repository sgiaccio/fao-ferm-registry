<script setup lang="ts">
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { useMenusStore } from '@/stores/menus';

import ResultPanel from './ResultPanel.vue';

import { getAllSelectedItemsInAreas, getRecursiveMenuLabel } from '@/lib/util';

import { groupBiomesByRealm, getRealmLabel } from '@/lib/util';

import terrestrial from '@/assets/iucn_realms/terrestrial.svg';
import marine from '@/assets/iucn_realms/marine.svg';
import freshwater from '@/assets/iucn_realms/freshwater.svg';
import subterranean from '@/assets/iucn_realms/subterranean.svg';


const props = defineProps<{
    areas: any[]
}>();

const { t } = useI18n();

const { menus } = useMenusStore();

function getRealmImages(value: string) {
    switch (value) {
        case 'T':
            return [terrestrial];
        case 'M':
            return [marine];
        case 'F':
            return [freshwater];
        case 'S':
            return [subterranean];
        case 'MT':
            return [marine, terrestrial];
        case 'SF':
            return [subterranean, freshwater];
        case 'FM':
            return [freshwater, marine];
        case 'MFT':
            return [marine, freshwater, terrestrial];
        case 'SM':
            return [subterranean, marine];
        case 'TF':
            return [terrestrial, freshwater];
        default:
            return [];
    }
}

const areasBiomes = getAllSelectedItemsInAreas(props.areas, 'ecosystems', menus.iucnEcosystems);
const groupedBiomes = computed(() => {
    return groupBiomesByRealm(areasBiomes, menus.iucnEcosystems);
});
</script>

<template>
    <!-- {{ groupedBiomes }}
    <div v-for="realm in groupedBiomes">
        {{ getRealmLabel(realm.realm) }}
        <div v-for="biome in realm.biomes">
            {{ getRecursiveMenuLabel(biome, menus.iucnEcosystems).split(' - ')[1] }}
        </div>
    </div> -->

    <ResultPanel
        :title="t('publicPagePreview.ecosystemsPanel.title')"
        titleLink="https://global-ecosystems.org"
    >
        <div
            v-if="groupedBiomes.length === 0"
            class="italic text-gray-500"
        >
            {{ t('publicPagePreview.ecosystemsPanel.noBiomes') }}
    </div>
        <template v-else>
            <div
                v-for="realm in groupedBiomes"
                class="flex flex-col"
                key="realm.realm"
            >

                <div :class="['flex flex-row items-center relative h-8 mb-2']">
                    <a
                        :href="`https://global-ecosystems.org/explore/realms/${realm.realm}`"
                        target="_blank"
                        class="font-semibold hover:underline text-blue-700"
                    >
                        <div
                            v-for="(image, i) in getRealmImages(realm.realm)"
                            :key="image"
                            class="absolute top-0"
                            :style="`left: ${i * 23}px; z-index: ${i};`"
                        >
                            <img
                                :src="image"
                                :alt="getRealmLabel(realm.realm)"
                                class="w-8 h-8"
                            />
                        </div>
                        <div :class="getRealmImages(realm.realm).length === 2 ? 'ml-16' : getRealmImages(realm.realm).length === 3 ? 'ml-24' : 'ml-10'">
                            {{ getRealmLabel(realm.realm) }}
                        </div>
                    </a>
                </div>
                <div
                    v-for="biome in realm.biomes"
                    :key="biome"
                    class="py-.5"
                >
                    <a
                        :href="`https://global-ecosystems.org/explore/biomes/${biome}`"
                        target="_blank"
                        class="text-blue-700 hover:underline"
                    >
                        {{ getRecursiveMenuLabel(biome, menus.iucnEcosystems).split(' - ')[1] }}
                    </a>
                </div>
            </div>
        </template>
    </ResultPanel>
</template>