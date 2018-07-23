import { Injector, Type, TypeProvider } from '../di/injector';
import { ComponentMetadata } from '../metadata/component/component-metadata';
import { Parser } from './parser';

declare const Zone: any;

export class Bootstrap {
    private injector: Injector;
    private parser: Parser = new Parser();

    constructor(private config: {
        components: Type[],
        providers: (TypeProvider | Type)[],
        bootstrap: Type
    }) {
        this.injector = new Injector();

        if (config.providers) {
            config.providers.forEach(provider => {
                this.injector.provide(provider);
            });
        }

        if (config.components) {
            config.components.forEach(component => {
                this.injector.provide(component);
            });
        }

        this.create(config.bootstrap);
    }

    private create(type: Type, parent?: ComponentMetadata) {
        const componentToSelect = parent ? parent.element : document;
        [].forEach.call(componentToSelect.querySelectorAll(
            ComponentMetadata.componentMetadataConfig.get(type).selector),
            element => {
                const component = new ComponentMetadata(type);
                component.init(this.injector, parent ? parent.zone.zone : Zone.current);
                if (parent) {
                    parent.add(component);
                }
                component.element = element;
                element.id = component.id;

                component.zone.whenTask(() => {
                    this.update(component);

                    // We need wait when in the next cycle browser will update innerHTML
                    // So we call updating the events outside of main execution zones
                    component.zone.callOutside(() => {
                        setTimeout(() => {
                            this.updateEvents(component);
                        });
                    });
                });

                component.zone.callIn(() => {
                    component.element.innerHTML = this.parseView(component);
                    ComponentMetadata.componentMetadataConfig.forEach((config, type) => {
                        if (config.selector !== component.config.selector && componentToSelect.querySelector(config.selector)) {
                            this.create(type, component);
                        }
                    });
                });

                this.updateEvents(component);
            });
    }

    private update(component: ComponentMetadata) {
        component.element.innerHTML = this.parseView(component);

        // Assign ids of child component
        let isFound;
        component.child().forEach(childComponent => {
            isFound = false;
            [].forEach.call(component.element.querySelectorAll(childComponent.config.selector), element => {
                if (isFound === false && !element.id) {
                    isFound = true;
                    element.id = childComponent.id;
                    childComponent.element = element;
                }
            });
        });

        component.child().forEach((child) => {
            this.update(child);
        });
    }

    private updateEvents(component: ComponentMetadata) {
        component.zone.callIn(() => {
            component.events.events().forEach((data, id) => {
                const element = document.getElementById(id);
                if (element) {
                    if (data.fn) {
                        element.removeEventListener(data.eventType, data.fn as any)
                    }
                    data.fn = () => {
                        (function () {
                            return eval(data.code)
                        }).call(component.getInstance());
                    };
                    element.addEventListener(data.eventType, data.fn as any);
                }

                component.child().forEach(component => this.updateEvents(component));
            });
        });
    }

    private parseView(component: ComponentMetadata) {
        component.events.clearEvents();
        return this.parser.parse(component);
    }
}