import * as functions from 'firebase-functions'
import {checkCronKey, sleep} from "../common/generalUtil";
import {getBlockChains, getCurrentNetwork, getCurrentValidators, getSubnets, setCurrentNetwork} from "../util/rpc-util";
import {getSqlClient, NOTIFY_TYPE, SubscriberDocument} from "../database/table";
import {Networks, UserNotifyInfo} from "../database/models";

const request = require('request');


//triggered every hour
exports.hourly = functions.runWith({ timeoutSeconds: 540}).https.onRequest(async (request, response) => {
    const check = checkCronKey(request, response);
    if (!check) {
        return null;
    }

    setCurrentNetwork(Networks.LOCAL)
    await coreHourly()
    setCurrentNetwork(Networks.FUJI)
    await coreHourly()
    setCurrentNetwork(Networks.MAIN)
    await coreHourly()

    response.send("Done");
});

async function coreHourly(){
    try{
        if(getCurrentNetwork() === Networks.LOCAL){
            const sqlClient = await getSqlClient()
            await sqlClient.removeLocalData()
        }
        const subnets = await getSubnets(false)
        await getBlockChains(true)
        await getCurrentValidators(null, true)
        for(let subnet of subnets.subnets){
            await getCurrentValidators(subnet.id, true)
        }
    }catch (e){
        console.log(e)
    }
}

//triggered every half an hour
exports.nsRunner = functions.runWith({ timeoutSeconds: 540}).https.onRequest(async (request, response) => {
    const check = checkCronKey(request, response);
    if (!check) {
        return null;
    }
    await coreNSRunner()

    response.send("Done");
});

exports.nsRunnerTest = functions.runWith({ timeoutSeconds: 540}).https.onRequest(async (request, response) => {
    const check = checkCronKey(request, response);
    if (!check) {
        return null;
    }
    await coreNSRunnerTest()

    response.send("Done");
});

async function coreNSRunner(){
    try{
        const sqlClient = await getSqlClient()
        const types = [NOTIFY_TYPE.EXP_WEEK, NOTIFY_TYPE.EXP_MONTH, NOTIFY_TYPE.EXP_3DAY, NOTIFY_TYPE.EXP_1DAY, NOTIFY_TYPE.EXP_6HOUR]

        for(let type of types){
            const users = await sqlClient.getUsersToNotify(type)
            for(let user of users){
                const message = prepareMessage(user, type)
                if(user.webhook){
                    await sendWebHook(user.webhook, message)
                }
                if(user.email){
                    await sendMail(user.email, message)
                }
            }
        }
    }catch (e){
        console.log(e)
    }
}



async function coreNSRunnerTest(){
    try{
        const sqlClient = await getSqlClient()
        const types = [NOTIFY_TYPE.EXP_WEEK, NOTIFY_TYPE.EXP_MONTH, NOTIFY_TYPE.EXP_3DAY, NOTIFY_TYPE.EXP_1DAY, NOTIFY_TYPE.EXP_6HOUR]

        for(let type of types){
            const users = await sqlClient.getUsersToNotify(type, true)
            for(let user of users){
                const message = prepareMessage(user, type)
                if(user.webhook){
                    await sendWebHook(user.webhook, message)
                }
                if(user.email){
                    await sendMail(user.email, message)
                }
                break
            }
            break
        }
    }catch (e){
        console.log(e)
    }
}

function prepareMessage(user: UserNotifyInfo, type: NOTIFY_TYPE){
    let interval = ''
    switch (type){
        case NOTIFY_TYPE.EXP_MONTH:
            interval = '30 days'
            break;
        case NOTIFY_TYPE.EXP_WEEK:
            interval = '7 days'
            break;
        case NOTIFY_TYPE.EXP_3DAY:
            interval = '3 days'
            break;
        case NOTIFY_TYPE.EXP_1DAY:
            interval = '1 days'
            break;
        case NOTIFY_TYPE.EXP_6HOUR:
            interval = '6 hours'
            break;
    }
    let network = ''
    switch (user.networkId) {
        case Networks.LOCAL:
            network = 'Local Network'
            break;
        case Networks.FUJI:
            network = 'Fuji Network'
            break;
        case Networks.MAIN:
            network = 'Main Network'
            break;

    }

        const message = `
                   ${user.nodeId} with ${user.stakeAmount} $AVAX staked for the Primary Network in ${network} with uptime ${Number(user.uptime).toFixed(1)} will expire after ${interval} having weight ${user.weight} for the subnet with id ${user.subnetId} 
                `
    return message
}

async function sendMail(mail: string, message: string){

}

async function sendWebHook(webhook: string, message: string){
    await new Promise<any>(function (resolve, reject) {
        request.post({
            url: webhook,
            "headers": {
                "content-type": "application/json",
            },
            body: JSON.stringify({text: message})
        }, async (error, res) => {
            resolve(null)
        });
    });
}

exports.subscribeToSubnetReq = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    response.set("Access-Control-Allow-Methods", "POST");

    const subnetId = request.body.subnetId
    const webhook = request.body.webhook
    const email = request.body.email
    const wallet = request.body.wallet
    await subscribeToSubnetId(subnetId, webhook, email,wallet)

    response.send(JSON.stringify({'status': 'ok'}))
});

interface SubsSubnetInterface {
    subnetId: string
    webhook: string
    email: string
    wallet: string
}
interface SubsSubnetOutput{
    status: string
}

export const subscribeToSubnet = functions.https.onCall(async (input: SubsSubnetInterface): Promise<SubsSubnetOutput> => {
    const subnetId = input.subnetId
    const webhook = input.webhook
    const email = input.email
    const wallet = input.wallet
    await subscribeToSubnetId(subnetId, webhook, email,wallet)
    return {status: 'ok'}
})

export async function subscribeToSubnetId(subnetId:string, webhook: string, email: string, wallet){
    const subscriber = new SubscriberDocument()
    subscriber.subnetId = subnetId
    subscriber.webhook = webhook
    subscriber.email = email
    subscriber.wallet = wallet
    const sqlClient = await getSqlClient()
    await sqlClient.TABLES.SUBSCRIBER.bulkCreate([subscriber])
}


exports.getSubscriptionsReq = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    response.set("Access-Control-Allow-Methods", "POST");
    const wallet = request.body.wallet

    response.send(JSON.stringify(await getSubscriptionsCore(wallet)))
});

interface GetSubsSubnetInterface {
    wallet: string
}
export const getSubscriptions = functions.https.onCall(async (input: GetSubsSubnetInterface): Promise<any> => {
    const wallet = input.wallet
    return {data: await getSubscriptionsCore(wallet)}
})

async function getSubscriptionsCore(wallet: string){
    const sqlClient = await getSqlClient()
    return await sqlClient.getSubscriptions(wallet)
}
