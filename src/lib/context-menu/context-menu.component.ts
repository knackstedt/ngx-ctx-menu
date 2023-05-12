import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ContextMenuItem } from '../types';
import { NgxAppMenuOptions } from '../appmenu.directive';
import { Optional } from '@angular/core';
import { createApplication } from '@angular/platform-browser';

export const calcMenuItemBounds = async (menuItems: ContextMenuItem[]) => {
    const data = {
        data: null,
        items: menuItems,
        config: {},
        id: null
    }

    const del = document.createElement("div");
    del.style.position = "absolute";
    del.style.left = '-1000vw';
    document.body.append(del);

    // Forcibly bootstrap the ctx menu outside of the client application's zone.
    const app = await createApplication({
        providers: [
            { provide: MAT_DIALOG_DATA, useValue: data }
        ]
    });

    const component = app.bootstrap(ContextMenuComponent, del);
    const el: HTMLElement = component.instance.viewContainer?.element?.nativeElement;
    const rect = el.getBoundingClientRect();
    app.destroy();
    del.remove();
    return rect;
}

@Component({
    selector: 'ngx-ctx-menu-template-container',
    template: `<ng-template *ngTemplateOutlet="template; context: {data: {data, dialog: dialogRef }}" />`,
    imports: [ CommonModule ],
    standalone: true
})
class TemplateWrapper {

    data: Object;
    template: TemplateRef<any>;

    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) private _data: any
    ) {
        this.data = _data.data;
        this.template = _data.template;
    }
}

@Component({
    selector: 'ngx-ctx-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss'],
    imports: [
        CommonModule,
        MatIconModule
    ],
    standalone: true
})
export class ContextMenuComponent implements OnInit {
    @Input() public data: any;
    @Input() public items: ContextMenuItem[];
    @Input() public config: NgxAppMenuOptions;
    @Input() public id: string;

    @Output() closeSignal = new EventEmitter();

    public readonly matIconRx = /[^a-z_\-]/i;

    constructor(
        public viewContainer: ViewContainerRef,
        @Optional() public dialog: MatDialog,
        @Optional() public dialogRef: MatDialogRef<any>,
        @Optional() @Inject(MAT_DIALOG_DATA) private _data: any
    ) {
        // Defaults are set before @Input() hooks evaluate
        this.data  = this._data.data;
        this.items = this._data.items;
        this.config = this._data.config;
        this.id = this._data.id;
    }

    ngOnInit() {
        this.items.forEach(i => {
            if (typeof i == "string") return;
            if (i.separator == true) return;

            if (i.label)
                try { i['_formattedLabel'] = this.formatLabel(i.label); } catch (e) { console.warn(e) }

            if (typeof i.isDisabled == "function")
                try { i['_disabled'] = i.isDisabled(this.data || {}); } catch(e) { console.warn(e) }

            if (typeof i.isVisible == "function")
                try { i['_visible'] = i.isVisible(this.data || {}); } catch (e) { console.warn(e) }
        })
    }

    /**
     *
     * @param item
     * @param evt
     * @returns
     */
    async onMenuItemClick(item: ContextMenuItem, row: HTMLTableRowElement, evt) {
        if (typeof item == 'string') return;
        if (item.separator == true) return;

        // If cache is enabled, only load if we don't have any children.
        const forceLoad = (item.cacheResolvedChildren ? !item.children : true);

        if (item.childrenResolver && forceLoad) {
            item['_isResolving'] = true;
            item.children = await item.childrenResolver(this.data);
            item['_isResolving'] = false;
        }

        if (!item.childTemplate && !item.children) {
            if (item.action)
                item.action(this.data);

            this.dialogRef.close(true);
            return;
        }

        // Need X pos, Y pos, width and height
        const bounds = row.getBoundingClientRect();

        const cords = {
            top: null,
            left: null,
            bottom: null,
            right: null
        };

        // Set position coordinates
        if (item.childTemplate) {
            const width = item.childWidth || 300;
            const height = item.childHeight || 500;

            if (bounds.y + height > window.innerHeight)
                cords.bottom = "0px";
            if (bounds.x + width > window.innerWidth)
                cords.left = ((bounds.x - width)) + "px";

            if (!cords.bottom) cords.top = bounds.y + "px";
            if (!cords.left) cords.left = bounds.x + bounds.width + "px";
        }
        else if (item.children) {
            const { width, height } = await calcMenuItemBounds(item.children);

            if (bounds.y + height > window.innerHeight)
                cords.bottom = "0px";
            if (bounds.x + width > window.innerWidth)
                cords.left = ((bounds.x - width)) + "px";

            if (!cords.bottom) cords.top = bounds.y + "px";
            if (!cords.left) cords.left = bounds.x + bounds.width + "px";
        }

        const component = item.children ? ContextMenuComponent : TemplateWrapper as any;

        let _s = this.dialog.open(component, {
            position: cords,
            panelClass: "ngx-ctx-menu",
            backdropClass: "ngx-ctx-menu-backdrop",
            data: {
                data: this.data,
                items: item.children,
                template: item.childTemplate
            }
        })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    if (item.action)
                        item.action(result);
                    this.dialogRef.close(true);
                }

                _s.unsubscribe();
            });
    }

    /**
     *
     * @param label
     * @returns
     */
    formatLabel(label: string): string {
        return label.replace(/_([a-z0-9])_/i, (match, group) => `<u>${group}</u>`);
    }

    /**
     * Close the context menu under these circumstances
     */
    // @HostListener("window:resize", ['event'])
    // @HostListener("window:blur", ['event'])
    close() {
        this.dialogRef.close();
    }

    /**
     * Check if the dialog is clipping offscreen
     * if so, move it back into view.
     */
    @HostListener("window:resize")
    private afterOpened() {
        const el = this.viewContainer?.element?.nativeElement as HTMLElement;
        if (!el) return;

        const { width, height, x, y } = el.getBoundingClientRect();

        const target = document.querySelector(".ngx-ctx-menu,.ngx-app-menu") as HTMLElement;
        if (!target) return;

        // Move back into view if we're clipping outside of the bottom
        if (y + height > window.innerHeight) {
            const newTop = (window.innerHeight - (height + (this.config.edgePadding || 12))) + "px";
            target.style['margin-top'] = newTop;
        }

        // Move back into view if we're clipping off the right
        if (x + width > window.innerWidth) {
            const newLeft = (window.innerWidth - (width + (this.config.edgePadding || 12))) + "px"
            target.style['margin-left'] = newLeft;
        }
    }
}
