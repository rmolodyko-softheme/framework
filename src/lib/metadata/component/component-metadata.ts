import { Injector, Type, TypeProvider } from '../../di/injector';
import { ComponentZone, Zone } from './component-zone';
import { ComponentEvents } from './component-events';

export interface ComponentMetadataConfig {
    selector: string;
    view: string;
    providers?: TypeProvider[];
}

export class ComponentMetadata {

    static componentMetadataConfig = new Map<Type, ComponentMetadataConfig>();

    isActive: boolean;
    config: ComponentMetadataConfig;

    id: string = '__id' + Math.random();
    element: HTMLElement;

    zone: ComponentZone;
    events: ComponentEvents;

    private injector: Injector;
    private children = new Set<ComponentMetadata>();

    constructor(private type: Type) {
        this.config = ComponentMetadata.componentMetadataConfig.get(type);
    }

    init(parentInjector: Injector, parentZone: Zone) {
        this.injector = new Injector(parentInjector);
        this.zone = new ComponentZone(parentZone);
        this.events = new ComponentEvents();

        if (Array.isArray(this.config.providers)) {
            this.config.providers.forEach(provider => {
                this.injector.provide(provider);
            });
        }
    }

    add(component: ComponentMetadata) {
        this.children.add(component);
    }

    getInstance() {
        return this.injector.get(this.type);
    }

    child() {
        return Array.from(this.children);
    }
}
