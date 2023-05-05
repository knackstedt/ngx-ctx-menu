import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BaseCtx, ContextMenuItem } from '../types';
import { NgxAppMenuOptions } from '../appmenu.directive';

export const calcMenuItemBounds = (menuItems: ContextMenuItem[]) => {
    const calcHeight = () => {
        return menuItems
            .map(i => typeof i == "string" ? 2 : 24)
            .reduce((a, b) => a + b, 0);
    }

    const calcWidth = () => {

        const items = menuItems
            .filter(i => i != "separator" && !i.separator) as BaseCtx[];

        // TODO: this is probably not right.
        const lName = items
            .filter(e => typeof e != 'string')
            .sort((a, b) => a.label.length - b.label.length)
            .filter(e => e)
            .pop().label;
        const lShort = items
            .filter(e => typeof e != 'string')
            .sort((a, b) => a.shortcutLabel?.length - b.shortcutLabel?.length)
            .filter(e => e)
            .pop().shortcutLabel;

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
        // div.remove();
        return w;
    }

    return {
        width: calcWidth(),
        height: calcHeight()
    }
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
export class ContextMenuComponent implements OnInit, AfterViewInit {
    @Input() public data: any;
    @Input() public items: ContextMenuItem[];
    @Input() public config: NgxAppMenuOptions;
    @Input() public id: string;

    @Output() closeSignal = new EventEmitter();

    public readonly matIconRx = /[^a-z_\-]/i;

    constructor(
        private viewContainer: ViewContainerRef,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) private _data: any
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
                i['_formattedLabel'] = this.formatLabel(i.label);

            if (typeof i.isDisabled == "function")
                i['_disabled'] = i.isDisabled(this.data);

            if (typeof i.isVisible == "function")
                i['_visible'] = i.isVisible(this.data);

        })
    }

    ngAfterViewInit() {
        // Try to make absolutely certain that this component isn't clipping off of the screen.
        this.afterOpened();
        setTimeout(this.afterOpened.bind(this), 1000);
        setTimeout(this.afterOpened.bind(this), 5000);
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
            const {width, height} = calcMenuItemBounds(item.children);

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
     * Check if the dialog is clipping, and if so, move it back into view.
     */
    @HostListener("window:resize")
    private afterOpened() {
        const el = this.viewContainer.element.nativeElement as HTMLElement;
        const { width, height, x, y } = el.getBoundingClientRect();

        const target = document.querySelector(".ngx-" + this.id) as HTMLElement;
        if (target) return;

        target.style['--checked'] = 'red';

        // Move back into view if we're clipping outside of the bottom
        if (y + height > window.innerHeight) {
            const newTop = (window.innerHeight - (height + (this.config.edgePadding || 12))) + "px";
            target.style['margin-top'] = newTop;
            target.style['--t'] = newTop;
            el.style['--t'] = newTop;

        }
        // Move back into view if we're clipping off the right
        if (x + width > window.innerWidth) {
            const newLeft = (window.innerWidth - (width + (this.config.edgePadding || 12))) + "px"
            target.style['margin-left'] = newLeft;
            target.style['--l'] = newLeft;
            el.style['--l'] = newLeft;
        }
    }
}
