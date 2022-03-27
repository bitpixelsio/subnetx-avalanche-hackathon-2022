import {
    BulkCreateOptions,
    DataTypes,
    FindOptions,
    Model,
    ModelAttributes,
    ModelCtor,
    ModelOptions,
    QueryTypes,
    Sequelize
} from "sequelize";
import PQueue from 'p-queue'
import {copyToClipboardWindows, isProd, PROJECT_ID, sleep} from "../common/generalUtil";
import {BaseDocument, Networks, UserNotifyInfo} from "./models";

const DATABASE_ADDRESS = "REDACTED"
const ADMIN_DATABASE_USER = "REDACTED"
const ADMIN_DATABASE_USER_PASSWORD = "REDACTED"
const SERVER_DATABASE_USER = "REDACTED"
const SERVER_DATABASE_USER_PASSWORD =  "REDACTED"
const READONLY_DATABASE_USER = "REDACTED"
const READONLY_DATABASE_USER_PASSWORD = "REDACTED"


export enum DATABASE_TYPE {
    MAIN = 1
}

export enum NOTIFY_TYPE{
    EXP_MONTH, EXP_WEEK, EXP_3DAY, EXP_1DAY, EXP_6HOUR
}


function getDatabaseAddressFor(type: DATABASE_TYPE): string{
    if(type == DATABASE_TYPE.MAIN){
        return DATABASE_ADDRESS
    }
    return DATABASE_ADDRESS
}

export interface DocumentWithCreatedAt {
    createdAt: Date;
}

export interface DocumentWithUpdatedAt {
    updatedAt: Date;
}

export interface DocumentWithNoDates {

}

export interface DocumentWithDefaultDates extends DocumentWithCreatedAt, DocumentWithUpdatedAt {

}

export interface DocumentWithDefaultId {
    id: number
}

export class SubscriberDocument {
    subnetId: string
    webhook: string
    email: string
    wallet: string
}


export class SubnetDocument{
    id: string
    controlKeys: string[]
    threshold: number
    networkId: Networks
}

export class BlockChainDocument {
    id: string
    name: string
    subnetId: string
    vmID: string
    networkId: Networks
}

export class ValidatorDocument {
    txID: string
    startTime: Date
    endTime: Date
    nodeID: string
    stakeAmount: number
    uptime: number
    connected: boolean
    networkId: Networks
}

export class SubnetValidatorDocument {
    subnetId: string
    nodeId: string
    networkId: Networks
    weight: number
    startTime: Date
    endTime: Date
}

export abstract class SqlAbstractClient {
    TABLE_INFO = class Table<T, R> {
        private queue: PQueue
        private _model: ModelCtor<Model<T & R, T>>;
        public get model(): ModelCtor<Model<T & R, T>> {
            return this._model;
        }

        constructor(
            public readonly tableName: string,
            public readonly attributes: ModelAttributes<Model<T & R, T>, T>,
            public readonly bulkCreateOptions?: BulkCreateOptions<T & R> | ((documents: T[]) => { documents: T[], options: BulkCreateOptions<T & R> }[]),
            public readonly modelOptions?: ModelOptions,
        ) {

        }

        public define(sequelize: Sequelize, queue: PQueue) {
            this.queue = queue
            this._model = sequelize.define(this.tableName, this.attributes, this.modelOptions);
        }

        async getByKey(key: any): Promise<T & R> {
            return this.queue.add(async () => {
                return (await this._model.findByPk(key)) as unknown as (T & R)
            })
        }

        async upsert(document: T) {
            const promises = []
            promises.push(this.queue.add(async () => {
                await this._model.upsert(document)
            }))
            return Promise.all(promises)
        }

        async saveFields(document: T, fields: any[]){
            const promises = []
            promises.push(this.queue.add(async () => {
                const data = this._model.build(document, {isNewRecord: false})
                await data.save({fields: fields, validate: false})
            }))
            return Promise.all(promises)
        }

        async getAll(options?: FindOptions<T & R>): Promise<(T & R)[]> {
            return this.queue.add(async () => {
                return (await this._model.findAll(options)) as unknown as (T & R)[]
            })
        }

        async bulkCreate(documents: T[], withOptions: {updateOnDuplicate: any[]} = null) {
            let insertArray = []
            const maxSize = 10000
            for(let i = 0; i < documents.length; i++){
                if(documents[i]){
                    insertArray.push(documents[i])
                }
                if(insertArray.length >= maxSize){
                    await this.bulkCreateCore(insertArray, withOptions)
                    insertArray = []
                }
            }
            if(insertArray.length >= 0){
                await this.bulkCreateCore(insertArray, withOptions)
            }
        }

        private async bulkCreateCore(documents: T[], withOptions: {updateOnDuplicate: any[]} = null){
            const promises = []
            if (documents.length !== 0) {
                promises.push(this.queue.add(async () => {
                    if (this.bulkCreateOptions) {
                        if (typeof this.bulkCreateOptions === "function") {
                            const groups = this.bulkCreateOptions(documents)
                            for (const group of groups) {
                                if (group.documents.length > 0) {
                                    await this._model.bulkCreate(group.documents, group.options)
                                }
                            }
                        } else {
                            await this._model.bulkCreate(documents, withOptions ? withOptions : this.bulkCreateOptions)
                        }
                    } else {
                        await this._model.bulkCreate(documents)
                    }
                }))
            }
            return Promise.all(promises)
        }
    }

