import { Component } from '../lib/metadata/decorators/component-decorator';
import { TestBase } from './test-base';
import { Inject } from '../lib/di/injector';

@Component({
    selector: 'some',
    view: `
        <div>
            {{ this.ts.name }}
        </div>
        <div>
            {{ this.value }}
        </div>
        <div>
            <button (click)="this.increase()">Increase</button>
            <button (click)="this.decrease()">Decrease</button>
        </div>
        <other></other>
        <other></other>
        <nested></nested>
    `,
    providers: [
        // { provide: TestBase, useClass: TestService1 }
    ]
})
export class SomeComponent {
    value = 0;

    constructor(@Inject('services') public ts: TestBase[]) {
        console.log(this);

        this.onInit();
    }

    onInit() {
        setTimeout(() => {
            this.value++;
            console.log('set timeout');
        }, 3000);
    }

    increase() {
        this.value++;
    }

    decrease() {
        this.value--;
    }
}
