import { defineStore } from 'pinia';

import {
    GoalIndicator,
    type RawGoalIndicator,
    type CustomIndicator,
} from '@/lib/auroraIndicators';

export const useAuroraStore = defineStore('aurora', {
    state: () => {
        return {
            userKey: null as string | null,
            projectId: null as string | null,
            auroraProject: null as any,
            rawGoalIndicators: [] as RawGoalIndicator[],
            goalIndicators: [] as GoalIndicator[],
            customIndicators: [] as CustomIndicator[],
        };
    },
    actions: {
        setRawGoalIndicators(rawGoalIndicators: RawGoalIndicator[]) {
            this.rawGoalIndicators = rawGoalIndicators;
        },
        setGoalIndicators(goalIndicators: GoalIndicator[]) {
            this.goalIndicators = goalIndicators;
        },
        setGoalIndicatorsFromRaw(rawGoalIndicators: RawGoalIndicator[]) {
            this.rawGoalIndicators = rawGoalIndicators;
            this.goalIndicators = rawGoalIndicators.map(
                (goalIndicator: RawGoalIndicator) =>
                    new GoalIndicator(goalIndicator),
            );
        },
        setCustomIndicatorsFromRaw(rawCustomIndicators: CustomIndicator[]) {
            this.customIndicators = rawCustomIndicators.map(
                (customIndicator: CustomIndicator) => ({
                    indicator: customIndicator.indicator,
                    metric: customIndicator.metric,
                    unit: customIndicator.unit,
                }),
            );
        },
        async fetchAuroraProject(userKey: string, auroraProjectId: string) {
            this.userKey = userKey;
            this.projectId = auroraProjectId;
            try {
                const res = await fetch(
                    `https://aurora.b4a.app/get_projects/${userKey}/${auroraProjectId}`,
                );
                const data = await res.json();
                this.auroraProject = data;
                this.setGoalIndicatorsFromRaw(data.indicators);
                this.setCustomIndicatorsFromRaw(data.customIndicators);
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        reset() {
            this.userKey = null;
            this.projectId = null;
            this.rawGoalIndicators = [];
            this.goalIndicators = [];
            this.customIndicators = [];
            this.auroraProject = null;
        },
    },
});
