<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';

import { useI18n } from 'vue-i18n';


// define a model with two booleans: local communities presence and protected areas presence
const props = defineProps({
    modelValue: {
        type: Object as PropType<{
            localCommunities: number,
            protectedAreas: number
        }
        >, default: {
            localCommunities: undefined,
            protectedAreas: undefined
        }
    },
    edit: { type: Boolean, default: false },
    units: { type: String }
});

const { t } = useI18n();

const localCommunities = ref(props.modelValue.localCommunities);
const protectedAreas = ref(props.modelValue.protectedAreas);

const emit = defineEmits(['update:modelValue'])

watch([localCommunities, protectedAreas], ([localCommunities, protectedAreas]) => {
    emit('update:modelValue', { localCommunities, protectedAreas });
});
</script>

<template>
    <div
        v-if="edit"
        class="mt-2"
    >
        <div class="mb-2">
            {{ t('areaAndEcosystems.paAndTraditionalTerritories.theRestorationAreaHas') }}
            <input
                type="number"
                v-model="protectedAreas"
                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
            />
            {{ t('areaAndEcosystems.paAndTraditionalTerritories.protectedAreaOrOECM', { units }) }}
        </div>
        <div class="mb-2">
            {{ t('areaAndEcosystems.paAndTraditionalTerritories.theRestorationAreaHas') }}
            <input
                type="number"
                v-model="localCommunities"
                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md p-1"
            />
            {{ t('areaAndEcosystems.paAndTraditionalTerritories.indigenousAndTraditionalTerritory', { units }) }}
        </div>
    </div>
    <div
        v-else
        class="mb-2"
    >
        {{ t('areaAndEcosystems.paAndTraditionalTerritories.theRestorationAreaHas') }}
        <template v-if="protectedAreas !== undefined">
            {{ protectedAreas }}
        </template>
        <template v-else>
            <span class="text-gray-500 font-bold italic">n/a</span>
        </template>
        {{ t('areaAndEcosystems.paAndTraditionalTerritories.protectedAreaOrOECM', { units }) }}
        <br>
        {{ t('areaAndEcosystems.paAndTraditionalTerritories.theRestorationAreaHas') }}
        <template v-if="localCommunities !== undefined">
            {{ localCommunities }}
        </template>
        <template v-else>
            <span class="text-gray-500 font-bold italic">n/a</span>
        </template>
        {{ t('areaAndEcosystems.paAndTraditionalTerritories.indigenousAndTraditionalTerritory', { units }) }}
    </div>
</template>