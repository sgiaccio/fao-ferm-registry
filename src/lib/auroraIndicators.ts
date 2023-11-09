import goalJsonData from '@/assets/aurora-json-files/goal_indicators_EN.json';


// Goal sorting
export const goalOrder = ['Food & Products', 'Climate', 'Soil', 'Water', 'Energy', 'Biodiversity', 'Culture', 'Community'] as const;

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

    constructor(goalIndicator: RawGoalIndicator) {
        // check if goalIndicator is valid
        if (!goalIndicator) {
            throw new Error('Invalid goal indicator');
        }
        // check if goalIndicator has all required properties
        const requiredProperties: GoalIndicatorKey[] = ['id', 'indicator', 'metric', 'action', 'action_id', 'unit', 'rg_goal', 'rg_goal_id', 'rg_subtheme'];
        for (const property of requiredProperties) {
            if (goalIndicator[property] === undefined || goalIndicator[property] === '') {
                throw new Error(`Invalid goal indicator, missing or empty property: ${property}`);
            }
        }

        this.id = goalIndicator.id;
        this.indicator = goalIndicator.indicator.trim();
        this.metric = goalIndicator.metric.trim();
        this.action = goalIndicator.action.trim();
        this.action_id = goalIndicator.action_id;
        this.unit = goalIndicator.unit.trim();
        this.rg_goal = goalIndicator.rg_goal.trim();
        this.rg_goal_id = goalIndicator.rg_goal_id.trim();
        this.rg_subtheme = goalIndicator.rg_subtheme.trim();
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

    clone(): GoalIndicator {
        return new GoalIndicator({
            id: this.id,
            indicator: this.indicator,
            metric: this.metric,
            action: this.action,
            action_id: this.action_id,
            unit: this.unit,
            rg_goal: this.rg_goal,
            rg_goal_id: this.rg_goal_id,
            rg_subtheme: this.rg_subtheme,
        });
    }
}

export const goalIndicators = goalJsonData.map(goalIndicator => new GoalIndicator(goalIndicator));

export const rawGoalIndicators: RawGoalIndicator[] = goalJsonData;

export const goalColors: { [goal: string]: string } = {
    'Food & Products': '150, 189, 61',
    'Climate': '75, 166, 123',
    'Soil': '5, 146, 195',
    'Water': '0, 107, 160',
    'Energy': '0, 66, 122',
    'Biodiversity': '76, 48, 126',
    'Culture': '148, 27, 130',
    'Community': '181, 68, 40',
};

export function getGoalColor(goal: string, opacity: number = 1): string {
    return `rgba(${goalColors[goal]}, ${opacity})`;
}

// sort goals by order
export const sortedGoalIndicators = goalIndicators.sort((a, b) => {
    const aIndex = goalOrder.indexOf(a.rg_goal)
    const bIndex = goalOrder.indexOf(b.rg_goal);
    return aIndex - bIndex;
});

interface RawGoalIndicator {
    id: number;
    indicator: string;
    metric: string;
    action: string;
    action_id: number;
    unit: string;
    bottom_limit?: number;
    top_limit?: number;
    step?: number;
    rg_goal: string;
    rg_goal_id: string;
    rg_subtheme: string;
    bs_focus?: string;
    bs_focus_id?: number;
    bs_subtheme?: string;
    eg_focus?: string;
    eg_focus_id?: number;
    eg_subtheme?: string;
    landuse?: string;
    sgd_aichi_ldn?: string;
    selected?: boolean;
    SDGs?: string[];
}

type GoalIndicatorKey = keyof RawGoalIndicator;

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
