
export interface Zone {
    fork(data: any);
    run(fn: () => void);
    parent: Zone;
}

export class ComponentZone {

    private whenTaskFn: () => void = () => {};

    zone: Zone;

    constructor(private parentZone: Zone) {
        this.zone = this.parentZone.fork({
            onInvokeTask: (delegate: any, currentZone: any, targetZone: any, task: any, ...args: any[]) => {
                const result = delegate.invokeTask(targetZone, task, ...args);
                if (this.whenTaskFn && targetZone === currentZone) {
                    this.whenTaskFn();
                }
                return result;
            }
        });
    }

    whenTask(fn: () => void) {
        this.whenTaskFn = fn;
    }

    callIn(fn: () => void) {
        this.zone.run(fn);
    }

    callOutside(fn: () => void) {
        let parent = this.zone;
        while (parent) {
            if (parent.parent) {
                parent = parent.parent;
            } else {
                parent.run(fn);
                return;
            }
        }
    }
}