import { Directive, Input, HostListener, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TooltipComponent, calcTooltipBounds } from './tooltip/tooltip.component';
import { NgComponentOutlet } from '@angular/common';
import { getPosition } from './utils';

export type NgxTooltipOptions = Partial<{
    /**
     * Position relative to the element the menu pops-up at
     */
    position: "top" | "right" | "bottom" | "left",
    /**
     * How the popup is aligned relative to the element
     */
    alignment: "center" | "beforestart" | "start" | "end" | "afterend",
    /**
     * @hidden
     * WIP:
     * Show an error from the dialog pointing to the element
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
}>;

@Directive({
    selector: '[ngxTooltip],[ngx-tooltip]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class NgxTooltipDirective {

    /**
     */
    @Input("ngxTooltip")
    @Input("ngx-tooltip") template: string | TemplateRef<any> | Type<any>;

    /**
     * Configuration for opening the app menu
     */
    @Input("ngxTooltipConfig")
    @Input("ngx-tooltip-config") config: NgxTooltipOptions = {};

    /**
     * Arbitrary data to pass into the template
     */
    @Input("ngxTooltipContext")
    @Input("ngx-tooltip-context") data: any = {};

    /**
     * A template for the tooltip item
     */
    @Input("ngxTooltipTemplate")
    @Input("ngx-tooltip-template") ngTooltipTemplate: TemplateRef<any>;

    /**
     * A component for the tooltip item
     */
    @Input("ngxTooltipComponent")
    @Input("ngx-tooltip-component") ngTooltipComponent: Type<any>;

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) {

    }

    ngOnInit() {
        if (this.template instanceof TemplateRef)
            this.ngTooltipTemplate = this.template;
        else if (typeof this.template == "function")
            this.ngTooltipComponent = this.template;

        // TODO: string case
    }

    private dialogInstance: MatDialogRef<any>;
    // Needs to be public so we can manually open the dialog
    @HostListener('pointerenter', ['$event'])
    public async onContextMenu(evt: PointerEvent) {
        const el = this.viewContainer.element.nativeElement;
        this.dialogInstance = await openTooltip(this.dialog, this.ngTooltipTemplate, this.ngTooltipComponent, this.data, el, this.config);
    }

    @HostListener('pointerleave', ['$event'])
    onPointerLeave() {
        this.dialogInstance.close();
    }
}

// Helper to open the context menu without using the directive.
export const openTooltip = async (
    dialog: MatDialog,
    ngTooltipTemplate: TemplateRef<any>,
    ngTooltipComponent: Type<any>,
    data: any,
    el: HTMLElement,
    config?: NgxTooltipOptions
) => {
    const rect = await calcTooltipBounds(ngTooltipTemplate, ngTooltipComponent);

    const cords = await getPosition(el, config, rect);

    const specificId = crypto.randomUUID();

    return dialog.open(TooltipComponent, {
        data: {
            data: data,
            ngTooltipTemplate: ngTooltipTemplate,
            ngTooltipComponent: ngTooltipComponent,
            config: config,
            id: specificId
        },
        panelClass: ["ngx-tooltip", 'ngx-' + specificId],
        position: cords,
        hasBackdrop: false
    });
};
