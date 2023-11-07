import goalJsonData from '@/assets/aurora-json-files/goal_indicators_EN.json';


// Goal sorting
const goalOrder = ['f_yield', 'cl_mitigation', 's_quality', 'w_quality', 'e_quantity', 'b_quality', 'cu_practices', 'co_income'];

export class GoalIndicator {
    id: number;
    indicator: string;
    metric: string;
    action: string;
    action_id: number;
    unit: string;
    rg_goal: string;
    rg_goal_id: string;
    rg_subtheme: string;

    constructor(goalIndicator: GoalIndicator_) {
        this.id = goalIndicator.id;
        this.indicator = goalIndicator.indicator;
        this.metric = goalIndicator.metric;
        this.action = goalIndicator.action;
        this.action_id = goalIndicator.action_id;
        this.unit = goalIndicator.unit;
        this.rg_goal = goalIndicator.rg_goal;
        this.rg_goal_id = goalIndicator.rg_goal_id;
        this.rg_subtheme = goalIndicator.rg_subtheme;
    }

    get color(): string {
        return goalColors[this.rg_goal];
    }

    equals(other: GoalIndicator): boolean {
        if (!other || !(other instanceof GoalIndicator)) {
            return false;
        }

        return this.id === other.id
            && this.indicator === other.indicator
            && this.metric === other.metric
            && this.action === other.action
            && this.action_id === other.action_id
            && this.unit === other.unit
            && this.rg_goal === other.rg_goal
            && this.rg_goal_id === other.rg_goal_id
            && this.rg_subtheme === other.rg_subtheme;
    }
}


export const goalIndicators = goalJsonData.map(goalIndicator => new GoalIndicator(goalIndicator));

export const rawGoalIndicators = goalJsonData;

export const goalColors = {
    'Food & Products': 'rgb(150, 189, 61)',
    'Climate': 'rgb(75, 166, 123)',
    'Soil': 'rgb(5, 146, 195)',
    'Water': 'rgb(0, 107, 160)',
    'Energy': 'rgb(0, 66, 122)',
    'Biodiversity': 'rgb(76, 48, 126)',
    'Culture': 'rgb(148, 27, 130)',
    'Community': 'rgb(181, 68, 40)',
};

export function getGoalColor(goal: string): string {
    return goalColors[goal];
}

// sort goals by order
export const sortedGoalIndicators = goalIndicators.sort((a, b) => {
    const aIndex = goalOrder.indexOf(a.rg_goal_id)
    const bIndex = goalOrder.indexOf(b.rg_goal_id);
    return aIndex - bIndex;
});

export function getSortedIndicatorsById(indicatorIds: number[]) {
    if (!indicatorIds || !indicatorIds.length) {
        return [];
    }
    return sortedGoalIndicators.filter(indicator => indicatorIds.includes(indicator.id));
}

// export function getIndicatorColor(indicator: any): string {
//     return indicatorColors[indicator.rg_goal];
// }

interface GoalIndicator_ {
    id: number;
    indicator: string;
    metric: string;
    action: string;
    action_id: number;
    unit: string;
    bottom_limit: number;
    top_limit: number;
    step: number;
    rg_goal: string;
    rg_goal_id: string;
    rg_subtheme: string;
    bs_focus: string;
    bs_focus_id: number;
    bs_subtheme: string;
    eg_focus: string;
    eg_focus_id: number;
    eg_subtheme: string;
    landuse: string;
    sgd_aichi_ldn: string;
    selected: boolean;
    SDGs: string[];
}

export function groupByGoal(goalIndicators: GoalIndicator[]) {
    const indicatorByGoal: { goal: string, indicators: GoalIndicator[] }[] = [];
    for (const indicator of goalIndicators) {
        const goal = indicator.rg_goal;
        if (!indicatorByGoal.find(i => i.goal === goal)) {
            indicatorByGoal.push({
                goal,
                indicators: []
            });
        }
        indicatorByGoal.find(i => i.goal === goal)!.indicators.push(indicator);
    }
    return indicatorByGoal;
}
