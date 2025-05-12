<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from '../TabTemplate.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import TextInput from '@/components/inputs/base/TextInput.vue';
import { ref } from 'vue';
import { getAreaValue } from "@/lib/areaUtil";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useProjectStore();
const menus = useMenusStore().menus;

function applyToAll() {
    if (!confirm('Are you sure you want to apply this activity to all areas? Your current selections will be overwritten.')) return;

    if (store.projectAreas.length < 2) return;

    const value = getAreaValue(store.projectAreas[0]);
    const activities = value.activities;

    if (!activities) return;
    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            const areaValue = getAreaValue(area);
            areaValue.activities = [...activities];
        }
    });
}

const otherActivitiesInputEnabled = ref<boolean[]>(new Array(store.projectAreas.length).fill(false));

function toggleOtherActivitiesInput(i: number) {
    (otherActivitiesInputEnabled.value)[i] = !(otherActivitiesInputEnabled.value)[i];
}
</script>

<template>
    <TabTemplate :title="$t('activities.title')">
        <template #description>
            <p v-if="store.project.reportingLine === 'GEF'">
                <i18n-t keypath="activities.gef.description">
                    <template v-slot:teerLink>
                        <a
                            href="https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/"
                            target="_blank"
                            class="text-blue-600 underline hover:text-blue-500"
                        >https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/</a>
                    </template>
                    <template v-slot:ipbesLink>
                        <a
                            href="https://www.ipbes.net/assessment-reports/ldr"
                            target="_blank"
                            class="text-blue-600 underline hover:text-blue-500"
                        >https://www.ipbes.net/assessment-reports/ldr</a>
                    </template>
                </i18n-t>
            </p>
            <p v-else>
                <i18n-t keypath="activities.description">
                    <template v-slot:teerLink>
                        <a
                            href="https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/"
                            target="_blank"
                            class="text-blue-600 underline hover:text-blue-500"
                        >
                            https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/
                        </a>
                    </template>
                    <template v-slot:ipbesLink>
                        <a
                            href="https://www.ipbes.net/assessment-reports/ldr"
                            target="_blank"
                            class="text-blue-600 underline hover:text-blue-500"
                        >
                            https://www.ipbes.net/assessment-reports/ldr
                        </a>
                    </template>
                </i18n-t>
            </p>
        </template>
        <template #default>
            <div
                v-if="store.projectAreas?.length"
                class="flex flex-col gap-y-4 pt-6"
            >
                <div
                    v-for="(area, i) in store.projectAreas"
                    class="border-2 px-3 py-2 rounded-lg border-gray-300"
                >
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 text-lg font-bold mb-2 flex-grow">
                            {{ t('areaAndEcosystems.area') }}
                            {{ i + 1 }}<span
                                class="text-black"
                                v-if="getAreaValue(area).siteName"
                            >: {{ getAreaValue(area).siteName }}</span>
                        </div>
                        <div v-if="edit">
                            <button
                                v-if="i === 0 && store.projectAreas.length > 1"
                                type="button"
                                class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                @click="applyToAll"
                            >
                                {{ t('edit.applyToAll') }}
                            </button>
                        </div>
                    </div>
                    <h1 class="text-2xl font-bold mb-2">
                        {{ t('activities.title') }}
                    </h1>
                    <RecursiveMenu
                        :edit="edit"
                        v-model="getAreaValue(area).activities"
                        :options="menus.activities"
                    />

                    <div
                        v-if="edit"
                        class="flex flex-row items-center mt-1 w-full"
                    >
                        <div class="flex items-start">
                            <div class="flex h-5 items-center">
                                <input
                                    :id="`otherActivities_${i}`"
                                    @change="() => toggleOtherActivitiesInput(i)"
                                    name="otherActivities"
                                    type="checkbox"
                                    :checked="otherActivitiesInputEnabled[i]"
                                    class="ml-1 mr-2 cursor-pointer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                >
                            </div>
                            <div class="text-sm">
                                <label
                                    :for="`otherActivities_${i}`"
                                    class="font-bold cursor-pointer mr-4"
                                >
                                    <!-- Other activities -->
                                    {{ t('activities.otherActivities') }}
                                </label>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <TextInput
                                :enabled="otherActivitiesInputEnabled[i]"
                                :edit="edit"
                                v-model="getAreaValue(area).activitiesOther"
                            />
                        </div>
                    </div>
                    <div v-else>
                        <div
                            v-if="getAreaValue(area).activitiesOther"
                            class="text-sm mt-6 "
                        >
                            <span class="font-bold text-gray-700">Other activities:</span> {{ getAreaValue(area).activitiesOther }}
                        </div>
                    </div>
                </div>
            </div>
            <i18n-t
                v-else-if="edit"
                keypath="inputs.validation.area.required"
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
                <div class="text-lg italic mt-6 text-gray-600">{{ $t('inputs.noneSelected') }}</div>
            </div>
        </template>
    </TabTemplate>
    <!--    <pre class="text-white">{{ JSON.stringify(store.projectAreas, null, 2) }}</pre>-->
</template>
