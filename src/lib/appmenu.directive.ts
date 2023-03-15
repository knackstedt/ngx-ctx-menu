import { Directive, Input, HostListener, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { calcMenuItemBounds, ContextMenuComponent } from 'src/lib/context-menu/context-menu.component';
import { ContextMenuItem } from 'src/lib/types';


@Directive({
    selector: '[ngx-app-menu]',
    standalone: true
})
export class NgxAppMenuDirective {

    /**
     * The data representing the item the context-menu was opened for.
     */
    @Input("ngx-app-menu-context") data: any;

    /**
     * The items that will be bound to the context menu.
     */
    @Input("ngx-app-menu") menuItems: ContextMenuItem[];

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) { }

    // Needs to be public so we can manually open the dialog
    @HostListener('click', ['$event'])
    @HostListener('touch', ['$event'])
    public onContextMenu(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        const bounds = (this.viewContainer.element.nativeElement as HTMLElement).getBoundingClientRect();

        const { width, height } = calcMenuItemBounds(this.menuItems);

        const cords = {
            top: null,
            left: null,
            bottom: null,
            right: null
        };

        if (bounds.y + height > window.innerHeight)
            cords.bottom = (window.innerHeight - (bounds.y + bounds.height)) + "px";
        if (bounds.x + width > window.innerWidth)
            cords.right = (window.innerWidth - (bounds.x + bounds.width)) + "px";

        if (!cords.bottom) cords.top = (bounds.y + bounds.height) + "px";
        if (!cords.right) cords.left = (bounds.x + bounds.width) + "px";

        let items = [];
        this.menuItems.forEach((item: ContextMenuItem) => {
            items.push(typeof item == "string" ? item : {
                ...item,
                active: typeof item.canActivate == "function" ? item.canActivate(this.data) : true
            });
        });

        // Create the context menu
        this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: items,
                // dialog: this.dialog
            },
            panelClass: "ngx-app-menu",
            position: cords,
            backdropClass: "ngx-app-menu-backdrop"
        });
    }
}
