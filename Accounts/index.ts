import * as fs from 'fs/promises'
import * as path from 'path'
import * as https from 'https'
import { URLSearchParams } from 'url'

import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const tenant = "4557de64-833b-4413-b18a-a35205da5c60";
const orgHost = "org43a3e6c9.crm.dynamics.com"
const serviceClientId = "3de233fc-a49e-44c1-87e3-87119065a375";
const serviceClientSecret = "aHn7Q~hnIp-r2qj29ilCkbrLwqDRkloY~50rx";
const tokenHost = 'login.microsoftonline.com'

const tokenPath = `/${tenant}/oauth2/v2.0/token`


function getDataversAccount(token: string): Promise<any> {
    const apiPath = "/api/data/v9.1/accounts?$select=name"
    const options = {
        hostname: orgHost,
        port: 443,
        path: apiPath,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
        }
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
            var result = '';
            res.on('data', function (chunk) {
                result += chunk;
            });
            res.on('end', function () {
                resolve(result)
            });
            res.on('error', function (err) {
                reject(err)
            })
        });

        req.on('error', function (err) {
            reject(err)
        });

        req.end();
    });


}

function getToken(clientToken: string, scope: string): Promise<any> {
    const query = new URLSearchParams({
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'client_id': serviceClientId,
        'client_secret': serviceClientSecret,
        'assertion': clientToken,
        'scope': scope,
        'requested_token_use': 'on_behalf_of'
    })

    const data = query.toString()

    const options = {
        hostname: tokenHost,
        port: 443,
        path: tokenPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length
        }
    }

    const token = new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
            var result = '';
            res.on('data', function (chunk) {
                result += chunk;
            });
            res.on('end', function () {
                resolve(result)
            });
            res.on('error', function (err) {
                reject(err)
            })
        });

        req.on('error', function (err) {
            reject(err)
        });

        req.write(data);
        req.end();
    })

    return token
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log(req.headers)
    const paths = new URL(req.url).pathname.split('/')
    const fnDir = paths[2]
    const action = paths[paths.length - 1]
    if (action === 'swagger' || !req.headers['authorization']) {
        context.res = {
            body: await swaggerFile(fnDir),
            headers: {
                'Content-Type': 'text/plain'
            }
        }
        return 
    }

    const bearerToken = req.headers['authorization'].split(' ')[1]
    let authResult = null;
    let data = null;
    try {
        const authResultStr = await getToken(bearerToken, `https://${orgHost}/user_impersonation`)
        authResult =  JSON.parse(authResultStr)
        context.log('Json: authresult: ', authResult)
        context.log('Bearer Token', authResult.access_token)
        const dataversDataStr = await getDataversAccount(authResult.access_token)
        context.log('Dataverse Str: ', dataversDataStr)
        data = JSON.parse(dataversDataStr)
    } catch (e) {
        context.log(e)
    }
    if (data) {
        context.res = {
            body: authResult
        };
        return
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: [{
            data: data.value
        }]
    };

};

async function swaggerFile(fnDir: string): Promise<string> {
    const content = await fs.readFile(path.join(__dirname, '..', '..', fnDir, 'swagger.yml'))
    return content.toString()
}

export default httpTrigger;