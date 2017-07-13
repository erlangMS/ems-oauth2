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

## <a name="2"></a>2 File Config
- Ever aplication can use this application creating a config.json file.
This file has all configurations with seguranca module need.
- this file look like this
```json
{
  "url_client": "/authorize",
  "param_client": "?response_type=code&client_id=",
  "redirect_param": "&state=xyz%20&redirect_uri=",
  "body_client":"",
  "client_id": "168",
  "client_secret":"CPD",
  "url_redirect":"/questionario/index.html/",
  "url_user": "/authorize?",
  "login": "grant_type=password&username=",
  "password": "&password=",
  "body_user" : "",
  "name_client":"questionario",
  "find_user_client": "/authorize/",
  "grant_type": "authorization_code",
  "port_client":":2344",
  "dns_server":"https://164.41.121.71",
  "authorization":"Oauth2"
}

```
- Explain all parameters in config.json
	- url_client: the url for authorization server
	- param_client: params need for authorization server
	- redirect_param: params need for redirect 
	- body_client: If need to passa something in a payload
	- client_id: id of a client
	- client_secret: secret of a client
	- url_redirect: url for redirect back, after autenticated, for aplication
	- url_user: url for get code
	- login: login when client authenticated
	- password: params for password authenticated
	- body_user: if need to pass something in payload 
	- name_client: name of a aplication client
	- find_user_client: find url /authorize/
	- grant_type: grnat type for authorization
	- port_client: port server for all requests
	- dns_server: url for all requests
	- authorizarion: optional for say what level of security (not working yet)


##<a name="3"></a>3 Future Features
	- Integrate seguranca with all languages
	- Better integration
	- Customize login and session time


## <a name="4"></a>4 How to use
If need to integrate seguranca module with your application 

1 - Create a config.json 
```json
{
  "url_client": "/authorize",
  "param_client": "?response_type=code&client_id=",
  "redirect_param": "&state=xyz%20&redirect_uri=",
  "body_client":"",
  "client_id": "168",
  "client_secret":"CPD",
  "url_redirect":"/questionario/index.html/",
  "url_user": "/authorize?",
  "login": "grant_type=password&username=",
  "password": "&password=",
  "body_user" : "",
  "name_client":"questionario",
  "find_user_client": "/authorize/",
  "grant_type": "authorization_code",
  "port_client":":2344",
  "dns_server":"https://164.41.121.71",
  "authorization":"Oauth2"
}

```
2 - In app.module import and use this components and services

```typescript

import {AuthenticationService, AuthGuard, 
		RedirectService, DefaultHeaders, 
		NavigationComponent, DefaultResponse} from 'seguranca';


@NgModule({ 
  declarations: [ NavigationComponent ],
  providers:    [AuthenticationService, AuthGuard, RedirectService,
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
       return this.http.get('/questionario/assets/config.json')
         .map((resultado) => {
             var resposta = resultado.json();
           let location  = window.location.href.split(':');
           let port = location[2].split('/');
             if(location[2]){
                 localStorage.setItem('externalFile',(window.location.protocol+'//'+window.location.hostname+':'+port[0]+'/questionario/assets/config.json'));
             }else {
                 localStorage.setItem('externalFile',(window.location.protocol+'//'+window.location.hostname+'/questionario/assets/config.json'));

             }
             this.redirectService.startRedirectFromBarramento();
           return true;
         });
     }

    onlyRedirectService() {
        this.redirectService.startInitVerifySessionToken();
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
