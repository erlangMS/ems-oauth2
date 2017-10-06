# Seguranca

This is a module for integrate angular2 aplications with  oauth2. 


## Contents
* [1 Features](#1)
* [2 File Config](#2)
* [3 Future Features ](#3)
* [4 How to use](#4)
* [5 Contribute](#5)

## <a name="1"></a>1 Features
- Oauth2:
    - integrate with wathever server oauth2
    - store token and send in header for server
    - Generate dinamically url for backend
    - Control ever header you need to pass for server in request
    - Control response for server
    - Control access for a page integrate with router
    - Have a login and session time

## <a name="2"></a>2 File Barramento
- Ever aplication can use this application creating a barramento file.
This file has all configurations with seguranca module need.
- this file look like this
```json
{
	"ip": "164.41.121.71",
	"http_port": 2301,
	"https_port": 2344,
	"base_url": "http://164.41.121.71:2301",
	"auth_url": "http://164.41.121.71:2301/authorize",
	"auth_protocol": "auth2",
	"app": "questionario",
	"version": "",
	"environment": "homologaservicos",
	"docker_version": "17.03.2"
}

```
- Explain all parameters in config.json
	- ip: ip of a server oauth2
	- http_port: port http of a server oauth2
	- https_port: port https of a server oauth2
	- body_client: If need to passa something in a payload
	- base_url: url base for request services after authenticate in server
	- auth_url: url authorization of a server oauth2
	- auth_protocol: type of protocol ("basic", "oauth2"). At hte moment only eork with oauth2
	- app: application name
	- version: application version
	- version: params for password authenticated
	- environment: if the application in porduction, developer, test, ect.
	- docker_version: if you put a application in docker need to inform version of docker


##<a name="3"></a>3 Future Features
	- Integrate seguranca with all languages

## <a name="4"></a>4 How to use
If need to integrate seguranca module with your application 

1 - Create a folder inside src folder with name of application. Inside this folder create a file nam barramento 
```json
{
	"ip": "164.41.121.71",
	"http_port": 2301,
	"https_port": 2344,
	"base_url": "http://164.41.121.71:2301",
	"auth_url": "http://164.41.121.71:2301/authorize",
	"auth_protocol": "auth2",
	"app": "questionario",
	"version": "",
	"environment": "homologaservicos",
	"docker_version": "17.03.2"
}

```
2 - In app.module import and use this components and services

```typescript

import {AuthenticationService, AuthGuard, 
		RedirectService, DefaultHeaders, 
		NavigationComponent, DefaultResponse, LoggerService} from 'seguranca';


@NgModule({ 
  declarations: [ NavigationComponent ],
  providers:    [AuthenticationService, AuthGuard, RedirectService, LoggerService,
          {
            provide: RequestOptions,
            useClass: DefaultHeaders
          },
          {
              provide: ResponseOptions,
              useClass: DefaultResponse
          }
   ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }

```

3 - create a folder _file and create a service file.service.ts

```typescript

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {RedirectService, DefaultHeaders} from 'seguranca';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class FileService extends DefaultHeaders {

  constructor( private http: Http, private redirectService: RedirectService){
    super();
  }

  startRedirect():Observable<boolean> {
       return this.http.get('/starter/barramento')

         .map((resultado) => {
             this.redirectService.startRedirectFromBarramento();
             return true;
         });
     }

}


```

Everthing has to be working for conect page login in server with this steps.


## <a name="5"></a>5 Contribution
For download and contribute with seguranca project only clone repository 
and install dependency
```Shell
npm clone https://github.com/erlangMS/oauth2-client.git
npm install  
```
For generate a library in dist folder run this comand
```Shell
npm run build  
```
## License
MIT
