import { WalletProvider } from "@avalabs/avalanche-wallet-sdk/dist/Wallet/Wallet";
import { Genesis } from "./ApiModels";
import { RestApi } from "./RestApi";
import { Blockchain, Validator } from "./RestApiModels";
import { AvalancheWalletApi } from "./AvalancheWalletApi";

export namespace Api {
  export async function createSubnet(wallet: WalletProvider): Promise<string> {
    return await AvalancheWalletApi.createSubnet(wallet)
  }

  export async function getSubnetValidators(subnetId: string): Promise<(Validator & { pending: boolean })[]> {
    let currentValidatorsResponse = await RestApi.getCurrentValidators(subnetId)
    let pendingValidatorsResponse = await RestApi.getPendingValidators(subnetId)

    const response: (Validator & { pending: boolean })[] = []

    for (let validator of currentValidatorsResponse.result.validators) {
      response.push({ ...validator, pending: false })
    }

    for (let validator of pendingValidatorsResponse.result.validators) {
      response.push({ ...validator, pending: true })
    }

    return response
  }

  export async function addSubnetValidator(wallet: WalletProvider, subnetId: string, nodeId: string, start: Date, end: Date, weight: number) {
    await AvalancheWalletApi.addSubnetValidator(wallet, nodeId, start, end, weight, subnetId, undefined)
  }

  export async function getSubnetBlockchains(subnetId: string): Promise<Blockchain[]> {
    let blockchainsResponse = await RestApi.getBlockchains()
    return blockchainsResponse.result.blockchains.filter(value => value.subnetID === subnetId)
  }

  export async function createBlockchain(wallet: WalletProvider, subnetId: string, name: string, vmId: string, genesis: Genesis | string): Promise<void> {
    if (vmId !== "avm") {
      throw Error("Not implemented")
    }
    if (typeof genesis === "string") {
      throw Error("Not implemented")
    } else {
      console.log(genesis)
      let genesisData = AvalancheWalletApi.toGenesisData(genesis)
      await AvalancheWalletApi.createBlockChain(wallet, subnetId, name, genesisData)
    }
  }
}
