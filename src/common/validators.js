
export function validateInvoiceForm(form) {
  const errors = [] 
  if (!form.items || !form.items.length) {
    errors.push('items are missing')
    return errors
  }
  let total = 0
  for(let item of form.items) {
    if (!item.description) {
      errors.push('item description can\'t be empty')
      break
    }
    total += item.amount * (item.quantity || 1)
  }
  if (!total)
    errors.push('invoice total')
  form.totalAmount = total
  form.paidAmount = 0
  return errors
}
