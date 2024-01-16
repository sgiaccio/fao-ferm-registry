<script setup lang="ts">
import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

// import { activities, restorationTypes, tenureStatuses } from '@/components/project/menus';

import TabTemplate from '../TabTemplate.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import TextInput from '@/components/inputs/base/TextInput.vue';
import { ref } from 'vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();
const menus = useMenusStore().menus;

function applyToAll() {
    if (!confirm('Are you sure you want to apply this activity to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const value = store.projectAreas[0][key];
    const activities = value.activities;
    const restorationType = value.restorationType;
    const tenureStatus = value.tenureStatus;
    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            const key2 = Object.keys(area)[0];
            area[key2].restorationType = restorationType;
            area[key2].tenureStatus = tenureStatus;
            area[key2].activities = [...activities];
        }
    });
}

const otherActivitiesInputEnabled = ref<boolean[]>(new Array(store.projectAreas.length).fill(false));

function toggleOtherActivitiesInput(i: number) {
    (otherActivitiesInputEnabled.value)[i] = !(otherActivitiesInputEnabled.value)[i];
}
</script>

<template>
    <TabTemplate title="Activities">
        <template #description>
            <p v-if="store.project.reportingLine === 'GEF'">Activities describe what is being implemented on the ground in order to achieve sustainable management or restoration objectives. Activities are adapted from the Glossary of restoration interventions of The Economics of Ecosystem Restoration (TEER) initiative (<a href="https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/"
                   target="_blank"
                   class="text-blue-600 underline hover:text-blue-500">https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/</a>). They are divided into two main categories (biophysical and enabling) and secondary categories according to the Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services (IPBES) Assessment Report on Land Degradation and Restoration (<a href="https://www.ipbes.net/assessment-reports/ldr"
                   target="_blank"
                   class="text-blue-600 underline hover:text-blue-500">https://www.ipbes.net/assessment-reports/ldr</a>). Implementing enabling activities often corresponds to the preparation stage.
            </p>
            <p v-else>
                Activities describe what is being implemented on the ground in order to achieve restoration objectives. Activities are adapted from the Glossary of restoration interventions of The Economics of Ecosystem Restoration (TEER) initiative (<a href="https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/"
                   target="_blank"
                   class="text-blue-600 underline hover:text-blue-500">https://www.fao.org/in-action/forest-landscape-restoration-mechanism/our-work/gl/teer/en/</a>). They are divided into two main categories (biophysical and enabling) and secondary categories according to the Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services (IPBES) Assessment Report on Land Degradation and Restoration (<a href="https://www.ipbes.net/assessment-reports/ldr"
                   target="_blank"
                   class="text-blue-600 underline hover:text-blue-500">https://www.ipbes.net/assessment-reports/ldr</a>). Implementing enabling activities often corresponds to the preparation stage.

            </p>
        </template>
        <template #default>
            <div v-if="store.projectAreas?.length"
                 class="flex flex-col gap-y-4 pt-6">
                <div v-for="(area, i) in store.projectAreas"
                     class="border-2 px-3 py-2 rounded-lg border-gray-300">
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 text-lg font-bold mb-2 flex-grow">
                            Area {{ i + 1 }}<span class="text-black"
                                  v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName
                                  }}</span>
                        </div>
                        <div v-if="edit">
                            <button v-if="i === 0 && store.projectAreas.length > 1"
                                    type="button"
                                    class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="applyToAll">
                                Apply to all
                            </button>
                        </div>
                    </div>


                    <!-- Only show restoration type and tenure status if not GEF or if GEF3 -->
                    <!-- This was moved to RegistrationView -->
                    <!-- <template v-if="store.project.reportingLine !== 'GEF' || area[Object.keys(area)[0]].gefIndicator?.startsWith('GEF3')">
                        <RecursiveRadioFormGroup :edit="edit"
                                                 v-model="area[Object.keys(area)[0]].restorationType"
                                                 :label="store.project.reportingLine === 'GEF' ? 'Intervention/restoration type' : 'Restoration type'"
                                                 :options="menus.restorationTypes"
                                                 :searchable="false"
                                                 :showSelection="false">
                            <template v-slot:info>
                                The possible values are ecological restoration and rehabilitation. This can be determined by analyzing the current and target ecosystem (natural or transformed). Examples of transformed ecosystems are: farmlands, forest plantation, urban ecosystems. As a useful rule of thumb, if the target ecosystem is natural, the restoration will be ecological restoration. If the target ecosystem is transformed, the restoration will be rehabilitation.
                                <span class="font-bold"
                                      v-if="store.project.reportingLine === 'GEF'">For GEF projects please only fill if some areas fall under GEF Core Indicator 3. </span>
                            </template>
                        </RecursiveRadioFormGroup>
                        <RecursiveRadioFormGroup :edit="edit"
                                                 v-model="area[Object.keys(area)[0]].tenureStatus"
                                                 label="Tenure status"
                                                 :options="menus.tenureStatuses"
                                                 :searchable="false"
                                                 :showSelection="false">
                            <template v-slot:info>
                                <p>
                                    It is the legal status of the area under restoration. Information on tenure status should include documentation of Free and Prior Consent (FPIC) to ensure that people's rights are respected in the process of restoration and adherence to the UN Decade principles (FAO, IUCN CEM & SER, 2021) as well as the Voluntary Guidelines on the Responsible Governance of Tenure (VGGT) (FAO, 2022).
                                    <span class="font-bold"
                                          v-if="store.project.reportingLine === 'GEF'">For GEF projects please only fill if some areas fall under GEF Core Indicator 3.</span>
                                </p>
                                <p class="pt-4">
                                    References:
                                    <br>
                                    FAO. 2022. Voluntary Guidelines on the Responsible Governance of Tenure of Land, Fisheries and Forests in the Context of National Food Security. First revision. Rome. <a href="https://doi.org/10.4060/i2801e"
                                       target="_blank"
                                       class="text-ferm-blue-dark-700 hover:text-ferm-blue-dark-600">https://doi.org/10.4060/i2801e</a>
                                </p>
                                <p class="pt-4">
                                    FAO, IUCN CEM & SER. (2021). Principles for ecosystem restoration to guide the United Nations Decade 2021–2030. Rome, FAO.
                                </p>
                            </template>
                        </RecursiveRadioFormGroup>
                    </template> -->

                    <h1 class="text-2xl font-bold mb-2">Activities</h1>
                    <RecursiveMenu :edit="edit"
                                   v-model="area[Object.keys(area)[0]].activities"
                                   :options="menus.activities" />

                    <div v-if="edit"
                         class="flex flex-row items-center mt-1 w-full">
                        <div class="flex items-start">
                            <div class="flex h-5 items-center">
                                <input :id="`otherActivities_${i}`"
                                       @change="() => toggleOtherActivitiesInput(i)"
                                       name="otherActivities"
                                       type="checkbox"
                                       :checked="otherActivitiesInputEnabled[i]"
                                       class="ml-1 mr-2 cursor-pointer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            </div>
                            <div class="text-sm">
                                <label :for="`otherActivities_${i}`"
                                       class="font-bold cursor-pointer mr-4">Other activities</label>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <TextInput :enabled="otherActivitiesInputEnabled[i]"
                                       :edit="edit"
                                       v-model="area[Object.keys(area)[0]].activitiesOther" />
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="area[Object.keys(area)[0]].activitiesOther"
                             class="text-sm mt-6 ">
                            <span class="font-bold text-gray-700">Other activities:</span> {{ area[Object.keys(area)[0]].activitiesOther }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="edit"
                 class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                <router-link class="text-blue-400 underline hover:text-blue-600"
                             :to="{ path: 'area' }">Area tab
                </router-link>
            </div>
            <div v-else>
                <div class="text-lg italic mt-6 text-gray-600">None selected</div>
            </div>
        </template>
    </TabTemplate>
    <!--    <pre class="text-white">{{ JSON.stringify(store.projectAreas, null, 2) }}</pre>-->
</template>
