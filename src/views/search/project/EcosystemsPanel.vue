<script setup lang="ts">
import { computed } from 'vue';

import { useMenusStore } from '@/stores/menus';

import ResultPanel from './ResultPanel.vue';

import { getAllSelectedItemsInAreas, getRecursiveMenuLabel } from '@/lib/util';

import { groupBiomesByRealm } from '@/lib/util';

import terrestrial from '@/assets/iucn_realms/terrestrial.svg';
import marine from '@/assets/iucn_realms/marine.svg';
import freshwater from '@/assets/iucn_realms/freshwater.svg';
import subterranean from '@/assets/iucn_realms/subterranean.svg';

const { menus } = useMenusStore();

const props = defineProps<{
    areas: any[]
}>();

const realms = [
    { value: 'T', label: 'Terrestrial realm', color: '#1f77b4', borderColor: '#0d4d8a' },
    { value: 'M', label: 'Marine realm', color: '#ff7f0e', borderColor: '#cc6608' },
    { value: 'F', label: 'Freshwater realm', color: '#2ca02c', borderColor: '#1e6a1e' },
    { value: 'S', label: 'Subterranean realm', color: '#d62728', borderColor: '#9a1c1c' },
    { value: 'MT', label: 'Marine-Terrestrial realm', color: '#9467bd', borderColor: '#6b4c8a' },
    { value: 'SF', label: 'Subterranean-Freshwater realm', color: '#8c564b', borderColor: '#623c34' },
    { value: 'FM', label: 'Freshwater-Marine realm', color: '#e377c2', borderColor: '#b25399' },
    { value: 'MFT', label: 'Marine-Freshwater-Terrestrial realm', color: '#7f7f7f', borderColor: '#595959' },
    { value: 'SM', label: 'Subterranean-Marine realm', color: '#bcbd22', borderColor: '#8a8c16' },
    { value: 'TF', label: 'Terrestrial-Freshwater realm', color: '#17becf', borderColor: '#11a3ac' }
];

function getRealmName(value: string) {
    return realms.find(r => r.value === value)?.label;
}

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
    return groupBiomesByRealm(areasBiomes, realms);
});
</script>

<template>
    <!-- {{ groupedBiomes }}
    <div v-for="realm in groupedBiomes">
        {{ getRealmName(realm.realm) }}
        <div v-for="biome in realm.biomes">
            {{ getRecursiveMenuLabel(biome, menus.iucnEcosystems).split(' - ')[1] }}
        </div>
    </div> -->

    <ResultPanel
        title="Biomes"
        titleLink="https://global-ecosystems.org"
    >
        <div
            v-if="groupedBiomes.length === 0"
            class="italic text-gray-500"
        >No ecosystems</div>
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
                                :alt="getRealmName(realm.realm)"
                                class="w-8 h-8"
                            />
                        </div>
                        <div :class="getRealmImages(realm.realm).length === 2 ? 'ml-16' : getRealmImages(realm.realm).length === 3 ? 'ml-24' : 'ml-10'">
                            {{ getRealmName(realm.realm) }}
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