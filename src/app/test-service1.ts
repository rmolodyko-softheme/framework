import { TestService2 } from './test-service2';
import { Injectable } from '../lib/di/injector';
import { TestBase } from './test-base';

@Injectable()
export class TestService1 extends TestBase {
    name = 'test1 ios';
    // constructor(private testService2: TestService2) {
    //     super();
    // }
}
