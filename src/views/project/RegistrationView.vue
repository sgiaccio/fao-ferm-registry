<script setup lang="ts">
import { getStorage, ref, listAll } from 'firebase/storage';

import { ref as vueRef, watch, computed } from 'vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';
import { useAuthStore } from '@/stores/auth';

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
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import RecursiveMenuFormGroup from '@/components/inputs/base/RecursiveMenuFormGroup.vue';
import SmallCardsFormGroup from '@/components/inputs/base/SmallCardsFormGroup.vue';
import FileUploadFormGroup2 from '@/components/inputs/base/FileUploadFormGroup2.vue';
import ImageUploadFormGroup from '@/components/inputs/base/ImageUploadFormGroup.vue';
import InfoButton from '@/components/InfoButton.vue';
import TextInput from '@/components/inputs/base/TextInput.vue';

withDefaults(
    defineProps<{
        edit?: boolean;
    }>(),
    {
        edit: true,
    },
);

// import { h } from 'vue'

// const DynamicHeading = (props, context) => {
//   return h(`h${props.level}`, context.attrs, context.slots)
// }

// DynamicHeading.props = ['level']

const organizations = {
    organization: {
        component: Organization,
        newData: {},
        addItemLabel: 'Add organization',
    },
};

const pointsOfContact = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: 'Add point of contact',
    },
};

const store = useProjectStore();
const menus = useMenusStore().menus;
const authStore = useAuthStore();

const storage = getStorage();

async function listFiles(projectId: string) {
    const dirRef = ref(storage, projectId + '/documents/');
    return listAll(dirRef);
}

const fileName = vueRef<string | null>();

async function getFiles(id: string) {
    const fList = await listFiles(id);
    fileName.value =
        (fList.items && fList.items.length && fList.items[0].name) || null; // only one file can be uploaded
}

watch(
    () => store.id as string,
    async (id) => {
        if (id) {
            getFiles(id);
        }
    },
);

const gefPrograms = vueRef<any>(null);

// Handle deletion based on gefType
function handleDeletionByGefType(gefType: string | null) {
    if (!store.project) {
        return;
    }
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
    // delete store.project.project.gefProgram;
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

const gefInvestmentType = computed(
    () => store.project?.project?.gefInvestmentType,
);
const gefCycle = computed(() => store.project?.project?.gefCycle);

// Watch gefType
watch(
    gefInvestmentType,
    (type, oldType) => {
        if (oldType) {
            handleDeletionByGefType(oldType);
        }
        // handleDeletionByGefType(type);
        if (type === 'program') {
            setGefPrograms(gefCycle.value);
        } else {
            setGefPrograms(null);
        }
    },
    { immediate: true },
);

// Watch gefCycle
watch(
    gefCycle,
    (cycle, oldCycle) => {
        if (!store.project) {
            return;
        }
        if (oldCycle) {
            delete store.project.project.gefProgram;
        }
        if (gefInvestmentType.value === 'program') {
            setGefPrograms(cycle);
        }
    },
    { immediate: true },
);

function generateYearOptions(
    start: number,
    end: number,
): { value: number; label: string }[] {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => {
        const year = start + i;
        return { value: year, label: String(year) };
    });
}

const years = generateYearOptions(1950, 2050);

const selectedItemInRestorationStatusInfo = vueRef<string>('1');
watch(
    () => store.project?.project.restorationStatus,
    (newValue) => {
        if (store.project) {
            if (newValue) {
                selectedItemInRestorationStatusInfo.value = '' + newValue;
            } else {
                selectedItemInRestorationStatusInfo.value = '1';
            }
        }
    },
    { immediate: true },
);

const otherObjectives = vueRef(
    store.project.project.otherObjectives ? [0] : [],
);

watch(
    () => [...store.project?.project.objectives, ...otherObjectives.value],
    (newValue) => {
        if (newValue.length === 0) {
            delete store.project.project.objectivesAdditionalInformation;
        }
    },
);
</script>

