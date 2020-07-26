import _ from 'lodash'
import { DAI, ethProvider } from '../../contracts'
import Invoices from '../invoice/manager'
import { fromBN } from '../../common/utils'
import config from 'config'

export async function checkPendingInvoices(tokenContract, provider) {
  const invoices = await Invoices.findPendingInvoices()
  console.log("INVOICES",invoices)
  const curBlock = await provider.getBlockNumber()
  const tasks = []
  console.log(`checkPendingInvoices: found ${invoices.length} invoices`)
  for(let invoice of invoices) {
    console.log(invoice)
    const balanceBN = (await tokenContract.balanceOf(invoice.wallet.address)).toString()
    const balance = fromBN(balanceBN)
    const upd = {}
    if (balance != invoice.paidAmount) {
      upd.paidAmount = balance
    }
    const expires = invoice.expires || (invoice.created + 24 * 60 * 60000) // 1 day
    if (Date.now() > expires) {
      upd.state = 'expired'
    }
    if (balance >= invoice.totalAmount) {
      if (config.invoices.minConfirmations) {
        if (invoice.confirmBlock) {
          console.log('curBlock',curBlock,invoice.confirmBlock)
          if (curBlock >= invoice.confirmBlock) {
            upd.state = 'paid'
          }  
        } else {
          upd.state = 'confirming'
          upd.confirmBlock = curBlock + config.invoices.minConfirmations
        }
      } else
        upd.state = 'paid'
    }
    if (!_.isEmpty(upd)) {
      console.log(`updating invoice #${invoice._id}`,upd)
      tasks.push(Invoices.updateInvoice(invoice._id, upd))
    }
  }
  return tasks
}
export function runLastBlockJob() {
  let curBlock, lastBlock = 0
  const updateLastBlock = async _ => {
    try {
      curBlock = await  ethProvider.getBlockNumber()
      if (curBlock > lastBlock) {
        lastBlock = ethProvider.blockNumber
        await checkPendingInvoices(DAI, ethProvider) 
      }
    } catch(e) {
      console.log(e)
    }
    setTimeout(updateLastBlock, 1000)
  }
  updateLastBlock()
}
