import {
    BCStatus,
    BlockchainsData,
    Networks,
    RPCJson,
    RPCServices,
    SubnetsData, ValidatedBy, Validates, ValidatorsData
} from "../database/models";
import {setDocument} from "../database/firestoreinteractor";
import {
    BlockChainDocument,
    getSqlClient,
    SubnetDocument,
    SubnetValidatorDocument,
    ValidatorDocument
} from "../database/table";

const request = require('request');
const rpcUrlLocal = 'http://localhost:9650/ext/bc/'
const rpcUrlFuji = 'https://api.avax-test.network/ext/bc/'
const rpcUrlMainnet = 'https://api.avax.network/ext/bc/'

let currentNetwork = Networks.FUJI//1 local, 2 fuji, 3 main

export function getCurrentNetwork(){
    return currentNetwork
}

export function setCurrentNetwork(network: Networks){
    currentNetwork = network
}

function getBaseUrlFor(network: Networks){
    switch (network){
        case Networks.LOCAL:
            return rpcUrlLocal;
        case Networks.FUJI:
            return rpcUrlFuji;
        case Networks.MAIN:
            return rpcUrlMainnet;
    }
}

function getMethodFor(service: RPCServices){
    switch (service){
        case RPCServices.getSubnets:
            return 'platform.getSubnets';
        case RPCServices.getBlockchains:
            return 'platform.getBlockchains';
        case RPCServices.getCurrentValidators:
            return 'platform.getCurrentValidators';
        case RPCServices.validatedBy:
            return 'platform.validatedBy';
        case RPCServices.validates:
            return 'platform.validates';
        case RPCServices.getBlockchainStatus:
            return 'platform.getBlockchainStatus';
    }
}

function getUrlFor(service: RPCServices, network: Networks = currentNetwork){
    const baseUrl = getBaseUrlFor(network)
    let urlSuffix = 'P'
    return baseUrl + urlSuffix
}

export async function getSubnets(saveData: boolean = false): Promise<SubnetsData>{
    const service = RPCServices.getSubnets
    const url = getUrlFor(service)
    const input = new RPCJson()
    input.method = getMethodFor(service)
    const data = await new Promise<SubnetsData>(function (resolve, reject) {
        request.post({
            url: url,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify(input)
        }, async (error, res) => {
            resolve(JSON.parse(res.body).result)
        });
    });
    if(saveData){
        const array = []
        for(let datum of data.subnets){
            const subnetDocument = new SubnetDocument()
            subnetDocument.id = datum.id
            subnetDocument.controlKeys = datum.controlKeys
            subnetDocument.threshold = datum.threshold
            subnetDocument.networkId = currentNetwork
            array.push(subnetDocument)
        }
        const client = await getSqlClient()
        await client.TABLES.SUBNETS.bulkCreate(array)

    }
    return data
}

export async function getBlockChains(saveData: boolean = false): Promise<BlockchainsData>{
    const service = RPCServices.getBlockchains
    const url = getUrlFor(service)
    const input = new RPCJson()
    input.method = getMethodFor(service)
    const data = await new Promise<BlockchainsData>(function (resolve, reject) {
        request.post({
            url: url,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify(input)
        }, async (error, res) => {
            resolve(JSON.parse(res.body).result)
        });
    });
    if(saveData){
        const array = []
        for(let datum of data.blockchains){
            const document = new BlockChainDocument()
            document.id = datum.id
            document.vmID = datum.vmID
            document.name = datum.name
            document.subnetId = datum.subnetID
            document.networkId = currentNetwork
            array.push(document)
        }
        const client = await getSqlClient()
        await client.TABLES.BLOCKCHAINS.bulkCreate(array)
    }
    return data
}



export async function getCurrentValidators(subnetId: string = null, saveData: boolean = false): Promise<ValidatorsData>{
    const service = RPCServices.getCurrentValidators
    const url = getUrlFor(service)
    const input = new RPCJson()
    input.method = getMethodFor(service)
    if(subnetId){
        input.params = { subnetID: subnetId}
    }
    const data = await new Promise<ValidatorsData>(function (resolve, reject) {
        request.post({
            url: url,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify(input)
        }, async (error, res) => {
            resolve(JSON.parse(res.body).result)
        });
    });
    if(saveData){
        if(subnetId){
            const array = []
            for(let datum of data.validators){
                const document = new SubnetValidatorDocument()
                document.subnetId = subnetId
                document.nodeId = datum.nodeID
                document.networkId = currentNetwork
                document.weight = datum.weight
                document.startTime = new Date(datum.startTime*1000)
                document.endTime = new Date(datum.endTime*1000)
                array.push(document)
            }
            const client = await getSqlClient()
            await client.TABLES.SUB_VALIDATOR.bulkCreate(array)
        }else{
            const array = []
            for(let datum of data.validators){
                const document = new ValidatorDocument()
                document.nodeID = datum.nodeID
                document.txID = datum.txID
                document.startTime = new Date(datum.startTime*1000)
                document.endTime = new Date(datum.endTime*1000)
                document.stakeAmount = datum.stakeAmount
                document.uptime = datum.uptime
                document.connected = datum.connected
                document.networkId = currentNetwork
                array.push(document)
            }
            const client = await getSqlClient()
            await client.TABLES.VALIDATORS.bulkCreate(array)
        }
    }


    return data
}


export async function getValidatedBy(blockChain: string): Promise<ValidatedBy>{
    const service = RPCServices.validatedBy
    const url = getUrlFor(service)
    const input = new RPCJson()
    input.method = getMethodFor(service)
    input.params = { blockChainID: blockChain}

    const data = await new Promise<ValidatedBy>(function (resolve, reject) {
        request.post({
            url: url,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify(input)
        }, async (error, res) => {
            resolve(JSON.parse(res.body).result)
        });
    });
    return data
}

export async function getValidates(subnet: string): Promise<Validates>{
    const service = RPCServices.validates
    const url = getUrlFor(service)
    const input = new RPCJson()
    input.method = getMethodFor(service)
    input.params = { subnetID: subnet}

    const data = await new Promise<Validates>(function (resolve, reject) {
        request.post({
            url: url,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify(input)
        }, async (error, res) => {
            resolve(JSON.parse(res.body).result)
        });
    });
    return data
}

export async function getBlockChainStatus(blockChain: string): Promise<BCStatus>{
    const service = RPCServices.getBlockchainStatus
    const url = getUrlFor(service)
    const input = new RPCJson()
    input.method = getMethodFor(service)
    input.params = { blockchainID: blockChain}

    const data = await new Promise<BCStatus>(function (resolve, reject) {
        request.post({
            url: url,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify(input)
        }, async (error, res) => {
            resolve(JSON.parse(res.body).result)
        });
    });
    return data
}