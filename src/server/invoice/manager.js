import { Invoice, DepositAddress } from './models'
import shortid from 'shortid'
import { ethers } from 'ethers'

export default class {
  static async createInvoice(props) {
    props._id = shortid.generate()
    props.created = Date.now()
    const wallet = ethers.Wallet.createRandom()
    const deposit = await DepositAddress.create({_id:shortid.generate(),address:wallet.address,privateKey:wallet.privateKey})
    props.deposit = {
      _id: deposit._id,
      address: deposit.address,
      created: Date.now()
    }
    props.state = 'pending'
    return Invoice.create(props)
  } 
  static getInvoice(id) {
    console.log("getInvoice",id)
    return Invoice.findOne({_id:id},{callbacks:0,metadata:0})
  }
  static findPendingInvoices() {
    return Invoice.find({state:{$in:['pending','confirming']}})
  }
  static findPaidInvoices() {
    return Invoice.find({state:'paid'})
  }
  static async updateInvoice(id, upd) {
    return Invoice.update({_id:id},{$set:upd})
  }
}
