import * as admin from "firebase-admin";
import { CollectionReference } from "@google-cloud/firestore";
import {
    BaseDocument,
    LogDocument,
} from "./models";

const LOGS_COLLECTION = 'Logs';


export abstract class CollectionInfo {
    abstract collectionName: string;
    abstract getDummyObject(id?): BaseDocument;
    public getCollection(): CollectionReference {
        return admin.firestore().collection(this.collectionName);
    };
}

class LOGS_COLLECTION_INFO extends CollectionInfo {
    collectionName = LOGS_COLLECTION;
    getDummyObject(): LogDocument {
        return new LogDocument();
    }
}


export const COLLECTIONS = {
    LOGS_COLLECTION_INFO: new LOGS_COLLECTION_INFO(),

    getCollectionInfoList(): Array<CollectionInfo> {
        const array: Array<CollectionInfo> = [];
        for (let key of Object.keys(this)) {
            if (this[key] instanceof CollectionInfo) {
                array.push(this[key]);
            }
        }
        return array;
    },

    getCollectionInfoFromName(collectionName): CollectionInfo {
        const collectionsInfo = this.getCollectionInfoList();
        for (let info of collectionsInfo) {
            if (info.collectionName === collectionName) {
                return info;
            }
        }
        return null;
    },
};

export function getLogsCollection(): CollectionReference {
    return admin.firestore().collection(LOGS_COLLECTION);
}
