import * as functions from "firebase-functions";
import {checkCronKey} from "../common/generalUtil";
import {getSqlClient} from "../database/table";

exports.syncDb = functions.runWith({ timeoutSeconds: 540, maxInstances: 1 }).https.onRequest(async (request, response) => {
    const check = checkCronKey(request, response);
    if (!check) {
        return null;
    }
    try {
        const client = await getSqlClient(true)
        await client.sync()
        response.send("ok")
    } catch (error) {
        response.status(500).send(error)
    }
});
