import React, { useCallback, useContext, useMemo, useState } from 'react';
import { WalletProvider } from "@avalabs/avalanche-wallet-sdk/dist/Wallet/Wallet";
import { usePromise } from "./hooks/UsePromise";
import { RestApi } from "./api/RestApi";
import { Blockchain, Subnet } from "./api/RestApiModels";
import { CloudFunctions, Subscription } from "./api/NotificationApi";

interface AppContextInterface {
  wallet?: WalletProvider
  subnets: Subnet[]
  blockchains: Blockchain[]
  subscriptions: Subscription[]
  updateWallet: (wallet?: WalletProvider) => void
  refreshSubnets: () => void
  refreshBlockchains: () => void
  refreshSubscriptions: () => void
}

const AppContext = React.createContext<AppContextInterface>({
  subnets: [],
  blockchains: [],
  subscriptions: [],
  updateWallet: _ => {

  },
  refreshSubnets: () => {
  },
  refreshBlockchains: () => {

  },
  refreshSubscriptions: () => {

  },
});

export function AppContextProvider(props: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletProvider>()
  const [subnetsRefresh, setSubnetsRefresh] = useState<number>(Date.now())
  const [blockchainsRefresh, setBlockchainsRefresh] = useState<number>(Date.now())
  const [subscriptionsRefresh, setSubscriptionsRefresh] = useState<number>(Date.now())

  const address = wallet?.getAllAddressesPSync()[0]

  const [subnets] = usePromise(RestApi.getSubnets,
    { cache: { cacheKey: "subnets", isCachePersistent: true }, refresh: subnetsRefresh })
  const [blockchains] = usePromise(RestApi.getBlockchains,
    { cache: { cacheKey: "blockchains", isCachePersistent: true }, refresh: blockchainsRefresh })
  const [subscriptions] = usePromise(CloudFunctions.getSubscriptions,
    {
      skip: address === undefined || address === null,
      cache: { cacheKey: "subscriptions_" + address!!, isCachePersistent: true }, refresh: subscriptionsRefresh
    }, address ?? "")


  console.log(subscriptions)

  const updateWalletCallback = useCallback((wallet?: WalletProvider) => {
    setWallet(wallet)
  }, [])

  const refreshSubnetsCallback = useCallback(() => {
    setSubnetsRefresh(Date.now())
  }, [])

  const refreshBlockchainsCallback = useCallback(() => {
    setBlockchainsRefresh(Date.now())
  }, [])

  const subscriptionsRefreshCallback = useCallback(() => {
    setSubscriptionsRefresh(Date.now())
  }, [])


  console.log(subscriptions)
  const state: AppContextInterface = useMemo(() => {
      return {
        wallet: wallet,
        subnets: subnets?.result.subnets ?? [],
        blockchains: blockchains?.result.blockchains ?? [],
        subscriptions: subscriptions?.data ?? [],
        updateWallet: updateWalletCallback,
        refreshSubnets: refreshSubnetsCallback,
        refreshBlockchains: refreshBlockchainsCallback,
        refreshSubscriptions: subscriptionsRefreshCallback
      }
    }, [wallet, subnets, blockchains, updateWalletCallback, refreshSubnetsCallback, refreshBlockchainsCallback, subscriptions,subscriptionsRefreshCallback]
  )

  return (
    <AppContext.Provider value={state}>{props.children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext)
}
