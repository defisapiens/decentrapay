import BigNumber from 'bignumber.js'
import commandLineArgs from 'command-line-args'
import { ethers } from 'ethers'
import Invoices from '../server/invoice/manager'
import { DAI,ethProvider } from '../contracts'
import { fromBN,toBN } from '../common/utils'


const optionDefs = [
  {name: 'collect', type:String},
  {name: 'gaslimit', type:Number, defaultValue:50000},
  {name: 'fundamount', type:Number, defaultValue: 0.001},
  {name: 'privatekey', alias:'p', type:String},
]

const fatal = (msg) => {
  console.log(msg)
  process.exit(1)
}
async function main() {
  const options = commandLineArgs(optionDefs)
  const wallets = await Invoices.findUsedDepositAddresses()
  console.log(`Found ${wallets.length} active wallets`)
  const gasPrice = new BigNumber((await ethProvider.getGasPrice()).toString())
  let fundWallet
  if (options.privatekey) {
    fundWallet = new ethers.Wallet(options.privatekey, ethProvider)
  }
  console.log(`gas price of the last block: ${gasPrice.toNumber()}`)
  for(let wallet of wallets) {
    let invoice
    if (wallet.usedBy)
      invoice = await Invoices.getInvoice(wallet.usedBy)
    else
      invoice = await Invoices.getInvoiceByDepositAddress(wallet._id)
    if (!invoice)
      console.log(`wallet ${wallet.address}: invoice not found`)
    let balanceBN = (await DAI.balanceOf(wallet.address))
    let balance = fromBN(balanceBN)
    console.log(`${wallet.address} DAI balance: ${balance} `)
    if (balance == 0) {
      if (!invoice || (invoice.state === 'expired')) {
        console.log(`releasing wallet ${wallet.address}`)
        await Invoices.updateDepositAddress(wallet._id, {usedBy:''}) 
      }
    } else {
      let ethBalance = new BigNumber((await ethProvider.getBalance(wallet.address)).toString())
      console.log(`${wallet.address} ETH balance: ${fromBN(ethBalance)}`)
      if (options.collect) {
        let tx
        if (!fundWallet) {
          fatal("privatekey should be specified")
        }
        const ethMin = gasPrice.multipliedBy(new BigNumber(options.gaslimit))
        if (ethBalance.lt(ethMin)) {
          console.log(`${wallet.address}: minimum ${fromBN(ethMin)} ETH is required`)
          console.log(`sending ${options.fundamount} ETH to ${wallet.address}`)
          const params = {
            to: wallet.address,
            value: ethers.utils.parseEther(options.fundamount.toString())
          } 
          tx = await fundWallet.sendTransaction(params)
          try {
            await tx.wait()
            console.log('done.')
            ethBalance = new BigNumber((await ethProvider.getBalance(wallet.address)).toString())
            console.log(`${wallet.address} ETH balance: ${fromBN(ethBalance)}`)
          } catch(e) {
            console.log('funding failed',e)
            continue
          } 
        }
        console.log(`collecting ${balance} DAI from ${wallet.address}`)
        const DAIWithSigner = DAI.connect(new ethers.Wallet(wallet.privateKey, ethProvider))
        tx = await DAIWithSigner.transfer(options.collect, balanceBN)
        try {
          await tx.wait()
          console.log('done.')
          balanceBN = (await DAI.balanceOf(wallet.address))
          if (balanceBN.isZero()) { // make sure that token balance is zero
            console.log(`releasing wallet ${wallet.address}`)
            await Invoices.updateDepositAddress(wallet._id, {usedBy:''}) 
          }
        } catch(e) {
          console.log('sending tokens failed',e)
        } 
      }
    }
  }
  process.exit(0)
}

main() 
