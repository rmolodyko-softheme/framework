import "reflect-metadata";

import { SomeComponent } from './app/some-component';
import { TestService3 } from './app/test-service3';
import { TestService1 } from './app/test-service1';
import { TestService2 } from './app/test-service2';
import { Bootstrap } from './lib/module/bootstrap';
import { OtherComponent } from './app/other-component';
import { NestedComponent } from './app/nested-component';

new Bootstrap({
    components: [
        SomeComponent,
        OtherComponent,
        NestedComponent
    ],
    providers: [
        { provide: 'services', useClass: TestService1, multi: true },
        { provide: 'services', useClass: TestService2, multi: true },
        { provide: 'services', useClass: TestService3, multi: true }
    ],
    bootstrap: SomeComponent
});
