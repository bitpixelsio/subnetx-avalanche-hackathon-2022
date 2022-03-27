export interface RPCResponse<T> {
  jsonrpc: string
  result: T
  id: number
}

export interface SubnetResult {
  subnets: Subnet[]
}

export interface Subnet {
  id: string,
  controlKeys: string[],
  threshold: string
}

export interface CurrentValidatorsResult {
  validators: Validator[];
}

export interface RewardOwner {
  locktime: string;
  threshold: string;
  addresses: string[];
}

export interface PendingValidatorsResult {
  validators: Validator[];
  delegators: any[];
}

export interface Validator {
  txID: string;
  startTime: string;
  endTime: string;
  weight: string;
  nodeID: string;
}

export interface BlockchainsResult {
  blockchains: Blockchain[];
}

export interface Blockchain {
  id: string;
  name: string;
  subnetID: string;
  vmID: string;
}
