<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import SelectInput from './base/SelectInput.vue';

import {
    getGaulLevel0,
    getGaulLevel1,
    getGaulLevel2,
} from '@/firebase/firestore';

import { useMenusStore } from '@/stores/menus';
import { useProjectStore } from '@/stores/project';

import { getMenuSelectedLabel } from '@/components/project/menus';

import AreaEcosystemsView from '@/views/project/AreaEcosystemsView.vue';
import { generateYearOptions } from '@/lib/util';

// type AdminArea = {
//     code?: string,
//     name?: string,
//     children?: AdminArea
// }[]

const props = withDefaults(
    defineProps<{
        modelValue: {
            siteName: string;
            admin0?: string;
            admin1?: string;
            admin2?: string;
            area: number;
            activities: number[];
            ecosystems: number[];
            startingYear: number;
        };
        edit?: boolean;
        index: number;
        nAreas: number;
    }>(),
    { edit: true },
);

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const store = useProjectStore();
const menus = useMenusStore().menus;

const admin0 = ref(props.modelValue?.admin0);
const admin1 = ref(props.modelValue?.admin1);
const admin2 = ref(props.modelValue?.admin2);

const admin0Menu = ref();
const admin1Menu = ref();
const admin2Menu = ref();

onMounted(async () => {
    admin0Menu.value = await getGaulLevel0();
    watch(
        () => props.modelValue,
        (curr, prev) => {
            if (!store.project) return;

            if (curr.admin0 !== prev.admin0) {
                if (!prev.admin0) {
                    store.addCountriesFromAdminAreas();
                } else {
                    store.updateCountries();
                }
            }
        },
        { deep: true },
    );
});

watch(
    admin0,
    async (val, prev) => {
        if (val) {
            admin1Menu.value = (await getGaulLevel1(val)) || undefined;
        } else {
            admin1Menu.value = undefined;
        }
    },
    { immediate: true },
);

watch(admin0, async (val, prev) => {
    // if prev is null it means that the page was just loaded, don't change values
    // only change values when the selection was changed by the user
    if (prev) {
        admin1.value = undefined;
        admin2.value = undefined;
    }

    if (!val) emit('update:modelValue', undefined);
    emit('update:modelValue', {
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined,
    });
});

watch(
    admin1,
    async (val, prev) => {
        if (val) {
            if (!admin0.value) return;
            admin2Menu.value = await getGaulLevel2(admin0.value, val);
        } else {
            admin2Menu.value = undefined;
        }
    },
    { immediate: true },
);

watch(admin1, (val, prev) => {
    if (prev) {
        admin2.value = undefined;
    }

    if (!admin0.value && !val) emit('update:modelValue', undefined);
    emit('update:modelValue', {
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined,
    });
});

watch(admin2, (val) => {
    if (!admin0.value && !admin1.value && !val)
        emit('update:modelValue', undefined);
    emit('update:modelValue', {
        ...props.modelValue,
        admin0: admin0.value || undefined,
        admin1: admin1.value || undefined,
        admin2: admin2.value || undefined,
    });
});

const years = generateYearOptions(1950, 2050);
</script>

<template>
    <div class="font-bold text-xl">
        {{ t('inputs.aoi.administrativeArea') }}
    </div>
    <div class="flex flex-col gap-y-3">
        <div>
            <legend class="block text-sm font-medium leading-6 text-gray-900">
                {{ t('inputs.aoi.siteName') }}
            </legend>
            <template v-if="edit">
                <div class="mt-2 flex rounded-md shadow-sm">
                    <div
                        class="relative flex flex-grow items-stretch focus-within:z-10"
                    >
                        <input
                            type="text"
                            v-model="modelValue.siteName"
                            name="siteName"
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            </template>
            <div v-else>{{ modelValue.siteName }}</div>
        </div>
        <div>
            <legend class="block text-sm font-medium leading-6 text-gray-900">
                {{ t('inputs.areaSurface') }}
                [{{
                    getMenuSelectedLabel(
                        store.project.project.areaUnits,
                        menus.units,
                    )
                }}]
            </legend>
            <template v-if="edit">
                <div class="mt-2 flex rounded-md shadow-sm">
                    <div
                        class="relative flex flex-grow items-stretch focus-within:z-10"
                    >
                        <input
                            type="number"
                            v-model="modelValue.area"
                            name="area"
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            </template>
            <div v-else>{{ modelValue.area }}</div>
        </div>
        <div class="block text-sm font-medium leading-6 text-gray-900">
            {{ t('inputs.aoi.administrativeArea') }}
        </div>
        <SelectInput
            :edit="edit"
            v-model="admin0"
            :options="admin0Menu"
            _placeholder="Please select Country"
            :placeholder="t('inputs.aoi.selectCountry')"
        />
        <SelectInput
            :edit="edit"
            v-model="admin1"
            :options="admin1Menu"
            _placeholder="Please select Region"
            :placeholder="t('inputs.aoi.selectRegion')"
        />
        <SelectInput
            :edit="edit"
            v-model="admin2"
            :options="admin2Menu"
            _placeholder="Please select Province"
            :placeholder="t('inputs.aoi.selectProvince')"
        />
        <fieldset>
            <div class="md:mt-5 mb-5">
                <legend class="block text-sm font-bold text-gray-700 sm:mt-px">
                    {{ t('inputs.aoi.startingYear') }}
                </legend>
                <div
                    v-if="modelValue.startingYear || edit"
                    class="mt-2 flex rounded-md max-w-36"
                >
                    <SelectInput
                        :edit="edit"
                        v-model="modelValue.startingYear"
                        :options="years"
                    />
                </div>
                <div v-else>N/A</div>
            </div>
        </fieldset>
        <AreaEcosystemsView
            :edit="edit"
            :area="modelValue"
            :index="index"
            :nAreas="nAreas"
        />
    </div>
</template>
