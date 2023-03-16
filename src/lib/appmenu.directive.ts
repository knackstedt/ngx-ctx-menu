import { Directive, Input, HostListener, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { calcMenuItemBounds, ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuItem } from './types';


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
     * The items that will be bound to the menu.
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

        const src = (this.viewContainer.element.nativeElement as HTMLElement).getBoundingClientRect();

        const { width, height } = calcMenuItemBounds(this.menuItems);

        const cords = {
            top: null,
            left: null,
            bottom: null,
            right: null
        };

        if (src.y + height > window.innerHeight)
            cords.bottom = "16px";
        if (src.x + src.width + width > window.innerWidth) {

            // Adjust the Y position if we're going to clip off screen
            if (src.y + src.height + height > window.innerHeight) {
                cords.bottom = window.innerHeight - (src.y - src.height)
            }

            cords.right = (window.innerWidth - src.x) + width;
        }

        if (!cords.bottom) cords.top = src.y + "px";
        if (!cords.right) cords.left = (src.x + src.width) + "px";

        // Create the context menu
        this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: this.menuItems,
                // dialog: this.dialog
            },
            panelClass: "ngx-app-menu",
            position: cords,
            backdropClass: "ngx-app-menu-backdrop"
        });
    }
}
