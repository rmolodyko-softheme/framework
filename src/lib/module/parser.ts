import { ComponentMetadata } from '../metadata/component/component-metadata';

export class Parser {

    parse(component: ComponentMetadata) {
        const ifIds = new Set();
        const result = component.config.view.replace(/\{\{(.*?)\}\}/mg, (allMatchString: string, view: string) => {
            return this.eval(component.getInstance(), view);
        }).replace(/\((.*?)\)="(.*?)"/mg, (allMatchString: string, eventType: string, code: string) => {
            const id = '_id' + Math.random();
            component.events.addEvent(id, eventType, code);
            return ' id="' + id + '" ';
        }).replace(/\*if="(.*?)"/, (allMatchString: string, code: string) => {
            const value = !this.eval(component.getInstance(), code);
            if (value) {
                const id = Math.random();
                ifIds.add(id);
                return ` __if-id="${id}" `;
            }

            return allMatchString;
        });

        if (ifIds.size > 0) {
            const temp = document.createElement('div');
            temp.innerHTML = result;
            ifIds.forEach(id => {
                const element = temp.querySelector(`[__if-id="${id}"]`);
                element.parentNode.removeChild(element);
            });

            return temp.innerHTML;
        }

        return result;

    }

    private eval(context: any, code: string) {
        return function () { return eval(code); }.call(context);
    }
}