import {Injectable, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import {DefaultHeaders} from "../_headers/default.headers";
import { CookieService } from '../_cookie/cookie.service';


@Injectable ()
export class AuthenticationService implements OnInit {

    public time:number = 0;
    intervalId:any = null;
    static client_secret:string = "";
    public static contentLogger:string = "";
    public static port_server:string = '';
    public static base_url:string = '';
    public static currentUser:any = {
        token: '',
        user: '',
        client_id: '',
        codigo: '',
        timer: ''
    }

    public nomeDoSistema:any = "";

    constructor (private http:Http, private cookieService:CookieService) {
        let url = window.location.href;
        let array = url.split ('/');
        this.nomeDoSistema = array[3].split('#');
        if(localStorage.getItem('token_'+this.nomeDoSistema)){  
             AuthenticationService.currentUser.token = localStorage.getItem('token_'+this.nomeDoSistema);
             AuthenticationService.currentUser.client_id = localStorage.getItem('client_id');
             AuthenticationService.currentUser.codigo = localStorage.getItem('codigo');
             AuthenticationService.currentUser.user = localStorage.getItem('user');
             AuthenticationService.currentUser.timer = localStorage.getItem('dateAccessPage');
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
        if(!localStorage.getItem('client_id')) {
          localStorage.setItem('client_id',AuthenticationService.currentUser.client_id);
        }
        return this.http.get (array[0] + '//' + array[2] + '/'+nomeSistema[0]+'/barramento')
            .map ((res) => {
                let json = res.json ();
                AuthenticationService.base_url = json.base_url;
                DefaultHeaders.host = json.base_url;
                let url =  json.auth_url + '?response_type=code&client_id=' + localStorage.getItem('client_id') + '&state=xyz%20&redirect_uri='+'/'+nomeSistema[0]+"/index.html/";
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService getUrl() url = '+url+'\n';
                return {url: url};
            }).publishReplay(1)
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
                localStorage.setItem ('client_id', json[0].id);

                return {code: json[0].id}
            }).publishReplay(1)
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
                localStorage.setItem ('token_'+this.nomeDoSistema, AuthenticationService.currentUser.token);
                this.cookieService.setCookie("token",AuthenticationService.currentUser.token,3600,'/',dominio[0],false);
                this.periodicIncrement (3600);
                let localDateTime = Date.now ();
                this.addValueUser(resp);
                localStorage.setItem ("dateAccessPage", localDateTime.toString ());
                this.cookieService.setCookie("dateAccessPage",localDateTime.toString(),3600,'/',dominio[0],false);
                AuthenticationService.currentUser.timer = localStorage.getItem('dateAccessPage');
                DefaultHeaders.headers.delete ('content-type');
                DefaultHeaders.headers.append ('content-type','application/json; charset=utf-8');
                return true;
            }).publishReplay(1)
            .refCount();
    }

    private addValueUser(resp:any){
        let login = resp.resource_owner.login;
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() login = '+login+'\n';
        let idPessoa = resp.resource_owner.id;
        AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() idPessoa = '+idPessoa+'\n';
        localStorage.setItem ('user', login);
        localStorage.setItem ('codigo', idPessoa);
        localStorage.setItem("resource_owner",JSON.stringify(resp.resource_owner));
        AuthenticationService.currentUser.token = localStorage.getItem('token_'+this.nomeDoSistema);
        AuthenticationService.currentUser.client_id = localStorage.getItem('client_id');
        AuthenticationService.currentUser.codigo = localStorage.getItem('codigo');

    }


    periodicIncrement (sessionTime:number):void {
        this.cancelPeriodicIncrement ();
        if (AuthenticationService.currentUser.timer) {
            let timeAccess = Date.now ();
            sessionTime = 3600000 - (timeAccess - Number (localStorage.getItem ("dateAccessPage")));
            sessionTime = sessionTime / 1000;
        }
        this.time = sessionTime * 1000;

        this.intervalId = setInterval (() => {
            if (this.time < 1000 || !AuthenticationService.currentUser.token) {
                this.logout ();
            } else {
                this.time = this.time - 1000;
                return this.time;
            }
        }, 1000);

    };

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
                    localStorage.removeItem ("dateAccessPage");
                    localStorage.removeItem ('token_'+this.nomeDoSistema);
                    localStorage.removeItem('resource_owner');
                    localStorage.removeItem ('user');
                    localStorage.removeItem('codigo');
                    this.cookieService.setCookie("token",' ',3600,'/',dominio[0],false);
                    this.cookieService.setCookie("dateAccessPage",' ',3600,'/',dominio[0],false);
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
        localStorage.removeItem ('token_'+this.nomeDoSistema);
        localStorage.removeItem ("dateAccessPage");
        localStorage.removeItem ('user');
        localStorage.removeItem('codigo');
        localStorage.removeItem('resource_owner');
        this.cookieService.setCookie("token",' ',3600,'/',dominio[0],false);
        this.cookieService.setCookie("dateAccessPage",' ',3600,'/',dominio[0],false);
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
                localStorage.setItem ('user', login);
                localStorage.setItem ('codigo', idPessoa);
                localStorage.setItem("resource_owner",JSON.stringify(resp.resource_owner));

               }).publishReplay(1)
               .refCount();
    }


}
