import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, Input, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxTooltipOptions } from '../tooltip.directive';
import { Optional } from '@angular/core';
import { createApplication } from '@angular/platform-browser';

export const calcTooltipBounds = async (ngTooltipTemplate?: TemplateRef<any>, ngTooltipComponent?: Type<any>) => {
    const data = {
        data: null,
        ngTooltipTemplate,
        ngTooltipComponent,
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

    const component = app.bootstrap(TooltipComponent, del);
    const el: HTMLElement = component.instance.viewContainer?.element?.nativeElement;
    const rect = el.getBoundingClientRect();
    app.destroy();
    del.remove();
    return rect;
}


@Component({
    selector: 'ngx-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
    imports: [
        // NgIf,
        // NgTemplateOutlet,
        // NgComponentOutlet,
        CommonModule,
    ],
    standalone: true
})
export class TooltipComponent {
    @Input() data: any;
    @Input() config: NgxTooltipOptions;
    @Input() ngTooltipTemplate: TemplateRef<any>;
    @Input() ngTooltipComponent: Type<any>;


    viewMode: "text" | "component"

    constructor(
        public viewContainer: ViewContainerRef,
        @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
        @Optional() public dialog: MatDialog, // optional only for the purpose of estimating dimensions
        @Optional() public dialogRef: MatDialogRef<any>,
    ) {
        // Defaults are set before @Input() hooks evaluate
        this.data = this.data || this._data?.data;
        this.config = this.config || this._data?.config;
        this.ngTooltipTemplate = this.ngTooltipTemplate || this._data?.ngTooltipTemplate;
        this.ngTooltipComponent = this.ngTooltipComponent || this._data?.ngTooltipComponent;
    }

    /**
     * Close the tooltip if these actions occur
     */
    @HostListener("window:resize")
    @HostListener("window:blur")
    private onClose() {
        this.dialogRef?.close();
    }
}
