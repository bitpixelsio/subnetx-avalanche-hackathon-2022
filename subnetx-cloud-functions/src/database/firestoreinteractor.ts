////////////////Document Setters////////////////
import {
    BaseDocument,
    LogDocument,
    LogDocumentType
} from "./models";
import {getHarmonyParams, sleep} from "../common/generalUtil";
import {COLLECTIONS} from "./collections";
import {FCLogError} from "../common/errorhandler";
import Transaction = FirebaseFirestore.Transaction;
import DocumentReference = FirebaseFirestore.DocumentReference;

export async function setDocument(data : BaseDocument, merge = true, transaction?: Transaction, logError = true, retry = true, forceElastic = false): Promise<any>{
    middlewareSetDocument(data);
    data.updateTime = new Date().getTime();
    data.updateTimeFormatted = new Date(data.updateTime).toISOString();
    if(forceElastic){
        // saveDocumentToElasticDB(data);
    }
    try{
        await setDocumentCore(transaction, data, merge);
    }catch (e) {
        let logDocument;
        if(logError) {
            logDocument = new LogDocument();
            const error = new Error();
            error.message = e.message;
            error.name = e.name;
            logDocument.error = error;
            logDocument.object1 = data.randomId;
            logDocument.object2 = data.getCollectionName();
            logDocument.object3 = data.getId();
            logDocument.number1 = 0;
            logDocument.type = 'set_document';
        }

        if(retry && e.name === 'Error'){
            for(let trial = 0; trial < 5; trial++){
                await sleep(300);
                try{
                    await setDocumentCore(transaction, data, merge);
                    break;
                }catch (e) {
                    if(logDocument){
                        logDocument.number1++;
                    }
                }
            }

        }
        if(logDocument){
            setDocument(logDocument, true, null, false);
        }
    }

}

export async function setDocumentField(doc: DocumentReference, fields:{field, value}[]){
    const updateTime = new Date().getTime()
    fields.push({field: 'updateTime', value: updateTime})
    fields.push({field: 'updateTimeFormatted', value: (new Date(updateTime).toISOString())})
    const data = {}
    for(let field of fields){
        data[field.field] = field.value
    }
    await doc.update(data)
}

function middlewareSetDocument(data: BaseDocument) {
    controlDocumentFields(data);
    removeUnnecceraries(data);
}

function controlDocumentFields(data) {
    if(data.getCollectionName() === COLLECTIONS.LOGS_COLLECTION_INFO.collectionName){
        if(data && data.error && !(data.error instanceof FCLogError)){
            data.error = new FCLogError(data.error);
        }
    }
}

function removeUnnecceraries(data) {
    if(data.getCollectionName() === COLLECTIONS.LOGS_COLLECTION_INFO.collectionName){
        if(data && data.error && data.error.options){
            delete data.error.options;
        }
        if(data && data.error && data.error.request){
            delete data.error.request;
        }
        if(data && data.error && data.error.json && data.error.json.options){
            delete data.error.json.options;
        }
    }
}

async function setDocumentCore(transaction, data: BaseDocument, merge) {
    if (transaction) {
        await transaction.set(data.getDocReference(), JSON.parse(JSON.stringify(data)), {merge: merge});
    } else {
        await data.getDocReference().set(JSON.parse(JSON.stringify(data)), {merge: merge});
    }
}
