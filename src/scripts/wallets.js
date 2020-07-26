import BigNumber from 'bignumber.js'
import commandLineArgs from 'command-line-args'
import { ethers } from 'ethers'
import Invoices from '../server/invoice/manager'
import { DAI,ethProvider } from '../contracts'
import { fromBN,toBN } from '../common/utils'
import xhr2 from 'xhr2'
global.XMLHttpRequest = xhr2
import Gasless from 'gasless'
import Web3 from "web3"

let web3 = new Web3(
  // Replace YOUR-PROJECT-ID with a Project ID from your Infura Dashboard
  new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/8373ce611754454884132be22b562e45")
);


const optionDefs = [
  {name: 'destination', alias:'d', type:String},
  {name: 'gaslimit', type:Number, defaultValue:50000},
]

const fatal = (msg) => {
  console.log(msg)
  process.exit(1)
}
async function main() {
  const options = commandLineArgs(optionDefs)
  const invoices = await Invoices.findPaidInvoices()
  console.log(`Found ${invoices.length} paid invoices`)
  const gasless = new Gasless(web3.currentProvider);
  for(let invoice of invoices) {
    const wallet = invoice.wallet
    let balanceBN = (await DAI.balanceOf(wallet.address))
    let balance = fromBN(balanceBN)
    console.log(`${wallet.address} DAI balance: ${balance} `)
    if (balance > 0) {
      let ethBalance = new BigNumber((await ethProvider.getBalance(wallet.address)).toString())
      console.log(`${wallet.address} ETH balance: ${fromBN(ethBalance)}`)
      if (options.destination) {
        const account = web3.eth.accounts.wallet.add(wallet.key)
        const gasPrice = await web3.eth.getGasPrice()
        const daiFee = await gasless.getFee(gasPrice)
        console.log(daiFee)
        let from = wallet.address
        let to = options.destination
        const tx = await gasless.send(
          from,
          to,
          balanceBN,
          daiFee,
          gasPrice  
        ) 
        /*
        const gasPrice = new BigNumber((await ethProvider.getGasPrice()).toString()).multipliedBy(1.25)  // increase last block gasprice 25% for faster transactions
        console.log(`setting gas price to ${gasPrice.toNumber()}`)

        console.log(`collecting ${balance} DAI from ${wallet.address}`)
        const DAIWithSigner = DAI.connect(new ethers.Wallet(wallet.privateKey, ethProvider))
        tx = await DAIWithSigner.transfer(options.collect, balanceBN)
        try {
          await tx.wait()
          console.log('done.')
        } catch(e) {
          console.log('sending tokens failed',e)
        } 
        */
      }
    }
  }
  process.exit(0)
}

main() 
