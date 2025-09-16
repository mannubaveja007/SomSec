import dotenv from 'dotenv'

dotenv.config()

export interface NetworkConfig {
    chainId: number
    name: string
    rpcUrl: string
    explorerUrl: string
    symbol: string
    multicallAddress: string
    entryPointV07: string
    factoryAddress: string
    faucetUrl: string
    alternativeExplorerUrl?: string
}

export const SOMNIA_TESTNET: NetworkConfig = {
    chainId: Number(process.env.SOMNIA_CHAIN_ID) || 50312,
    name: 'Somnia Testnet',
    rpcUrl: process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network/',
    explorerUrl: process.env.SOMNIA_EXPLORER_URL || 'https://shannon-explorer.somnia.network/',
    symbol: process.env.SOMNIA_SYMBOL || 'STT',
    multicallAddress: process.env.SOMNIA_MULTICALL_ADDRESS || '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223',
    entryPointV07: process.env.SOMNIA_ENTRYPOINT_V07 || '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    factoryAddress: process.env.SOMNIA_FACTORY_ADDRESS || '0x4be0ddfebca9a5a4a617dee4dece99e7c862dceb',
    faucetUrl: 'https://testnet.somnia.network/',
    alternativeExplorerUrl: 'https://somnia-testnet.socialscan.io/'
}

export const SOMNIA_MAINNET: NetworkConfig = {
    chainId: 5031,
    name: 'Somnia Mainnet',
    rpcUrl: 'https://api.infra.mainnet.somnia.network/',
    explorerUrl: 'https://explorer.somnia.network',
    symbol: 'SOMI',
    multicallAddress: '0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11',
    entryPointV07: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    factoryAddress: '0x4be0ddfebca9a5a4a617dee4dece99e7c862dceb',
    faucetUrl: 'https://stakely.io/faucet/somnia-somi'
}

// Default to testnet
export const DEFAULT_NETWORK = SOMNIA_TESTNET

// Export current active network
export const getActiveNetwork = (): NetworkConfig => {
    const isMainnet = process.env.NODE_ENV === 'production' && process.env.USE_MAINNET === 'true'
    return isMainnet ? SOMNIA_MAINNET : SOMNIA_TESTNET
}