<script setup lang="ts">
import { watch } from 'vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

// import { indicators, gefIndicators } from '@/components/project/menus';
import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import RecursiveRadio from '@/components/inputs/base/RecursiveRadio.vue';

import { roundToPrecisionAsString } from '@/lib/util';




import goalJsonData from '@/assets/aurora-json-files/goal_indicators_EN.json';
// import landuseJsonData from '@/assets/aurora-json-files/goal_indicators_EN.json';
// import barriersJsonData from '@/assets/aurora-json-files/goal_indicators_EN.json';

function transformData(data, themeLabelKey: string, subthemeLabelKey: string) {
    const goalsMap = new Map();

    data.forEach(item => {
        if (!goalsMap.has(item[themeLabelKey])) {
            goalsMap.set(item[themeLabelKey], {
                label: item[themeLabelKey],
                items: new Map()
            });
        }
        const goal = goalsMap.get(item[themeLabelKey]);

        if (!goal.items.has(item[subthemeLabelKey])) {
            goal.items.set(item[subthemeLabelKey], {
                label: item[subthemeLabelKey],
                items: new Map()
            });
        }
        const subTheme = goal.items.get(item[subthemeLabelKey]);

        if (!subTheme.items.has(item.indicator)) {
            subTheme.items.set(item.indicator, {
                label: item.indicator,
                items: []
            });
        }
        const indicator = subTheme.items.get(item.indicator);

        indicator.items.push({
            value: item.id,
            label: item.metric.trim(),
            dangerousHtmlLabel: `${item.metric} [${item.unit.trim()}]`,
            unit: item.unit.trim(),
            action: item.action.trim()
        });
    });

    // Convert Maps to arrays
    const result = Array.from(goalsMap.values()).map(goal => {
        return {
            label: goal.label,
            items: Array.from(goal.items.values()).map(subTheme => {
                return {
                    label: subTheme.label,
                    items: Array.from(subTheme.items.values()).map(indicator => {
                        return {
                            label: indicator.label,
                            items: indicator.items
                        };
                    })
                };
            })
        };
    });

    return result;
}


// const transformedData = transformData(jsonData);
// console.log(JSON.stringify(transformedData, null, 2));

const goalIndicatorsMenu = transformData(goalJsonData, 'rg_goal', 'rg_subtheme');
// const landuseIndicatorsMenu = transformData(landuseJsonData, 'rg_goal', 'rg_subtheme');









const store = useProjectStore();
const menus = useMenusStore().menus;

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const gefIndicator = store.projectAreas[0][key].gefIndicator;
    const auroraIndicators = store.projectAreas[0][key].auroraIndicators;

    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            if (gefIndicator) {
                area[key].gefIndicator = gefIndicator;
            }
            if (auroraIndicators && auroraIndicators.length) {
                area[key].auroraIndicators = [...auroraIndicators];
            }
        }
    });
}

// Delete restorationType and tenureStatus for GEF3 indicators. This should be done in the store, but will be done here for now.
watch(() => store.projectAreas, areas => areas.forEach(area => {
    const areaValue = Object.values(area)[0];
    if (!areaValue.gefIndicator?.startsWith('GEF3')) {
        delete areaValue.restorationType;
        delete areaValue.tenureStatus;
    }
}), { deep: true });

// const indicatorsMenu = menus.auroraIndicators.map(i => ({
//     ...i,
//     label: `${i.label} [${i.units}]`,
// }));

// let indicatorsMenu: any = [];


// function addUnitAndAction(indicators: any, newIndicators: any) {
//     for (const indicator of indicators) {
//         console.log(indicator.label);
//         if (indicator.items) {
//             for (const item of indicator.items) {
//                 addUnitAndAction(indicator.items, []);
//             }
//         }
//         //     if (indicator.items) {
//         //         addUnitAndAction(indicator.items, newIndicators);
//         //     } else {
//         //         newIndicators.push({
//         //             ...indicator,
//         //             label: `${indicator.label} [${indicator.units}]`,
//         //         });
//         //     }
//     }
// }

// addUnitAndAction(transformData(jsonData), []);


// Goal sorting
// const goalOrder = ['f_yield', 'cl_mitigation', 's_quality', 'w_quality', 'e_quantity', 'b_quality', 'cu_practices', 'co_income'];
// const indicatorColors = {
//     'Food & Products': 'rgb(150, 189, 61)',
//     'cl_mitigation': 'rgb(75, 166, 123)',
//     s_quality: 'rgb(5, 146, 195)',
//     w_quality: 'rgb(0, 107, 160)',
//     e_quantity: 'rgb(0, 66, 122)',
//     b_quality: 'rgb(76, 48, 126)',
//     cu_practices: 'rgb(148, 27, 130)',
//     co_income: 'rgb(181, 68, 40)',
// };

// // sort goals by order
// const sortedGoalIndicators = goalJsonData.sort((a, b) => {
//     const aIndex = goalOrder.indexOf(a.rg_goal_id)
//     const bIndex = goalOrder.indexOf(b.rg_goal_id);
//     return aIndex - bIndex;
// });
</script>

