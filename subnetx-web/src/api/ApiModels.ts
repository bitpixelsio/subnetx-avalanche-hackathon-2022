export interface SubnetsOutput {
  controlledSubnets: Subnet[]
  otherSubnets: Subnet[]
}

interface Subnet {
  id: string,
  controlKeys: string[],
  threshold: string
}

export interface Genesis {
  genesisData: AVMGenesis | EVMGenesis
}

export interface AVMGenesis {
  [alias: string]: AVMAsset
}

interface AVMAsset {
  name: string
  symbol: string
  initialState: FixedCapState | VariableCapState
}

export interface FixedCapState {
  fixedCap: FixedCap[]
}

interface FixedCap {
  amount: number
  address: string
}

export interface VariableCapState {
  variableCap: VariableCap[]
}

interface VariableCap {
  minters: string[]
  threshold: number
}

interface EVMGenesis {
  config: {
    chainId: number
    homesteadBlock: number
    eip150Block: number
    eip150Hash: string
    eip155Block: number
    eip158Block: number
    byzantiumBlock: number
    constantinopleBlock: number
    petersburgBlock: number
    istanbulBlock: number
    muirGlacierBlock: number
    subnetEVMTimestamp: number
    feeConfig: {
      gasLimit: number
      minBaseFee: number
      targetGas: number
      baseFeeChangeDenominator: number
      minBlockGasCost: number
      maxBlockGasCost: number
      targetBlockRate: number
      blockGasCostStep: number
    },
    "allowFeeRecipients": boolean
  },
  alloc: {
    [address: string]: { balance: string | number }
  },
  nonce: string,
  timestamp: string
  extraData: string
  gasLimit: string
  difficulty: string
  mixHash: string
  coinbase: string
  number: string
  gasUsed: string
  parentHash: string
}
