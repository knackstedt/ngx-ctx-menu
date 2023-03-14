import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ContextMenuItem } from 'src/lib/types';

export const calcMenuItemBounds = (menuItems: ContextMenuItem[]) => {
    const calcHeight = () => {
        return menuItems
            .map(i => typeof i == "string" ? 2 : 24)
            .reduce((a, b) => a + b, 0);
    }

    const calcWidth = () => {

        const items = menuItems
            .filter(i => i != "seperator");

        // TODO: this is probably not right.
        const lName = (items as any)
            .sort((a, b) => a.label.length - b.label.length)
            .filter(e => e)
            .pop().label;
        const lShort = (items as any)
            .sort((a, b) => a.label.length - b.label.length)
            .filter(e => e)
            .pop().label;

        // Create dummy div that will calculate the width for us.
        const div = document.createElement("div");
        div.style["font-size"] = "14px";
        div.style["position"] = "absolute";
        div.style["opacity"] = "0";
        div.style["pointer-events"] = "none";
        div.style["left"] = "-1000vw"; // The div gets to exist in narnia

        div.innerText = lName + lShort;

        document.body.appendChild(div);

        // Get width
        const w = div.getBoundingClientRect().width;

        // Clear element out of DOM
        div.remove();

        return w;
    }

    return {
        width: calcWidth(),
        height: calcHeight()
    }
}

@Component({
    selector: 'template-wrapper',
    template: `<ng-template *ngTemplateOutlet="template; context: {data: {data, dialog: dialogRef }}" />`,
    imports: [ CommonModule ],
    standalone: true
})
class TemplateWrapper {

    data;
    template;

    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) private _data: any
    ) {
        this.data = _data.data;
        this.template = _data.template;
    }
}

@Component({
    selector: 'app-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss'],
    imports: [
        CommonModule,
        MatIconModule
    ],
    standalone: true
})
export class ContextMenuComponent {
    @Input() public data: any;
    @Input() public items: ContextMenuItem[];

    public matIconRx = /[^a-z_\-]/i;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) private _data: any
    ) {
        this.data  = this._data.data;
        this.items = this._data.items;
    }

    /**
     *
     * @param item
     * @param evt
     * @returns
     */
    onMenuItemClick(item: ContextMenuItem, row: HTMLTableRowElement, evt) {
        if (typeof item == 'string') return;

        if (!item.childTemplate && !item.children) {
            item.action(this.data);
            this.dialogRef.close(true);
        }
        else if (item.childTemplate) {

            // Need X pos, Y pos, width and height
            const bounds = row.getBoundingClientRect();


            let width = item.childWidth || 300;
            let height = item.childHeight || 500;

            const cords = {
                top: null,
                left: null,
                bottom: null,
                right: null
            };

            if (bounds.y + height > window.innerHeight)
                cords.bottom = "0px";
            if (bounds.x + width > window.innerWidth)
                cords.left = ((bounds.x - width)) + "px";

            if (!cords.bottom) cords.top = bounds.y + "px";
            if (!cords.left) cords.left = bounds.x + bounds.width + "px";


            let _s = this.dialog.open(TemplateWrapper, {
                position: cords,
                panelClass: "context-menu",
                backdropClass: "context-menu-backdrop",
                data: {
                    data: this.data,
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
        else if (item.children) {
            const {width, height} = calcMenuItemBounds(item.children);

            // Need X pos, Y pos, width and height
            const bounds = row.getBoundingClientRect();


            const cords = {
                top: null,
                left: null,
                bottom: null,
                right: null
            };

            if (bounds.y + height > window.innerHeight)
                cords.bottom = "0px";
            if (bounds.x + width > window.innerWidth)
                cords.left = ((bounds.x - width)) + "px";

            if (!cords.bottom) cords.top = bounds.y + "px";
            if (!cords.left) cords.left = bounds.x + bounds.width + "px";


            let _s = this.dialog.open(ContextMenuComponent, {
                position: cords,
                panelClass: "context-menu",
                backdropClass: "context-menu-backdrop",
                data: {
                    data: this.data,
                    items: item['children']
                }
            })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.dialogRef.close(true);
                }

                _s.unsubscribe();
            });
        }
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
    @HostListener("window:resize", ['event'])
    @HostListener("window:blur", ['event'])
    close() {
        this.dialogRef.close();
    }
}
