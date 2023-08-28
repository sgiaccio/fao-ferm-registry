import type { RecursiveMenu } from "@/components/project/menus";

export function fbTimestampToString(ts: any) {
    return ts.toDate().toLocaleDateString('default');
}

export function snakeToCamel(o: any) {
    let newO: any;
    if (o instanceof Array) {
        return o.map(value => {
            if (typeof value === "object") {
                value = snakeToCamel(value);
            }
            return value;
        });
    } else {
        newO = {}
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
            if (typeof value === "object") {
                value = camelToSnake(value);
            }
            return value;
        });
    } else {
        newO = {}
        for (let origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                // The first character might be upper case
                let newKey = origKey.charAt(0).toLowerCase() + origKey.substring(1).replace(/[A-Z]/g, x => '-' + x[0].toLowerCase())
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

export function formatNumber(n: number, limitPrecision: boolean = false): string {
    // Check for null, undefined, or non-number values
    if (n === null || n === undefined || typeof n !== 'number') {
        console.log('formatNumber: not a valid number', n);
        return 'n/a';
    }

    // Determine the number of decimal places based on the value of n
    let maximumFractionDigits;
    if (limitPrecision && n >= 100) {
        maximumFractionDigits = 0;
    } else if (limitPrecision && n >= 1) {
        maximumFractionDigits = 1;
    } else {
        maximumFractionDigits = 2;
    }

    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: maximumFractionDigits });
}