<template>
    <TabTemplate title="Indicators">
        <template #description>
            <template v-if="store.project.reportingLine === 'GEF'">
                <p>
                    Indicators are selected to monitor project progress. The methodology proposed to report and monitor the achievement of GEF commitments including restoration (in ha of land) in FERM is through GEF Core Indicators.
                </p>
                <p>
                    Details on GEF Core Indicators can be found under this
                    <a href="https://www.thegef.org/sites/default/files/documents/2022-09/Results_Framework_Guidelines_2022_06_30.pdf"
                       target="_blank"
                       class="text-blue-600 dark:text-blue-100 underline hover:text-blue-500 dark:hover:text-blue-200">link</a>.
                </p>
            </template>
            <template v-else>
                <p>
                    Indicators are selected to monitor ecosystem restoration progress. The list of global indicators for monitoring ecosystem restoration is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated (<a href="https://www.fao.org/publications/card/en/c/CB9982EN"
                       target="_blank"
                       class="text-ferm-blue-dark-700 dark:text-ferm-blue-dark-100 underline hover:text-ferm-blue-dark-500 dark:hover:text-ferm-blue-dark-300">https://www.fao.org/publications/card/en/c/CB9982EN</a>).
                </p>
                <p class="pt-4">
                    You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project.
                </p>
            </template>
        </template>
        <template #default>
            <!-- hide if GEF -->
            <!-- <div v-if="store.project.reportingLine !== 'GEF'"
                 class="pb-6">
                <h1 class="text-2xl dark:text-zinc-300 font-bold mb-3">SDG indicators</h1>
                <RecursiveMenu :edit="edit"
                               v-model="store.project.indicators"
                               :options="menus.indicators"
                               :expandLevel="0" />

            </div> -->

            <!-- hide if not GEF -->
            <!-- <div class="pt-8"
                 v-if="store.project.reportingLine !== 'GEF'">
                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="( area ) in  store.projectAreas "
                         class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                        <!- - Project indicators - ->
                        <div>
                            <h1 class="text-2xl dark:text-zinc-300 font-bold mb-3">Project level indicators</h1>
                            <RecursiveMenu :edit="edit"
                                           v-model="area[Object.keys(area)[0]].auroraIndicators"
                                           :options="goalIndicatorsMenu"
                                           :searchable="true" />
                        </div>
                    </div>
                </div>
            </div> -->
            <div class="pt-8"
                 v-if="store.project.reportingLine !== 'GEF'">
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`" />

                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="( area, i ) in  store.projectAreas "
                         class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                        <div class="flex flex-row my-3">
                            <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                                Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
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
                        <!-- Project indicators -->
                        <div>
                            <h1 class="text-2xl dark:text-zinc-300 font-bold mb-3">Project indicators</h1>
                            <RecursiveMenu :edit="edit"
                                           v-model="area[Object.keys(area)[0]].auroraIndicators"
                                           :options="goalIndicatorsMenu"
                                           :searchable="true" />
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
                    <div class="text-lg italic text-gray-600 dark:text-gray-400">None selected</div>
                </div>
            </div>



            <!-- GEF -->
            <div class="pt-8"
                 v-else>
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`" />

                <!-- Area by indicator -->
                <div class="mb-6">
                    <!-- <h3 class="text-xl font-semibold leading-6 text-gray-900">Area by indicator</h3> -->
                    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div v-for=" [indicator, area]  in  store.areaByGefIndicator() "
                             :key="indicator"
                             class="overflow-hidden rounded-lg bg-gray-100 px-4 py-5 shadow sm:p-6 flex flex-col">
                            <dt class="flex-grow text-sm font-medium text-gray-500">
                                {{ getRecursiveMenuLabel(indicator, menus.gefIndicators) }}
                            </dt>
                            <dd class="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                                {{ area.toFixed(2) }} Ha
                            </dd>
                        </div>
                    </dl>
                </div>

                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="( area, i ) in  store.projectAreas "
                         class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                        <div class="flex flex-row my-3">
                            <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                                Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
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
                        <!-- Project indicators -->
                        <div>
                            <h1 class="text-2xl dark:text-zinc-300 font-bold mb-3">Project indicators</h1>
                            <RecursiveMenu :edit="edit"
                                           v-model="area[Object.keys(area)[0]].auroraIndicators"
                                           :options="goalIndicatorsMenu"
                                           :searchable="true" />
                        </div>
                        <div class="px-4 sm:px-3 lg:px-4">
                            <!-- <div class="sm:flex sm:items-center">
                                <div class="sm:flex-auto">
                                    <h1 class="text-base font-semibold leading-6 text-gray-900">Users</h1>
                                    <p class="mt-2 text-sm text-gray-700">A list of all the users in your account including their name, title, email and role.</p>
                                </div>
                                <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                                    <button type="button"
                                            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add user</button>
                                </div>
                            </div> -->
                            <!-- <div class="mt-8 flow-root">
                                <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                            <table class="min-w-full divide-y divide-gray-300">
                                                <thead class="bg-gray-50">
                                                    <tr>
                                                        <th scope="col"
                                                            class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Goal</th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subtheme</th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Indicator</th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Metric</th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit</th>
                                                        <th scope="col"
                                                            class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                            <span class="sr-only">Select/delete</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-gray-200 bg-white">
                                                    <tr v-for="metric in sortedGoalIndicators"
                                                        :key="metric.email" :style="`background-color: ${indicatorColors[metric.rg_goal_id]};`">
                                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ metric.name }}</td>
                                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ metric.rg_goal_id }}</td>
                                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ metric.email }}</td>
                                                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ metric.role }}</td>
                                                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <a href="#"
                                                               class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, {{ metric.name }}</span></a>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div> -->
                        </div>

                        <!-- <div class="mt-6">
                            <h1 class="akrobat text-2xl dark:text-zinc-300 font-bold mb-3">Project level indicators</h1>

                        </div> -->
                        <div class="mt-6">
                            <h1 class="akrobat text-2xl dark:text-zinc-300 font-bold mb-3">GEF indicators</h1>
                            <RecursiveRadio v-model="area[Object.keys(area)[0]].gefIndicator"
                                            :options="menus.gefIndicators"
                                            :edit="edit" />
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
                    <div class="text-lg italic text-gray-600 dark:text-gray-400">None selected</div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
