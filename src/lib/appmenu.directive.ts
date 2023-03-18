import { Directive, Input, HostListener, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { calcMenuItemBounds, ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuItem } from './types';

const arrowPadding = 8;

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

    /**
     *
     */
    @Input("ngx-app-menu-config") config: {
        position: "top" | "right" | "bottom" | "left",
        alignment:  "center" | "beforestart" | "start" | "end" | "afterend",
        showArrow: boolean,
        arrowSize: number,
        edgePadding: number
    };

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) { }

    getPosition() {
        const src = (this.viewContainer.element.nativeElement as HTMLElement).getBoundingClientRect();

        const { width, height } = calcMenuItemBounds(this.menuItems);

        const winh = window.innerHeight;
        const winw = window.innerWidth;

        const cords = {
            top: null,
            left: null
        };

        if (this.config.position == "left" || this.config.position == "right" || !this.config.position) {
            switch(this.config.alignment) {

                case "end": {
                    // vertically bind to bottom
                    cords.top = src.y + src.height - height;
                    break;
                }
                case "afterend": {
                    // vertically bind below bottom
                    cords.top = src.y + src.height;
                    break;
                }
                case "beforestart": {
                    // vertically bind above top
                    cords.top = src.y - height;
                    break;
                }
                case "start": {
                    // vertically bind to top
                    cords.top = src.y;
                    break;
                }
                case "center":
                default: {
                    // vertically center
                    cords.top = (src.y + (src.height / 2)) - (height / 2);
                    break;
                }
            }

            // Apply bounds to prevent the dialog from being cut-off screen
            // Lower bound
            cords.top = Math.max(this.config.edgePadding || 0, cords.top);
            // Upper bound
            cords.top = Math.min(winh, cords.top);

            if (this.config.position == "left") {
                cords.left = src.x - (width + this.config.arrowSize + arrowPadding);
            }
            if (this.config.position == "right" || !this.config.position) {
                cords.left = src.x + (src.width + this.config.arrowSize + arrowPadding);
            }

            // Lower bound
            cords.left = Math.max(this.config.edgePadding || 0, cords.left);
            // Upper bound
            cords.left = Math.min(winw, cords.left);
        }
        else if (this.config.position == "top" || this.config.position == "bottom") {
            switch (this.config.alignment) {
                case "end": {
                    // vertically bind to right
                    cords.left = src.x + src.width - width;
                    break;
                }
                case "afterend": {
                    // vertically bind past right
                    cords.left = src.x + src.width;
                    break;
                }
                case "beforestart": {
                    // vertically bind before left
                    cords.left = src.x - width;
                    break;
                }
                case "start": {
                    // vertically bind to left
                    cords.left = src.x;
                    break;
                }
                case "center":
                default: {
                    // vertically center
                    cords.left = (src.x + (src.width / 2)) - (width / 2);
                    break;
                }
            }

            // Apply bounds to prevent the dialog from being cut-off screen
            // Lower bound
            cords.left = Math.max(this.config.edgePadding || 0, cords.left);
            // Upper bound
            cords.left = Math.min(winw, cords.left);


            if (this.config.position == "top") {
                cords.top = src.y - (height + this.config.arrowSize + arrowPadding);
            }
            if (this.config.position == "bottom") {
                cords.top = src.y + (src.height + this.config.arrowSize + arrowPadding);
            }

            // Lower bound
            cords.top = Math.max(this.config.edgePadding || 0, cords.top);
            // Upper bound
            cords.top = Math.min(winh, cords.top);
        }

        // Assign unit
        cords.top = cords.top + 'px';
        cords.left = cords.left + 'px';


        return cords;
    }

    // Needs to be public so we can manually open the dialog
    @HostListener('click', ['$event'])
    @HostListener('touch', ['$event'])
    public onContextMenu(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        const cords = this.getPosition();

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
