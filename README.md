<a href="https://dotglitch.dev/#/ContextMenuLibrary">
  <h1 align="center">ngx-ctx-menu</h1>
</a>

<p align="center">
  `ngx-ctx-menu` provides a robust context menu and app menu for Angular applications.
</p>

[![npm](https://img.shields.io/npm/v/@dotglitch/ngx-ctx-menu.svg)](https://www.npmjs.com/package/@dotglitch/ngx-ctx-menu)
[![npm](https://img.shields.io/npm/dm/@dotglitch/ngx-ctx-menu.svg)](https://www.npmjs.com/package/@dotglitch/ngx-ctx-menu)
[![npm downloads](https://img.shields.io/npm/dt/@dotglitch/ngx-ctx-menu.svg)](https://npmjs.org/@dotglitch/ngx-ctx-menu)
[![GitHub stars](https://img.shields.io/github/stars/knackstedt/ngx-ctx-menu.svg?label=GitHub%20Stars&style=flat)](https://github.com/knackstedt/ngx-ctx-menu)



Quickstart 
=====

[Demo](https://dotglitch.dev/#/ContextMenuLibrary)

## Install

```bash
$ npm install @dotglitch/ngx-ctx-menu
```

### Import the Module

```typescript
import { NgModule } from '@angular/core';
import { NgxAppMenuDirective, NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        NgxAppMenuDirective,
        NgxContextMenuDirective,
        ...
    ]
    bootstrap: [AppComponent]
})
export class AppModule { }
```

### Basic Usage
> `Context menus` show up when a user right-clicks a specific element in a given application.
> `App menus` are menus that show up on buttons when you click them. The support provided by this package is for convenience of feature support, allowing you to make context menus that also appear when buttons are pressed, which is very useful for mobile development or in cases where complex button menus are required.

`component.html`
```html
<ul>
    <!-- Bind the context menu to the list item -->
    <li *ngFor="let item of items" [ngx-ctx-menu]="actionMenu" [ngx-ctx-menu-context]="item">
        
        <!-- Bind the same menu to a button that can easily be clicked on mobile -->
        <button mat-icon-button [ngx-app-menu]="actionMenu" [ngx-app-menu-context]="item">
            <mat-icon>more_vert</mat-icon>
        </button>

        <div>
            Item: {{item}}
        </div>
    </li>
</ul>
```

`component.ts`
```ts
import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ContextMenuItem, NgxAppMenuDirective, NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';

@Component({
    selector: 'app-tag-picker',
    templateUrl: './tag-picker.component.html',
    styleUrls: ['./tag-picker.component.scss'],
    imports: [
        NgForOf,
        MatButtonModule,
        NgxAppMenuDirective,
        NgxContextMenuDirective
    ],
    standalone: true
})
export class SimpleComponent {

    // For the sake of this example, this has no action handlers.
    actionMenu: ContextMenuItem<MyDataObject>[] = [
        {
            label: "Duplicate",
            icon: "add"
        },
        {
            label: "Edit",
            icon: "edit"
        },
        "separator",
        {
            label: "Delete",
            icon: "delete_outline"
        },
    ];

    items = [
        "item1",
        "item2",
        "item3",
        "item4",
        "item5"
    ]
}

```

### Advanced usage

`component.html`
```html
<img src="/foo/bar.png" [ngx-ctx-menu]="actionMenu" [ngx-ctx-menu-context]="someArbitraryValue">

<ng-template #iconSelectTemplate let-data="data">
    <!-- 
        We need to pass data.data and data.dialog through so that the child component
        has all of the references it needs.
     -->
    <app-icon-picker [commonMatIcons]="commonMatIcons" [data]="data.data" [dialog]="data.dialog"/>
</ng-template>
```

`component.ts`
```typescript
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ContextMenuItem, NgxAppMenuDirective, NgxContextMenuDirective } from '@dotglitch/ngx-ctx-menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

type MyDataObject = {
    name: string,
    value: number,
    color: string
}

@Component({
    selector: 'app-raci',
    templateUrl: 'component.html',
    imports: [
        IconPickerComponent,
        NgxContextMenuDirective
    ],
    // This library works with both standalone components and components declared on modules.
    // Just import the Directive where you need to use it.
    standalone: true
})
export class MyComponent {
    @ViewChild('iconSelectTemplate', { read: TemplateRef }) iconSelectTemplate: TemplateRef<any>;

    readonly commonMatIcons = [
        "warning",       "new_releases",      "priority_high",   "flag",            "bug_report",        "star_rate",
        "sync",          "architecture",      "design_services", "polyline",        "view_quilt",        "emoji_events",
        "bookmark",      "workspace_premium", "person",          "groups",          "menu_book",         "library_books",
        "sticky_note_2", "receipt_long",      "settings",        "tune",            "settings_ethernet", "security",
        "privacy_tip",   "lock",              "fact_check",      "event_available", "newspaper",         "schema",
    ];
    
    data: MyDataObject[] = [{
        name: "foobar",
        value: 800,
        color: "red"
    },{
        name: "lemons",
        value: 9000,
        color: "yellow"
    }]

    cellCtxMenu: ContextMenuItem<MyDataObject>[];

    ngAfterViewInit() {
        // We attach this after the view init hook to ensure the template is bound.
        // If you have a truly simple ctx menu, assigning it directly in the class 
        // works perfectly fine.
        this.cellCtxMenu = [
            // First, a simple entry that is always visible.
            {
                icon: "edit",
                label: "Edit",
                // Action is invoked when the menu item is clicked.
                action: (data) => {
                    this.data.splice(this.data.findIndex(d => d.name == data.name), 1);
                }
            },
            // Now, let's customize the label and when it's shown.
            {
                icon: "trash",
                // Only show the entry if the name isn't blank.
                isVisible: (entry) => entry.name?.length > 1,
                labelTemplate: (entry) => `Delete ${user?.name}`,
                action: (data) => {
                    this.data.splice(this.data.findIndex(d => d.name == data.name), 1);
                }
            },
            // Last, we're attaching a context menu item that opens up an angular template.
            {
                label: "Icon",
                icon: "category",
                childTemplate: this.iconSelectTemplate,
                // Action is invoked when the template dialog closes
                action: (data) => this.updateEventTag(data)
            },
        ];
    }
}


@Component({
    selector: 'app-icon-picker',
    template: `
<div class="icon-container">
    <button mat-icon-button *ngFor="let icon of commonMatIcons" (click)="setIcon(icon)">
        <!-- [class.active]="data.tags." -->
        <mat-icon [fontIcon]="icon" [style.color]="icon == currentIcon ? '#fff' : ''"></mat-icon>
    </button>
</div>

<hr/>

<div>
    <div style="padding: 0 24px">
        Specify a <a href="https://fonts.google.com/icons?icon.set=Material+Icons&icon.style=Filled" target="_blank">material icon</a> id, such as 'schedule_send'
    </div>

    <mat-form-field style="margin: 12px 24px 24px 24px; width: -webkit-fill-available;">
        <mat-label>Custom</mat-label>
        <input #input matInput type="text" />
    </mat-form-field>

    <button mat-icon-button class="custom-btn" (click)="setIcon(input.value?.toLowerCase())"><mat-icon>check</mat-icon></button>
</div>
    `,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule
    ],
    standalone: true
})
export class IconPickerComponent implements OnInit {

    @Input() commonMatIcons: string[] = [];
    @Input() data: MyDataObject;
    @Input() dialog: MatDialogRef<any>;

    currentIcon;

    ngOnInit() {
        this.currentIcon = this.data.tags?.find(t => t.name == "icon").value;
    }

    async setIcon(classes: string) {
        axios.put(`/api/data/${this.data.id}`, {
            name: "icon",
            value: classes
        })

        if (!this.data.tags) this.data.tags = [];

        let old = this.data.tags.findIndex(t => t.name == "icon");
        if (old >= 0)
            this.data.tags.splice(old, 1);

        this.data.tags.push({
            name: "icon",
            value: classes
        });

        this.dialog.close(this.data);
    }
}

```

<!-- 
Examples
=====

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](...) -->


Configuration
=====

You can set configuration options on the App menu for where it should pop-up relative to the parent element.

```html
<button mat-button [ngx-app-menu]="createMenu" [ngx-app-menu-config]="{ position: 'bottom', alignment: 'center' }">
    <mat-icon>add</mat-icon>
    New Item
</button>
```
```ts
export type NgxAppMenuTriggers = "click" | "dblclick" | "hover";

export type NgxAppMenuOptions = Partial<{
    /**
     * Position relative to the element the menu pops-up at
     * @default 'right'
     */
    position: "top" | "right" | "bottom" | "left",
    /**
     * How the popup is aligned relative to the element
     * @default 'center'
     */
    alignment: "center" | "beforestart" | "start" | "end" | "afterend",
    /**
     * How much padding to add near the edges of the screen.
     */
    edgePadding: number,
    /**
     * Which event should trigger the app menu
     * @default 'click'
     */
    trigger: NgxAppMenuTriggers | NgxAppMenuTriggers[];
}>;
```


Styling
=====

> Custom styling is still a work-in-progress.

```scss
// You can use these CSS variables to configure colors
--ngx-ctx-menu-background-color: #000000;
--ngx-ctx-menu-text-color: #000000;
--ngx-ctx-menu-hover-background-color: #000000;
--ngx-ctx-menu-hover-text-color: #000000;
--ngx-ctx-menu-disabled-text-color: #000000;
--ngx-ctx-menu-separator-color: #000000;
--ngx-ctx-menu-shortcut-text-color: #000000;
```


Debugging
=====

### The menu isn't bound
- Did you import the module?
- Does it have any entries? Are you sure?
- Do you have a global `contextmenu` handler that's interrupting events?

Roadmap
=====
  - [*] Basic menu template support
  - [ ] Support for better styling
  - [ ] Support for templates without relying on `@ViewChild`
  - [ ] Add more trigger events for app menu
  - [ ] Better ARIA support and configuration
  - [ ] Support dynamic entries
  - [ ] Enable sharing menus and combining menu chunks
