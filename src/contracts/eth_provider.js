import { ethers } from 'ethers'
import config from 'config'

var provider

if (!provider) {
  switch(config.provider.type) {
    case 'rpc':
      provider  = new ethers.providers.JsonRpcProvider(config.provider.uri,config.provider.network)
      break
  }
}
export default provider
