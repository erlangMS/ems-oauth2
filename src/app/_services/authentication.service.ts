import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {DefaultHeaders} from "../_headers/default.headers";


@Injectable ()
export class AuthenticationService {

    public time:number = 0;
    intervalId:any = null;
    static client_secret:string = "";
    public static port_server:string = '';
    public static base_url:string = '';
    public static currentUser:any = {
        token: '',
        login: '',
        authorization: '',
        time: '',
        password: ''
    }

    constructor (private http:Http) {

    }

    getUrl ():Observable<any> {
        let url = window.location.href;
        let array = url.split ('/');
        let nomeSistema = array[3].split('#');
        return this.http.get (array[0] + '//' + array[2] + '/'+nomeSistema[0]+'/barramento')
            .map ((res) => {
                let json = res.json ();
                AuthenticationService.base_url = json.base_url;
                DefaultHeaders.host = json.base_url;
                let url =  json.auth_url + '?response_type=code&client_id=' + localStorage.getItem('client_id') + '&state=xyz%20&redirect_uri='+'/'+nomeSistema[0]+"/index.html/";
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


        return this.http.post (url + '?grant_type=' + grant_type + '&client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + code + '&redirect_uri=' + redirect_uri, JSON.stringify (obj))
            .map ((resposta) => {
                var resp = resposta.json ();
                AuthenticationService.currentUser.token = resp.access_token;
                localStorage.setItem ('token', AuthenticationService.currentUser.token);
                this.periodicIncrement (3600);
                let localDateTime = Date.now ();
                localStorage.setItem ("dateAccessPage", localDateTime.toString ());
                return true;
            });
    }


    getUrlForDirectLogin (login:string, senha:string, arquivo:string):Observable<any> {
        let arquivoExterno = localStorage.getItem ('externalFile');
        if (arquivoExterno) {
            arquivo = arquivoExterno;
        }
        return this.http.get (arquivo)
            .map ((res) => {
                var json = res.json ();
                let url = json.url_user + '' + json.login + '' + login + '' + json.password + '' + senha;
                let body = json.body_user;
                let authorization = json.authorization;
                return {url: url, body: body, authorization: authorization};
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
        return this.http.post ('/recurso', '')
            .map ((response) => {
                let resp = response.json ();
                let login = resp.resource_owner.login;
                let idPessoa = resp.resource_owner.codigo;
                localStorage.setItem ('user', login);
                localStorage.setItem ('codigo', idPessoa);
            });
    }

}
