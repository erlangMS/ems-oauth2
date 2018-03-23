import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {DefaultHeaders} from "../_headers/default.headers";
import { CookieService } from '../_cookie/cookie.service';
import { HttpService } from '../_http/http.service';
import { Http } from '@angular/http';
import { EventEmitterService } from '../_register/event-emitter.service';


@Injectable ()
export class AuthenticationService  {
    public time:number = 0;
    public client_secret:string = "";
    public port_server:string = '';
    public base_url:string = '';
    public activatedSystem = true;
    public erlangmsUrlMask:any = "false";
    public clientSecret:string = 'CPD';


    private textDate = '';
    private intervalId:any = null;
    private urlSistema:any = '';
    private partesUrlSistema:any = '';
    private protocoloSistema:any = '';
    private dominioSistema:any = '';

    //constantes
    private _transformaMilissegundos = 1000;
    private _tempoParaRefresh = 500000;
    private _grant_type = 'refresh_token';
    private _errorNotANumber = 'NaN:NaN:NaN';
    private _nomeArquivoBarramento = 'barramento';


    public currentUser:any = {
        token: '',
        user: '',
        client_id: '',
        codigo: '',
        timer: '',
        resource_owner: '',
        refresh_token: '',
        client_secret: '',
        default_host: '',
        expires_in: 3600,
        default_url: ''

    }

    public nomeDoSistema:any = "";

    constructor (private http:HttpService, private cookieService:CookieService, private httpAngular: Http) {
        this.dadosDaUrl();
        if(localStorage.getItem(this.nomeDoSistema)){ 
            EventEmitterService.get('tokenPreenchido').emit(true);
            var stringObjeto:any = localStorage.getItem(this.nomeDoSistema);
            var variaveisSistema:any = JSON.parse(stringObjeto); 
            this.currentUser.token = variaveisSistema.token
            this.currentUser.client_id = variaveisSistema.client_id;
            this.currentUser.codigo = variaveisSistema.codigo;
            this.currentUser.user = variaveisSistema.user;
            this.currentUser.timer = variaveisSistema.timer;
            this.currentUser.resource_owner = variaveisSistema.resource_owner;
            this.currentUser.refresh_token = variaveisSistema.resource_owner.refresh_token;
            this.currentUser.expires_in = variaveisSistema.expires_in;  
            this.currentUser.default_url = variaveisSistema.default_url;      
        }
    }

    private dadosDaUrl(){
        this.urlSistema = window.location.href;
        this.partesUrlSistema = this.urlSistema.split ('/');
        this.nomeDoSistema = this.partesUrlSistema[3].split('#');
        this.protocoloSistema = this.partesUrlSistema[0];
        this.dominioSistema = this.partesUrlSistema[2];

    }


    getUrl ():Observable<any> {
        return this.httpAngular.get (this.protocoloSistema + '//' + this.dominioSistema + '/'+this.nomeDoSistema+'/'+this._nomeArquivoBarramento)
            .map ((res) => {
                let json = res.json ();
                this.base_url = json.base_url;
                this.erlangmsUrlMask = json.url_mask;
                if(json.client_secret){
                    this.clientSecret = json.client_secret;
                }
                this.currentUser.default_url = this.base_url;
                let url =  json.auth_url + '?response_type=code&client_id=' + this.currentUser.client_id + '&state=xyz%20&redirect_uri='+'/'+this.nomeDoSistema+"/index.html/";
                return {url: url};
            });
    }