    readonly TABLES = {}

    readonly sequelize: Sequelize
    readonly queue: PQueue
    readonly databaseName: string
    readonly databaseType: DATABASE_TYPE

    protected constructor(isAdmin: boolean, isProd: boolean, databaseType: DATABASE_TYPE) {
        this.databaseType = databaseType
        const databaseAddress = getDatabaseAddressFor(databaseType)
        const user = isAdmin ? ADMIN_DATABASE_USER : SERVER_DATABASE_USER
        const password = isAdmin ? ADMIN_DATABASE_USER_PASSWORD : SERVER_DATABASE_USER_PASSWORD
        this.databaseName = isProd ? "subnet_ns" : "subnet_ns_test"
        const applicationName = isProd ? "Subnet Prod" : "Subnet Test"
        this.sequelize = new Sequelize(`postgresql://${user}:${password}@${databaseAddress}/${this.databaseName}`, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: false,
                collate: 'utf8_general_ci',
                application_name: applicationName,
            },
            define: {
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
            pool: {
                max: isAdmin ? 25 : 5,
                min: isAdmin ? 5 : 1,
                acquire: 600000,
                idle: 10000
            },
            logging: false
        });
        this.queue = new PQueue({ concurrency: 25 })
    }

    abstract define()
    abstract sync()

    protected queuedSelectQuery(sql: string) {
        return this.queue.add(() => this.sequelize.query(sql, { type: QueryTypes.SELECT }))
    }

    async getCountForTable(tableName: string): Promise<number>{
        const result = await this.sequelize.query(`              
                                select count(*) from ${tableName}`)
        return Number(result[0][0]['count'])
    }

    protected async createServerRole() {
        await this.sequelize.query(`
            DO
            $do$
            BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${SERVER_DATABASE_USER}') THEN
                CREATE ROLE ${SERVER_DATABASE_USER} LOGIN PASSWORD '${SERVER_DATABASE_USER_PASSWORD}';
            END IF;
            
            GRANT CONNECT ON DATABASE ${this.databaseName} TO ${SERVER_DATABASE_USER};
            GRANT USAGE ON SCHEMA public TO ${SERVER_DATABASE_USER};
            GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA public TO ${SERVER_DATABASE_USER};
            GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${SERVER_DATABASE_USER};
            ALTER ROLE ${SERVER_DATABASE_USER} SET statement_timeout=60000;
            ALTER ROLE ${SERVER_DATABASE_USER} SET idle_in_transaction_session_timeout=60000;
            END
            $do$;
        `)
    }

    protected async createReaderRole() {
        await this.sequelize.query(`
            DO
            $do$
            BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${READONLY_DATABASE_USER}') THEN
                CREATE ROLE ${READONLY_DATABASE_USER} LOGIN PASSWORD '${READONLY_DATABASE_USER_PASSWORD}';
            END IF;
            
            GRANT CONNECT ON DATABASE ${this.databaseName} TO ${READONLY_DATABASE_USER};
            GRANT USAGE ON SCHEMA public TO ${READONLY_DATABASE_USER};
            GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${READONLY_DATABASE_USER};
            GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${READONLY_DATABASE_USER};
            GRANT pg_read_all_stats TO ${READONLY_DATABASE_USER};
            ALTER ROLE ${READONLY_DATABASE_USER} SET statement_timeout=60000;
            ALTER ROLE ${READONLY_DATABASE_USER} SET idle_in_transaction_session_timeout=60000;
            END
            $do$;
        `)
    }
}

