import {Injectable, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/catch';
import {DefaultHeaders} from "../_headers/default.headers";
import { CookieService } from '../_cookie/cookie.service';
import { HttpService } from '../_http/http.service';


@Injectable ()
export class AuthenticationService implements OnInit {
    private initialTime = 3600;
    public time:number = 0;
    intervalId:any = null;
    static client_secret:string = "";
    public static contentLogger:string = "";
    public static port_server:string = '';
    public static base_url:string = '';
    public url_default:string = '';
    public static activatedSystem = true;
    public static currentUser:any = {
        token: '',
        user: '',
        client_id: '',
        codigo: '',
        timer: '',
        resource_owner: '',
        refresh_token: '',
        client_secret: '',
        expires_in: ''
    }

    public nomeDoSistema:any = "";

    constructor (private http:HttpService, private cookieService:CookieService) {
        let url = window.location.href;
        let array = url.split ('/');
        this.nomeDoSistema = array[3].split('#');
        if(localStorage.getItem(this.nomeDoSistema)){ 
            var stringObjeto:any = localStorage.getItem(this.nomeDoSistema);
            var variaveisSistema:any = JSON.parse(stringObjeto); 
            AuthenticationService.currentUser.token = variaveisSistema.token
            AuthenticationService.currentUser.client_id = variaveisSistema.client_id;
            AuthenticationService.currentUser.codigo = variaveisSistema.codigo;
            AuthenticationService.currentUser.user = variaveisSistema.user;
            AuthenticationService.currentUser.timer = variaveisSistema.timer;
            AuthenticationService.currentUser.resource_owner = variaveisSistema.resource_owner;
            AuthenticationService.currentUser.refresh_token = variaveisSistema.resource_owner.refresh_token;
            AuthenticationService.currentUser.expires_in = variaveisSistema.resource_owner.expires_in;
        
        }
    }

    ngOnInit(){
      this.findUser()
        .subscribe(result =>{

        },
      error=> {
        this.logout();
      })
    }

    getUrl ():Observable<any> {
        let url = window.location.href;
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService getUrl() url = '+url+'\n';
        let array = url.split ('/');
        let nomeSistema = array[3].split('#');
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService getUrl() nomeSistema = '+nomeSistema+'\n';
        return this.http.get (array[0] + '//' + array[2] + '/'+nomeSistema[0]+'/barramento')
            .map ((res) => {
                let json = res.json ();
                AuthenticationService.base_url = json.base_url;
                DefaultHeaders.host = json.base_url;
                let url =  json.auth_url + '?response_type=code&client_id=' + AuthenticationService.currentUser.client_id + '&state=xyz%20&redirect_uri='+'/'+nomeSistema[0]+"/index.html/";
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService getUrl() url = '+url+'\n';
                this.url_default = json.base_url;
                return {url: url};
            }).catch((e:any) => {
                return Observable.throw(
                  new Error(`${ e.status } ${ e.statusText }`)
                );
            })
            .publishReplay(1)
            .refCount();
    }

    getClientCode (client:string):Observable<any> {
        let count:string[] = client.split ("#");
        if (count.length > 1) {
            client = count[0];
        }
        if (AuthenticationService.base_url == '') {
            AuthenticationService.base_url = DefaultHeaders.host;
        }
        DefaultHeaders.headers.delete ("Authorization");
        return this.http.get (AuthenticationService.base_url + '/auth/client?filter={"name":"' + client + '"}')
            .map ((resposta) => {
                this.nomeDoSistema = client;
                let json = resposta.json ();
                AuthenticationService.currentUser.client_id = json[0].id;
                AuthenticationService.activatedSystem = json[0].active;
                return {code: json[0].id}
            }).catch((e:any) => {
                return Observable.throw(
                  new Error(`${ e.status } ${ e.statusText }`)
                );
            })
            .publishReplay(1)
            .refCount();

    }


    redirectUserTokenAccess (url:string, client_id:any, client_secret:string, code:string, grant_type:string,
                             redirect_uri:string):Observable<boolean> {

        var obj = {
            client_id: client_id,
            client_secret: client_secret,
            code: code,
            redirect_uri: redirect_uri,
            grant_type: grant_type
        }
        DefaultHeaders.headers.delete ('content-type');
        DefaultHeaders.headers.append ('content-type','application/x-www-form-urlencoded');
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService redirectUserTokenAccess() before return http.post \n';
        return this.http.post (url,'grant_type=' + grant_type + '&client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + code + '&redirect_uri=' + redirect_uri)
            .map ((resposta) => {
                var resp = resposta.json ();
                let url = window.location.href;
                let array = url.split ('/');
                let dominio = array[2].split(':');
                AuthenticationService.currentUser.token = resp.access_token;
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService redirectUserTokenAccess() resp.access_token'+resp.access_token+'\n';
                this.cookieService.setCookie("token",AuthenticationService.currentUser.token,this.initialTime,'/',dominio[0],false);
                let localDateTime = Date.now ();
                AuthenticationService.currentUser.timer = localDateTime.toString();
                this.addValueUser(resp);
                this.cookieService.setCookie("dateAccessPage",localDateTime.toString(),this.initialTime,'/',dominio[0],false);
                DefaultHeaders.headers.delete ('content-type');
                DefaultHeaders.headers.append ('content-type','application/json; charset=utf-8');

                return true;
            }).catch((e:any) => {
                return Observable.throw(
                  new Error(`${ e.status } ${ e.statusText }`)
                );
            })
            .publishReplay(1)
            .refCount();
    }

    private addValueUser(resp:any){
        let login = resp.resource_owner.login;
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() login = '+login+'\n';
        let idPessoa = resp.resource_owner.id;
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() idPessoa = '+idPessoa+'\n';
        AuthenticationService.currentUser.codigo = idPessoa;
        AuthenticationService.currentUser.user = login;
        AuthenticationService.currentUser.resource_owner = resp.resource_owner;
        AuthenticationService.currentUser.refresh_token = resp.refresh_token;
        AuthenticationService.currentUser.expires_in = resp.expires_in;
        this.periodicIncrement(AuthenticationService.currentUser.expires_in);
        localStorage.setItem(this.nomeDoSistema,JSON.stringify(AuthenticationService.currentUser));

    }


    periodicIncrement (sessionTime:number):void {
        this.cancelPeriodicIncrement ();
        if (AuthenticationService.currentUser.timer) {
            let timeAccess = Date.now ();
            sessionTime = this.initialTime * 1000 - (timeAccess - Number (AuthenticationService.currentUser.timer));
            sessionTime = sessionTime / 1000;
            this.initialTime = sessionTime;
        }
        this.time = this.initialTime * 1000;

        this.intervalId = setInterval (() => {
            if (this.time < 1000) {
                if(AuthenticationService.currentUser.refresh_token){
                    AuthenticationService.currentUser.token = '';
                    clearInterval(this.intervalId);
                    this.refreshSessionTime('refresh_token')
                    .subscribe((validado)=>{
                    })
                }else{
                    this.logout ();
                }
                
            } else if(!AuthenticationService.currentUser.token){
                this.logout ();
            }else {
                this.time = this.time - 1000;
                return this.time;
            }
        }, 1000);

    };

    refreshSessionTime(grant_type:string):Observable<any>{
        DefaultHeaders.headers.delete ("Authorization");
        DefaultHeaders.headers.delete ("content-type");
-       DefaultHeaders.headers.append ("Authorization", "Basic " + btoa (AuthenticationService.currentUser.client_id + ":CPD"));
        DefaultHeaders.headers.append ('content-type','application/x-www-form-urlencoded');
        return this.http.post(this.url_default+'/authorize','grant_type=' + grant_type + '&refresh_token='+AuthenticationService.currentUser.refresh_token)
        .map((resposta: any)=>{
            let token = resposta.json();
            AuthenticationService.currentUser.timer = null;
            AuthenticationService.currentUser.token = token.access_token;
            AuthenticationService.currentUser.resource_owner = token.resource_owner;
            AuthenticationService.currentUser.expires_in = token.expires_in;
            localStorage.removeItem(this.nomeDoSistema);
            localStorage.setItem(this.nomeDoSistema,JSON.stringify(AuthenticationService.currentUser));
            DefaultHeaders.headers.delete ("Authorization");
            DefaultHeaders.headers.delete ('content-type');
            DefaultHeaders.headers.append ('content-type','application/json; charset=utf-8');
            this.periodicIncrement(AuthenticationService.currentUser.expires_in);
        }).catch((e:any) => {
            return Observable.throw(
              new Error(`${ e.status } ${ e.statusText }`)
            );
        }).publishReplay(1)
        .refCount();
    }

    cancelPeriodicIncrement ():void {
        if (this.intervalId != null) {
            clearInterval (this.intervalId);
            this.intervalId = null;
            this.time = 0;
        }
    };

    logout ():void {
        let url = window.location.href;
        let array = url.split ('/');
        let dominio = array[2].split(':');

        this.getClientCode(array[3])
        .subscribe(resp=>{
            this.getUrl ()
                .subscribe (resultado => {
                    this.cancelPeriodicIncrement ();
                    localStorage.removeItem (this.nomeDoSistema);
                    this.cookieService.setCookie("token",' ',this.initialTime,'/',dominio[0],false);
                    this.cookieService.setCookie("dateAccessPage",' ',this.initialTime,'/',dominio[0],false);
                    AuthenticationService.currentUser = {
                        token: '',
                        user: '',
                        client_id: AuthenticationService.currentUser.client_id,
                        codigo: ''
                    }
                    window.location.href = resultado.url;
                });
        });
    }

    reset ():void {
        let url = window.location.href;
        let array = url.split ('/');
        let dominio = array[2].split(':');

        this.cancelPeriodicIncrement ();
        localStorage.removeItem (this.nomeDoSistema);
        this.cookieService.setCookie("token",' ',this.initialTime,'/',dominio[0],false);
        this.cookieService.setCookie("dateAccessPage",' ',this.initialTime,'/',dominio[0],false);
        AuthenticationService.currentUser = {
            token: '',
            user: '',
            client_id: AuthenticationService.currentUser.client_id,
            codigo: ''
        }
    }

    findUser ():Observable<any> {
      AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() before return http.post \n';
        return this.http.post ('/resource', '')
            .map ((response) => {
                let resp = response.json ();
                let login = resp.resource_owner.login;
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() login = '+login+'\n';
                let idPessoa = resp.resource_owner.id;
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() idPessoa = '+idPessoa+'\n';
                AuthenticationService.currentUser.resource_owner = resp.resource_owner;
                AuthenticationService.currentUser.user = login;
                AuthenticationService.currentUser.codigo = idPessoa;
               }).catch((e:any) => {
                return Observable.throw(
                  new Error(`${ e.status } ${ e.statusText }`)
                );
            }).publishReplay(1)
               .refCount();
    }



}
