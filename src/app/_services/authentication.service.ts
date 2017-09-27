import {Injectable, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {DefaultHeaders} from "../_headers/default.headers";


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
        authorization: ''
    }

    constructor (private http:Http) {

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
                let url =  json.auth_url + '?response_type=code&client_id=' + localStorage.getItem('client_id') + '&state=xyz%20&redirect_uri='+'/'+nomeSistema[0]+"/index.html/";
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService getUrl() url = '+url+'\n';
                return {url: url};
            });
    }

    getClientCode (client:string):Observable<any> {
        let count:string[] = client.split ("#");
        if (count.length > 1) {
            client = count[0];
        }
        if (AuthenticationService.base_url == '') {
            AuthenticationService.base_url = DefaultHeaders.host
        }
        DefaultHeaders.headers.append ("Authorization", "Basic " + btoa ("erlangms@unb.br:5outLag1"));
        return this.http.get (AuthenticationService.base_url + '/auth/client?filter={"name":"' + client + '"}')
            .map ((resposta) => {
                let json = resposta.json ();
                localStorage.setItem ('client_id', json[0].codigo);
                DefaultHeaders.headers.delete ('Authorization');
                return {code: json[0].codigo}
            });

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
                AuthenticationService.currentUser.token = resp.access_token;
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService redirectUserTokenAccess() resp.access_token'+resp.access_token+'\n';
                localStorage.setItem ('token', AuthenticationService.currentUser.token);
                this.periodicIncrement (3600);
                let localDateTime = Date.now ();
                localStorage.setItem ("dateAccessPage", localDateTime.toString ());
                DefaultHeaders.headers.delete ('content-type');
                DefaultHeaders.headers.append ('content-type','application/json; charset=utf-8');
                return true;
            });
    }


    periodicIncrement (sessionTime:number):void {
        this.cancelPeriodicIncrement ();
        if (localStorage.getItem ('dateAccessPage')) {
            let timeAccess = Date.now ();
            sessionTime = 3600000 - (timeAccess - Number (localStorage.getItem ("dateAccessPage")));
            sessionTime = sessionTime / 1000;
        }
        this.time = sessionTime * 1000;

        this.intervalId = setInterval (() => {
            if (this.time < 1000 || !localStorage.getItem ('token')) {
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
        this.cancelPeriodicIncrement ();
        localStorage.removeItem ('token');
        localStorage.removeItem ("dateAccessPage");
        localStorage.removeItem ('user');
        AuthenticationService.currentUser = {
            token: '',
            authorization: ''
        }
        this.getUrl ()
            .subscribe (resultado => {
                window.location.href = resultado.url;
            });
    }

    reset ():void {
        this.cancelPeriodicIncrement ();
        localStorage.removeItem ('token');
        localStorage.removeItem ("dateAccessPage");
        localStorage.removeItem ('user');
        AuthenticationService.currentUser = {
            token: '',
            authorization: ''

        }
    }

    findUser ():Observable<any> {
      AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() before return http.post \n';
        return this.http.post ('/recurso', '')
            .map ((response) => {
                let resp = response.json ();
                let login = resp.resource_owner.login;
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() login = '+login+'\n';
                let idPessoa = resp.resource_owner.codigo;
                AuthenticationService.contentLogger += 'oauth2-client AuthenticationService findUser() idPessoa = '+idPessoa+'\n';
                localStorage.setItem ('user', login);
                localStorage.setItem ('codigo', idPessoa);
            });
    }

}
