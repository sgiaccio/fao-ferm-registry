<script setup lang="ts">
import { getStorage, ref, uploadBytes, listAll, deleteObject } from 'firebase/storage';

import { ref as vueRef, watch, computed } from 'vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from '../TabTemplate.vue';

import FormGroup from '@/components/inputs/FormGroup.vue';
import TextFormGroup from '@/components/inputs/base/TextFormGroup.vue';
import TextareaFormGroup from '@/components/inputs/base/TextareaFormGroup.vue';
import KeywordsInputGroup from '@/components/inputs/KeywordsInputGroup.vue';
import MultiSelectFormGroup from '@/components/inputs/base/MultiSelectFormGroup.vue';
import MultiInputFormGroup from '@/components/inputs/MultiInputFormGroup.vue';
import Organization from '@/components/inputs/organizations/Organization.vue';
import PointOfContact from '@/components/inputs/pointsOfContact/PointOfContact.vue';
import SelectFormGroup from '@/components/inputs/base/SelectFormGroup.vue';
import RecursiveRadioFormGroup from '@/components/inputs/base/RecursiveRadioFormGroup.vue';
import SmallCardsFormGroup from '@/components/inputs/base/SmallCardsFormGroup.vue';

// import { gefCycles, objectives, gefFocalAreas } from "@/components/project/menus";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

// import { h } from 'vue'

// const DynamicHeading = (props, context) => {
//   return h(`h${props.level}`, context.attrs, context.slots)
// }

// DynamicHeading.props = ['level']

const organizations = {
    organization: {
        component: Organization,
        newData: {},
        addItemLabel: 'Add organization'
    }
};

const pointsOfContact = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: 'Add point of contact'
    }
};

const store = useProjectStore();
const menus = useMenusStore().menus;

const selectedFile = vueRef<File | null>(null);
const uploadStatus = vueRef<'idle' | 'uploading' | 'uploaded'>('idle');

function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
}

const storage = getStorage();

function uploadFile(projectId: string | null) {
    if (projectId === null) return;

    if (uploadStatus.value !== 'idle') return;

    const storageRef = ref(storage, `${projectId}/documents/${selectedFile.value!.name}`);
    const uploadTask = uploadBytes(storageRef, selectedFile.value!);

    uploadStatus.value = 'uploading';
    uploadTask.then(snapshot => {
        getFiles(projectId);
        selectedFile.value = null;
        uploadStatus.value = 'uploaded';
    }).catch(error => {
        uploadStatus.value = 'idle';
    });
}

async function listFiles(projectId: string) {
    const dirRef = ref(storage, projectId + '/documents/');
    return listAll(dirRef);
}

const fileName = vueRef<string | null>();

async function getFiles(id: string) {
    const fList = await listFiles(id);
    fileName.value = fList.items && fList.items.length && fList.items[0].name || null; // only one file can be uploaded
}

function deleteFile(projectId: string | null, fileName: string) {
    if (projectId === null) return;

    if (!confirm(`Are you sure you want to delete the file ${fileName}`)) return;
    const fRef = ref(storage, `${projectId}/documents/${fileName}`);
    deleteObject(fRef).then(() => {
        getFiles(projectId);
    }).catch((error) => {
        alert('Error deleting the file');
    });
}

watch(() => store.id as string, async id => {
    if (id) {
        getFiles(id);
    }
});

const gefPrograms = vueRef<any>(null);

// Handle deletion based on gefType
function handleDeletionByGefType(gefType: string | null) {
    if (gefType === 'program') {
        delete store.project.project.gefFocalAreas;
    } else if (gefType === 'project') {
        delete store.project.project.gefProgram;
    } else {
        delete store.project.project.gefProgram;
        delete store.project.project.gefFocalAreas;
    }
}

// Set gefPrograms based on gefCycle
function setGefPrograms(gefCycle: number | null) {
    // keep compatibility with old data where gefCycle was a string
    const cycle = gefCycle ? +gefCycle : null;
    delete store.project.project.gefProgram;
    switch (cycle) {
        case 6:
            gefPrograms.value = menus.gef6Programs;
            break;
        case 7:
            gefPrograms.value = menus.gef7Programs;
            break;
        case 8:
            gefPrograms.value = menus.gef8Programs;
            break;
        default:
            gefPrograms.value = null;
            break;
    }
}

const gefInvestmentType = computed(() => store.project?.project?.gefInvestmentType);
const gefCycle = computed(() => store.project?.project?.gefCycle);

// Watch gefType
watch(gefInvestmentType, type => {
    handleDeletionByGefType(type);
    if (type === 'program') {
        setGefPrograms(gefCycle.value);
    } else {
        setGefPrograms(null);
    }
}, { immediate: true });

// Watch gefCycle
watch(gefCycle, cycle => {
    if (gefInvestmentType.value === 'program') {
        setGefPrograms(cycle);
    }
}, { immediate: true });

function generateYearOptions(start: number, end: number): { value: number; label: string }[] {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => {
        const year = start + i;
        return { value: year, label: String(year) };
    });
}

