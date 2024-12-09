import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
export const YearPicker = ({ year, validYear }) => {
    const increment = () => {
        year.value = year.value + 1;
    };
    const decrement = () => {
        year.value = Math.max(year.value - 1, 1);
    };
    const handleInputChange = (event) => {
        const inputValue = event.currentTarget.value;
        const parsedYear = parseInt(inputValue, 10);
        if (!isNaN(parsedYear) && parsedYear > 0) {
            year.value = parsedYear;
            validYear.value = true;
        }
        else {
            validYear.value = false;
        }
    };
    return (_jsxs("div", { class: 'year-selector', children: [_jsx("div", { class: 'year-selector-button year-selector-button-decrement', onClick: decrement, children: "\u2013" }), _jsxs("div", { class: 'year-selector-counter', children: [_jsx("input", { class: 'year-selector-counter-input', maxLength: 4, type: 'text', value: year, onInput: handleInputChange }), _jsx("div", { class: 'year-selector-counter-num', children: year })] }), _jsx("div", { class: 'year-selector-button year-selector-button-increment', onClick: increment, children: "+" })] }));
};
//# sourceMappingURL=YearPicker.js.map