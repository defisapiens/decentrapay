import { h } from 'hyperapp'

export function classNames(arr) {
  return arr.join(' ')
}


export function displayDAI(amount) {
  return <span>{amount.toFixed(2)} DAI</span>
}
