import * as functions from "firebase-functions";
import {ApplicationError} from "./apperrors";
import {setDocument} from "../database/firestoreinteractor";
import {LogDocument, LogDocumentType} from "../database/models";

export async function errorReturnHandler(error) {
    await logError(error);

    const growleeError = new FCError(error);
    overrideMessageIfRequired(error, growleeError);

    return new functions.https.HttpsError('internal', growleeError.name, growleeError);
}

function overrideMessageIfRequired(error, growleeError) {
    if(isGeneralErrorMessage(error, growleeError)){
        growleeError.message = 'We are sorry. Please try again.'
    }
}

function isGeneralErrorMessage(error, growleeError) {
    return !growleeError.message ||
        (growleeError.type == 'General' && error.codePrefix != 'auth') ||
        isProxyConnectionError(error);
}

async function logError(error: Error) {
    const logDocument = new LogDocument();
    logDocument.type = 'return_handler';
    logDocument.logType = LogDocumentType.RETURN_HANDLER;
    logDocument.error = error;
    if(error.stack){
        logDocument.message = error.stack;
    }else{
        logDocument.message = new Error().stack;
    }
    await setDocument(logDocument);
}

export class FCError extends Error{
    type: 'APIError' | 'ApplicationError' | 'General';
    falconPk: number;

    constructor(error: Error){
        super();
        if(error['falconPk']){
            this.falconPk = error['falconPk'];
        }

        if(error.stack){
            this.stack = error.stack;
        }
        try{
            if(error.name){
                this.name = error.name;
            }
        }catch (e) {
            //
        }


        try{
            if(error.message){
                this.message = error.message;
            }
        }catch (e) {
            //
        }

        if(error instanceof ApplicationError){
            this.type = 'ApplicationError'
        }else{
            this.type = 'General'
        }
    }
}

export class FCLogError extends Error{
    json: any;
    type: 'APIError' | 'APIErrorNew' | 'ApplicationError' | 'General';
    code: any;
    statusCode: any;
    url: any;
    errorInfo: any;

    constructor(error: Error){
        super();
        try{
            if(error.stack){
                this.stack = error.stack;
            }
        }catch (e) {
            //
        }

        try{
            if(error.name){
                this.name = error.name;
            }
        }catch (e) {
            //
        }


        try{
            if(error.message){
                this.message = error.message;
            }
        }catch (e) {
            //
        }

        if(error instanceof ApplicationError){
            this.type = 'ApplicationError'
        }else{
            this.type = 'General'
        }

        try{
            if(error['json']){
                this.json = error['json'];
            }
        }catch (e) {
            //
        }

        try{
            if(error['code']){
                this.code = error['code'];
            }
        }catch (e) {
            //
        }

        try{
            if(error['statusCode']){
                this.statusCode = error['statusCode'];
            }
        }catch (e) {

        }

        try{
            if(error['url']){
                this.url = error['url'];
            }
        }catch (e) {
            //
        }

        try{
            if(error['errorInfo']){
                this.errorInfo = error['errorInfo'];
            }
        }catch (e) {
            //
        }
    }

}



export function isProxyConnectionError(error) {
    return error.code == 'ECONNRESET' || (error.json && error.json.error && error.json.error.code == 'ECONNRESET') || (error.cause && 'ECONNRESET' === error.cause.code) || (error.error && 'ECONNRESET' === error.error.code)  ;
}


async function handleError(error: any, url?: string) {
    try{
        const logDocument = new LogDocument();
        logDocument.error = error;
        logDocument.object1 = url;
        logDocument.type = 'general_handler';
        logDocument.logType = LogDocumentType.GENERAL_HANDLER;
        await setDocument(logDocument);

        if(isProxyConnectionError(error)){
            // await saveFailAttempt(proxyUrl);
        }
    }catch (e) {
        //
    }
    return error;
}
