import { Signal } from '@preact/signals'
import { useRef, useState } from 'preact/hooks'

type DebounceInputProps = {
	placeholder?: string
	delay?: number
	onDebouncedChange: (value: string) => void
	onValidationError: (value: string) => void
	validate: (value: string) => boolean
	validationError?: string
	inputValue: Signal<string>
}

export function DebounceInput({
	placeholder = '',
	delay = 500,
	onDebouncedChange,
	onValidationError,
	validate,
	validationError = 'Invalid input.',
	inputValue,
}: DebounceInputProps) {
	const inputTimeoutRef = useRef<number | null>(null)
	const [error, setError] = useState<string | undefined>(undefined)

	function handleInput(event: Event) {
		const value = (event.target as HTMLInputElement).value
		inputValue.value = value

		if (inputTimeoutRef.current !== null) clearTimeout(inputTimeoutRef.current)

		inputTimeoutRef.current = setTimeout(() => {
			inputTimeoutRef.current = null
			const currentValue = inputValue.value.toLowerCase()

			if (!validate(currentValue)) {
				setError(validationError)
				onValidationError(currentValue)
				return
			}

			setError(undefined)
			onDebouncedChange(currentValue)
		}, delay)
	}

	return (
		<div class = 'input' style = 'display: block; width 100%;'>
			<input
				class = 'input' 
				type = 'text'
				style = 'width: 100%'
				placeholder = { placeholder }
				onInput = { handleInput }
			/>
			{ error && <p style = { { color: 'red' } }>{ error }</p> }
		</div>
	)
}
