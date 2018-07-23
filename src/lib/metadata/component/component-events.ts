
export interface Zone {
    fork(data: any);
    run(fn: () => void);
    parent: Zone;
}

export class ComponentEvents {

    private pendingEvents = new Map<string, { eventType: string, code: string, fn?: Function }>();

    addEvent(id: string, eventType: string, code: string) {
        this.pendingEvents.set(id, { eventType, code });
    }

    clearEvents() {
        this.pendingEvents.forEach((data, id) => {
            if (data.fn) {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener(data.eventType, data.fn as any);
                }
            }
        });

        this.pendingEvents.clear();
    }

    events() {
        return this.pendingEvents;
    }
}