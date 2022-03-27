import * as admin from 'firebase-admin'
import {config, getAvaxParams, getHarmonyParams, isProd, serviceAccount} from "./common/generalUtil";
import { initializeExtensions } from './extensions';

initializeExtensions()

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount())
});
const settings = { timestampsInSnapshots: true };
admin.firestore().settings(settings);


if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME.includes('cronjobs-')) {
    exports.cronjobs2 = require('./cronjobs/cronjobs');
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME.includes('admin-')) {
    exports.admin = require('./admin/admin-controller');
}
