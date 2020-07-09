import { h } from 'hyperapp'

export function classNames(arr) {
  return arr.join(' ')
}


export function displayCurrency(amount, currency) {
  return <span>{amount.toFixed(2)} {currency}</span>
}