<template>
    <TabTemplate title="General">
        <template #description>
            <p v-if="store.project.reportingLine === 'GEF'">
                In this tab, you can provide basic information about your
                initiative. The title and a summary of the aims and expected
                results of the initiative can be provided in the description
                section. Further information can be provided such as when the
                initiative is expected to start and end, web links or
                documentation that you find relevant, responsible organisms and
                the contact person who can provide further technical details of
                the initiative.
            </p>
            <p v-else>
                In this tab, you can provide basic information about your
                restoration initiative. The title and a summary of the aims and
                expected results of the initiative can be provided in the
                description section. Further information can be provided such as
                when the initiative is expected to start and end, the
                restoration status, web links or documentation that you find
                relevant, responsible organisms and the contact person who can
                provide further technical details of the restoration initiative.
            </p>
        </template>
        <div class="divide-y divide-slate-100 border-2 border-slate-200 rounded-md shadow-sm mt-4 mb-6 overflow-hidden">
            <!-- show the thumbnail if available -->
            <!-- <img v-if="store.project.project.thumbnailUrl" :src="store.project.project.thumbnailUrl" alt="thumbnail" class="w-full h-48 object-cover object-center" /> -->
            <TextFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.title"
                label="Title"
                description="Title of the initiative as stated in the official initiative document"
            />
            <RecursiveMenuFormGroup
                v-if="store.project.reportingLine === 'GEF'"
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.gefImplementingAgencies"
                label="GEF implementing agencies"
                :searchable="false"
                :showSelection="false"
                :options="menus.gefImplementingAgencies"
            />

            <!-- Enable this when the reporting line is GEF -->
            <template v-if="store.project.reportingLine === 'GEF'">
                <TextFormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    :edit="edit"
                    v-model="store.project.project.gefFaoSymbol"
                    label="GEF Project Symbol"
                />
                <FormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    label="GEF investment type"
                >
                    <SmallCardsFormGroup
                        v-model="store.project.project.gefInvestmentType"
                        :options="menus.gefInvestmentTypes"
                        :edit="edit"
                    />
                </FormGroup>
                <!-- <FormGroup label="GEF investment type">
                <RecursiveRadio v-model="store.project.project.gefInvestmentType"
                                :options="menus.gefInvestmentTypes"
                                :showSelection="false"
                                :edit="edit"
                                :searchable="false" />
            </FormGroup> -->
                <FormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    label="GEF cycle"
                >
                    <!-- <RecursiveRadio v-model="store.project.project.gefCycle"
                                :options="menus.gefCycles"
                                :showSelection="false"
                                :edit="edit"
                                :searchable="false" /> -->
                    <SmallCardsFormGroup
                        v-model="store.project.project.gefCycle"
                        :options="menus.gefCycles"
                        :edit="edit"
                    />
                </FormGroup>
                <MultiSelectFormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    v-if="store.project.project.gefInvestmentType === 'project'"
                    :edit="edit"
                    v-model="store.project.project.gefFocalAreas"
                    label="GEF standalone projects (focal areas)"
                    :options="menus.gefFocalAreas"
                />
                <RecursiveRadioFormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    v-if="store.project.project.gefInvestmentType === 'program'"
                    label="GEF programmes"
                    v-model="store.project.project.gefProgram"
                    :options="gefPrograms"
                    :showSelection="false"
                    :searchable="false"
                    :edit="edit"
                />
            </template>

            <TextareaFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.description"
                label="Description"
                description="Short description of the initiative"
            >
                <template v-slot:info>
                    <p v-if="store.project.reportingLine === 'GEF'">
                        Provide a short context of the initiative in terms of
                        actors and partners leading it, a short background, main
                        management or restoration activities that will be
                        implemented, expected results of the initiative.
                    </p>
                    <p v-else>
                        Provide a short context of the initiative in terms of
                        actors and partners leading it, a short background, main
                        restoration activities that will be implemented,
                        expected results of the initiative.
                    </p>
                </template>
            </TextareaFormGroup>

            <ImageUploadFormGroup
                label="Initiative photos"
                dangerousHtmlDescription="Please upload photos of the initiative.<br>Images that are bigger than 1MB will be resized.<br><b>You can then choose one as a cover photo by clicking on it.</b>"
                :projectId="store.id!"
                folder="images"
                :multiple="true"
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                :getAccessTokenFn="authStore!.getIdToken"
                v-model="store.project.project.thumbnailUrl"
            />
            <TextFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.website"
                label="Website"
                description="Website of the initiative"
                placeholder="www.example.com"
            />
            <SelectFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.startingYear"
                label="Starting year"
                :options="years"
            />
            <SelectFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.endingYear"
                label="Ending year"
                :options="years"
            />

            <RecursiveRadioFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                label="Restoration status"
                v-model="store.project.project.restorationStatus"
                :options="menus.restorationStatuses"
                :showSelection="false"
                :searchable="false"
                :edit="edit"
            >
                <template v-slot:info>
                    <p>
                        Provides an indication of whether the restoration area
                        can be counted towards a reporting period. Restoration
                        status is broken down into four components and an area
                        specifies one of the components to represent its status.
                        Each restoration status is characterized by a temporal
                        component, which includes the start year of the
                        restoration activities and end year, if applicable.
                    </p>

                    <p class="mt-2">
                        References:
                        <br />
                        <a
                            href="https://www.post-2020indicators.org/metadata/headline/2-2"
                            target="_blank"
                            class="text-blue-700 underline"
                        >
                            https://www.post-2020indicators.org/metadata/headline/2-2
                        </a>
                    </p>

                    <select
                        v-model="selectedItemInRestorationStatusInfo"
                        class="mt-6 mb-3 block w-full font-bold rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="1">In preparation</option>
                        <option value="2">In progress</option>
                        <option value="3">Post-completion monitoring</option>
                    </select>

                    <p v-if="selectedItemInRestorationStatusInfo === '1'">
                        It is considered that the initiative is enabled, has
                        been launched, has the necessary funds committed or the
                        restoration areas has been officially gazetted. Still
                        the the activities have not started in the field and the
                        effect of restoration may not yet be measurable.
                    </p>
                    <p v-if="selectedItemInRestorationStatusInfo === '2'">
                        Restoration activities have started in the site and
                        depending on the time that the activities have been
                        ongoing, impacts may start to be measurable.
                    </p>
                    <p v-if="selectedItemInRestorationStatusInfo === '3'">
                        Restoration activities have finished and the focus is
                        now on monitoring results. It is acknowledged that an
                        area will not be restored as soon as activities are
                        completed, therefore, post-completion assessments on the
                        restoration status shall be made periodically.
                    </p>
                </template>
            </RecursiveRadioFormGroup>
            <RecursiveMenuFormGroup
                :edit="edit"
                v-model="store.project.project.restorationTypes"
                :label="store.project.reportingLine === 'GEF'
                    ? 'Intervention/restoration types'
                    : 'Restoration types'
                    "
                :options="menus.restorationTypes"
                :searchable="false"
                :showSelection="false"
                class="px-4 odd:bg-white even:bg-slate-50"
            >
                <template v-slot:info>
                    The possible values are ecological restoration and
                    rehabilitation. This can be determined by analyzing the
                    current and target ecosystem (natural or transformed).
                    Examples of transformed ecosystems are: farmlands, forest
                    plantation, urban ecosystems. As a useful rule of thumb, if
                    the target ecosystem is natural, the restoration will be
                    ecological restoration. If the target ecosystem is
                    transformed, the restoration will be rehabilitation.
                    <!-- <span class="font-bold"
                          v-if="store.project.reportingLine === 'GEF'">For GEF projects please only fill if some areas fall under GEF Core Indicator 3. </span> -->
                </template>
            </RecursiveMenuFormGroup>

            <FormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                label="Objectives"
                :dangerousHtmlDescription="'Please select the primary aim(s) of the restoration initiative. Reference: <a class=&quot;text-blue-600&quot; target=&quot;_blank&quot; href=&quot;https://gbf-indicators.org/metadata/headline/2-2&quot;>https://gbf-indicators.org/metadata/headline/2-2</a>'"
            >
                <RecursiveMenu
                    :edit="edit"
                    v-model="store.project.project.objectives"
                    :options="menus.projectObjectives"
                    :searchable="false"
                    :showSelection="false"
                />
                <div class="flex items-center gap-x-3 w-full">
                    <RecursiveMenu
                        v-if="edit"
                        :edit="edit"
                        v-model="otherObjectives"
                        :options="[{ value: 0, label: 'Other' }]"
                        :searchable="false"
                        :showSelection="false"
                    />
                    <span
                        v-else
                        class="text-sm font-bold text-gray-600"
                    >Other objectives:</span>
                    <div class="flex-1">
                        <TextInput
                            ref="otherObjectivesTextInput"
                            :enabled="!!otherObjectives.length"
                            :edit="edit"
                            v-model="store.project.project.otherObjectives"
                            :placeholder="otherObjectives.length ? 'Please specify' : ''
                                "
                        />
                    </div>
                </div>

                <div
                    v-if="
                        store.project.project.objectives?.length ||
                        store.project.project.otherObjectives
                    "
                    class="mt-3"
                >
                    <p class="font-semibold text-sm text-gray-500 mb-3">
                        Please provide additional information on the primary
                        aims of the restoration initiative.
                        <InfoButton title="Objectives additional information">
                            <slot>
                                <p>
                                    Please explain how your project contributes
                                    to the selected objectives. If applicable,
                                    please provide for each objective selected:
                                    specific objectives, description of the
                                    project's impacts, and other relevant
                                    information. See an example below.
                                </p>
                                <p class="mt-2">
                                    <b>Example:</b> The project aims to restore
                                    local biodiversity by reintroducing species
                                    that play key roles in ecosystem functioning
                                    and enhancing conditions that support the
                                    return and increase of migratory species
                                    populations. 30 wolves were reintroduced in
                                    a previously wolf-free area to control deer
                                    populations. Additionally, 15 species of
                                    migratory birds were observed in a wetland
                                    area.
                                </p>
                            </slot>
                        </InfoButton>
                    </p>
                    <textarea
                        v-if="edit"
                        rows="3"
                        :disabled="false"
                        class="block w-full rounded-md pr-10 focus:outline-none border-gray-300 sm:text-sm focus:ring-0"
                        v-model="store.project.project
                            .objectivesAdditionalInformation
                            "
                    ></textarea>
                    <div
                        v-else-if="
                            store.project.project
                                .objectivesAdditionalInformation
                        "
                        class="whitespace-pre-wrap"
                    >
                        {{
                            store.project.project
                                .objectivesAdditionalInformation
                        }}
                    </div>
                    <div
                        v-else
                        class="italic text-gray-400"
                    >Not available</div>
                </div>
            </FormGroup>

            <RecursiveMenuFormGroup
                :edit="edit"
                v-model="store.project.project.tenureStatuses"
                label="Tenure statuses"
                :options="menus.tenureStatuses"
                :searchable="false"
                :showSelection="false"
                class="px-4 odd:bg-white even:bg-slate-50"
            >
                <template v-slot:info>
                    <p>
                        It is the legal status of the area under restoration.
                        Information on tenure status should include
                        documentation of Free and Prior Consent (FPIC) to ensure
                        that people's rights are respected in the process of
                        restoration and adherence to the UN Decade principles
                        (FAO, IUCN CEM & SER, 2021) as well as the Voluntary
                        Guidelines on the Responsible Governance of Tenure
                        (VGGT) (FAO, 2022).
                        <!-- <span class="font-bold"
                              v-if="store.project.reportingLine === 'GEF'">For GEF projects please only fill if some areas fall under GEF Core Indicator 3.</span> -->
                    </p>
                    <p class="pt-4">
                        References:
                        <br />
                        FAO. 2022. Voluntary Guidelines on the Responsible
                        Governance of Tenure of Land, Fisheries and Forests in
                        the Context of National Food Security. First revision.
                        Rome.
                        <a
                            href="https://doi.org/10.4060/i2801e"
                            target="_blank"
                            class="text-ferm-blue-dark-700 hover:text-ferm-blue-dark-600"
                        >https://doi.org/10.4060/i2801e</a>
                    </p>
                    <p class="pt-4">
                        FAO, IUCN CEM & SER. (2021). Principles for ecosystem
                        restoration to guide the United Nations Decade
                        2021&mdash;2030. Rome, FAO.
                    </p>
                </template>
            </RecursiveMenuFormGroup>

            <RecursiveMenuFormGroup
                :edit="edit"
                v-model="store.project.contributionToSdg"
                label="Contribution to SDG goals"
                :options="menus.contributionToSdg"
                :searchable="false"
                :showSelection="false"
                class="px-4 odd:bg-white even:bg-slate-50"
            />

            <FileUploadFormGroup2
                :label="store.project.reportingLine === 'GEF'
                    ? 'Upload the GEF project document'
                    : 'Upload one initiative document'
                    "
                :projectId="store.id!"
                folder="documents"
                :multiple="false"
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                :getAccessTokenFn="authStore!.getIdToken"
            >
            </FileUploadFormGroup2>
            <MultiInputFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                label="Points of contact"
                :inputComponents="pointsOfContact"
                v-model="store.project.project.pointsOfContact"
            />
            <KeywordsInputGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.keywords"
                label="Keywords"
            />
            <MultiInputFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                label="Organizations"
                description="Organizations that implement the project/initiative"
                :inputComponents="organizations"
                v-model="store.project.project.organizations"
            />
        </div>
    </TabTemplate>
    <!-- <DynamicHeading level=2>Title</DynamicHeading> -->
    <!-- <pre class="text-black text-xs">{{ JSON.stringify(store.project.project, null, 2) }}</pre> -->
</template>
