<script setup lang="ts">
import { ref } from 'vue';

import { TrashIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';

import TabTemplate from '../TabTemplate.vue';

import MultiInput from '@/components/inputs/MultiInput.vue';
import MapInput from '@/components/inputs/base/MapInput.vue';
import AdminArea from '@/components/inputs/AdminArea.vue';
import MapUpload from '@/components/inputs/base/MapUpload.vue';
import ShapefileUploadDialog from './ShapefileUploadDialog.vue';
import FormGroup from '@/components/inputs/FormGroup.vue';
import NumberInput from '@/components/inputs/base/NumberInput.vue';
import AreaFormGroup from '@/components/inputs/AreaFormGroup.vue';

import ConfirmModal from '@/views/ConfirmModal.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const multiInputComponents = {
    adminArea: {
        component: AdminArea,
        newData: {},
        addItemLabel: 'Add admin area'
    },
    draw: {
        component: MapInput,
        newData: {},
        addItemLabel: 'Draw polygon'
    },
    upload: {
        component: MapUpload,
        newData: {},
        addItemLabel: 'Upload shapefile',
        addDialog: ShapefileUploadDialog
    }
};

const store = useProjectStore();

function numbering(i: number, v: any) {
    const key = Object.keys(v)[0];
    if (key === 'adminArea') {
        return `Area ${i + 1}`;
    } else if (key === 'draw') {
        return `Area ${i + 1}`;
    } else if (key === 'upload') {
        const value = v[key];
        return `Area ${value.shapeId || i + 1}`;
    } else {
        return `Unknown area type: ${key}`;
    }
}

const showDeleteAreasConfirm = ref(false);

function deleteProjectAreas() {
    store.projectAreas = [];
    showDeleteAreasConfirm.value = false;
}
</script>

<template>
    <ConfirmModal :on-confirm="deleteProjectAreas"
                  type="info"
                  :open="showDeleteAreasConfirm"
                  title="Delete all project areas"
                  @cancel="() => { showDeleteAreasConfirm = false }">
        Are you sure you want to delete all project areas? This action will only remove areas temporarily in your
        current session. <span class="font-bold">To permanently apply this change, you must save the project afterwards</span>. Proceed?
    </ConfirmModal>
    <TabTemplate title="Area">
        <template #description>
            <p>
                Identification of geographic areas of ecosystem restoration is key for geospatial applications. One
                initiative implements ecosystem restoration in one or more geographic areas. initiatives can identify
                one or more initiative areas. Identification of activities, indicators, characterization and results
                will be provided for each area. Geographic areas can be identified based on different options:
            </p>
            <ul class="list-disc list-inside">
                <li>
                    Select administrative areas
                </li>
                <li>
                    Upload polygons/vector

                </li>
                <li>
                    Draw directly on the platform
                </li>
            </ul>
        </template>
        <template #default>
            <AreaFormGroup :edit="edit"
                           label="Committed area to restore"
                           v-model="store.project.project.targetArea"
                           description="Area of the restoration target">
                <template v-slot:info>
                    Includes pledges, targets, aspirations, or commitments of area to restore. This parameter will not be counted as area under restoration but will serve as a reference to monitor restoration progress.
                </template>
            </AreaFormGroup>
            <FormGroup label="Total area under restoration (ha)">
                <NumberInput :edit="edit"
                             v-model="store.project.project.areaUnderRestoration" />
            </FormGroup>
            <div class="py-6">
                <MultiInput :edit="edit"
                            :numbering="(n, v) => numbering(n, v)"
                            :inputComponents="multiInputComponents"
                            v-model="store.projectAreas"
                            deleteConfirmMessage="Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted." />
                <button v-if="store.projectAreas.length > 0 && edit"
                        @click="() => { showDeleteAreasConfirm = true }"
                        type="button"
                        class="mt-6 inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                    <TrashIcon class="-ml-0.5 h-5 w-5"
                               aria-hidden="true" />
                    Delete all areas
                </button>
            </div>
        </template>
    </TabTemplate>
    <!-- <pre>{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
