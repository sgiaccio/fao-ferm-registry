<script setup lang="ts">
import { getStorage, ref, uploadBytes, listAll, deleteObject } from "firebase/storage";
import * as vue from "vue";


import { useProjectStore } from "@/stores/project";
import { useMenusStore } from '@/stores/menus';

import TabTemplate from "../TabTemplate.vue";

import FormGroup from "@/components/inputs/FormGroup.vue";
import TextFormGroup from "@/components/inputs/base/TextFormGroup.vue";
import DateFormGroup from "@/components/inputs/base/DateFormGroup.vue";
import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
import KeywordsInputGroup from "@/components/inputs/KeywordsInputGroup.vue";
import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue";
import AreaFormGroup from "@/components/inputs/AreaFormGroup.vue";
import MultiInputFormGroup from "@/components/inputs/MultiInputFormGroup.vue";
import Organization from "@/components/inputs/organizations/Organization.vue";
import PointOfContact from "@/components/inputs/pointsOfContact/PointOfContact.vue";
import SelectFormGroup from "@/components/inputs/base/SelectFormGroup.vue";

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
        addItemLabel: "Add organization"
    }
};

const pointsOfContact = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: "Add point of contact"
    }
};

const store = useProjectStore();
const menus = useMenusStore().menus;

const selectedFile = vue.ref<File | null>(null);
const uploadStatus = vue.ref<"idle" | "uploading" | "uploaded">("idle");

function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
}

const storage = getStorage();

function uploadFile(projectId: string | null) {
    if (projectId === null) return;

    if (uploadStatus.value !== "idle") return;

    const storageRef = ref(storage, `${projectId}/documents/${selectedFile.value!.name}`);
    const uploadTask = uploadBytes(storageRef, selectedFile.value!);

    uploadStatus.value = "uploading";
    uploadTask.then(snapshot => {
        getFiles(projectId);
        selectedFile.value = null;
        uploadStatus.value = "uploaded";
    }).catch(error => {
        uploadStatus.value = "idle";
    });
}

async function listFiles(projectId: string) {
    const dirRef = ref(storage, projectId + "/documents/");
    return listAll(dirRef);
}

const fileName = vue.ref<string | null>();

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
        alert("Error deleting the file");
    });
}

vue.watch(() => store.id as string, async id => {
    if (id) {
        getFiles(id);
    }
});
</script>


<template>
    <TabTemplate title="General">
        <template #description>
            <p>
                In this tab, basic information about your initiative is needed. The title and a summary of the aims and
                expected results of the initiative can be provided in the description section. You also need to provide
                further information such as when the initiative is expected to start and end, sources of funding and
                responsible organisms.
            </p>
        </template>
        <TextFormGroup :edit="edit"
                       v-model="store.project.project.title"
                       label="Title"
                       description="Title of the initiative as stated in the official initiative document" />

        <!-- Enable this when the reporting line is GEF -->
        <template v-if="store.project.reportingLine === 'GEF'">
            <TextFormGroup :edit="edit"
                           v-model="store.project.project.gefFaoSymbol"
                           label="GEF/FAO Symbol" />

            <SelectFormGroup :edit="edit"
                             v-model="store.project.project.gefCycle"
                             label="GEF cycle"
                             :options="menus.gefCycles" />
            <SelectFormGroup :edit="edit"
                             v-model="store.project.project.gefFocalArea"
                             label="GEF focal area"
                             :options="menus.gefFocalAreas" />
        </template>

        <TextareaFormGroup :edit="edit"
                           v-model="store.project.project.description"
                           label="Description"
                           description="Short description of the initiative" />
        <!-- TODO Short description of the initiative (max xx characters) -->
        <TextFormGroup :edit="edit"
                       v-model="store.project.project.website"
                       label="Website"
                       description="Website of the initiative"
                       placeholder="www.example.com" />

        <!-- Disable this when the reporting line is GEF -->
        <AreaFormGroup v-if="store.project.reportingLine !== 'GEF'"
                       :edit="edit"
                       label="Target area"
                       v-model="store.project.project.targetArea"
                       description="Area of the restoration target">
        </AreaFormGroup>

        <!--
        <template v-if="store.project.reportingLine === 'GEF'" v-slot:info >
            <p>Please include the land (in ha) committed in project design phase and updated in MTR/TE (sum of GEF 7 Indicators 1-5)</p>
        </template>
        -->


        <!-- Enable this when the reporting line is GEF -->
        <template v-if="store.project.reportingLine === 'GEF'">
            <AreaFormGroup :edit="edit"
                           label="Target area in design phase"
                           v-model="store.project.project.targetAreaDesignPhase"
                           description="Area of land committed in design phase">
                <template v-slot:info>
                    <p>Please include the land (in ha) committed in <span class="font-bold">project design phase</span> (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                </template>
            </AreaFormGroup>
            <AreaFormGroup :edit="edit"
                           label="Target area in mid-term review phase"
                           v-model="store.project.project.targetAreaReviewPhase"
                           description="Area of land committed in mid-term review phase">
                <template v-slot:info>
                    <p>Please include the land (in ha) committed in project <span class="font-bold">mid-term review phase</span> (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                </template>
            </AreaFormGroup>
            <AreaFormGroup :edit="edit"
                           label="Target area in terminal evaluation phase"
                           v-model="store.project.project.targetAreaEvaluationPhase"
                           description="Area of land committed in terminal evaluation phase">
                <template v-slot:info>
                    <p>Please include the land (in ha) committed in project <span class="font-bold">terminal evaluation phase</span> (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                </template>
            </AreaFormGroup>
        </template>

        <DateFormGroup :edit="edit"
                       v-model="store.project.project.startingDate"
                       label="Starting date"
                       description="Date when the initiative started" />
        <DateFormGroup :edit="edit"
                       v-model="store.project.project.endingDate"
                       label="Ending date"
                       description="Date when the initiative finished or is expected to finish" />
        <FormGroup :label="store.project.reportingLine === 'GEF' ? 'Upload the GEF project document' : 'Upload one initiative document'">
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
        <MultiInputFormGroup :edit="edit"
                             label="Points of contact"
                             :inputComponents="pointsOfContact"
                             v-model="store.project.project.pointsOfContact" />
        <KeywordsInputGroup :edit="edit"
                            v-model="store.project.project.keywords"
                            label="Keywords" />
        <MultiInputFormGroup :edit="edit"
                             label="Organizations"
                             description="Organizations that implement the project/initiative"
                             :inputComponents="organizations"
                             v-model="store.project.project.organizations" />
    </TabTemplate>
    <!-- <DynamicHeading level=2>Title</DynamicHeading> -->
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
</template>
