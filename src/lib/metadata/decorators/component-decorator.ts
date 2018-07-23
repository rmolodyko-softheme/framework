import { ComponentMetadata, ComponentMetadataConfig } from '../component/component-metadata';
import { Type } from '../../di/injector';

export function Component(config: ComponentMetadataConfig) {
    return (constructor: Type) => {
        ComponentMetadata.componentMetadataConfig.set(constructor, config);
        return constructor;
    };
}
