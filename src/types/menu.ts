export type MenuValue = string | number
export type Menu = RecursiveMenu;
export type MenuItem = RecursiveMenuItem;

export interface RecursiveMenuItem {
    label?: string
    value?: MenuValue
    items?: RecursiveMenu
    dangerousHtmlLabel?: string
}

export type RecursiveMenu = Array<RecursiveMenuItem>;
