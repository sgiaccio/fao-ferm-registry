import {sortedGoalIndicators} from './auroraIndicators';
import type { AreaDataKey, AreaObject, Menu, MenuValue, RecursiveMenu, RecursiveMenuItem } from '@/types';
import { getAreaValue } from '@/lib/areaUtil';

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
                // The first character might be uppercase
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

export function getRecursiveMenuLabel(value: MenuValue, menu: RecursiveMenu): string {
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

export function formatNumber(n: number) {
    // Use the toLocaleString method to add suffixes to the number
    return n.toLocaleString('en-US', {
        // add suffixes for thousands, millions, and billions
        // the maximum number of decimal places to use
        maximumFractionDigits: 0,
        // specify the abbreviations to use for the suffixes
        notation: 'compact',
        compactDisplay: 'short'
    });
}

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
    return sorted.reduce((acc: any, indicator: any) => {
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
}

export function getRecursiveMenuItem(menu: RecursiveMenu, value: MenuValue): RecursiveMenuItem | null {
    for (const item of menu) {
        if (item.value === value) {
            return item;
        }
        if (item.items) {
            const found = getRecursiveMenuItem(item.items, value);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

export function flattenMenu(menu: RecursiveMenu): Menu {
    const result: Menu = [];
    for (const item of menu) {
        if (item.value) {
            result.push(item);
        }
        if (item.items) {
            result.push(...flattenMenu(item.items));
        }
    }
    return result;
}

export function getAllSelectedItemsInAreas(areas: AreaObject[], key: AreaDataKey, menu: RecursiveMenu) {
    if (areas.length === 0) return [];
    const items: MenuValue[] = areas.reduce((acc: any, area) => {
        const areaObjValue = getAreaValue(area);
        const areaItems = areaObjValue[key];
        return areaItems
            ? (Array.isArray(areaItems)
                ? [...acc, ...areaItems]
                : [...acc, areaItems])
            : acc;
    }, []);
    // remove duplicates
    const uniqueItems = [...new Set(items)];
    return uniqueItems
        .map(i => getRecursiveMenuItem(menu, i))
        .filter((item): item is RecursiveMenuItem => item !== null)
        .map(i => i.value)
}

export function groupBiomesByRealm(biomes: any, realmsMenu: RecursiveMenu) {
    // Get the realm ids from the realm menu - the convention is that the realm id is the first word in the realm label
    const realms = realmsMenu.map(realm => realm.label?.split(' ')[0] ?? '').filter(Boolean);

    // sort biomes alphabetically - this will make biomes ordered alphabetically within realms
    const sortedBiomes = biomes.sort((a: string, b: string) => a.localeCompare(b));

    if (sortedBiomes?.length) {
        // sort biomes internally in realms
        const biomesByRealm = sortedBiomes.reduce((acc: any, curr: string) => {
            // Realm is the first characters before the first digit
            const realm = curr.substring(0, curr.search(/\d/));
            if (!acc[realm]) {
                acc[realm] = [];
            }
            acc[realm].push(curr);
            return acc;
        }, {});

        const biomesByRealmArr = Object.entries(biomesByRealm).map(([realm, biomes]) => ({ realm, biomes }));

        // Sort according to the order in the realms array
        return biomesByRealmArr.sort((a, b) => {
            return realms.findIndex(r => r === a.realm) > realms.findIndex(r => r === b.realm) ? 1 : -1;
        });
    } else {
        return [];
    }
}

export function getLastTargetArea(project: any) {
    // reverse the order of the phases and return the first one that is not null
    return project.project?.targetAreaEvaluationPhase || project.project?.targetAreaReviewPhase || project.project?.targetAreaDesignPhase;
}

export function getPolygonsArea(areasObj: AreaObject[]) {
    // const getValue = (area: any) => Object.values(area)[0];
    try {
        const areas = areasObj
            // .filter((a: any) => ['draw', 'upload'].includes(getType(a)))
            // .map((a: any) => +((getValue(a) as { area: number }).area || 0));
            .map(a => +(getAreaValue(a).area || 0));
        return areas.reduce((a: number, b: number) => a + b, 0);
    } catch (e) {
        console.error('Error calculating polygons area', e);
        return NaN;
    }
}

export function areaByGefIndicator(areas: AreaObject[]) {
    return Object.entries(
        areas.reduce((acc: { [indicator: string]: number }, area: any) => {
            const { gefIndicator, area: areaValue } = getAreaValue(area);
            return gefIndicator ? {
                ...acc,
                [gefIndicator]: (acc[gefIndicator] || 0) + +(areaValue || 0)
            } : acc;
        }, {}))
        .sort((a, b) => {
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;
            return 0;
        });
}

export function areaByGefIndicatorGroup(areas: any) {
    const indicators = areaByGefIndicator(areas);
    const areaByIndicatorGroup = indicators.reduce((prev, [id, area]) => {
        const newId = id === 'GEF2LDCF' ? '2LDCF' : id.slice(3, 4);
        return prev.set(newId, (prev.get(newId) || 0) + area);
    }, new Map());
    return Array.from(areaByIndicatorGroup);
}

const realmColors = [
    { value: 'T', color: '#1f77b4', borderColor: '#0d4d8a', key: 'iucnEcosystems.T_Terrestrial_realm' },
    { value: 'M', color: '#ff7f0e', borderColor: '#cc6608', key: 'iucnEcosystems.M_Marine_realm' },
    { value: 'F', color: '#2ca02c', borderColor: '#1e6a1e', key: 'iucnEcosystems.F_Freshwater_realm' },
    { value: 'S', color: '#d62728', borderColor: '#9a1c1c', key: 'iucnEcosystems.S_Subterranean_realm' },
    { value: 'MT', color: '#9467bd', borderColor: '#6b4c8a', key: 'iucnEcosystems.MT_Marine_Terrestrial_realm' },
    { value: 'SF', color: '#8c564b', borderColor: '#623c34', key: 'iucnEcosystems.SF_Subterranean_Freshwater_realm' },
    { value: 'FM', color: '#e377c2', borderColor: '#b25399', key: 'iucnEcosystems.FM_Freshwater_Marine_realm' },
    { value: 'MFT', color: '#7f7f7f', borderColor: '#595959', key: 'iucnEcosystems.MFT_Marine_Freshwater_Terrestrial_realm' },
    { value: 'SM', color: '#bcbd22', borderColor: '#8a8c16', key: 'iucnEcosystems.SM_Subterranean_Marine_realm' },
    { value: 'TF', color: '#17becf', borderColor: '#11a3ac', key: 'iucnEcosystems.TF_Terrestrial_Freshwater_realm' },
];

export function getRealmColor(realm: string) {
    return realmColors.find(r => r.value === realm)?.color || '#ffffff';
}

export function getRealmBorderColor(realm: string) {
    return realmColors.find(r => r.value === realm)?.borderColor || '#000000';
}

export function getEcosystemColor(ecosystem: string) {
    const realm = ecosystem.substring(0, ecosystem.search(/\d/));
    return getRealmColor(realm);
}

export function getRealmKey(realm: string) {
    return realmColors.find(r => r.value === realm)?.key;
}

export function getEMStatsYears(stats: any) {
    return stats.map((year: any) => year.year);
}

// Processing function for pushing area_ha values
function pushAreaHa(values: any[], data: any) {
    values.push(data.area_ha ?? 0);
}

// Processing function for calculating averages using a closure
function accumulateAverage(totalYears: number) {
    return function (values: any[], data: any) {
        const addendum = (data.area_ha ?? 0) / totalYears;
        if (values.length === 0) {
            values.push(addendum);
        } else {
            values[0] += addendum;
        }
    };
}

function createValuesFromStats(stats: any[], processFn: (values: any[], data: any) => void, initialValue: any = []) {
    return stats.reduce((acc: any[], year: any) => {
        for (const data of year.data) {
            const className = data.class_name;
            let item = acc.find((a: any) => a.class_name === className);
            if (!item) {
                item = {
                    class_name: className,
                    values: [],
                };
                acc.push(item);
            }
            processFn(item.values, data);
        }
        return acc;
    }, initialValue);
}

// Using the function to create Echart values
export function createEchartValuesFromEMStats(stats: any[], initialValue: any = []) {
    return createValuesFromStats(stats, pushAreaHa, initialValue);
}

// // Using the function to calculate averages
// const totalYears = years2011to2020.length;
// const averages2011to2020 = createValuesFromStats(
//     years2011to2020,
//     accumulateAverage(totalYears)
// );

export function createEchartValuesFromEMStatsAverages(stats: any[]) {
    const totalYears = stats.length;
    return createValuesFromStats(stats, accumulateAverage(totalYears));
}

export function addMissingEMClasses(stats: any, startYear: number) {
    const years = stats.statisticResults.years;
    const firstYearInData = Math.min(...years.map((year: any) => year.year));
    const firstYear = Math.max(startYear, firstYearInData);
    const lastYear = Math.max(...years.map((year: any) => year.year));
    const allYears = [];
    for (let i = firstYear; i <= lastYear; i++) {
        allYears.push(i);
    }

    const allClasses = years.reduce((acc: any, year: any) => {
        year.data.forEach((data: any) => {
            if (!acc.includes(data.class_name)) {
                acc.push(data.class_name);
            }
        });
        return acc;
    }, []);

    allYears.forEach((year: any) => {
        const yearData = years.find((y: any) => y.year === year);
        if (!yearData) {
            years.push({
                year,
                data: allClasses.map((c: any) => ({
                    class_name: c,
                    value: 0,
                })),
            });
        } else {
            const classes = yearData.data.map((d: any) => d.class_name);
            const missingClasses = allClasses.filter((c: any) => !classes.includes(c));
            missingClasses.forEach((c: any) => {
                yearData.data.push({
                    class_name: c,
                    value: 0,
                });
            });
        }
    });

    // sort years
    years.sort((a: any, b: any) => a.year - b.year);
    return years;
}