    getClientCode (client:string):Observable<any> {
        let count:string[] = client.split ("#");
        if (count.length > 1) {
            client = count[0];
        }
      
        DefaultHeaders.headers.delete ("Authorization");
        return this.http.get (this.base_url + '/auth/client?filter={"name":"' + client + '"}')
            .map ((resposta) => {
                this.nomeDoSistema = client;
                let json = resposta.json ();
                let idClient = json[0].id;
                this.currentUser.client_id = idClient;
                this.activatedSystem = json[0].active;
                return {code: idClient}
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
          return this.http.post (url,'grant_type=' + grant_type + '&client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + code + '&redirect_uri=' + redirect_uri)
            .map ((resposta) => {
                var resp = resposta.json ();
                this.addValueUser(resp, true);
                EventEmitterService.get('registroToken').emit(resp.access_token);
                this.cookieService.setCookie("token",this.currentUser.token,this.currentUser.expires_in,'/',this.dominioSistema,false);
                this.periodicIncrement (this.currentUser.expires_in);             
                this.cookieService.setCookie("dateAccessPage",this.currentUser.timer,this.currentUser.expires_in,'/',this.dominioSistema,false);
                DefaultHeaders.headers.delete ('content-type');
                DefaultHeaders.headers.append ('content-type','application/json; charset=utf-8');

                return true;
            });
    }

    private addValueUser(resp:any, emit:boolean){
        let localDateTime = Date.now ();
        this.currentUser.timer = localDateTime.toString();
        let login = resp.resource_owner.login;
        let idPessoa = resp.resource_owner.id;
        this.currentUser.codigo = idPessoa;
        this.currentUser.user = login; 
        this.currentUser.resource_owner = resp.resource_owner;
        this.currentUser.refresh_token = resp.refresh_token;
        this.currentUser.token = resp.access_token;
        this.currentUser.expires_in = resp.expires_in;
        this.periodicIncrement(this.currentUser.expires_in);
        localStorage.setItem(this.nomeDoSistema,JSON.stringify(this.currentUser));
        if(emit){
            EventEmitterService.get('tokenPreenchido').emit(true);
        }

    }


    periodicIncrement (sessionTime:number):Observable<any> {
        this.cancelPeriodicIncrement ();
        if (this.currentUser.timer) {
            let timeAccess = Date.now ();
            sessionTime = this.currentUser.expires_in * this._transformaMilissegundos - (timeAccess - Number (this.currentUser.timer));
            sessionTime = sessionTime / this._transformaMilissegundos;
        }

        this.time = sessionTime * this._transformaMilissegundos;
        let dateFormat = sessionTime

        this.intervalId = setInterval (() => {
            this.textDate = this.formatDate(dateFormat);
            if(this.textDate == this._errorNotANumber){
               this.textDate = this.formatDate(dateFormat); 
            }
            dateFormat = dateFormat - 1;
            if (this.time < this._tempoParaRefresh) {
                if(this.currentUser.refresh_token){
                    this.currentUser.token = '';
                    clearInterval(this.intervalId);
                    this.refreshSessionTime(this._grant_type)
                    .subscribe((validado)=>{
                    },error => {
                       clearInterval(this.intervalId);
                    })
                }else{
                    this.logout ();
                }
                
            } else if(!this.currentUser.token){
                this.logout ();
            }else {
                this.time = this.time - this._transformaMilissegundos;
                return this.time;
            }

        }, this._transformaMilissegundos);

        return Observable.create((observer:any) =>{
            return observer;
        });

    };

    private formatDate(timer:number):string{
        let hours:any = Math.floor(timer / 3600)
        let  minutes:any = Math.floor((timer % 3600)/60);
        let seconds:any = Math.floor(timer % 60);

        hours = minutes < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

       return  hours + ":" + minutes + ":" + seconds;
    }

    refreshSessionTime(grant_type:string):Observable<any>{
        DefaultHeaders.headers.delete ("Authorization");
        DefaultHeaders.headers.delete ("content-type");
-       DefaultHeaders.headers.append ("Authorization", "Basic " + btoa (this.currentUser.client_id + ":"+this.clientSecret));
        DefaultHeaders.headers.append ('content-type','application/x-www-form-urlencoded');

        return this.http.post(this.base_url+'/authorize','grant_type=' + grant_type + '&refresh_token='+this.currentUser.refresh_token)
        .map((resposta: any)=>{
            let token = resposta.json();
            localStorage.removeItem(this.nomeDoSistema);
            this.addValueUser(token, false);
            DefaultHeaders.headers.delete ("Authorization");
            DefaultHeaders.headers.delete ('content-type');
            DefaultHeaders.headers.append ('content-type','application/json; charset=utf-8');
            this.periodicIncrement(this.currentUser.expires_in);
        });

    }

    cancelPeriodicIncrement ():Observable<any> {
        if (this.intervalId != null) {
            clearInterval (this.intervalId);AuthenticationService
            this.intervalId = null;
            this.time = 0;
        }

        return Observable.create((observer:any) =>{
            return observer;
        });
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
                    this.cookieService.setCookie("token",' ',this.currentUser.expires_in,'/',dominio[0],false);
                    this.cookieService.setCookie("dateAccessPage",' ',this.currentUser.expires_in,'/',dominio[0],false);
                    this.currentUser = {};
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
        this.cookieService.setCookie("token",' ',this.currentUser.expires_in,'/',dominio[0],false);
        this.cookieService.setCookie("dateAccessPage",' ',this.currentUser.expires_in,'/',dominio[0],false);
        this.currentUser = {};
    }

    findUser ():Observable<any> {
        return this.http.post ('/resource', '')
            .map ((response) => {
                let resp = response.json ();
                let login = resp.resource_owner.login;
                let idPessoa = resp.resource_owner.id;
                this.currentUser.resource_owner = resp.resource_owner;
                this.currentUser.user = login;
                this.currentUser.codigo = idPessoa;
            });
    }


}
