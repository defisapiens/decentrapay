import BigNumber from 'bignumber.js'

export function fromBN(val) {
  return new BigNumber(val).dividedBy(Math.pow(10,18)).toNumber()
}

export function toBN(val) {
  return BigNumber(val).multipliedBy(Math.pow(10,18))
}