const years = generateYearOptions(1950, 2050);

const selectedItemInRestorationStatusInfo = vueRef<string>("1");
watch(() => store.project?.project.restorationStatus, newValue => {
    if (store.project) {
        if (newValue) {
            selectedItemInRestorationStatusInfo.value = '' + newValue;
        } else {
            selectedItemInRestorationStatusInfo.value = '1';
        }
    }
}, { immediate: true });
</script>

<template>
    <TabTemplate title="General">
        <template #description>
            <p v-if="store.project.reportingLine === 'GEF'">
                In this tab, you can provide basic information about your initiative. The title and a summary of the aims and expected results of the initiative can be provided in the description section. Further information can be provided such as when the initiative is expected to start and end, web links or documentation that you find relevant, responsible organisms and the contact person who can provide further technical details of the initiative.
            </p>
            <p v-else>
                In this tab, you can provide basic information about your restoration initiative. The title and a summary of the aims and expected results of the initiative can be provided in the description section. Further information can be provided such as when the initiative is expected to start and end, the restoration status, web links or documentation that you find relevant, responsible organisms and the contact person who can provide further technical details of the restoration initiative.
            </p>
        </template>
        <div class="divide-y divide-slate-100 dark:divide-slate-900 border-2 border-slate-200 dark:border-slate-900 rounded-md shadow-sm mt-4 mb-6 overflow-hidden">
            <TextFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                           :edit="edit"
                           v-model="store.project.project.title"
                           label="Title"
                           description="Title of the initiative as stated in the official initiative document" />

            <!-- Enable this when the reporting line is GEF -->
            <template v-if="store.project.reportingLine === 'GEF'">
                <TextFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                               :edit="edit"
                               v-model="store.project.project.gefFaoSymbol"
                               label="GEF/FAO Symbol" />
                <FormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                           label="GEF investment type">
                    <SmallCardsFormGroup v-model="store.project.project.gefInvestmentType"
                                         :options="menus.gefInvestmentTypes"
                                         :edit="edit" />
                </FormGroup>
                <!-- <FormGroup label="GEF investment type">
                <RecursiveRadio v-model="store.project.project.gefInvestmentType"
                                :options="menus.gefInvestmentTypes"
                                :showSelection="false"
                                :edit="edit"
                                :showSearchInput="false" />
            </FormGroup> -->
                <FormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                           label="GEF cycle">
                    <!-- <RecursiveRadio v-model="store.project.project.gefCycle"
                                :options="menus.gefCycles"
                                :showSelection="false"
                                :edit="edit"
                                :showSearchInput="false" /> -->
                    <SmallCardsFormGroup v-model="store.project.project.gefCycle"
                                         :options="menus.gefCycles"
                                         :edit="edit" />
                </FormGroup>
                <MultiSelectFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                                      v-if="store.project.project.gefInvestmentType === 'project'"
                                      :edit="edit"
                                      v-model="store.project.project.gefFocalAreas"
                                      label="GEF standalone projects (focal areas)"
                                      :options="menus.gefFocalAreas" />
                <RecursiveRadioFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                                         v-if="store.project.project.gefInvestmentType === 'program'"
                                         label="GEF programmes"
                                         v-model="store.project.project.gefProgram"
                                         :options="gefPrograms"
                                         :showSelection="false"
                                         :show-search-input="false"
                                         :edit="edit" />
            </template>

            <TextareaFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                               :edit="edit"
                               v-model="store.project.project.description"
                               label="Description"
                               description="Short description of the initiative">
                <template v-slot:info>
                    <p>Provide a short context of the initiative in terms of actors and partners leading it, a short background, main restoration activities that will be implemented, expected results of the initiative.</p>
                </template>
            </TextareaFormGroup>
            <!-- TODO Short description of the initiative (max xx characters) -->
            <TextFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                           :edit="edit"
                           v-model="store.project.project.website"
                           label="Website"
                           description="Website of the initiative"
                           placeholder="www.example.com" />


            <!--
        <template v-if="store.project.reportingLine === 'GEF'" v-slot:info >
            <p>Please include the land (in ha) committed in project design phase and updated in MTR/TE (sum of GEF 7 Indicators 1-5)</p>
        </template>
        -->

            <!--        <DateFormGroup :edit="edit"-->
            <!--                       v-model="store.project.project.startingDate"-->
            <!--                       label="Starting date"-->
            <!--                       description="Date when the initiative started" />-->
            <!--        <DateFormGroup :edit="edit"-->
            <!--                       v-model="store.project.project.endingDate"-->
            <!--                       label="Ending date"-->
            <!--                       description="Date when the initiative finished or is expected to finish" />-->

            <SelectFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                             :edit="edit"
                             v-model="store.project.project.startingYear"
                             label="Starting year"
                             :options="years" />
            <SelectFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                             :edit="edit"
                             v-model="store.project.project.endingYear"
                             label="Ending year"
                             :options="years" />

            <RecursiveRadioFormGroup v-if="store.project.reportingLine !== 'GEF'"
                                     class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                                     label="Restoration status"
                                     v-model="store.project.project.restorationStatus"
                                     :options="menus.restorationStatuses"
                                     :showSelection="false"
                                     :show-search-input="false"
                                     :expandable="false"
                                     :edit="edit">
                <template v-slot:info>
                    <p>Provides an indication of whether the restoration area can be counted towards a reporting period. Restoration status is broken down into four components and an area specifies one of the components to represent its status. Each restoration status is characterized by a temporal component, which includes the start year of the restoration activities and end year, if applicable.
                    </p>

                    <p class="mt-2">
                        References:
                        <br>
                        <a href="https://www.post-2020indicators.org/metadata/headline/2-2"
                           target="_blank"
                           class="text-blue-700 underline">
                            https://www.post-2020indicators.org/metadata/headline/2-2
                        </a>
                    </p>

                    <select v-model="selectedItemInRestorationStatusInfo"
                            class="mt-6 mb-3 block w-full font-bold rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <option value="1">In preparation</option>
                        <option value="2">In progress</option>
                        <option value="3">Post-completion monitoring</option>
                    </select>

                    <p v-if="selectedItemInRestorationStatusInfo === '1'">
                        It is considered that the initiative is enabled, has been launched, has the necessary funds committed or the restoration areas has been officially gazetted. Still the the activities have not started in the field and the effect of restoration may not yet be measurable.
                    </p>
                    <p v-if="selectedItemInRestorationStatusInfo === '2'">
                        Restoration activities have started in the site and depending on the time that the activities have been ongoing, impacts may start to be measurable.
                    </p>
                    <p v-if="selectedItemInRestorationStatusInfo === '3'">
                        Restoration activities have finished and the focus is now on monitoring results. It is acknowledged that an area will not be restored as soon as activities are completed, therefore, post-completion assessments on the restoration status shall be made periodically.
                    </p>
                </template>
            </RecursiveRadioFormGroup>


            <FormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                       :label="store.project.reportingLine === 'GEF' ? 'Upload the GEF project document' : 'Upload one initiative document'">
                <div v-if="edit">
                    <div v-if="!fileName">
                        <label for="file"
                               class="block text-sm font-medium text-gray-700" />
                        <div class="mt-1 flex rounded-md shadow-sm">
                            <div class="flex-grow focus-within:z-10">
                                <input type="file"
                                       name="file"
                                       class="pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                       @change="setSelectedFile">
                            </div>
                            <button type="button"
                                    class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 focus:outline-none"
                                    :class="['idle' === 'idle' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-default']"
                                    @click="uploadFile(store.id)">
                                <svg v-if="uploadStatus === 'idle'"
                                     xmlns="http://www.w3.org/2000/svg"
                                     :class="[selectedFile ? 'text-red-600 animate-pulse' : 'text-gray-400', 'h-5 w-5']"
                                     viewBox="0 0 20 20"
                                     fill="currentColor"
                                     d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                     clip-rule="evenodd">
                                    <path fill-rule="evenodd"
                                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                          clip-rule="evenodd"></path>

                                </svg>
                                <svg v-else
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 20 20"
                                     fill="currentColor"
                                     class="w-5 h-5 animate-spin">
                                    <path fill-rule="evenodd"
                                          d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                                          clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div v-if="selectedFile"
                             class="text-red-500 text-sm">Remember to click the upload button before saving.
                        </div>
                    </div>

                    <div class="dark:text-white"
                         v-else>Initiative file: {{ fileName }} <span @click="deleteFile(store.id, fileName!)">[delete]</span></div>
                </div>
                <template v-else>
                    <div v-if="selectedFile">Initiative file: {{ fileName }}</div>
                    <div v-else>File not uploaded</div>
                </template>
            </FormGroup>
            <!-- <MultiSelectFormGroup :edit="edit"
                              :options="menus.objectives"
                              v-model="store.project.project.objectives"
                              label="Objectives"
                              description="Objectives of the initiatives" /> -->
            <MultiInputFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700 "
                                 :edit="edit"
                                 label="Points of contact"
                                 :inputComponents="pointsOfContact"
                                 v-model="store.project.project.pointsOfContact" />
            <KeywordsInputGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700"
                                :edit="edit"
                                v-model="store.project.project.keywords"
                                label="Keywords" />
            <MultiInputFormGroup class="px-4 odd:bg-white even:bg-slate-50 dark:even:bg-gray-800 dark:odd:bg-slate-700 "
                                 :edit="edit"
                                 label="Organizations"
                                 description="Organizations that implement the project/initiative"
                                 :inputComponents="organizations"
                                 v-model="store.project.project.organizations" />
        </div>
    </TabTemplate>
    <!-- <DynamicHeading level=2>Title</DynamicHeading> -->
    <!-- <pre class="text-black text-xs">{{ JSON.stringify(store.project.project, null, 2) }}</pre> -->
</template>
