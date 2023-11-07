<script setup lang="ts">
import { watch } from 'vue';

import { useProjectStore } from '@/stores/project';

import TabTemplate from '../TabTemplate.vue';

import { PlusCircleIcon } from '@heroicons/vue/24/solid';

import { getSortedIndicatorsById, getGoalColor, groupByGoal, GoalIndicator as GI, goalIndicators, type GoalIndicator } from '@/lib/auroraIndicators';


// function transformData(data, themeLabelKey: string, subthemeLabelKey: string) {
//     const goalsMap = new Map();

//     data.forEach(item => {
//         if (!goalsMap.has(item[themeLabelKey])) {
//             goalsMap.set(item[themeLabelKey], {
//                 label: item[themeLabelKey],
//                 items: new Map()
//             });
//         }
//         const goal = goalsMap.get(item[themeLabelKey]);

//         if (!goal.items.has(item[subthemeLabelKey])) {
//             goal.items.set(item[subthemeLabelKey], {
//                 label: item[subthemeLabelKey],
//                 items: new Map()
//             });
//         }
//         const subTheme = goal.items.get(item[subthemeLabelKey]);

//         if (!subTheme.items.has(item.indicator)) {
//             subTheme.items.set(item.indicator, {
//                 label: item.indicator,
//                 items: []
//             });
//         }
//         const indicator = subTheme.items.get(item.indicator);

//         indicator.items.push({
//             value: item.id,
//             label: item.metric.trim(),
//             dangerousHtmlLabel: `${item.metric} [${item.unit.trim()}]`,
//             unit: item.unit.trim(),
//             action: item.action.trim()
//         });
//     });

//     // Convert Maps to arrays
//     const result = Array.from(goalsMap.values()).map(goal => {
//         return {
//             label: goal.label,
//             items: Array.from(goal.items.values()).map(subTheme => {
//                 return {
//                     label: subTheme.label,
//                     items: Array.from(subTheme.items.values()).map(indicator => {
//                         return {
//                             label: indicator.label,
//                             items: indicator.items
//                         };
//                     })
//                 };
//             })
//         };
//     });

//     return result;
// }

const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const gefIndicator = store.projectAreas[0][key].gefIndicator;
    const goalIndicators = store.projectAreas[0][key].goalIndicators;

    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            if (gefIndicator) {
                area[key].gefIndicator = gefIndicator;
            }
            if (goalIndicators && goalIndicators.length) {
                area[key].goalIndicators = [...goalIndicators];
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


// const indicatorsMenu = menus.goalIndicators.map(i => ({
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

function findGoalIndicator(area: any, indicator: GoalIndicator) {
    const areaValue = Object.values(area)[0] as any;
    return (areaValue.goalIndicators as any).find((i: number) => {
        const i2 = goalIndicators.find(i3 => i3.id === i);
        if (!i2) return false;
        return i2.equals(indicator);
    });
}
</script>

<template>
    <TabTemplate title="Monitoring">
        <!-- <template #description>
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
        </template> -->
        <template #default>
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
                    <div v-for="goal in groupByGoal(getSortedIndicatorsById(area[Object.keys(area)[0]].goalIndicators))"
                         class="text-xs mb-4">
                        <div class="w-full px-3 py-3 font-bold text-white border rounded-t-md"
                             :style="`background-color: ${getGoalColor(goal.goal)}; border-color: ${getGoalColor(goal.goal)};`">{{ goal.goal }}</div>

                        <div class="border-x border-b rounded-b-md"
                             :style="`border-color: ${getGoalColor(goal.goal)};`">
                            <div v-for="indicator in goal.indicators"
                                 class="px-3 py-3 border-b last:border-b-0">
                                <div class="flex flex-row ">
                                    <div class="flex-grow self-center font-medium">
                                        {{ indicator.rg_subtheme }} || {{ indicator.indicator }}
                                        <br>
                                        {{ indicator.action }}: {{ indicator.metric }}
                                    </div>
                                    <div>
                                        <div class="flex flex-row gap-x-5">
                                            <div class="flex flex-col">
                                                <label for="year"
                                                       class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    Year
                                                </label>
                                                <input type="number"
                                                       name="year"
                                                       id="year"
                                                       class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                       v-model="findGoalIndicator(area, indicator).value">
                                            </div>
                                            <div class="flex flex-col">
                                                <label for="value"
                                                       class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    {{ indicator.unit }}
                                                </label>
                                                <input type="number"
                                                       name="value"
                                                       id="value"
                                                       class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                       v-model="indicator.value">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="w-full text-right mt-3 ">
                                    <PlusCircleIcon class="inline w-5 h-5 cursor-pointer"
                                                    :style="`color: ${getGoalColor(goal.goal)};`" />
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- <pre>{{ JSON.stringify(getSortedIndicatorsById(area[Object.keys(area)[0]].goalIndicators), null, 2) }} </pre> -->
                    <!-- <div v-for="indicator in area[Object.keys(area)[0]].goalIndicators || []"> -->
                    <!-- <div v-for="indicator in getSortedIndicatorsById(area[Object.keys(area)[0]].goalIndicators)">
                            {{ indicator.metric }}
                        </div> -->



                    <!-- <pre>{{ JSON.stringify(groupByGoal(getSortedIndicatorsById(area[Object.keys(area)[0]].goalIndicators)), null, 2) }} </pre> -->


                    <!-- <div class="mt-8 flow-root">
                        <div class="-mx-4_ -my-2_ overflow-x-auto sm:-mx-6_ lg:-mx-8_">
                            <div class="inline-block min-w-full py-2 align-middle sm:px-6_ lg:px-8_">
                                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"> -->
                    <!-- <div class="min-w-full overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-300 w-full text-xs rounded-lg">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">Goal</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left font-semibold text-gray-900">Subtheme</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left font-semibold text-gray-900">Indicator</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left font-semibold text-gray-900">Action</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left font-semibold text-gray-900">Metric</th>
                                    <th scope="col"
                                        class="px-3 py-3.5 text-left font-semibold text-gray-900">Unit</th>
                                    <th scope="col"
                                        class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span class="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                <template v-for="indicator in getSortedIndicatorsById(area[Object.keys(area)[0]].goalIndicators)"
                                          :key="indicator.metric">
                                    <tr :style="`background-color: ${indicator.color};`">
                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-white sm:pl-6">{{ indicator.rg_goal }}</td>
                                        <td class="whitespace-nowrap py-4 pl-4 text-white sm:pl-6">{{ indicator.rg_subtheme }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-white">{{ indicator.indicator }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-white">{{ indicator.action }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-white">{{ indicator.metric }}</td>
                                        <td class="whitespace-nowrap px-3 py-4 text-white">{{ indicator.unit }}</td>
                                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium sm:pr-6">
                                            <a href="#"
                                               class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, {{ indicator.name }}</span></a>
                                        </td>
                                    </tr>
                                    <tr :style="`background-color: ${indicator.color};`" class="border-b-gray-800 border-b">
                                        <td colspan="7"
                                            class="whitespace-nowrap py-4 pl-4 pr-3 text-white sm:pl-6">
                                            <!- - year input - ->
                                            
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div> -->
                    <!-- </div>
                            </div>
                        </div>
                    </div> -->



                </div>
            </div>
            <!-- <div v-for="indicator in sortedGoalIndicators">
                {{ indicator.rg_goal }}
            </div> -->
        </template>
    </TabTemplate>
</template>
