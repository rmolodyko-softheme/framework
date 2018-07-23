import { Injectable } from '../lib/di/injector';
import { TestBase } from './test-base';

@Injectable()
export class TestService2 extends TestBase {
    name = 'test2 windows';
}