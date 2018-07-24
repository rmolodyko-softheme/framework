import { Injectable } from '../../di/injector';

export abstract class Node {
    children: Node[] = [];

    add(node: Node) {
        this.children.push(node);
    }
}

export class Attribute {
    hasBrackets = false;
    hasParenthesis = false;
    hasAsterisk = false;

    constructor(public name: string, public value?: string) {}
}

export class TextNode extends Node {
    constructor(
        public text: string
    ) {
        super();
    }
}

export class ElementNode extends Node {
    constructor(
        public nodeName: string,
        public attributes: Attribute[] = [],
        public children: Node[] = []
    ) {
        super();
    }
}

@Injectable()
export class Parser {

    private parsingState: ParsingState = ParsingState.Undefined;
    private nodes: Node[] = [];
    private result: Node[] = [];

    constructor() {

    }

    parse(view: string): Node[] {
        const normalizedView = view.replace(/\r?\n|\r/mg, '').replace(/\s+/, ' ');
        for (let i = 0; i < normalizedView.length; i++) {
            const symbol = normalizedView[i];
            const nextSymbol = normalizedView[i + 1];
            if (symbol === '<' && nextSymbol === '/') {
                const startEndTagPosition = i + 2;
                if (
                    normalizedView.slice(
                        startEndTagPosition,
                        startEndTagPosition + this.currentElementNode().nodeName.length
                    ) === this.currentElementNode().nodeName
                ) {
                    if (this.parsingState === ParsingState.StartText) {
                        this.pop();
                    }
                    this.pop();
                } else {
                    throw new Error(`Closing tag for ${this.current<ElementNode>().nodeName} is wrong`);
                }
            } else if (symbol === '<' && nextSymbol !== '/') {
                const tagName = normalizedView.slice(i, normalizedView.length).replace(/<(.*?)(\s+|>).*/, '$1');
                this.push(new ElementNode(tagName));

                // Parse attributes
                let attributes = normalizedView.slice(i, normalizedView.length)
                    .replace(/<(.*?)((\s+(.*?)>)|>).*/, '$4')
                    .replace(/\s+/, ' ')
                ;

                // Default attributes with value
                attributes = attributes.replace(/([^\s]*?)="(.*?)"/g, (all: string, name: string, value: string) => {
                    const attributeName = name.replace(/\s/, '');
                    this.current<ElementNode>().attributes.push(this.createAttribute(attributeName, value));
                    return '';
                });

                attributes.split(' ').forEach(name => {
                    if (name) {
                        this.current<ElementNode>().attributes.push(this.createAttribute(name))
                    }
                });

                // Move cursor to next token
                i += normalizedView.slice(i, normalizedView.length).replace(/.*?<(.*?)>.*/m, '$1').length + 1;
            } else if (this.parsingState === ParsingState.StartTag) {
                this.push(new TextNode(normalizedView[i]));
            } else if (this.parsingState === ParsingState.StartText) {
                this.current<TextNode>().text += normalizedView[i];
            }
        }

        return this.result;
    }

    private push(word: Node) {
        if (this.nodes.length > 0) {
            this.current().add(word);
        }

        this.nodes.push(word);

        if (word instanceof ElementNode) {
            this.parsingState = ParsingState.StartTag;
        }

        if (word instanceof TextNode) {
            this.parsingState = ParsingState.StartText;
        }
    }

    private pop() {
        const item = this.nodes.pop();

        if (item instanceof ElementNode) {
            this.parsingState = ParsingState.EndTag;
        }
        if (item instanceof Text) {
            this.parsingState = ParsingState.EndText;
        }

        if (this.nodes.length === 0) {
            this.result.push(item);
        }
    }

    private current<T extends Node>(): T {
        return this.nodes[this.nodes.length - 1] as T;
    }

    private currentElementNode(): ElementNode {
        const length = this.nodes.length;
        for (let i = length - 1; i >= 0; i--) {
            const current = this.nodes[i];
            if (current instanceof ElementNode) {
                return current;
            }
        }

        throw new Error('Tag not found');
    }

    private createAttribute(name: string, value?: string) {
        const attribute = new Attribute(name, value);

        if (name.match(/\*(.*)/)) {
            attribute.name = attribute.name.replace('*', '');
            attribute.hasAsterisk = true;
        }

        if (name.match(/\[.*\]/)) {
            attribute.name = attribute.name.replace('[', '').replace(']', '');
            attribute.hasBrackets = true;
        }

        if (name.match(/\(.*\)/)) {
            attribute.name = attribute.name.replace('(', '').replace(')', '');
            attribute.hasParenthesis = true;
        }

        return attribute;
    }
}

enum ParsingState {
    Undefined,
    StartTag,
    EndTag,
    StartText,
    EndText
}