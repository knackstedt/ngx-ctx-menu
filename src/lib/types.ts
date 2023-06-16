import { TemplateRef } from '@angular/core';

export type BaseCtx<T = any> = {
    /**
     * Label for the menu-item
     */
    label?: string,

    /**
     * Custom angular template to use for the label
     * Alternatively accepts a lambda function
     */
    labelTemplate?: TemplateRef<any> | ((data: T) => string),

    /**
     * Callback method that is called when a user activates
     * a context-menu item.
     * Use the `contextMenuData` decorator for passing data.
     */
    action?: (data: T) => any,

    /**
     * Instead of an action, this item can be a hyperlink pointing to this URL
     * www.example.com/foo/bar.zip
     */
    link?: string,

    /**
     * When having a configured `link` property, this specifies the `target`
     * attribute applied to the link
     */
    linkTarget?: "_blank" | "_self" | "_parent" | "_top", // "framename"

    /**
     * Custom template function for resolving a link when the context menu
     * is opened
     */
    linkTemplate?: ((data: T) => string),

    /**
     * Callback method that is called upon a context menu activation
     * that when it returns true, will show the item as disabled.
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
     * Icon to render on the left side of the item.
     * Can be a URL/URI (must include extension)
     * Or can be a material icon identifier.
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

    /**
     * This item is a separator.
     * Can be used with label to make a label separator.
     */
    separator?: false
};

type Separator = {
    label: string,
    separator: true
}

export type ContextMenuItem<T = any> =
    BaseCtx<T> |
    Separator |
    "separator";
