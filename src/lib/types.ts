import { TemplateRef } from '@angular/core';

type BaseCtx<T = any> = {
    /**
     * Label for the menu-item
     */
    label?: string,
    labelTemplate?: TemplateRef<any>,

    /**
     * Callback method that is called when a user activates
     * a context-menu item.
     * Use the `contextMenuData` decorator for passing data.
     */
    action?: (data: T) => any,

    /**
     * Callback method that is called upon a context menu activation
     * that when returning false, will show the item in a disabled state.
     */
    isDisabled?: (data: T) => boolean,

    /**
     * Callback method that is called upon a context menu activation
     * that when returning false, will hide the menu item.
     */
    isVisible?: (data: T) => boolean,

    /**
     * If a shortcut is set, the text-label.
     */
    shortcutLabel?: string,

    /**
     * Keyboard shortcut to activate this item.
     */
    // shortcut?: KeyCommand,

    /**
     * Path to an icon to render on the left side of the item.
     */
    icon?: string,

    /**
     * Optional child menu
     */
    children?: ContextMenuItem<T>[],

    /**
     * Optional resolver that dynamically loads the contents
     * for the menu item.
     * Can be used to dynamically determine the submenu contents
     */
    childrenResolver?: (data: T) => Promise<ContextMenuItem<T>[]>,

    /**
     * If `childrenResolver` is provided, disable caching of
     * the resolved children.
     */
    cacheResolvedChildren?: boolean,

    /**
     * Instead of an array of children, render a template
     */
    childTemplate?: TemplateRef<T>,

    /**
     * Width of child component
     */
    childWidth?: number,

    /**
     * Height of child component
     */
    childHeight?: number,
};

export type ContextMenuItem<T = any> =
    BaseCtx<T> |
    "seperator";
