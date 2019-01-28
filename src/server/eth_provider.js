import { ethers } from 'ethers'
import config from 'config'

var provider

if (!provider) {
  switch(config.provider.type) {
    case 'rpc':
      provider  = new ethers.providers.JsonRpcProvider(config.provider.uri,config.provider.network)
      break
    case 'infura':
      //provider = new ethers.providers.InfuraProvider('kovan',config.provider
      break
  }
}
export default provider
