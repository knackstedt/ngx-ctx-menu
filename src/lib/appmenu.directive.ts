import { Directive, Input, HostListener, ViewContainerRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { calcMenuItemBounds, ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuItem } from './types';
import { getPosition } from './utils';

export type NgxAppMenuTriggers = "click" | "dblclick" | "hover" | "contextmenu";

export type NgxAppMenuOptions = Partial<{
    /**
     * Position relative to the element the menu pops-up at.
     */
    position: "top" | "right" | "bottom" | "left",
    /**
     * How the popup is aligned relative to the element.
     */
    alignment: "center" | "beforestart" | "start" | "end" | "afterend",
    /**
     * @hidden
     * WIP:
     * Show an error from the dialog pointing to the element.
     */
    showArrow: boolean,
    /**
     * @hidden
     * WIP:
     * Size of the arrow.
     */
    arrowSize: number,
    /**
     * How much padding to add near the edges of the screen.
     */
    edgePadding: number,
    /**
     * Which event should trigger the app menu.
     */
    trigger: NgxAppMenuTriggers | NgxAppMenuTriggers[];
    /**
     * A list of custom classes to add to the dialog popups.
     */
    customClass: string[]
}>;

@Directive({
    selector: '[ngx-app-menu]',
    standalone: true
})
export class NgxAppMenuDirective implements AfterViewInit {

    /**
     * The items that will be bound to the menu.
     */
    @Input("ngx-app-menu") menuItems: ContextMenuItem[];

    /**
     * The data representing the item the context-menu was opened for.
     */
    @Input("ngx-app-menu-context") data: any;

    /**
     * Configuration for opening the app menu
     */
    @Input("ngx-app-menu-config") config: NgxAppMenuOptions = {};

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) { }

    ngAfterViewInit() {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        if (!this.config?.trigger) {
            el.onclick = this.openDialog.bind(this);
        }
        else {
            const triggers = Array.isArray(this.config.trigger) ? this.config.trigger : [this.config.trigger];

            triggers.forEach(t => {
                if (t == "contextmenu") {
                    el.addEventListener(t, (e) => {
                        e.preventDefault();
                        this.openDialog(e);
                    });
                }
                else {
                    el.addEventListener(t, this.openDialog.bind(this));
                }
            });
        }
    }

    // Needs to be public so we can manually open the dialog
    private async openDialog(evt: MouseEvent) {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        const cords = getPosition(el, this.config, await calcMenuItemBounds(this.menuItems));

        const specificId = crypto.randomUUID();

        el.classList.add("ngx-app-menu-open");

        // Create the context menu
        let _s = this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: this.menuItems,
                // dialog: this.dialog
                config: this.config,
                id: specificId
            },
            panelClass: ["ngx-app-menu", "ngx-ctx-menu", 'ngx-' + specificId].concat(this.config?.customClass || []),
            position: cords,
            backdropClass: "ngx-app-menu-backdrop"
        })
        .afterClosed() // What a stupid thing to make an observable.
        .subscribe(() => {
            _s.unsubscribe();

            el.classList.remove("ngx-app-menu-open");
        })
    }
}
