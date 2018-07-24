import { Injector } from '../../di/injector';
import { Attribute, ElementNode, Parser, TextNode } from './parser';

describe('HTML parser', () => {

    let injector;
    beforeEach(() => {
        injector = new Injector().provide(Parser);
    });

    it('Empty view', () => {
        const parser = injector.get(Parser);
        expect(parser.parse('')).toEqual([]);
    });

    it('Simple node', () => {
        const parser = injector.get(Parser);
        const test = `<div>Hello</div>`;

        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [], [new TextNode('Hello')])
        ]);
    });

    it('Simple nested node', () => {
        const parser = injector.get(Parser);
        const test = `<div><span>Hello</span></div>`;

        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [], [
                new ElementNode('span', [], [
                    new TextNode('Hello')
                ])
            ])
        ]);
    });

    it('Two sibling nodes on parent level', () => {
        const parser = injector.get(Parser);
        const test = `<div>div</div>
<span>span</span>`;

        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [], [new TextNode('div')]),
            new ElementNode('span', [], [new TextNode('span')])
        ]);
    });

    it('Node with attributes', () => {
        const parser = injector.get(Parser);
        const test = `<div class="hello"    style="margin: 10px"></div>`;

        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [
                new Attribute('class', 'hello'),
                new Attribute('style', 'margin: 10px')
            ], []),
        ]);
    });

    it('Node with attribute without value', () => {
        const parser = injector.get(Parser);
        const test = `<div class  style></div>`;

        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [
                new Attribute('class'),
                new Attribute('style')
            ], []),
        ]);
    });

    it('Node with asterisk attribute', () => {
        const parser = injector.get(Parser);
        const test = `<div *class  *style="hello"></div>`;

        const attribute1 = new Attribute('class');
        const attribute2 = new Attribute('style', 'hello');
        attribute1.hasAsterisk = true;
        attribute2.hasAsterisk = true;
        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [
                attribute2,
                attribute1
            ], []),
        ]);
    });

    it('Node with brackets attribute', () => {
        const parser = injector.get(Parser);
        const test = `<div [class]  [style]="hello"></div>`;

        const attribute1 = new Attribute('class');
        const attribute2 = new Attribute('style', 'hello');
        attribute1.hasBrackets = true;
        attribute2.hasBrackets = true;
        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [
                attribute2,
                attribute1
            ], []),
        ]);
    });

    it('Node with parenthesis attribute', () => {
        const parser = injector.get(Parser);
        const test = `<div (style)="hello" (class)></div>`;

        const attribute1 = new Attribute('class');
        const attribute2 = new Attribute('style', 'hello');
        attribute1.hasParenthesis = true;
        attribute2.hasParenthesis = true;
        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [
                attribute2,
                attribute1
            ], []),
        ]);
    });

    it('Node with combined attributes', () => {
        const parser = injector.get(Parser);
        const test = `<div [(style)]="hello" (*class) [(*value)]="value"></div>`;

        const attribute1 = new Attribute('class');
        attribute1.hasParenthesis = true;
        attribute1.hasAsterisk = true;

        const attribute2 = new Attribute('style', 'hello');
        attribute2.hasParenthesis = true;
        attribute2.hasBrackets = true;

        const attribute3 = new Attribute('value', 'value');
        attribute3.hasParenthesis = true;
        attribute3.hasBrackets = true;
        attribute3.hasAsterisk = true;

        expect(parser.parse(test)).toEqual([
            new ElementNode('div', [
                attribute2,
                attribute3,
                attribute1,
            ], []),
        ]);
    });
});