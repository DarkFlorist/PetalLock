import { Signal } from '@preact/signals'
import * as funtypes from 'funtypes'

interface CreateProps {
	year: Signal<number>
}

export const YearPicker = ( { year }: CreateProps) => {
	const setYear = (text: string) => {
		const yearToSet = funtypes.Number.parse(text)
		year.value = yearToSet
	}
	const increment = () => {
		year.value = year.value + 1
	}
	const decrement = () => {
		year.value = Math.max(year.value - 1, 1)
	}
	return <div class = 'year-selector'>
		<div class = 'year-selector-button year-selector-button-decrement' onClick = { decrement }>&ndash;</div>
		<div class = 'year-selector-counter'>
			<input
				class = 'year-selector-counter-input'
				maxlength = { 4 }
				type = 'text'
				pattern = '\d*'
				value = { year.value } 
				onInput = { e => setYear(e.currentTarget.value) }
			/>
			<div class = 'year-selector-counter-num'>{ year }</div>
		</div>
		<div class = 'year-selector-button year-selector-button-increment' onClick = { increment }>+</div>
	</div>
}
