import { batch, Signal } from '@preact/signals';
import { useMemo } from 'preact/hooks';
export class OptionalSignal extends Signal {
    inner;
    constructor(value, startUndefined) {
        if (value === undefined) {
            super(undefined);
        }
        else if (value instanceof Signal) {
            super(startUndefined ? undefined : value);
            this.inner = value;
        }
        else {
            const inner = new Signal(value);
            super(startUndefined ? undefined : inner);
            this.inner = inner;
        }
    }
    clear() {
        this.value = undefined;
    }
    get deepValue() {
        const inner = this.value;
        if (inner === undefined)
            return undefined;
        else
            return inner.value;
    }
    deepPeek() {
        const inner = this.peek();
        if (inner === undefined)
            return undefined;
        else
            return inner.peek();
    }
    set deepValue(newValue) {
        if (newValue === undefined) {
            this.value = undefined;
        }
        else {
            batch(() => {
                if (this.inner === undefined)
                    this.inner = new Signal(newValue);
                else
                    this.inner.value = newValue;
                this.value = this.inner;
            });
        }
    }
}
export function useOptionalSignal(value, startUndefined) {
    return useMemo(() => new OptionalSignal(value, startUndefined), []);
}
//# sourceMappingURL=OptionalSignal.js.map