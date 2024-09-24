import { Signal } from '@preact/signals';
export declare class OptionalSignal<T> extends Signal<Signal<T> | undefined> {
    private inner;
    constructor(value: Signal<T> | T | undefined, startUndefined?: boolean);
    clear(): void;
    get deepValue(): T | undefined;
    deepPeek(): T | undefined;
    set deepValue(newValue: T | undefined);
}
export declare function useOptionalSignal<T>(value: Signal<T> | T | undefined, startUndefined?: boolean): OptionalSignal<T>;
//# sourceMappingURL=OptionalSignal.d.ts.map