import { h } from 'hyperapp'
import { classNames, displayDAI } from './helpers'
import QRCode from 'qrcode'
import config from 'config'

/*
let updater

export default {
  state: {
  },
  actions: {
    fetchInvoice: (id) => (state, actions) => {
      const opts = {}
      opts.headers = new Headers({'Content-Type': 'application/json'})
      return fetch(`/api/v1/invoice/${id}`, opts).then( result => result.json()).then( invoice => actions.setInvoice(invoice))
    },
    setInvoice: (invoice) => (state, actions) => {
      if (!state.invoice || state.invoice._id != invoice._id)
        QRCode.toDataURL(`ethereum:${invoice.deposit.address}/transfer?address=${config.contracts.DAI.address}&uint256=${invoice.totalAmount}`).then( result => actions.setQRCode(result))
      return {invoice}
    },
    setQRCode: (qrcode) => ({qrcode})
  },
  view: ({match, state, actions}) => {
    const { id } = match.params
    const { invoice, qrcode } = state.invoice
    const oncreate = _ => {
      const updateData = _ => {
        actions.invoice.fetchInvoice(id).then( _ => updater = setTimeout(updateData, 5000) )
      }
      updateData()
    }
    console.log(state)
    const showStatusLine = (state) => {
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
    let content
    if (invoice) {
      const amountDue = invoice.totalAmount - invoice.paidAmount 
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
        { invoice.items.map( i => <tr><td>{ i.description }</td><td>{ displayDAI(i.amount) } </td></tr>) }
        <tr><td><strong>Total:</strong></td><td>{ displayDAI(invoice.totalAmount) }</td></tr>
        <tr><td><strong>Paid:</strong></td><td>{ displayDAI(invoice.paidAmount) }</td></tr>
        </tbody>
        </table>
        { amountDue >= 0.01 ? <div>Transfer <strong>{ displayDAI(amountDue) }</strong> to</div> : 'Deposit address:'} <div><strong>{ invoice.deposit.address }</strong></div>
        <div class="columns">
          <div class="column is-6">
            { qrcode ? <img src={qrcode} /> : null }
          </div>
          <div class="column is-6">
            <div class="buttons is-centered">
              <button class="button is-info is-small" onclick={ _ => window.open(`http://etherscan.io/address/${invoice.deposit.address}`,'_blank')}>View transactions</button>
            </div>
          </div>
        </div>
        <div>
        { showStatusLine(invoice.state) }
        </div>
      </div> 
    } else {
      content = 'Loading..'
    }
    return <div key={id} class="box" oncreate={oncreate}>
      { content }
    </div>
  }
}

*/
export function fx(a) {
  return function(b) {
    return [a, b]
  }
}
function SetInvoice(state, invoice) {
  return {...state, invoice}
}

async function fetchInvoice(dispatch, params) {
  console.log("Fetching invoice",params.id)
  const opts = {}
  opts.headers = new Headers({'Content-Type': 'application/json'})
  let result = await fetch(`/api/v1/invoice/${params.id}`, opts)
  result = await result.json()
  console.log("Result",result)
  dispatch([SetInvoice, result])
}

const FetchInvoiceFx = fx(fetchInvoice)

export default {
  Init: (state, id) => {
    return [
      state,
      FetchInvoiceFx({id})
    ]
  },
  View: _ => (
    <div></div>
  )
}
