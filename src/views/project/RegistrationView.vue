<script setup lang="ts">
import { getStorage, ref, listAll } from 'firebase/storage';

import { ref as vueRef, watch, computed } from 'vue';

import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();

const organizations = {
    organization: {
        component: Organization,
        newData: {},
        addItemLabel: t('inputs.organization.addItemLabel'),
    },
};

const pointsOfContact = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: t('inputs.pointOfContact.addItemLabel'),
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
    <TabTemplate :title="t('projectRegistration.title')">
        <template #description>
            <p v-if="store.project.reportingLine === 'GEF'">
                {{ t('projectRegistration.gef.description') }}
            </p>
            <p v-else>
                {{ t('projectRegistration.description') }}
            </p>
        </template>
        <div class="divide-y divide-slate-100 border-2 border-slate-200 rounded-md shadow-sm mt-4 mb-6 overflow-hidden">
            <TextFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.title"
                :label="t('projectRegistration.fields.title.label')"
                :description="t('projectRegistration.fields.title.description')"
            />
            <RecursiveMenuFormGroup
                v-if="store.project.reportingLine === 'GEF'"
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.gefImplementingAgencies"
                :label="t('projectRegistration.fields.gef.implementingAgencies.label')"
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
                    :label="t('projectRegistration.fields.gef.faoSymbol.label')"
                />
                <FormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    :label="t('projectRegistration.fields.gef.investmentType.label')"
                >
                    <SmallCardsFormGroup
                        v-model="store.project.project.gefInvestmentType"
                        :options="menus.gefInvestmentTypes"
                        :edit="edit"
                    />
                </FormGroup>
                <FormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    :label="t('projectRegistration.fields.gef.gefCycle.label')"
                >
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
                    :label="t('projectRegistration.fields.gef.focalAreas.label')"
                    :options="menus.gefFocalAreas"
                />
                <RecursiveRadioFormGroup
                    class="px-4 odd:bg-white even:bg-slate-50"
                    v-if="store.project.project.gefInvestmentType === 'program'"
                    :label="t('projectRegistration.fields.gef.gefProgram.label')"
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
                :label="t('projectRegistration.fields.description.label')"
                :description="t('projectRegistration.fields.description.description')"
            >
                <template #info>
                    <p v-if="store.project.reportingLine === 'GEF'">
                        {{ t('projectRegistration.fields.description.gef.info') }}
                    </p>
                    <p v-else>
                        {{ t('projectRegistration.fields.description.info') }}
                    </p>
                </template>
            </TextareaFormGroup>

            <!-- TODO translation -->
            <ImageUploadFormGroup
                :label="t('projectRegistration.fields.initiativePhotos.label')"
                :dangerousHtmlDescription="`<p>${t('projectRegistration.fields.initiativePhotos.description.line1')}</p><p>${t('projectRegistration.fields.initiativePhotos.description.line2')}</p><p><b>${t('projectRegistration.fields.initiativePhotos.description.line3')}</b></p>`"
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
                :label="t('projectRegistration.fields.website.label')"
                :description="t('projectRegistration.fields.website.description')"
                placeholder="www.example.com"
            />
            <SelectFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.startingYear"
                :label="t('projectRegistration.fields.startingYear.label')"
                :options="years"
            />
            <SelectFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.endingYear"
                :label="t('projectRegistration.fields.endingYear.label')"
                :options="years"
            />

            <RecursiveRadioFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :label="t('projectRegistration.fields.restorationStatus.label')"
                v-model="store.project.project.restorationStatus"
                :options="menus.restorationStatuses"
                :showSelection="false"
                :searchable="false"
                :edit="edit"
            >
                <template #info>
                    <div>
                        <!-- Introductory text -->
                        <p>
                            {{ t('projectRegistration.fields.restorationStatus.info.intro') }}
                        </p>

                        <!-- References -->
                        <p class="mt-2">
                            {{ t('projectRegistration.fields.restorationStatus.info.references.title') }}
                            <br />
                            <a
                                :href="t('projectRegistration.fields.restorationStatus.info.references.linkHref')"
                                target="_blank"
                                class="text-blue-700 underline"
                            >
                                {{ t('projectRegistration.fields.restorationStatus.info.references.linkText') }}
                            </a>
                        </p>

                        <!-- Dropdown -->
                        <select
                            v-model="selectedItemInRestorationStatusInfo"
                            class="mt-6 mb-3 block w-full font-bold rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="1">{{ t('projectRegistration.fields.restorationStatus.options.preparation') }}</option>
                            <option value="2">{{ t('projectRegistration.fields.restorationStatus.options.progress') }}</option>
                            <option value="3">{{ t('projectRegistration.fields.restorationStatus.options.monitoring') }}</option>
                        </select>

                        <!-- Conditional descriptions -->
                        <p v-if="selectedItemInRestorationStatusInfo === '1'">
                            {{ t('projectRegistration.fields.restorationStatus.descriptions.preparation') }}
                        </p>
                        <p v-if="selectedItemInRestorationStatusInfo === '2'">
                            {{ t('projectRegistration.fields.restorationStatus.descriptions.progress') }}
                        </p>
                        <p v-if="selectedItemInRestorationStatusInfo === '3'">
                            {{ t('projectRegistration.fields.restorationStatus.descriptions.monitoring') }}
                        </p>
                    </div>

                </template>
            </RecursiveRadioFormGroup>
            <RecursiveMenuFormGroup
                :edit="edit"
                v-model="store.project.project.restorationTypes"
                :label="store.project.reportingLine === 'GEF'
                    ? t('projectRegistration.fields.restorationTypes.gef.label')
                    : t('projectRegistration.fields.restorationTypes.label')
                    "
                :options="menus.restorationTypes"
                :searchable="false"
                :showSelection="false"
                class="px-4 odd:bg-white even:bg-slate-50"
            >
                <template #info>
                    {{ t('projectRegistration.fields.restorationTypes.info') }}
                </template>
            </RecursiveMenuFormGroup>
            <FormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :label="t('projectRegistration.fields.objectives.label')"
            >
                <!-- Description -->
                <p>{{ t('projectRegistration.fields.objectives.description') }}</p>
                <p class="mt-2">
                    {{ t('projectRegistration.fields.objectives.reference') }}
                    <a
                        href="https://gbf-indicators.org/metadata/headline/2-2"
                        target="_blank"
                        class="text-blue-600 underline"
                    >
                        {{ t('projectRegistration.fields.objectives.referenceLink') }}
                    </a>
                </p>

                <!-- Recursive Menu -->
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
                    >
                        {{ t('projectRegistration.fields.objectives.otherObjectives') }}
                    </span>
                    <div class="flex-1">
                        <TextInput
                            ref="otherObjectivesTextInput"
                            :enabled="!!otherObjectives.length"
                            :edit="edit"
                            v-model="store.project.project.otherObjectives"
                            :placeholder="otherObjectives.length
                                ? t('projectRegistration.fields.objectives.placeholder')
                                : ''"
                        />
                    </div>
                </div>

                <!-- Additional Information -->
                <div
                    v-if="store.project.project.objectives?.length || store.project.project.otherObjectives"
                    class="mt-3"
                >
                    <p class="font-semibold text-sm text-gray-500 mb-3">
                        {{ t('projectRegistration.fields.objectives.additionalInfo.intro') }}
                        <InfoButton :title="t('projectRegistration.fields.objectives.label')">
                            <template #default>
                                <p>{{ t('projectRegistration.fields.objectives.additionalInfo.details') }}</p>
                                <p class="mt-2">
                                    <b>{{ t('projectRegistration.fields.objectives.additionalInfo.example') }}</b>
                                </p>
                            </template>
                        </InfoButton>
                    </p>
                    <textarea
                        v-if="edit"
                        rows="3"
                        :disabled="false"
                        class="block w-full rounded-md pr-10 focus:outline-none border-gray-300 sm:text-sm focus:ring-0"
                        v-model="store.project.project.objectivesAdditionalInformation"
                    ></textarea>
                    <div
                        v-else-if="store.project.project.objectivesAdditionalInformation"
                        class="whitespace-pre-wrap"
                    >
                        {{ store.project.project.objectivesAdditionalInformation }}
                    </div>
                    <div
                        v-else
                        class="italic text-gray-400"
                    >
                        {{ t('projectRegistration.fields.objectives.notAvailable') }}
                    </div>
                </div>
            </FormGroup>
            <RecursiveMenuFormGroup
                :edit="edit"
                v-model="store.project.project.tenureStatuses"
                :label="t('projectRegistration.fields.tenureStatuses.label')"
                :options="menus.tenureStatuses"
                :searchable="false"
                :showSelection="false"
                class="px-4 odd:bg-white even:bg-slate-50"
            >
                <template #info>
                    <p>
                        {{ $t('projectRegistration.fields.tenureStatuses.info.fpic') }}
                    </p>
                    <p class="pt-4">
                        {{ t('references') }}:
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
                :label="t('projectRegistration.fields.contributionToSdg.label')"
                :options="menus.contributionToSdg"
                :searchable="false"
                :showSelection="false"
                class="px-4 odd:bg-white even:bg-slate-50"
            />

            <FileUploadFormGroup2
                :label="store.project.reportingLine === 'GEF' ? t('projectRegistration.fields.uploadInitiativeDocument.gef.label') : t('projectRegistration.fields.uploadInitiativeDocument.label')"
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
                :label="t('projectRegistration.fields.pointsOfContact.label')"
                :inputComponents="pointsOfContact"
                v-model="store.project.project.pointsOfContact"
            />
            <KeywordsInputGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                v-model="store.project.project.keywords"
                :label="t('projectRegistration.fields.keywords.label')"
            />
            <MultiInputFormGroup
                class="px-4 odd:bg-white even:bg-slate-50"
                :edit="edit"
                :label="t('projectRegistration.fields.organizations.label')"
                :description="t('projectRegistration.fields.organizations.description')"
                :inputComponents="organizations"
                v-model="store.project.project.organizations"
            />
        </div>
    </TabTemplate>
    <!-- <DynamicHeading level=2>Title</DynamicHeading> -->
    <!-- <pre class="text-black text-xs">{{ JSON.stringify(store.project.project, null, 2) }}</pre> -->
</template>
