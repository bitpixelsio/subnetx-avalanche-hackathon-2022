import { generateRandomString } from "../common/generalUtil";
import CollectionReference = FirebaseFirestore.CollectionReference;
import * as admin from "firebase-admin";
import DocumentReference = FirebaseFirestore.DocumentReference;
import { COLLECTIONS } from "./collections";

export abstract class BaseDocument {
    creationTime = new Date().getTime();
    creationTimeFormatted = new Date(this.creationTime).toISOString();
    updateTime = this.creationTime;
    updateTimeFormatted = new Date(this.creationTime).toISOString();
    randomId = generateRandomString(10);

    public abstract getId(): string;
    public abstract getCollectionName(): string;
    public getElasticIndexName(): string {
        return this.getCollectionName().toLowerCase();
    }
    public getCollection(): CollectionReference {
        return admin.firestore().collection(this.getCollectionName());
    };
    public getDocReference(): DocumentReference {
        return this.getCollection().doc(this.getId());
    };
}

export enum LogDocumentType {
    GENERAL = 0,
    REQUEST_ERROR = 1,
    LOGIN_ERROR = 2,
    ELASTIC_BULK = 1000,
    ELASTIC_BULK_ERROR = 1001,
    RETURN_HANDLER = 1005,
    GENERAL_HANDLER = 1006,
    BLOCK_EVENT = 1007
}

export class LogDocument extends BaseDocument {
    logType: LogDocumentType;
    message: string;
    payload?: any;
    type: string;
    error?: Error;
    object1?: string;
    object2?: string;
    object3?: string;
    number1?: number;
    number2?: number;
    number3?: number;

    getCollectionName(): string {
        return COLLECTIONS.LOGS_COLLECTION_INFO.collectionName;
    }

    getId(): string {
        return this.randomId
    }
}


export interface SubnetsData{
    subnets: Subnet[]
}

export interface Subnet{
    id: string
    controlKeys: string[]
    threshold: number
}

export interface BlockchainsData{
    blockchains: Blockchain[]
}

export interface Blockchain{
    id: string
    name: string
    subnetID: string
    vmID: string
}

export interface ValidatorsData{
    validators: Validator[]
}

export interface Validator{
    txID: string
    startTime: number
    endTime: number
    weight: number
    nodeID: string
    stakeAmount: number
    uptime: number
    connected: boolean
}

export interface ValidatedBy{
    subnetID: string
}

export interface Validates{
    blockchainIDs: string[]
}

export interface BCStatus{
    status: string
}

export enum RPCServices{
    getSubnets, getBlockchains, getCurrentValidators, validatedBy, validates, getBlockchainStatus
}

export enum Networks{
    LOCAL, FUJI, MAIN
}

export class RPCJson{
    jsonrpc:string = '2.0'
    method: string
    params: any = {}
    id: number = 1
}

export interface UserNotifyInfo{
    nodeId:string, subnetId: string, startTime: Date, endTime: Date,
    mEndTime: Date, mStartTime: Date, stakeAmount: number, uptime: number, connected: boolean,
    weight: number, email:string, webhook: string, wallet: string, networkId: Networks
}

