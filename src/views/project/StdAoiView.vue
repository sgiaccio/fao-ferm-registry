<script setup lang="ts">
import { ref, watch, computed } from 'vue';

import { TrashIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from '../TabTemplate.vue';

import MultiInput from '@/components/inputs/MultiInput.vue';
import MapInput from '@/components/inputs/base/MapInput.vue';
import AdminArea from '@/components/inputs/AdminArea.vue';
import MapUpload from '@/components/inputs/base/MapUpload.vue';
import ShapefileUploadDialog from './ShapefileUploadDialog.vue';
import FormGroup from '@/components/inputs/FormGroup.vue';
import NumberInput from '@/components/inputs/base/NumberInput.vue';
// import AreaFormGroup from '@/components/inputs/AreaFormGroup.vue';
import SelectInput from '@/components/inputs/base/SelectInput.vue';

import ConfirmModal from '@/views/ConfirmModal.vue';

import { getMenuSelectedLabel } from '@/components/project/menus';

const store = useProjectStore();
const menus = useMenusStore().menus;

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


// watch store.project.project.areaUnits for changes
// if units change, show alert
watch(() => store.project?.project.areaUnits, (_newVal, oldVal) => {
    if (store.project) {
        if (oldVal) {
            alert('You have changed the units of the target area. Please note that the areas you have defined will be not be converted to the new units. Please review all the areas you have defined.');
        } else {
            alert('You have set the units of the target area for the whole project. Please note that all the areas will have to be entered in the same units.');
        }
    }
});

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
    <TabTemplate title="Area & Ecosystems">
        <template #description>
            <p>
                Identification of geographic areas under ecosystem restoration is key for geospatial applications and is essential to keep track of effective restoration, being the main objective of Target 2 of the Kunming-Montreal Global Biodiversity Framework (<a class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-700 dark:text-ferm-blue-dark-100 dark:hover:text-ferm-blue-dark-200"
                   href="https://www.cbd.int/gbf/targets/2/"
                   target="_blank">Target 2</a>). One initiative can implement ecosystem restoration in one or more geographic areas. Activities, indicators, ecosystem characterization and results will be provided for each area. Geographic areas can be identified based on different options:
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
            <FormGroup label="Committed area to restore">
                <div class="flex gap-8">
                    <div class="flex flex-col gap-1">
                        <NumberInput v-model="store.project.project.targetArea"
                                     :edit="edit" />
                        <span class="text-gray-300 text-sm">Area</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <SelectInput v-model="store.project.project.areaUnits"
                                     :options="menus.units"
                                     :edit="edit" />
                        <span class="text-gray-300 text-sm">Units</span>
                    </div>
                </div>
                <template v-slot:info>
                    Includes pledges, targets, aspirations, or commitments of area to restore. This parameter will not be counted as area under restoration but will serve as a reference to monitor restoration progress.
                </template>
            </FormGroup>
            <!-- <AreaFormGroup :edit="edit"
                           label="Committed area to restore"
                           v-model="store.project.project.targetArea"
                           description="Area of the restoration target">
                <template v-slot:info>
                    Includes pledges, targets, aspirations, or commitments of area to restore. This parameter will not be counted as area under restoration but will serve as a reference to monitor restoration progress.
                </template>
            </AreaFormGroup> -->
            <FormGroup :label="`Total area under restoration [${getMenuSelectedLabel(store.project.project.areaUnits, menus.units)}]`">
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
