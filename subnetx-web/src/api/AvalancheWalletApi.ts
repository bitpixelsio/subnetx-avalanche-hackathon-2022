import { WalletProvider } from "@avalabs/avalanche-wallet-sdk/dist/Wallet/Wallet";
import { BN, pChain, waitTxP } from "@avalabs/avalanche-wallet-sdk";
import { GenesisAsset, GenesisData, InitialStates, SECPMintOutput, SECPTransferOutput, } from 'avalanche/dist/apis/avm';
import { SubnetAuth, } from 'avalanche/dist/apis/platformvm';
import { BinTools } from "avalanche";
import { Buffer } from "buffer";
import { AVMGenesis, Genesis } from "./ApiModels";

export namespace AvalancheWalletApi {
  export async function createSubnet(
    wallet: WalletProvider,
    memoStr?: string
  ): Promise<string> {
    let memo = undefined
    if (memoStr) {
      memo = Buffer.from(memoStr, "utf8")
    }
    const utxoSet = wallet.utxosP;
    const pAddressStrings = await wallet.getAllAddressesP();

    const unsignedTx = await pChain.buildCreateSubnetTx(
      utxoSet,
      pAddressStrings,
      [pAddressStrings[0]],
      [pAddressStrings[0]],
      1,
      memo as any,
      new BN(Math.round(new Date().getTime() / 1000))
    );

    let tx = await wallet.signP(unsignedTx);
    const txId = await pChain.issueTx(tx);
    await waitTxP(txId);

    await wallet.updateUtxosP();

    return txId;
  }

  export async function addSubnetValidator(
    wallet: WalletProvider,
    nodeID: string,
    start: Date,
    end: Date,
    weight_: number,
    subnetId: string,
    memoStr?: string
  ) {
    let memo = undefined
    if (memoStr) {
      memo = Buffer.from(memoStr, "utf8")
    }
    const utxoSet = wallet.utxosP;

    let pAddressStrings = await wallet.getAllAddressesP();

    // Convert dates to unix time
    let startTime = new BN(Math.round(start.getTime() / 1000));
    let endTime = new BN(Math.round(end.getTime() / 1000));
    let weight = new BN(weight_);
    const subnetID = BinTools.getInstance().cb58Decode(
      subnetId
    )
    const addressIndex: Buffer = Buffer.alloc(4)
    addressIndex.writeUIntBE(0x0, 0, 4)
    const subnetAuth: SubnetAuth = new SubnetAuth([addressIndex as any])

    const unsignedTx = await pChain.buildAddSubnetValidatorTx(
      utxoSet as any,
      pAddressStrings as any,
      [pAddressStrings[0]] as any,
      nodeID as any,
      startTime as any,
      endTime as any,
      weight as any,
      subnetID as any,
      subnetAuth as any,
      memo as any,
      undefined
    );

    let tx = await wallet.signP(unsignedTx);
    const txId = await pChain.issueTx(tx);
    await waitTxP(txId);

    await wallet.updateUtxosP();

    return txId;
  }

  export async function createBlockChain(wallet: WalletProvider,
                                         subnetId: string,
                                         chainName: string,
                                         genesisData: GenesisData,
                                         memoStr?: string
  ) {
    let memo = undefined
    if (memoStr) {
      memo = Buffer.from(memoStr, "utf8")
    }
    const utxoSet = wallet.utxosP;

    let pAddressStrings = await wallet.getAllAddressesP();

    // Convert dates to unix time
    const subnetID = BinTools.getInstance().cb58Decode(
      subnetId
    )
    const addressIndex: Buffer = Buffer.alloc(4)
    addressIndex.writeUIntBE(0x0, 0, 4)
    const subnetAuth: SubnetAuth = new SubnetAuth([addressIndex as any])

    const vmId = 'avm'

    const fxIDs: string[] = ["secp256k1fx"]

    const unsignedTx = await pChain.buildCreateChainTx(
      utxoSet,
      pAddressStrings,
      [pAddressStrings[0]],
      subnetID,
      chainName,
      vmId,
      fxIDs,
      genesisData as any,
      subnetAuth as any,
      memo as any,
      new BN(Math.round(new Date().getTime() / 1000))
    );

    let tx = await wallet.signP(unsignedTx);
    const txId = await pChain.issueTx(tx);
    await waitTxP(txId);

    await wallet.updateUtxosP();

    return txId;
  }

  export function toGenesisData(genesis: Genesis): GenesisData {
    const locktime: BN = new BN(0)
    const genesisAssets: GenesisAsset[] = []
    const avm = genesis.genesisData as AVMGenesis
    for (let alias of Object.keys(avm)) {
      const asset = avm[alias]
      const assetAlias: string = alias
      const name: string = asset.name
      const symbol: string = asset.symbol
      const denomination: number = 1
      const initialStates: InitialStates = new InitialStates()
      if ("fixedCap" in asset.initialState) {
        for (let fixedCap of asset.initialState.fixedCap) {
          const buffers = []
          buffers.push(BinTools.getInstance().stringToAddress(fixedCap.address))
          const vcapSecpOutput = new SECPTransferOutput(
            new BN(fixedCap.amount),
            buffers,
            locktime,
            1
          )
          initialStates.addOutput(vcapSecpOutput)
        }
      } else {
        for (let variableCap of asset.initialState.variableCap) {
          const buffers = []
          for (let addr of variableCap.minters) {
            buffers.push(BinTools.getInstance().stringToAddress(addr))
          }
          const secpMintOutput: SECPMintOutput = new SECPMintOutput(buffers,
            locktime,
            variableCap.threshold
          )
          initialStates.addOutput(secpMintOutput)
        }
      }
      const genesisAsset: GenesisAsset = new GenesisAsset(
        assetAlias,
        name,
        symbol,
        denomination,
        initialStates,
        undefined
      )
      genesisAssets.push(genesisAsset)
    }
    return new GenesisData(genesisAssets, 1337)
  }
}
