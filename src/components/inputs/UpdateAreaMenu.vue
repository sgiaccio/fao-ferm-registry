<script setup lang="ts">
import { ref, computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { getAreaObj } from '@/lib/util';

import {
    ChevronDownIcon,
} from '@heroicons/vue/20/solid';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';

import ShapefileUploadDialog from '@/views/project/ShapefileUploadDialog.vue';
import KmlKmzUploadDialog from '@/views/project/KmlKmzUploadDialog.vue';


const props = withDefaults(defineProps<{
    components: any,
    project: any,
    area: any,
    excludeViewMenuItem?: boolean,
    label?: string,
    sections?: ('view' | 'edit' | 'publishing' | 'best-practices' | 'delete')[],
}>(), {
    excludeViewMenuItem: false
});

const emit = defineEmits(['done']);

const { t } = useI18n();

const shapefileUploadDialogOpen = ref(false);
const kmlUploadDialogOpen = ref(false);

function deleteAdminAreaInfo(area: any) {
    const areaCopy = { ...area };
    delete areaCopy.admin0;
    delete areaCopy.admin1;
    delete areaCopy.admin2;

    return areaCopy;
}

function doneUploadingShapefile(areas: any) {
    if (areas.length > 1) {
        console.error('multiple areas', areas);
    } else if (areas.length === 0) {
        console.error('no areas', areas);
    }

    const area = deleteAdminAreaInfo(getAreaObj(props.area));
    emit('done', {
        upload: {
            ...area,
            uuid: areas[0].uuid
        }
    });
    shapefileUploadDialogOpen.value = false;
}

function doneUploadingKml(areas: any) {
    const area = deleteAdminAreaInfo(getAreaObj(props.area));

    if (areas.length === 1) {
        // emit('done', {
        //     type: 'uploadKml',
        //     area: {
        //         ...area,
        //         uuid: areas[0].uuid,
        //         area: areas[0].area,
        //         siteName: areas[0].siteName || area.siteName,
        //         shapeId: areas[0].shapeId
        //     }
        // });ea });
        emit('done', {
            uploadKml: {
                ...area,
                uuid: areas[0].uuid,
            }
        });
    } else if (areas.length > 1) {
        console.error('multiple areas', areas);
    } else {
        console.error('no areas', areas);
    }
    kmlUploadDialogOpen.value = false;
}

function changeToDraw() {
    const area = deleteAdminAreaInfo(getAreaObj(props.area));
    delete area.uuid;
    emit('done', { draw: area });
}

const areaType = computed(() => Object.keys(props.area)[0]);
</script>

<template>
    <Menu
        as="div"
        class="relative inline-block text-left"
    >
        <div>
            <menu-button class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ml-6">
                <span class="sr-only">Update area</span>
                Update area
                <ChevronDownIcon
                    class="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                />
            </menu-button>
        </div>

        <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
        >
            <MenuItems class="absolute left-5 bottom-10 z-10 mt-2 w-56 origin-top-righ rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <menu-item 
                    v-if="areaType !== 'adminArea'"
                    v-slot="{ active }"
                >
                    <span
                        @click="() => emit('done', { type: 'adminArea' })"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Admin area
                    </span>
                </menu-item>
                <menu-item 
                    v-if_="areaType !== 'draw'"
                    v-slot="{ active }"
                >
                    <span
                        @click="changeToDraw"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Draw polygon
                    </span>
                </menu-item>
                <menu-item 
                    v-if="areaType !== 'upload'"
                    v-slot="{ active }"
                >
                    <span
                        @click="() => { shapefileUploadDialogOpen = true }"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Upload shapefile
                    </span>
                </menu-item>
                <menu-item 
                    v-if="areaType !== 'uploadKml'"
                    v-slot="{ active }"
                >
                    <span
                        @click="() => { kmlUploadDialogOpen = true }"
                        :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']"
                    >
                        Upload KML/KMZ/GeoJSON
                    </span>
                </menu-item>
            </MenuItems>
        </transition>
    </Menu>

    <ShapefileUploadDialog
        :open="shapefileUploadDialogOpen"
        @done="doneUploadingShapefile"
        @cancel="shapefileUploadDialogOpen = false"
        :dissolveOnly="true"
    />
    <KmlKmzUploadDialog
        :open="kmlUploadDialogOpen"
        @done="doneUploadingKml"
        @cancel="kmlUploadDialogOpen = false"
    />
</template>
