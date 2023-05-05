import { Directive, Input, HostListener, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { calcMenuItemBounds, ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuItem } from './types';
import { NgxAppMenuOptions } from 'src/lib/appmenu.directive';


@Directive({
    selector: '[ngx-ctx-menu]',
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
    @Input("ngx-ctx-menu-config") config: NgxAppMenuOptions;

    constructor(
        private dialog: MatDialog
    ) { }

    // Needs to be public so we can manually open the dialog
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        const { width, height } = calcMenuItemBounds(this.menuItems);

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

        // let items = [];
        // this.menuItems.forEach((item: ContextMenuItem) => {
        //     items.push(typeof item == "string" ? item : {
        //         ...item,
        //         active: typeof item.canActivate == "function" ? item.canActivate(this.data) : true
        //     });
        // });

        // Create the context menu
        this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: this.menuItems,
                config: this.config
            },
            panelClass: "ngx-ctx-menu",
            position: cords,
            backdropClass: "ngx-ctx-menu-backdrop"
        });
    }
}

// Helper to open the context menu without using the directive.
export const openContextMenu = (dialog: MatDialog, menuItems: ContextMenuItem[], data: any, evt: PointerEvent) => {
    const ctx = new NgxContextMenuDirective(dialog);
    ctx.data = data;
    ctx.menuItems = menuItems;
    ctx.onContextMenu(evt);

    // TODO: is this disposed properly?
};
