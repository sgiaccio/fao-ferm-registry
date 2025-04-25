export type MenuValue = string | number

// export type MenuItem = { value: MenuValue, label?: string, dangerousHtmlLabel?: string }

export type Menu = RecursiveMenu;
export type MenuItem = RecursiveMenuItem;

export interface RecursiveMenuItem {
    label?: string
    value?: MenuValue
    items?: RecursiveMenu
    dangerousHtmlLabel?: string
}[];

export type RecursiveMenu = Array<RecursiveMenuItem>;

export function filterByLabel(data: RecursiveMenu, searchString: string): RecursiveMenu {
    // Initialize an empty array to hold the filtered results
    let filteredData: RecursiveMenu = [];

    // Iterate through each item in the provided data array
    for (const item of data) {
        // Initialize an empty object to potentially hold filtered items and subitems
        let filteredItem: RecursiveMenuItem = {};

        // Check if the label contains the search string
        if (item.label?.toLowerCase().includes(searchString.toLowerCase())) {
            filteredItem = { ...item }; // Clone the item if it matches
            if (item.dangerousHtmlLabel) {
                filteredItem.dangerousHtmlLabel = item.dangerousHtmlLabel.replace(new RegExp(`(${searchString})`, 'gi'), '<span class="bg-yellow-300 dark:bg-yellow-800">$1</span>');
            } else {
                filteredItem.label = item.label.replace(new RegExp(`(${searchString})`, 'gi'), '<span class="bg-yellow-300 dark:bg-yellow-800">$1</span>');
            }
        }

        // Recursively apply the filter to subitems if they exist
        if (Array.isArray(item.items)) {
            const filteredSubItems = filterByLabel(item.items, searchString);
            if (filteredSubItems.length > 0) {
                filteredItem.items = filteredSubItems;
                if (!filteredItem.label) {
                    // Inherit label from original item if not already set
                    filteredItem.label = item.label;
                }
            }
        }

        // Only include non-empty filtered items in the final result
        if (filteredItem.label || filteredItem.items) {
            filteredData.push(filteredItem);
        }
    }

    return filteredData;
}

export function getMenuSelectedLabel(value: MenuValue, menu: RecursiveMenu): string {
    const selected = menu.find(u => u.value === value);
    return selected ? selected.label || ('' + value) : 'No units selected';
}
