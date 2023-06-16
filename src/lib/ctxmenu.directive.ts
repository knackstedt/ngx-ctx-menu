import { Directive, Input, HostListener, TemplateRef, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER } from '@angular/material/dialog';
import { calcMenuItemBounds, ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuItem } from './types';
import { NgxAppMenuOptions } from './appmenu.directive';
import { createApplication } from '@angular/platform-browser';

@Directive({
    selector: '[ngx-ctx-menu]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class NgxContextMenuDirective {

    /**
     * The data representing the item the context-menu was opened for.
     */
    @Input("ngx-ctx-menu-context") data: any;

    /**
     * The items that will be bound to the context menu.
     */
    @Input("ngx-ctx-menu") menuItems: ContextMenuItem[];

    /**
     * Configuration for opening the app menu
     */
    @Input("ngx-ctx-menu-config") config: NgxAppMenuOptions = {};

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) { }

    // Needs to be public so we can manually open the dialog
    @HostListener('contextmenu', ['$event'])
    public async onContextMenu(evt: PointerEvent) {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        el.classList.add("ngx-app-menu-open");

        return openContextMenu(this.dialog, this.menuItems, this.data, evt, this.config)
            .finally(() => {
                el.classList.remove("ngx-app-menu-open");
            });
    }
}

// Helper to open the context menu without using the directive.
export const openContextMenu = async (dialog: MatDialog, menuItems: ContextMenuItem[], data: any, evt: PointerEvent, config?: NgxAppMenuOptions) => {
    evt.preventDefault();
    evt.stopPropagation();

    const { width, height } = await calcMenuItemBounds(menuItems);

    const cords = {
        top: null,
        left: null,
        bottom: null,
        right: null
    };

    if (evt.clientY + height > window.innerHeight)
        cords.bottom = (window.innerHeight - evt.clientY) + "px";
    if (evt.clientX + width > window.innerWidth)
        cords.right = (window.innerWidth - evt.clientX) + "px";

    if (!cords.bottom) cords.top = evt.clientY + "px";
    if (!cords.right) cords.left = evt.clientX + "px";

    const specificId = crypto.randomUUID();


    return new Promise(res => {
        dialog.open(ContextMenuComponent, {
            data: {
                data: data,
                items: menuItems,
                config: config,
                id: specificId
            },
            panelClass: ["ngx-ctx-menu", 'ngx-' + specificId].concat(config?.customClass || []),
            position: cords,
            backdropClass: "ngx-ctx-menu-backdrop"
        })
        .afterClosed()
        .subscribe(s => {
            res(s);
        })
    }) as Promise<any>;
};