export class SqlClient extends SqlAbstractClient {
    readonly TABLES = {
        SUBSCRIBER: new this.TABLE_INFO<SubscriberDocument, DocumentWithDefaultDates>('subscribers', {
            wallet: { type: DataTypes.TEXT, primaryKey: true },
            subnetId: {type: DataTypes.TEXT, primaryKey: true, defaultValue: '', allowNull: false},
            webhook: {type: DataTypes.TEXT, defaultValue: '', allowNull: false},
            email: {type: DataTypes.TEXT, defaultValue: '', allowNull: false},
            }, {updateOnDuplicate: ["webhook", "email", "updatedAt"]}, {}
        ),
        SUBNETS: new this.TABLE_INFO<SubnetDocument, DocumentWithDefaultDates>('subnets', {
            id: { type: DataTypes.TEXT, primaryKey: true },
            controlKeys: {type: DataTypes.JSONB, defaultValue: '', allowNull: false},
            threshold: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
            networkId: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
            }, {updateOnDuplicate: ["controlKeys", "threshold", "networkId", "updatedAt"]}, {}
        ),
        BLOCKCHAINS: new this.TABLE_INFO<BlockChainDocument, DocumentWithDefaultDates>("blockchains", {
                id: { type: DataTypes.TEXT, primaryKey: true },
                name: {type: DataTypes.TEXT, defaultValue: '', allowNull: false },
                subnetId: {type: DataTypes.TEXT, defaultValue: '', allowNull: false },
                vmID: {type: DataTypes.TEXT, defaultValue: '', allowNull: false },
                networkId: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
            }, { updateOnDuplicate: ["name", "subnetId", "vmID", "networkId", "updatedAt"] }, {}
        ),
        VALIDATORS: new this.TABLE_INFO<ValidatorDocument, DocumentWithDefaultDates>('validators', {
                nodeID: { type: DataTypes.TEXT, primaryKey: true },
                txID: {type: DataTypes.TEXT, defaultValue: '', allowNull: false},
                startTime: { type: DataTypes.DATE, defaultValue: 0 },
                endTime: { type: DataTypes.DATE, defaultValue: 0 },
                stakeAmount: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false},
                uptime: {type: DataTypes.DECIMAL({
                        unsigned: true,
                        length: 16,
                        decimals: 12,
                        precision: 12,
                        scale: 4,
                        zerofill: true
                    }), defaultValue: 0, allowNull: false},
                connected: {type: DataTypes.BOOLEAN, defaultValue: false},
                networkId: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
            }, {updateOnDuplicate: ["txID", "startTime", "endTime", "stakeAmount", "uptime", "connected", "networkId", "updatedAt"]}, {}
        ),
        SUB_VALIDATOR: new this.TABLE_INFO<SubnetValidatorDocument, DocumentWithDefaultDates>('sub_validators', {
            subnetId: {type: DataTypes.TEXT, primaryKey: true},
            nodeId: {type: DataTypes.TEXT, primaryKey: true},
            weight: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
            networkId: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
            startTime: { type: DataTypes.DATE, defaultValue: 0 },
            endTime: { type: DataTypes.DATE, defaultValue: 0 },
            }, {updateOnDuplicate: ["weight", "startTime", "endTime", "updatedAt"]}, {}
        ),
    }

    constructor(isAdmin: boolean, isProd: boolean) {
        super(isAdmin, isProd, DATABASE_TYPE.MAIN)
    }

    async define() {
        for (const table of Object.values(this.TABLES)) {
            // @ts-ignore
            await table.define(this.sequelize, this.queue)
        }
    }

    async sync() {
        await this.sequelize.sync()

        await this.createServerRole()
        await this.createReaderRole()
    }

    async removeLocalData(){
        try{
            const res = await this.queuedSelectQuery(`
            delete from blockchains where "networkId" = 0;
            delete from subnets where "networkId" = 0;
            delete from validators where "networkId" = 0;
            delete from sub_validators where "networkId" = 0;
        `)
        }catch (e) {
            console.log(e)
        }
    }

    async getUsersToNotify(notifyType: NOTIFY_TYPE, forTest: boolean = false): Promise<UserNotifyInfo[]>{
        let interval = ''
        switch (notifyType){
            case NOTIFY_TYPE.EXP_MONTH:
                interval = '30 day'
                break;
            case NOTIFY_TYPE.EXP_WEEK:
                interval = '7 day'
                break;
            case NOTIFY_TYPE.EXP_3DAY:
                interval = '3 day'
                break;
            case NOTIFY_TYPE.EXP_1DAY:
                interval = '1 day'
                break;
            case NOTIFY_TYPE.EXP_6HOUR:
                interval = '6 hour'
                break;
        }
        const res = await this.queuedSelectQuery(`
            select v."nodeId", v."subnetId", v.weight, v."startTime", v."endTime", v2."endTime" as mEndTime, v2."startTime" as mStartTime,
            v2."stakeAmount", v2.uptime, v2.connected, s.wallet, s.webhook, s.email, v."networkId"::integer  
            from sub_validators v
            inner join validators v2 on v2."nodeID" = v."nodeId" 
            inner join subscribers s on s."subnetId" = v."subnetId" 
             where v."endTime" < now() + interval '${interval}' 
             ${forTest ? `and s.wallet = '0x0'` : `and v."endTime" > now() + interval '${interval}' - interval '30 minute'`}
        `)
        // and v."endTime" > now() + interval '${interval}' - interval '30 minute'

        if(res.length > 0){
            return JSON.parse(JSON.stringify(res)) as UserNotifyInfo[]
        }
        return []
    }

    async getSubscriptions(wallet: string): Promise<SubscriberDocument[]>{
        const res = await this.queuedSelectQuery(`
            select * from subscribers s where s.wallet = '${wallet}'
        `)

        if(res.length > 0){
            return JSON.parse(JSON.stringify(res)) as SubscriberDocument[]
        }
        return []
    }
}

let sqlClient = new Map<string, SqlClient>()

export async function getSqlClient(isAdmin: boolean = false): Promise<SqlClient> {
    const isProd_ = isProd();
    const id = `${isAdmin}_${isProd_}`
    if(!sqlClient.get(id)){
        const s = new SqlClient(isAdmin, isProd_)
        await s.define()
        sqlClient.set(id, s);
    }
    return sqlClient.get(id)
}
