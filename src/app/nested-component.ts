import { Component } from '../lib/metadata/decorators/component-decorator';

@Component({
    selector: 'nested',
    view: `
        <div>{{ this.counter }}</div>
        <div>{{ this.value }}</div>
        <div *if="this.value">
            Component value
        </div>
        <button (click)="this.value = true">Toggle true</button>
        <button (click)="this.value = false">Toggle false</button>
    `
})
export class NestedComponent {

    list: string[] = [];
    value: boolean = true;
    counter: number = 0;

    constructor() {
        setTimeout(() => {
            this.counter++;
        }, 6000);
    }
}
