import request from 'request'
import Invoices from '../invoice/manager'
import config from 'config'

export async function checkPendingNotifications() {
  const invoices = await Invoices.findPaidInvoices()
  for(let invoice of invoices) {
    if (!invoice.notified && invoice.callbacks) {
      request.post(invoice.callbacks.paid.url, {json:{token:invoice.callbacks.token,invoiceId:invoice._id,metadata:invoice.metadata}}, (err, resp) => {
        if (err || resp.statusCode != 200) {
          console.log(`invoice #${invoice._id}: callback error occured:`,err)
          return
        }
        Promise.resolve(Invoices.updateInvoice(invoice._id,{notified:Date.now(),state:'closed'}))
      })
    }
  }
}

export function runCallbackJob() {
  checkPendingNotifications()
  setInterval(checkPendingNotifications, 15000)
}
