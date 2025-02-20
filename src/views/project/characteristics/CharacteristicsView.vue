<script setup lang="ts">
import { ref, computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { useProjectStore } from '../../../stores/project';

import TabTemplate from "../../TabTemplate.vue";

import EarthMapView from '../EarthMapView.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useProjectStore();

const areasWithUuid = computed(() => store.projectAreas
    .map(a => Object.values(a)[0])
    .map((a: any, i) => ({ uuid: a.uuid, siteName: a.siteName || `Area ${i + 1}` }))
    .filter(a => !!a.uuid));

const earthMapView = ref();
</script>

<template>
    <TabTemplate :title="t('characteristics.title')">
        <template #description>
            <p>
                <i18n-t keypath="characteristics.description">
                    <template v-slot:earthMap>
                        <a
                            href="https://ferm.earthmap.org/"
                            target="_blank"
                            class="text-blue-600 underline hover:text-blue-500"
                        >EarthMap</a>
                    </template>
                    <template v-slot:earthMapHelp>
                        <a
                            href="https://help.earthmap.org/"
                            target="_blank"
                            class="text-blue-600 underline hover:text-blue-500"
                        >https://help.earthmap.org/</a>
                    </template>
                </i18n-t>
            </p>
            <h2 class="text-lg font-semibold mt-3">{{ t('characteristics.quickGuideTitle') }}</h2>
            <ul class="list-disc list-inside">
                <li>{{ t('characteristics.quickGuide.language') }}</li>
                <li>{{ t('characteristics.quickGuide.addLayers') }}</li>
                <li>{{ t('characteristics.quickGuide.adjustVisibility') }}</li>
                <li>{{ t('characteristics.quickGuide.layerInfo') }}</li>
                <li>{{ t('characteristics.quickGuide.areaAnalysis') }}</li>
                <li>{{ t('characteristics.quickGuide.zonalStats') }}</li>
                <li>{{ t('characteristics.quickGuide.pointStats') }}</li>
                <li>{{ t('characteristics.quickGuide.extendedInstructions') }}</li>
            </ul>
        </template>
        <template #default>
            <div class="mt-10">
                <EarthMapView
                    v-if="areasWithUuid.length > 0"
                    ref="earthMapView"
                    :countries="store.project.project.countries"
                    :projectId="store.id!"
                    :areas="areasWithUuid"
                />
            </div>
        </template>
    </TabTemplate>
</template>./BatChart.vue
