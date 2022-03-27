import { initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBpPb5BUx1oQ8S-HHE1RZZzaqQk0tqyXUo",
  authDomain: "dfk-runner.firebaseapp.com",
  projectId: "dfk-runner",
  storageBucket: "dfk-runner.appspot.com",
  messagingSenderId: "905796874713",
  appId: "1:905796874713:web:1ffe9fe2cf221ae150e9c8",
  measurementId: "G-M4HWVZ8CBV"
};

const ACTIVE_APP_OPTIONS = firebaseConfig
const app = initializeApp(ACTIVE_APP_OPTIONS);
const functions = getFunctions(app);
const USE_EMULATOR = process.env.REACT_APP_FIREBASE_EMULATOR_HOST && process.env.REACT_APP_FIREBASE_EMULATOR_PORT
if (USE_EMULATOR) {
  connectFunctionsEmulator(functions, process.env.REACT_APP_FIREBASE_EMULATOR_HOST!!, parseInt(process.env.REACT_APP_FIREBASE_EMULATOR_PORT!!));
}
(() => {
  const region = functions.region
  let domain: string
  if (USE_EMULATOR) {
    // noinspection HttpUrlsUsage
    domain = `http://${process.env.REACT_APP_FIREBASE_EMULATOR_HOST}:${process.env.REACT_APP_FIREBASE_EMULATOR_PORT}/${app.options.projectId}/${region}`
  } else {
    domain = `https://${region}-${ACTIVE_APP_OPTIONS.projectId}.cloudfunctions.net`
  }
  return domain
})();


export interface Subscription {
  wallet: string;
  subnetId: string;
  webhook: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscriptions {
  data: Subscription[];
}


export namespace CloudFunctions {

  async function baseHttpsCallable<T>(name: string, input: any): Promise<T> {
    return await (await httpsCallable(functions, name)(input)).data as T
  }

  export async function getSubscriptions(wallet: string): Promise<Subscriptions> {
    return await baseHttpsCallable("cronjobs2-getSubscriptions", { wallet })
  }

  export async function subscribeToSubnet(wallet: string, subnetId: string, webhook: string): Promise<{ ok: string }> {
    return await baseHttpsCallable("cronjobs2-subscribeToSubnet", {
      wallet, subnetId, webhook, email: ""
    })
  }
}
