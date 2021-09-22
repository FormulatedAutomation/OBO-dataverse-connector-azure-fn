import * as https from 'https'
import { IncomingMessage, RequestOptions } from 'http'

interface RequestResult {
    response:  IncomingMessage
    body: string
}

// We could use a libray for this, but even the smallest ones are > 100k
// Ideal serverless functions are small in size so they can load quickly from idle

function httpsRequest(options: RequestOptions, data?: any): Promise<RequestResult> {
    return new Promise((resolve, reject) => {
        if (data && !options.headers['Content-Length']) {
            options.headers['Content-Length'] = data.length
        }

        const req = https.request(options, function (res) {
            let body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                resolve({response: res, body})
            });
            res.on('error', function (err) {
                reject(err)
            })
        });

        req.on('error', function (err) {
            reject(err)
        });

        if (data) {
            req.write(data)
        }

        req.end();
    });
}


interface TokenSwapArg {
    tenant: string
    token: string
    clientId: string
    clientSecret: string
    scope: string
}

async function getToken({tenant, clientId, clientSecret, scope, token}: TokenSwapArg): Promise<any> {
    const tokenHost = 'login.microsoftonline.com'
    const tokenPath = `/${tenant}/oauth2/v2.0/token`

    const query = new URLSearchParams({
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'client_id': clientId,
        'client_secret': clientSecret,
        'assertion': token,
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

    const {response, body} = await httpsRequest(options, data)
    if (response.statusCode < 400) {
        return JSON.parse(body)
    } else {
        throw new Error(body)
    }

}


async function getDataverseAPI(path: string, query: any, token: string, orgHost: string): Promise<any> {
    const queryStr = new URLSearchParams(query).toString()
    const apiPath = "/api/data/v9.1" + path + "?" + queryStr
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

    const {response, body} = await httpsRequest(options)
    if (response.statusCode < 400) {
        return JSON.parse(body)
    } else {
        throw new Error(body)
    }

}

export {
    getDataverseAPI,
    getToken,
    httpsRequest,
}