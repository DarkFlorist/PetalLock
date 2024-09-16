import { batch, Signal } from '@preact/signals'
import { useMemo } from 'preact/hooks'

export class OptionalSignal<T> extends Signal<Signal<T> | undefined> {
	private inner: Signal<T> | undefined

	public constructor(value: Signal<T> | T | undefined, startUndefined?: boolean) {
		if (value === undefined) {
			super(undefined)
		} else if (value instanceof Signal) {
			super(startUndefined ? undefined : value)
			this.inner = value
		} else {
			const inner = new Signal(value)
			super(startUndefined ? undefined : inner)
			this.inner = inner
		}
	}

	public clear() {
		this.value = undefined
	}

	public get deepValue() {
		const inner = this.value
		if (inner === undefined) return undefined
		else return inner.value
	}

	public deepPeek() {
		const inner = this.peek()
		if (inner === undefined) return undefined
		else return inner.peek()
	}

	public set deepValue(newValue: T | undefined) {
		if (newValue === undefined) {
			this.value = undefined
		} else {
			batch(() => {
				if (this.inner === undefined) this.inner = new Signal(newValue)
				else this.inner.value = newValue
				this.value = this.inner
			})
		}
	}
}

export function useOptionalSignal<T>(value: Signal<T> | T | undefined, startUndefined?: boolean) {
	return useMemo(() => new OptionalSignal<T>(value, startUndefined), []);
}
