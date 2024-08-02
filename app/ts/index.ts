import { createElement, render } from 'preact'
import { App } from './components/App.js'

// specify our render function, which will be fired anytime rootModel is mutated
function rerender() {
	const element = createElement(App, {})
	render(element, document.body)
}

// kick off the initial render
rerender()
