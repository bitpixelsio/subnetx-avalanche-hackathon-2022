import {
  getRpcC,
  getRpcP,
  getRpcX,
  LEDGER_EXCHANGE_TIMEOUT,
  LedgerWallet,
  NetworkConfig,
  setNetworkAsync,
  SingletonWallet,
  TestnetConfig
} from "@avalabs/avalanche-wallet-sdk";
import { Defaults } from 'avalanche/dist/utils';
// @ts-ignore
import TransportU2F from '@ledgerhq/hw-transport-u2f'
//@ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
//@ts-ignore
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import { WalletProvider } from "@avalabs/avalanche-wallet-sdk/dist/Wallet/Wallet";
import { isLocal, localNodePort } from "./Env";

export const LocalnetConfig: NetworkConfig = {
  rawUrl: 'http://localhost:' + localNodePort,
  apiProtocol: 'http',
  apiIp: 'localhost',
  apiPort: localNodePort,
  networkID: 1337,
  xChainID: Defaults.network[1337]['X']['blockchainID'],
  pChainID: Defaults.network[1337]['P']['blockchainID'],
  cChainID: Defaults.network[1337]['C']['blockchainID'],
  evmChainID: Defaults.network[1337]['C']['chainID']!!,
  avaxID: Defaults.network[1337]['X']['avaxAssetID']!!,
  get rpcUrl() {
    return {
      c: getRpcC(this),
      p: getRpcP(this),
      x: getRpcX(this),
    };
  },
};

export async function getLedgerWallet() {
  if (isLocal()) {
    await setNetworkAsync(LocalnetConfig);
  } else {
    await setNetworkAsync(TestnetConfig);
  }
  let transport = await getTransport()
  transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)

  const wallet = await LedgerWallet.fromTransport(transport, 0)
  wallet.setHdIndices(20,20)
  await wallet.updateUtxosX()
  await wallet.updateUtxosP()

  console.log(await wallet.getAllAddressesP())

  await printBalances(wallet)

  return wallet
}

// export async function expX(wallet: WalletProvider){
//   try{
//     await wallet.exportXChain(numberToBNAvaxP(1.3), 'P')
//     await wallet.importP('X')
//     await printBalances(wallet)
//   }catch (e) {
//     console.log(e)
//   }
// }

async function printBalances(wallet: WalletProvider){
  await wallet.updateUtxosX()
  await wallet.updateUtxosP()
  // console.log(await wallet.getUtxosP())
  // console.log(bnToAvaxP(wallet.getAvaxBalanceP().unlocked))
  // console.log(bnToAvaxX(wallet.getAvaxBalanceX().unlocked))
}

export async function getPrivateKeyWallet(privateKey: string) {
  if (isLocal()) {
    await setNetworkAsync(LocalnetConfig);
  } else {
    await setNetworkAsync(TestnetConfig);
  }
  let wallet = new SingletonWallet(privateKey)
  await wallet.updateUtxosP();
  return wallet
}

async function getTransport() {
  let transport

  try {
    transport = await TransportWebHID.create()
    return transport
  } catch (e) {
    console.log('Web HID not supported.')
  }

  //@ts-ignore
  if (window.USB) {
    transport = await TransportWebUSB.create()
  } else {
    transport = await TransportU2F.create()
  }
  return transport
}

