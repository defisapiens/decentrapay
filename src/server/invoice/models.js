import db from '../connector'

const InvoiceItem = {
  description: String,
  quantity: Number,
  amount: Number
}

const InvoiceCallback = {
  url: String
}

const DepositAddressSchema = new db.Schema({
  _id: {
    type: String,
    required: true
  },
  address: String,
  created: Number,
  privateKey: String,
  usedBy: String // invoice Id
})

const InvoiceSchema = new db.Schema({
  _id: {
    type: String,
    required: true
  },
  currency: String,
  items: [InvoiceItem],
  totalAmount: Number,
  paidAmount: Number,
  merchant: {
    name: String,
    address: String,
    url: String
  },
  metadata: {
    type: db.Schema.Types.Mixed,
    optional: true
  },
  created: Number,
  expires: {
    type: Number,
    optional: true
  },
  paid: {
    type: Number,
    optional: true
  },
  confirmBlock: {
    type: Number,
    optional: true
  },
  notified: {
    type: Number,
    optional: true  
  },
  callbacks: {
    token: String,
    paid: InvoiceCallback
  },
  state: String,
  deposit: {
    _id: String,
    address: String 
  }
})
InvoiceSchema.index({state:1})
DepositAddressSchema.index({invoiceId:1})

export const DepositAddress = db.model('DepositAddress', DepositAddressSchema)
export const Invoice = db.model('Invoice', InvoiceSchema)

