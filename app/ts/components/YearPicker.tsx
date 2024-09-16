import { Signal } from '@preact/signals'

export const YearPicker = ( { year, validYear }: { year: Signal<number>, validYear: Signal<boolean>  }) => {
	const increment = () => {
		year.value = year.value + 1
	}

	const decrement = () => {
		year.value = Math.max(year.value - 1, 1)
	}

	const handleInputChange = (e: Event) => {
		const inputValue = (e.target as HTMLInputElement).value
		const parsedYear = parseInt(inputValue, 10)
		if (!isNaN(parsedYear) && parsedYear > 0) {
			year.value = parsedYear
			validYear.value = true
		} else {
			validYear.value = false
		}
	}

	return (
		<div class = 'year-selector'>
			<div class = 'year-selector-button year-selector-button-decrement' onClick = { decrement }>&ndash;</div>
			<div class = 'year-selector-counter'>
				<input
					class = 'year-selector-counter-input'
					maxLength = { 4 }
					type = 'text'
					value = { year.value }
					onInput = { handleInputChange }
				/>
				<div class = 'year-selector-counter-num'>{ year.value }</div>
			</div>
			<div class = 'year-selector-button year-selector-button-increment' onClick = { increment }>+</div>
		</div>
	)
}
