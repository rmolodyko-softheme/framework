export type Type = any;
export type TypeProvider = { provide: Type, useClass?: Type, useValue?: any, multi?: boolean };

declare const Reflect: any;

export function Injectable() {
    return (constructor: Type) => {
        return constructor;
    };
}

export function Inject(type: Type) {
    return function logParameter(target: any, key : string, index : number) {
        Reflect.defineMetadata('constructor_parameter_' + index, type, target);
    }
}

export class Injector {
    private definitions = new Map<Type, TypeProvider>();
    private multiDefinitions = new Map<Type, TypeProvider[]>();
    private instances = new Map<Type, any | any[]>();

    constructor(private parent: Injector = null) {}

    get<T>(type: { new(): T }): T {
        // Find instance in current and parent injectors
        const instance = this.find(type, 'instances');
        if (instance) {
            return instance;
        }

        const provider = this.find(type, 'definitions');
        if (provider) {
            let instance;
            if (provider.useClass) {
                const metadataParams = Reflect.getMetadata('design:paramtypes', provider.useClass);
                const keys = Reflect.getMetadataKeys(provider.useClass)
                    .filter((key: string) => key.includes('constructor_parameter_'));
                const parameters = new Map<number, Type>();
                keys.forEach((key: string) => {
                    parameters.set(
                        +key.replace('constructor_parameter_', ''),
                        Reflect.getMetadata(key, provider.useClass)
                    );
                });
                let params: any[] = [];
                if (Array.isArray(metadataParams)) {
                    metadataParams.forEach((param: any, index: number) => {
                        if (Array.from(parameters.keys()).some(paramIndex => paramIndex === index)) {
                            params.push(this.get(parameters.get(index)));
                        } else if (param instanceof Function) {
                            params.push(this.get(param));
                        }
                    });
                }

                instance = new provider.useClass(...params);
            } else if (provider.useValue) {
                instance = provider.useValue;
            } else {
                throw new Error('Use value or use class should be set');
            }

            this.instances.set(type, instance);

            return instance;
        }

        const providers = this.find(type, 'multiDefinitions');
        if (providers) {
            providers.forEach(provider => {
                let instance;
                if (provider.useClass) {
                    instance = this.get(provider.useClass);
                } else if (provider.useValue) {
                    instance = provider.useValue;
                }
                if (!this.instances.has(type)) {
                    this.instances.set(type, []);
                }
                this.instances.get(type).push(instance);
            });

            return this.instances.get(type);
        }

        throw new Error('No provider');
    }

    provide(provider: TypeProvider | Type) {
        if (provider instanceof Function) {
            this.definitions.set(provider, { provide: provider, useClass: provider });

            return this;
        } else if (provider && provider.provide) {
            if (provider.multi) {
                if (!this.multiDefinitions.has(provider.provide)) {
                    this.multiDefinitions.set(provider.provide, []);
                }
                if (provider.useClass) {
                    this.provide(provider.useClass);
                }
                this.multiDefinitions.get(provider.provide).push(provider);
            } else {
                this.definitions.set(provider.provide, provider);
            }

            return this;
        }
        throw new Error('Wrong provider');
    }

    private find(type: Type, name: string) {
        let parent = this as Injector;

        // Find instance in current and parent injectors
        while (parent) {
            if (parent[name].has(type)) {
                return parent[name].get(type);
            }
            parent = parent.parent;
        }

        return null;
    }
}