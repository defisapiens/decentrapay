import ethProvider from './eth_provider'
import { ethers } from 'ethers'
import config from 'config'
import DAI_ABI from './abi/ERC20.json'

export const DAI = new ethers.Contract(config.public.contracts.DAI.address, DAI_ABI, ethProvider)

export { ethProvider }
