<script setup lang="ts">
import { ref } from 'vue';

import { sortedGoalIndicators, getGoalColor, groupByGoal, GoalIndicator } from '@/lib/auroraIndicators';
import { getSortedIndicatorsAndMonitoring } from '@/lib/util';

import { ChevronRightIcon, ChevronDownIcon, CheckCircleIcon, TrashIcon } from '@heroicons/vue/20/solid';


const props = defineProps({
    modelValue: { type: null, default: undefined },
    edit: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue'])

function addIndicator(indicator: any) {
    // check if the indicator was already selected
    if (isSelected(indicator)) return;

    const goalIndicator = sortedGoalIndicators.find(i => i.id === indicator.id);

    const newIndicators = props.modelValue || [];
    emit('update:modelValue', [...newIndicators, { indicator: goalIndicator }]);
}

function removeIndicator(indicator: GoalIndicator) {
    // const areaValue: any = Object.values(props.area.value)[0];
    if (!props.modelValue) return;

    // look for the indicator to remove
    const toBeRemoved = props.modelValue.find(i => {
        try {
            const t = new GoalIndicator(i.indicator);
            return t.equals(indicator);
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    // check that there are no monitoring years
    if (toBeRemoved?.monitoring?.length) {
        alert('Please remove all monitoring years before removing the indicator.');
        return;
    }

    const newIndicators = props.modelValue.filter(i => {
        try {
            const t = new GoalIndicator(i.indicator);
            return !t.equals(indicator);
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    emit('update:modelValue', newIndicators.length ? newIndicators : undefined);
}

const showGoals = ref(new Map());

function toggleGoal(goal: string) {
    const newMap = new Map(showGoals.value);
    newMap.set(goal, !newMap.get(goal));
    showGoals.value = newMap;
}

const showAreaGoals = ref(false);

function toggleAreaGoals() {
    showAreaGoals.value = !showAreaGoals.value;
}

function isSelected(indicator: any) {
    const indicators = props.modelValue;
    if (!indicators) return false;
    return indicators.some(i => {
        try {
            const t = new GoalIndicator(i.indicator);
            return t.equals(indicator);
        } catch (error) {
            console.error(error);
            return false;
        }
    });
}

function nSelectedByGoal(goal: string) {
    const indicators = groupByGoal(sortedGoalIndicators).find(g => g.goal === goal)?.indicators;
    if (!indicators) return 0;
    return indicators.filter(i => isSelected(i)).length;
}
</script>

<template>
    <div class="border-2 border-gray-300 rounded-md px-4 py-4 bg-gray-100">
        <h1 class="font-bold text-gray-700 text-lg pb-3">Project indicators</h1>
        <!-- summary of the selected indicators -->
        <div class="flex flex-col mb-4 gap-y-1 text-xs font-bold text-white"
             v-if="modelValue">
<!--            <pre>{{ JSON.stringify(modelValue, null, 2) }}</pre>-->
            <template v-for="goal in getSortedIndicatorsAndMonitoring(modelValue)">
                <div v-for="indicator in goal.indicators"
                     class="rounded px-3 py-2 flex shadow-sm"
                     :style="`background-color: ${getGoalColor(goal.goal)};`">
                     <!-- <pre>{{JSON.stringify(indicator, null, 2)}}</pre> -->
                    <div class="flex-grow">
                        {{ indicator.indicator.indicator }} &mdash;
                        {{ indicator.indicator.rg_subtheme }} &mdash;
                        {{ indicator.indicator.metric }} &mdash;
                        {{ indicator.indicator.action }}
                    </div>
                    <div v-if="edit"
                         @click="removeIndicator(indicator.indicator)"
                         class="cursor-pointer">
                        <TrashIcon class="w-4 h-4 cursor-pointer self-center text-black hover:text-red-500" />
                    </div>
                </div>
            </template>
        </div>
        <div v-else
             class="-mt-2 mb-2 text-gray-500 italic">
            No indicators selected for this area
        </div>

        <div v-if="edit"
             class="shadow-md rounded">
            <div class="w-full px-2.5 py-2 font-bold text-gray-700 dark:text-gray-200 border-t border-x border-gray-300 cursor-pointer flex gap-0.5 rounded-t hover:bg-gray-100 dark:hover:bg-gray-900"
                 :class="[!showAreaGoals ? 'rounded-b border-b' : '']"
                 @click="toggleAreaGoals">
                <ChevronRightIcon v-if="!showAreaGoals"
                                  class="inline w-5 h-5 cursor-pointer self-center" />
                <ChevronDownIcon v-if="showAreaGoals"
                                 class="inline w-5 h-5 cursor-pointer self-center" />
                <div class="flex-grow self-center ">Add project indicators</div>
            </div>
            <template v-if="showAreaGoals">
                <div v-for="( goal, j ) in  groupByGoal(sortedGoalIndicators)"
                     class="text-xs -mb-0">
                    <div class="w-full px-2.5 py-2 font-bold text-white border-t border-y cursor-pointer flex gap-0.5 hover:brightness-110"
                         :class="[j === groupByGoal(sortedGoalIndicators).length - 1 && !showGoals.get(goal.goal) ? 'rounded-b' : '']"
                         @click="() => toggleGoal(goal.goal)"
                         :style="`background-color: ${getGoalColor(goal.goal)}; border-color: ${getGoalColor(goal.goal)};`">
                        <ChevronRightIcon v-if="!showGoals.get(goal.goal)"
                                          class="inline w-5 h-5 cursor-pointer self-center" />
                        <ChevronDownIcon v-if="showGoals.get(goal.goal)"
                                         class="inline w-5 h-5 cursor-pointer self-center" />
                        <div class="flex-grow self-center">{{ goal.goal }}</div>
                        <div :class="['font-normal', nSelectedByGoal(goal.goal) ? '' : 'text-gray-300', 'self-center']">{{ nSelectedByGoal(goal.goal) }} selected</div>
                    </div>

                    <div v-show="!!showGoals.get(goal.goal)"
                         class="border-x border-b"
                         :class="j === groupByGoal(sortedGoalIndicators).length - 1 ? 'rounded-b-md' : ''"
                         :style="`border-color: ${getGoalColor(goal.goal)};`">
                        <div v-for="indicator  in  goal.indicators"
                             :class="['px-3 py-2 border-b last:border-b-0 text-black dark:text-gray-200', isSelected(indicator) ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer']"
                             :style="`border-color: ${getGoalColor(goal.goal, 0.4)}`"
                             @click="() => addIndicator(indicator)">
                            <div class="flex flex-row">
                                <div class="flex-grow self-center">
                                    {{ indicator.indicator }}
                                    <br>
                                    {{ indicator.rg_subtheme }} &ndash;
                                    {{ indicator.metric }} &ndash;
                                    {{ indicator.action }}
                                </div>
                                <div v-if="isSelected(indicator)"
                                     class="font-bold text-lg self-center"
                                     >
                                    <CheckCircleIcon class="inline w-6 h-6 cursor" :style="`color: ${getGoalColor(goal.goal)}`"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>