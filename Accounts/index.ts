import * as fs from 'fs/promises'
import * as path from 'path'

import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import config from '../config'
import {getDataverseAPI, getToken } from '../lib/request'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log(req.method, req.url)
    context.log(req.headers)
    const paths = new URL(req.url).pathname.split('/')
    const fnDir = paths[2]
    const action = paths[paths.length - 1]
    if (action === 'swagger' || !req.headers['authorization']) {
        context.res = {
            body: await swaggerFile(fnDir),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return 
    }

    const bearerToken = req.headers['authorization'].split(' ')[1]
    let data = null;
    let error = null
    try {
        const authResult = await getToken({
            token: bearerToken,
            scope: `https://${config.orgHost}/user_impersonation`,
            tenant: config.tenant,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
        })
        context.log('Bearer Token', authResult.access_token)
        data = await getDataverseAPI("/accounts", {"$select": "name"}, authResult.access_token, config.orgHost)
    } catch (e) {
        context.log(e)
    }
    if (data) {
        context.res = {
            body: data.value
        };
        return
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            error
        }
    };

};

async function swaggerFile(fnDir: string): Promise<string> {
    const content = await fs.readFile(path.join(__dirname, '..', '..', fnDir, 'swagger.json'))
    return content.toString()
}

export default httpTrigger;