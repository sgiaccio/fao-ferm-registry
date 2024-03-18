import type { RecursiveMenu } from '@/components/project/menus';
import { sortedGoalIndicators } from './auroraIndicators';


export function fbTimestampToString(ts: any) {
    return ts.toDate().toLocaleDateString('EN-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function snakeToCamel(o: any) {
    let newO: any;
    if (o instanceof Array) {
        return o.map(value => {
            if (typeof value === 'object') {
                value = snakeToCamel(value);
            }
            return value;
        });
    } else {
        newO = {};
        for (let origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                const newKey = origKey.replace(/-./g, x => x[1].toUpperCase());
                let value = o[origKey];
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = snakeToCamel(value);
                }
                newO[newKey] = value;
            }
        }
    }
    return newO;
}

export function camelToSnake(o: any) {
    let newO: any;
    if (o instanceof Array) {
        return o.map(value => {
            if (typeof value === 'object') {
                value = camelToSnake(value);
            }
            return value;
        });
    } else {
        newO = {};
        for (let origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                // The first character might be upper case
                let newKey = origKey.charAt(0).toLowerCase() + origKey.substring(1).replace(/[A-Z]/g, x => '-' + x[0].toLowerCase());
                let value = o[origKey];
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = camelToSnake(value);
                }
                newO[newKey] = value;
            }
        }
    }
    return newO;
}

export function getRecursiveMenuLabel(value: string | number, menu: RecursiveMenu): string {
    const label = menu.find(i => i.value === value)?.label;
    if (label) return label;
    for (const i of menu) {
        if (i.items) {
            const label = getRecursiveMenuLabel(value, i.items);
            if (label) return label;
        }
    }
    return '';
}

// export function formatNumber(n: number, limitPrecision: boolean = false): string {
//     // Check for null, undefined, or non-number values
//     if (n === null || n === undefined || typeof n !== 'number') {
//         console.log('formatNumber: not a valid number', n);
//         return 'n/a';
//     }

//     // Determine the number of decimal places based on the value of n
//     let maximumFractionDigits;
//     if (limitPrecision && n >= 100) {
//         maximumFractionDigits = 0;
//     } else if (limitPrecision && n >= 1) {
//         maximumFractionDigits = 1;
//     } else {
//         maximumFractionDigits = 2;
//     }

//     return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: maximumFractionDigits });
// }

export function roundToPrecisionAsString(number: number, precision: number) {
    let result = number.toFixed(precision);

    if (result.indexOf('.') > -1) {
        result = result.replace(/0+$/, '');
        if (result.endsWith('.')) {
            result = result.substring(0, result.length - 1);
        }
    }

    return result;
}

export function getSortedIndicatorsAndMonitoring(indicatorAndMonitoring: any) {
    function rank(i1: any, i2: any) {
        // check nullity
        if (!i1.indicator.rg_goal || !i2.indicator.rg_goal) return 0;

        const i1Index = sortedGoalIndicators.findIndex(i => i.rg_goal === i1.indicator.rg_goal);
        const i2Index = sortedGoalIndicators.findIndex(i => i.rg_goal === i2.indicator.rg_goal);
        return i1Index - i2Index;
    }

    if (!indicatorAndMonitoring) return [];
    const sorted = indicatorAndMonitoring.sort(rank);

    // group by goal
    const grouped = sorted.reduce((acc: any, indicator: any) => {
        const goal = indicator.indicator.rg_goal;
        if (!acc[goal]) {
            acc[goal] = {
                goal,
                indicators: []
            };
        }
        acc[goal].indicators.push(indicator);
        return acc;
    }, {});

    return grouped;
}

export function setsContainSameValues<T>(set1: Set<T>, set2: Set<T>) {
    if (set1.size !== set2.size) {
        return false;
    }

    for (let elem of set1) {
        if (!set2.has(elem)) {
            return false;
        }
    }

    return true;
}

export function getGroupsWhereEditor(privileges: { [key: string]: string }): string[] {
    return Object.keys(privileges).filter(group => ['editor', 'admin'].includes(privileges[group]));
}

export async function resilientFetch(url: string, options: any = {}, timeout = 5000, retries: number = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await Promise.race([
                fetch(url, options),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), timeout)
                )
            ]);

            // return response;
            if (response instanceof Response && response.ok) {
                return response;
            }
        } catch (error) {
            if ((error as Error).message === 'Timeout') {
                console.error('Request timed out');
            } else {
                console.error(`Attempt ${i + 1} failed with error:`, error);
            }
        }
    }
    throw new Error('Network error');
}

export function debounce(func: Function, wait: number) {
    let timeout: any;
    return function (this: any, ...args: []) {
        const context = this;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
};
