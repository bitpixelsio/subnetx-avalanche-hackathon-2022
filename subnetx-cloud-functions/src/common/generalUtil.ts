import * as functions from 'firebase-functions';
import { LogDocumentType, LogDocument } from '../database/models';
import {setDocument} from "../database/firestoreinteractor";
import * as crypto from "crypto";
import exp = require("constants");
const secureCompare = require('secure-compare');

export const PACKAGE_NAME = functions.config().app.package_name;
export const APP_ENV = functions.config().app.env;
const { PubSub } = require('@google-cloud/pubsub');
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
export const PROJECT_ID = adminConfig.projectId;
const pubsub = new PubSub({
    PROJECT_ID,
});
let randomstring;

export const oneMinuteMilliSeconds = 60 * 1000;

export const rewards = {
    "0x6e1bC01Cc52D165B357c42042cF608159A2B81c1": "Ambertaffy",
    "0x68EA4640C5ce6cC0c9A1F17B7b882cB1cBEACcd7": "Darkweed",
    "0x600541aD6Ce0a8b5dae68f086D46361534D20E80": "Goldvein",
    "0x043F9bd9Bb17dFc90dE3D416422695Dd8fa44486": "Ragweed",
    "0x094243DfABfBB3E6F71814618ace53f07362a84c": "Redleaf",
    "0x6B10Ad6E3b99090De20bF9f95F960addC35eF3E2": "Rockroot",
    "0xCdfFe898E687E941b124dfB7d24983266492eF1d": "Swift-Thistle",
    "0x78aED65A2Cc40C7D8B0dF1554Da60b38AD351432": "Bloater",
    "0xe4Cfee5bF05CeF3418DA74CFB89727D8E4fEE9FA": "Ironscale",
    "0x8Bf4A0888451C6b5412bCaD3D9dA3DCf5c6CA7BE": "Lanterneye",
    "0xc5891912718ccFFcC9732D1942cCD98d5934C2e1": "Redgill",
    "0xb80A07e13240C31ec6dc0B5D72Af79d461dA3A70": "Sailfish",
    "0x372CaF681353758f985597A35266f7b330a2A44D": "Shimmerskin",
    "0x2493cfDAcc0f9c07240B5B1C4BE08c62b8eEff69": "Silverfin",
    "0x66F5BfD910cd83d3766c4B39d13730C911b2D286": "Shvas Rune",
    "0x9678518e04Fe02FB30b55e2D0e554E26306d0892": "Blue Pet Egg",
    "0x95d02C1Dc58F05A015275eB49E107137D9Ee81Dc": "Grey Pet Egg",
    "0x24eA0D436d3c2602fbfEfBe6a16bBc304C963D04": "Gaia's Tears",
    "0x0000000000000000000000000000000000000000": "Nothing :("
}

export const config = {
    "professionMaxAttempts": 5,
    "nonProfessionMaxAttempts": 3,
    "maxQuestGroupSize": 6,
    "professionDuration": 10,
    "nonPrefessionDuration": 12,
    "minStaminaGarden": 16,

    "pollingInterval": 60000,

    "quests": [
        {
            "name": "Fishing",
            "professionHeroes": [74149, 120874],//
            "nonProfessionHeroes": [],//57892
            "contractAddress": "0xE259e8386d38467f0E7fFEdB69c3c9C935dfaeFc"
        },
        {
            "name": "Foraging",
            "professionHeroes": [  ],
            "nonProfessionHeroes": [],//72894
            "contractAddress": "0x3132c76acF2217646fB8391918D28a16bD8A8Ef4"
        },
        {
            "name": "WishingWell",
            "professionHeroes": [ ],
            "nonProfessionHeroes": [ ],
            "contractAddress": "0x0548214A0760a897aF53656F4b69DbAD688D8f29"
        },
        {
            "name": "Garden",
            "professionHeroes": [ ],
            "nonProfessionHeroes": [ ],
            "contractAddress": "0xe4154B6E5D240507F9699C730a496790A722DF19",
            "pools": []
        },
        {
            "name": "Mining",
            "professionHeroes": [ 72894, 57892, 104640 ],
            "nonProfessionHeroes": [ ],
            "contractAddress": "0x569e6a4c2e3af31b337be00657b4c040c828dd73",
            "pools": []
        }
    ],
    "questContract": "0x5100Bd31b822371108A0f63DCFb6594b9919Eaf4",
    "heroContract": "0x5f753dcdf9b1ad9aabc1346614d1f4746fd6ce5c",

    "gasPrice": 31000000000,
    "gasLimit" : 7000000
}

export function checkCronKey(request, response) {
    const key = request.body.cronKey;
    // Exit if the keys don't match.
    if (!secureCompare(key, functions.config().cron.key)) {
        console.log('The key provided in the request does not match the key set in the environment.');
        response.status(403).send('Security key does not match. Make sure your "key" parameter matches');
        return false;
    } else {
        return true;
    }
}

export class ChainParams{
    chainId: number
    chainName: string
    nativeCurrency: {name, symbol, decimals}
    rpcUrls: string[]
    blockExplorerUrls: string[]
    contractAddress: number
    network: string
    port: number
    protocol: string
    networkId: number
    startingBlock: number

