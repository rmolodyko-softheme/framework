import { Injectable } from '../lib/di/injector';
import { TestBase } from './test-base';

@Injectable()
export class TestService3 extends TestBase {
    name = 'test3 linux';
}