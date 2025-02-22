<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <p class="pt-4">
        <i18n-t keypath="areaAndEcosystems.info.realms">
            <template v-slot:realms>
                <span class="font-bold">{{ t('areaAndEcosystems.info.realmsTitle') }}</span>
            </template>
        </i18n-t>
    </p>
    <p class="pt-4">
        <i18n-t keypath="areaAndEcosystems.info.biomes">
            <template v-slot:biomes>
                <span class="font-bold">{{ t('areaAndEcosystems.info.biomesTitle') }}</span>
            </template>
        </i18n-t>
    </p>
    <p class="pt-4">
        <i18n-t keypath="areaAndEcosystems.info.ecosystemGroups">
            <template v-slot:ecosystemGroups>
                <span class="font-bold">{{ t('areaAndEcosystems.info.ecosystemGroupsTitle') }}</span>
            </template>
        </i18n-t>
    </p>
    <p class="pt-4">
        {{ t('areaAndEcosystems.info.spatialInfo') }}
    </p>
</template>
