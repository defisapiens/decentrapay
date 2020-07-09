import assert from 'assert'
import { h } from 'hyperapp'
import { classNames, displayCurrency } from './helpers'
import QRCode from 'qrcode'
import config from 'config'

export function fx(a) {
  return function(b) {
    return [a, b]
  }
}
function SetInvoice(state, invoice) {
  return {...state, invoice}
}

function SetQRCode(state, qrcode) {
  return {...state, qrcode}
}

async function fetchInvoice(dispatch, params) {
  console.log("Fetching invoice",params.id)
  assert(params.id)
  const opts = {}
  opts.headers = new Headers({'Content-Type': 'application/json'})
  let result = await fetch(`/api/v1/invoice/${params.id}`, opts)
  const invoice = await result.json()
  console.log("Result",invoice)
  dispatch([SetInvoice, invoice])
  if (params.generateQR) {
    let qrcode = await QRCode.toDataURL(`ethereum:${invoice.wallet.address}/transfer?address=${config.contracts.DAI.address}&uint256=${invoice.totalAmount}`)
    dispatch([SetQRCode, qrcode])
  }
}

export const FetchInvoiceFx = fx(fetchInvoice)

export function FetchInvoice(state, id) {
  return [
    state, 
    FetchInvoiceFx({id})
  ]
}

function showStatusLine(state) {
  let cls, msg
  switch(state) {
    case 'pending':
      cls = ['has-background-info','has-text-white']
      msg = <span><button class="button is-loading is-info is-small"/> Awaiting payment</span>
      break
    case 'paid':
    case 'confirming':
      cls = ['has-background-success','has-text-white']
      msg = <span><button class="button is-loading is-success is-small"/> Confirming</span>
      break  
    case 'closed':
      cls = ['has-background-success','has-text-white']
      msg = 'Paid'
      break  
    case 'expired':
      cls = ['has-background-danger','has-text-white']
      msg = 'Expired'
      break
  }
  return <div class={classNames(cls)}>{ msg }</div> 
}

export default {
  Init: (state, id) => {
    return [
      state,
      FetchInvoiceFx({id,generateQR:true})
    ]
  },
  View: state => {
    const { invoice, qrcode } = state
    let content
    if (invoice) {
      const amountDue = invoice.totalAmount - invoice.paidAmount 
      const currency = invoice.currency
      let merchantInfo 
      if (invoice.merchant) {
        merchantInfo = <div class="columns">
          <div class="column is-6 is-offset-6 has-text-right">
            <strong>{ invoice.merchant.name }</strong>
            { invoice.merchant.address ? <div>{ invoice.merchant.address }</div> : null }
          </div>
        </div>
      }
      content = <div class="invoice">
        <h5 class="title is-5 has-text-black">Invoice #{ invoice._id }</h5>
        { merchantInfo }
        <table class="table is-striped is-fullwidth">
        <tbody>
        { invoice.items.map( i => <tr><td>{ i.description }</td><td>{ displayCurrency(i.amount, currency) } </td></tr>) }
        <tr><td><strong>Total:</strong></td><td>{ displayCurrency(invoice.totalAmount, currency) }</td></tr>
        <tr><td><strong>Paid:</strong></td><td>{ displayCurrency(invoice.paidAmount, currency) }</td></tr>
        </tbody>
        </table>
        { amountDue >= 0.01 ? <div>Transfer <strong>{ displayCurrency(amountDue, currency) }</strong> to</div> : 'Deposit address:'} <div><strong>{ invoice.wallet.address }</strong></div>
        <div class="columns">
          <div class="column is-6">
            { qrcode ? <img src={qrcode} /> : null }
          </div>
          <div class="column is-6">
            <div class="buttons is-centered">
              <a class="button is-info is-small" href={`http://etherscan.io/address/${invoice.wallet.address}`} target='_blank'>View transactions</a>
            </div>
          </div>
        </div>
        <div>
        { showStatusLine(invoice.state) }
        </div>
      </div> 
    } else {
      content = 'Loading...'
    }
    return <div class="box">{ content }</div>
  }
}
