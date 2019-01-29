import Router from 'koa-router'
import Invoices from './invoice/manager'
import { validateInvoiceForm } from '../common/validators'
import config from 'config'

const router = new Router()

router.get('/version', (ctx,next) => {
  ctx.body = 'v1'
})

router.post('/invoice', async (ctx, next) => {
  const form = ctx.request.body
  if (config.apiKey && (config.apiKey !== form.apiKey) )
    ctx.throw(403, 'invalid token')
  const errors = validateInvoiceForm(form)
  if (errors.length) {
    ctx.body = {
      errors
    }
    return
  }
  form.expires = form.expires || Date.now() + 24 * 60 * 60000
  const invoice = await Invoices.createInvoice(form) 
  ctx.body = {
    invoiceId: invoice._id
  }
})

router.get('/invoice/:id', async (ctx, next) => {
  const invoice = await Invoices.getInvoice(ctx.params.id) 
  ctx.body = invoice
})


export default router