    getProviderAddress(){
        return this.rpcUrls[0]
    }
}

export function getHarmonyParams(): ChainParams{
    return Object.assign(new ChainParams(), {
        chainId: 1666600000,
        chainName: 'Harmony Mainnet',
        nativeCurrency: {
            name: 'ONE',
            symbol: 'ONE',
            decimals: 18
        },
        rpcUrls: ['https://api.s0.t.hmny.io'],
        blockExplorerUrls: ['https://explorer.harmony.one/'],
        contractAddress: "",
        network: 'harmony.network',
        port: 443,
        protocol: 'https',
        networkId: 0,
        startingBlock: 0
    })
}

export function getAvaxParams(): ChainParams{
    return Object.assign(new ChainParams(), {
        chainId: 0xA86A,
        chainName: 'Avalanche Mainnet C-Chain',
        nativeCurrency: {
            name: 'Avalanche',
            symbol: 'AVAX',
            decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://cchain.explorer.avax.network/'],
        contractAddress: "0x483f6788F65cEeE77071aCaE82011a7E3c57aA97",
        network: 'avax.network',
        port: 443,
        protocol: 'https',
        networkId: 1,
        startingBlock: 5753257
    })
}

export async function publisMessage(topicName: string, message: string) {
    const data = JSON.stringify({ message: message });
    const dataBuffer = Buffer.from(data);

    const projectTopicName = "projects/" + adminConfig.projectId + "/topics/" + topicName;

    await createTopicIfNotExists(projectTopicName);

    await pubsub
        .topic(projectTopicName)
        .publish(dataBuffer);
}

async function createTopicIfNotExists(topicName) {
    if (!(await topicExists(topicName))) {
        await pubsub
            .createTopic(topicName);
    }
}

async function topicExists(topicName) {
    const topicList = await listAllTopics();
    for (const topic of topicList) {
        if (topicName === topic.name) {
            return true;
        }
    }
    return false;
}

async function listAllTopics() {
    return (await pubsub.getTopics())[0];
}

export function getCurrentDateYYYYMMDD(time = new Date().getTime()) {
    const d = new Date(time)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('');
}

export function isProd(): boolean {
    if (APP_ENV === 'prod')
        return true;
    return false
}

export function serviceAccount() {
    if (isProd()) {
        return require('../../service_accounts/prod.json')
    } else {
        return require('../../service_accounts/test.json')
    }
}

export function getYYYYMMWEEK(time) {
    const date = new Date(time);
    const month = date.getUTCMonth() + 1;
    let monthString = '';
    if (month < 10) {
        monthString = '0' + month;
    } else {
        monthString = String(month);
    }

    let week = Math.floor(date.getDate() / 7) + 1;
    if (week > 4) {
        week = 4;
    }
    return date.getUTCFullYear() + "-" + monthString + ".w" + week
}

export function isObject(val) {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
}

export function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export async function log(logType: LogDocumentType, message: string, pk: string = null, payload: any = null) {
    const logDocument = new LogDocument();
    logDocument.logType = logType;
    logDocument.payload = payload;
    logDocument.message = message;
    await setDocument(logDocument);
}

export function generateRandomString(length: number = 15, charset: 'alphabetic' | 'alphanumeric' | 'numeric' = 'alphanumeric') {
    if (!randomstring) {
        randomstring = require("randomstring")
    }
    return randomstring.generate({
        length: length,
        charset: 'alphanumeric',
        capitalization: 'uppercase'
    });
}

export function getSha256(str: string): string{
    return crypto.createHash('sha256').update(str).digest('hex')
}

export function getHmac256(data: string, key: string): string{
    return crypto.createHmac('sha256', key).update(data).digest('hex')
}

export function promiseTimeout<T>(ms: number, promise: Promise<T>): Promise<T>{
    let timeout = new Promise<T>((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in '+ ms + 'ms.')
        }, ms)
    })

    return Promise.race([
        promise,
        timeout
    ])
}

export function getConfigForFirebaseClient() {
    let config;
    if (isProd()) {
        config = {
            apiKey: "AIzaSyBYz8MlnusmAdsuBXnH5RTg_90VIh2Uwk0",
            authDomain: "bitpixels-prod.firebaseapp.com",
            projectId: "bitpixels-prod",
            storageBucket: "bitpixels-prod.appspot.com",
            messagingSenderId: "745219778667",
        };
    } else {
        config = {
            apiKey: "AIzaSyDIUTwR05svw_HHITCgLLIPVgp20tXYQBQ",
            authDomain: "bitpixels-test.firebaseapp.com",
            projectId: "bitpixels-test",
            storageBucket: "bitpixels-test.appspot.com",
            messagingSenderId: "1000140991825",
        };
    }
    return config;
}

export function checkIfWarmup(data) {
    if (data.warmUpCheck)
        return true;
    return false;
}

export function copyToClipboardWindows(data) {
    const util = require('util');
    require('child_process').spawn('clip').stdin.end(util.inspect(data));
}


