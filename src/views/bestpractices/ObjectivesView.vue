<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'

import { useProjectStore } from "../../stores/project";

import TextFormGroup from "../../components/inputs/base/TextFormGroup.vue";
import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import MultiSelectFormGroup from "../../components/inputs/base/MultiSelectFormGroup.vue";
import LatLongFormGroup from "../../components/inputs/LatLongFormGroup.vue";

import { objectives, ecosystems, drivers } from "../../components/project/menus";



function toCamel(o: any) {
    let newO: any;
    if (o instanceof Array) {
        return o.map(value => {
            if (typeof value === "object") {
                value = toCamel(value);
            }
            return value;
        });
    } else {
        newO = {}
        for (let origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                const newKey = origKey.replace(/-./g, x => x[1].toUpperCase());
                let value = o[origKey];
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = toCamel(value);
                }
                newO[newKey] = value;
            }
        }
    }
    return newO;
}

// import { h } from 'vue'

type AOI = {
    adminArea: {
        siteName?: string,
        admin0: string,
        admin1: string,
        admin2: string,
    }
};

type Objectives = {
    projectId: string,
    objectives: number[],
    objectivesOther?: [{"other": string}],
    title: string,
    ecosystems: number[],
    coordinates?: { latitude: number, longitude: number },
    context: string,
    drivers: number[],
    additionalInformation?: string,
    aoi: AOI[]
}

const data = ref<Objectives> ({
    projectId: "JtSvTe3h4dDhjIlWaphw",
    objectives: [1],
    title: "Test admin",
    ecosystems: [],
    coordinates: undefined,
    context: "",
    drivers: [],
    additionalInformation: undefined,
    aoi: [],
    // objectivesOther: [ { "other": "Other objective" } ]
});

// const asdf = ref();

const route = useRoute();
const projectData = ref();
watch(
    () => route.params,
    async () => {
        const { fetchProject } = useProjectStore();
        const project = fetchProject(data.value.projectId);
        projectData.value = toCamel((await project).data());
    },
    // fetch the data when the view is created and the data is already being observed
    { immediate: true },
)

// Build the AOI menu. Showing all AOIs from the related project
const aoiMenu = ref<{ label: string, value: number }[]>([])
// const activitiesMenu = ref<number[]>([])
watch(projectData, data => {
    aoiMenu.value = data.aoi.map((area: AOI, i: number) => ({
        label: Object.values(area)[0]["siteName"] || `Area ${i}`, value: i
    }));

    // TODO build activities menu
});

// Convert current selection of AOI indexes (number[]) from the menu to a vector of AOIs
const aoiSelection = reactive<number []>([]);
watch(aoiSelection, selection => {
    data.value.aoi = selection.map(n => projectData.value.aoi[n]);
});


// const DynamicHeading = (props, context) => {
//   return h(`h${props.level}`, context.attrs, context.slots)
// }

// DynamicHeading.props = ['level']
</script>


<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Objectives and Context</h1>
        <!-- <p class="dark:text-zinc-200">In this tab, basic information about your initiative is needed. The title and a summary of the aims and expected results of the initiative can be provided in the description section. You also need to provide further information such as when the initiative is expected to start and end, sources of funding and responsible organisms.</p> -->

        <div class="divide-y divide-stone-900">
            <TextFormGroup
                v-model="data.title"
                label="Title"
                description="Title of the restoration practice"
                :required=true>
            </TextFormGroup>
            <MultiSelectFormGroup
                :options="objectives"
                v-model="data.objectives"
                label="Objectives"
                description="Objectives of the initiatives"
                :required="true"
                :otherEnabled="true"
                v-model:others="data.objectivesOther" 
                />
            <TextareaFormGroup
                v-model="data.additionalInformation"
                label="Additional information"
                description="Feel free to provide additional information on specific objectives of the practice." />
            <MultiSelectFormGroup
                :options="ecosystems"
                v-model="data.ecosystems"
                label="Ecosystems"
                description="Ecosystems where the practice was applied (Mandatory) [Select all that apply]"
                :required="true"></MultiSelectFormGroup>
            <LatLongFormGroup
                v-model="data.coordinates"
                label="Geographic coordinates"
                description="If available, please insert the geographic coordinates of the restoration area. Please use the WGS84 Geographic Reference System."></LatLongFormGroup>
            <TextareaFormGroup
                v-model="data.context"
                label="Context"
                description="Please feel free to share any relevant socioeconomic and cultural context for the practice's implementation."></TextareaFormGroup>
            
            <div class="text-white">TODO: activities</div>

            <MultiSelectFormGroup
                :options="drivers"
                v-model="data.drivers"
                label="Drivers"
                description="Drivers of degradation addressed by the practice [Select all that apply]"
                :required="true">
            </MultiSelectFormGroup>
            <TextareaFormGroup
                v-model="data.additionalInformation"
                label="Additional information"
                description="Feel free to provide additional information to explain how the practice contributed to addressing the drivers of ecosystem degradation selected above."></TextareaFormGroup>
            <template v-if="projectData">
                <MultiSelectFormGroup
                    :options="aoiMenu"
                    v-model="aoiSelection"
                    label="AOIs"
                    description="AOIs" />
            </template>
        </div>
    </div>
    <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre>

</template>
