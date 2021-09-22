# dataverse-obo-azure-fn-backend

## OBO Walkthrough

- Create Client App (73c70d44-295e-40dc-b031-c2922710fd20)
<img width="893" alt="Screen Shot 2021-09-20 at 11 46 39" src="https://user-images.githubusercontent.com/2868/134236578-79459414-bb73-495d-a97f-4d0927cb4bd5.png">

- Add Redirect to it: https://global.consent.azure-apim.net/redirect
<img width="1293" alt="Screen Shot 2021-09-20 at 11 51 55" src="https://user-images.githubusercontent.com/2868/134236737-d34d8090-98eb-4378-87a9-93075b65753c.png">
<img width="1145" alt="Screen Shot 2021-09-20 at 11 52 06" src="https://user-images.githubusercontent.com/2868/134236832-f1eb24dc-8032-4b25-aac5-cfccb86028cf.png">

- Add authentication token
  - PowerApps Client Secret: pb-7Q~QW5rNazBc_1bGXfC7dHObjhC8As06Fr
<img width="1290" alt="Screen Shot 2021-09-20 at 11 52 50" src="https://user-images.githubusercontent.com/2868/134236879-13185e75-281b-4ac5-9e1c-de70a63950d5.png">
  
- Create Service App (3de233fc-a49e-44c1-87e3-87119065a375)
  - Azure Fn OBO Client: aHn7Q~hnIp-r2qj29ilCkbrLwqDRkloY~50rx
<img width="1027" alt="Screen Shot 2021-09-20 at 11 57 51" src="https://user-images.githubusercontent.com/2868/134236927-6b693f96-a32b-4c1f-84c5-076e907aebf5.png">
  
- Add scopes for access_as_user and user_impersonation for admins and users
<img width="1904" alt="Screen Shot 2021-09-20 at 12 00 53" src="https://user-images.githubusercontent.com/2868/134236964-3de59143-a646-4f2b-b5d4-e692bbbd8755.png">
<img width="1409" alt="Screen Shot 2021-09-20 at 12 02 52" src="https://user-images.githubusercontent.com/2868/134237019-7de20162-4411-405c-b38e-1362e5db122e.png">
<img width="1314" alt="Screen Shot 2021-09-20 at 12 08 18" src="https://user-images.githubusercontent.com/2868/134237068-3709c30f-a8aa-47ad-b73c-44c4531ef060.png">

- Add Client App to Service App manifest
  ```
  	"knownClientApplications": [
        "73c70d44-295e-40dc-b031-c2922710fd20"
    ],
  ```
<img width="1007" alt="Screen Shot 2021-09-20 at 12 11 18" src="https://user-images.githubusercontent.com/2868/134237114-f0e271ee-3438-4094-bc50-4c4fdaecb6b9.png">


- Go back to the Client App and add the API Permissions for the Service App
<img width="1882" alt="Screen Shot 2021-09-20 at 12 27 21" src="https://user-images.githubusercontent.com/2868/134237161-2958b4b7-9e3c-464d-bd74-3f3eb7c1d6bc.png">



- Create a Azure Serverless Function
<img width="768" alt="Screen Shot 2021-09-20 at 12 32 02" src="https://user-images.githubusercontent.com/2868/134237221-436d6e7b-3559-419c-8e5b-f3c45d1ca88f.png">


Here's the example Swagger File:

```yaml
swagger: '2.0'
info:
  title: Account API
  description: Get accounts from Dataverse
  version: '1.0'
  contact: {}
host: formulated-obo-demo-fn.azurewebsites.net
basePath: /
schemes: [https]
consumes: []
produces: []
paths:
  /api/accounts:
    get:
      summary: Get Accounts
      operationId: AllAccounts
      parameters: []
      responses:
        '200':
          description: Result
          schema:
            type: array
            items:
              type: object
              properties:
                id: {type: string, description: id}
                name: {type: string, description: name}
definitions: {}
parameters: {}
responses: {}
securityDefinitions:
  oauth2_auth:
    type: oauth2
    flow: accessCode
    authorizationUrl: https://login.windows.net/common/oauth2/authorize
    tokenUrl: https://login.windows.net/common/oauth2/authorize
    scopes: {user_impersonation: user_impersonation, access_as_user: access_as_user}
security:
- oauth2_auth: [user_impersonation, access_as_user]
tags:
- {name: dataverse, description: ''}
```


<img width="715" alt="Screen Shot 2021-09-21 at 15 45 29" src="https://user-images.githubusercontent.com/2868/134237564-00188a18-13c7-4c79-a188-d608a5a14ca5.png">
