import {
  BlockchainsResult,
  CurrentValidatorsResult,
  PendingValidatorsResult,
  RPCResponse,
  SubnetResult
} from "./RestApiModels";
import { isLocal, localNodePort } from "./Env";

export namespace RestApi {
  async function baseFetch<T>(methodName: string, params: any): Promise<T> {
    const raw = JSON.stringify({
      "jsonrpc": "2.0",
      "method": methodName,
      "params": params,
      "id": 1
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: raw,
      redirect: 'follow'
    };

    let url = ""
    if (isLocal()) {
      url = "http://localhost:" + localNodePort + "/ext/bc/P"
    } else {
      url = "https://api.avax-test.network/ext/bc/P"
    }

    let response = await fetch(url, requestOptions)
    return await response.json() as T
  }

  export async function getSubnets(): Promise<RPCResponse<SubnetResult>> {
    return baseFetch("platform.getSubnets", {})
  }

  export async function getCurrentValidators(subnetId?: string): Promise<RPCResponse<CurrentValidatorsResult>> {
    return baseFetch("platform.getCurrentValidators", {
      "subnetID": subnetId,
      "nodeIDs": []
    })
  }

  export async function getPendingValidators(subnetId?: string): Promise<RPCResponse<PendingValidatorsResult>> {
    return baseFetch("platform.getPendingValidators", {
      "subnetID": subnetId,
      "nodeIDs": []
    })
  }

  export async function getBlockchains(): Promise<RPCResponse<BlockchainsResult>> {
    return baseFetch("platform.getBlockchains", {})
  }
}
