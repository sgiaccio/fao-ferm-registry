<script setup lang="ts">
import { ref, computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { TrashIcon } from '@heroicons/vue/20/solid';
import AdminArea from '@/components/inputs/AdminArea.vue';
import MapInput from '@/components/inputs/base/MapInput.vue';
import MapUpload from '@/components/inputs/base/MapUpload.vue';
import ShapefileUploadDialog from '@/views/project/ShapefileUploadDialog.vue';
import KmlKmzUploadDialog from '@/views/project/KmlKmzUploadDialog.vue';

import UpdateAreaMenu from '@/components/inputs/UpdateAreaMenu.vue';


const { t } = useI18n();

type AreaType = 'adminArea' | 'draw' | 'upload' | 'uploadKml';

type Area = Partial<Record<AreaType, any>>;

const props = defineProps<{
    modelValue: Area[];
    edit?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: Area[]): void;
}>();

type ComponentConfig = {
    component: any;
    newData: Record<string, any>;
    addItemLabel: string | ComputedRef<string>;
    addDialog?: any;
    calculatedProps: Array<{
        key: string;
        f: (area: any, i: number) => any;
    }>;
};

const multiInputComponents: Record<AreaType, ComponentConfig> = {
    adminArea: {
        component: AdminArea,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.addAdminArea')),
        calculatedProps: [
            { key: 'index', f: (_area, i) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    draw: {
        component: MapInput,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.drawPolygon')),
        calculatedProps: [
            { key: 'index', f: (_area, i) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    upload: {
        component: MapUpload,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.uploadShapefile')),
        addDialog: ShapefileUploadDialog,
        calculatedProps: [
            { key: 'index', f: (_area, i) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    uploadKml: {
        component: MapUpload,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.uploadGeoJson')),
        addDialog: KmlKmzUploadDialog,
        calculatedProps: [
            { key: 'index', f: (_area, i) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
};

const nShow = ref(25);
const hasMorePages = computed(() => nShow.value && nShow.value < props.modelValue.length);
const selectedInputType = ref<AreaType>('adminArea');

// Add dialog state
const showShapefileDialog = ref(false);
const showKmlDialog = ref(false);

// Add dialog handlers
function handleShapefileUpload(data: any) {
    const newArea = { upload: data };
    emit('update:modelValue', [...props.modelValue, newArea]);
    showShapefileDialog.value = false;
}

function handleKmlUpload(data: any) {
    const newArea = { uploadKml: data };
    emit('update:modelValue', [...props.modelValue, newArea]);
    showKmlDialog.value = false;
}

function showMore() {
    if (hasMorePages.value && nShow.value) {
        nShow.value += 25;
    }
}

function deleteArea(index: number) {
    if (confirm(t('inputs.aoi.deleteAreaConfirm'))) {
        const newValue = [...props.modelValue];
        newValue.splice(index, 1);
        emit('update:modelValue', newValue);
    }
}

function addArea() {
    const newArea = {};
    newArea[selectedInputType.value] = multiInputComponents[selectedInputType.value].newData;
    emit('update:modelValue', [...props.modelValue, newArea]);
}

function getAreaType(area: Area): AreaType {
    return Object.keys(area)[0] as AreaType;
}

function numbering(i: number, v: any) {
    const key = Object.keys(v)[0];
    const localizedArea = t('areaAndEcosystems.area');
    if (key === 'adminArea') {
        return `${localizedArea} ${i + 1}`;
    } else if (key === 'draw') {
        return `${localizedArea} ${i + 1}`;
    } else if (key === 'upload') {
        const value = v[key];
        return `${localizedArea} ${value.shapeId || i + 1}`;
    } else if (key === 'uploadKml') {
        return `${localizedArea} ${i + 1}`;
    } else {
        return `Unknown area type: ${key}`;
    }
}

// function changeType(i: number, type: AreaType) {
//     // const newArea = { [type]: multiInputComponents[type].newData } as Area;
//     // const newValue = [...props.modelValue];
//     // newValue[i] = newArea;
//     // emit('update:modelValue', newValue);
//     const newValue = [...props.modelValue];
//     newValue[i] = { [type]: multiInputComponents[type].newData } as Area;
//     // emit('update:modelValue', newValue);
//     return newValue;
// }

function handleAreaUpdate(i: number, area: Area) {
    const newValue = [...props.modelValue];
    newValue[i] = area
    emit('update:modelValue', newValue);
}

function closeAllDialogs() {
    showShapefileDialog.value = false;
    showKmlDialog.value = false;
}

function addItemFromDialog(type: string, dataArr: any) {
    const newValues = dataArr.map(d => ({ [type]: d }));
    const tempProp = props.modelValue ? [...props.modelValue, ...newValues] : newValues

    emit('update:modelValue', tempProp);

    closeAllDialogs();
}
</script>

<template>
    <div class="border-2 rounded-md divide-y-2 border-stone-300 divide-stone-300 bg-white overflow-hidden">
        <div
            v-for="(area, i) in nShow ? modelValue.slice(0, nShow) : modelValue"
            :key="i"
            class="p-3"
        >
            <div class="text-gray-400 text-lg font-bold">
                {{ numbering(i, area) }}
            </div>
            <component
                :is="multiInputComponents[getAreaType(area)].component"
                v-model="area[getAreaType(area)]"
                :edit="edit"
                :index="i"
                :nAreas="modelValue.length"
            />
            <UpdateAreaMenu
                v-if="edit"
                :components="multiInputComponents"
                :area="area"
                :edit="edit"
                :index="i"
                :nAreas="modelValue.length"
                :project="null"
                @done="(data) => handleAreaUpdate(i, data)"
            />
            <div
                v-if="edit"
                class="w-full text-orange-600 text-right hover:text-orange-500"
            >
                <button
                    type="button"
                    @click="deleteArea(i)"
                >
                    <TrashIcon class="h-5 w-5" />
                </button>
            </div>
        </div>

        <div
            v-if="edit"
            class="flex p-3 gap-x-3 flex-wrap"
        >
            <button
                v-for="(component, type) in multiInputComponents"
                :key="type"
                type="button"
                @click="() => {
                    selectedInputType = type as AreaType;
                    if (type === 'upload') {
                        showShapefileDialog = true;
                    } else if (type === 'uploadKml') {
                        showKmlDialog = true;
                    } else {
                        addArea();
                    }
                }"
                class="inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {{ typeof component.addItemLabel === 'string' ? component.addItemLabel : component.addItemLabel.value }}
            </button>
        </div>

        <div
            v-if="nShow"
            class="flex flex-row flex-1 text-right py-4 pr-3 items-center justify-end gap-x-3 bg-slate-50"
        >
            <div>{{ Math.min(nShow, modelValue.length) }} of {{ modelValue.length }}</div>
            <button
                v-if="hasMorePages"
                type="button"
                @click="showMore"
                class="inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {{ t('inputs.aoi.showMore') }}
            </button>
        </div>
    </div>

    <!-- Add dialogs -->
    <ShapefileUploadDialog
        v-if="showShapefileDialog"
        :open="showShapefileDialog"
        @done="addItemFromDialog('upload', $event)"
        @upload="handleShapefileUpload"
    />
    <KmlKmzUploadDialog
        v-if="showKmlDialog"
        :open="showKmlDialog"
        @done="addItemFromDialog('uploadKml', $event)"
        @upload="handleKmlUpload"
    />
</template>