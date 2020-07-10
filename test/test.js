import assert from 'assert'
import http from 'http'
import fs from 'fs'
import path from 'path'
import request from 'supertest'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import ERC20_ABI from './ERC20_ABI.json'
import config from 'config'


const binPath = path.join(__dirname,'./ERC20.bin')
const bytecode = fs.readFileSync(binPath,'UTF-8')

global.__DEV__ = false
global.__TEST__ = true
var app = require('../src/server/server').default.listen(8000)


const TOKEN='SECRET'

function fetchInvoice(invoiceId) {
  return new Promise((resolve, reject) => {
    request(app)    
      .get(`/api/v1/invoice/${invoiceId}`)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err)
          reject(err)
        else {
          console.log(res.body)
          resolve(res.body)
        }
      })
  })
}

function sleep(ms) {
  return new Promise((resolve,reject) => {
    setTimeout(resolve, ms)
  })
}
describe('basic functionality', function() {
  let provider, wallet, accounts, contract
  let invoiceId, invoice
  before(done => {
    // Load the wallet to deploy the contract with
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
    provider.listAccounts().then( result => {
      accounts = result
      console.log(accounts)
      // Load the wallet to deploy the contract with
      let privateKey = '97a5328dcde49f1f6224b18cddc935b4f3e79e80cb1dcb2cf43f1033be890fd9'; // default ganache key
      wallet = new ethers.Wallet(privateKey, provider);
      // Create an instance of a Contract Factory
      let factory = new ethers.ContractFactory(ERC20_ABI, bytecode, wallet);

      // Notice we pass in "Hello World" as the parameter to the constructor
      const totalSupply = new BigNumber(100).multipliedBy(new BigNumber(Math.pow(10,18)))
      factory.deploy(totalSupply.toString(), 'DAI', 18, 'DAI').then( result => {
        contract = result
        console.log("ERC20 contract deployed")
        contract.totalSupply().then( result => console.log("total supply:",result))
        done()
      })
    })
    http.createServer((req, resp) => {
      console.log("callback triggered")
      let body = ''
      req.on('readable', _ => {
        const data = req.read()
        if (data)
          body += data
      })
      req.on('end', _ => {
        console.log(body)
        body = JSON.parse(body)
        assert(body.token === TOKEN,'server token should match')
        resp.writeHead(200)
        resp.end() 
      })
    }).listen(8001) 
  })
  it('should throw error', done => {
    request(app)    
      .post('/api/v1/invoice')
      .set('Accept', 'application/json')
      .expect(403)
      .end((err, res) => {
        done()
      })
  })
  it('should create new invoice', done => {
    request(app)    
      .post('/api/v1/invoice')
      .send({apiKey:config.apiKey,items:[{description: "item #1",amount:1}],callbacks:{token:TOKEN,paid:{url:'http://localhost:8001'}},metadata:{orderId:'ABCDEF'}})
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        invoiceId = res.body.invoiceId
        done(err)
      })
  })
  it('should return invoice info', done => {
    fetchInvoice(invoiceId).then( result => {
      invoice = result
      done()
    })
  })
  it('should send coins to the invoice', done => {
    const { checkPendingInvoices } = require('../src/server/jobs/invoices')
    const { checkPendingNotifications } = require('../src/server/jobs/callbacks') 
    contract.transfer(invoice.wallet.address, new BigNumber(0.99 * Math.pow(10,18)).toString()).then( tx => {
      return tx.wait()
    }).then( res => {
      contract.balanceOf(accounts[0]).then( result => console.log("balance:",result.toString()))
      contract.balanceOf(invoice.wallet.address).then( result => console.log("invoice balance:",result.toString()))
      return checkPendingInvoices(contract,provider).then( result => {
        return fetchInvoice(invoiceId).then( result => {
          assert(result.state === 'pending')          
        })
      })
    }).then( _ => {
      return contract.transfer(invoice.wallet.address, new BigNumber(0.01 * Math.pow(10,18)).toString()).then( tx => {
        return tx.wait()
      }).then( async res => {
        await checkPendingInvoices(contract,provider)
        const invoice = await fetchInvoice(invoiceId)
        assert(invoice.state === 'confirming','should be in confirming state') 
        const curBlock = await provider.getBlockNumber()
        // force block mining 
        for(let i = 0; i < config.invoices.minConfirmations; i++) {
          await contract.transfer(accounts[1], new BigNumber(0.0001 * Math.pow(10,18)).toString()).then( tx => (tx.wait()))
        }
        return checkPendingInvoices(contract,provider).then( result => {
          return fetchInvoice(invoiceId).then( result => {
            assert(result.state === 'paid','invoice should be paid')          
          })
        })
      }).then( _ => {
        checkPendingNotifications().then( _ => {
          sleep(1000).then( _ => fetchInvoice(invoiceId).then( result => {
            assert(result.state === 'closed','invoice should be closed')
            done()
          }))
        })
      })
    })
  })
})

