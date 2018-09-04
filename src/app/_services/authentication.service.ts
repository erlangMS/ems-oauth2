import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { CookieService } from '../_cookie/cookie.service';
import { HttpService } from '../_http/http.service';
import { EventEmitterService } from '../_register/event-emitter.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthInterceptor } from '../_headers/auth.interceptor';
import { ResourceOwner } from '../_local/resource_owner';


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
    public protocoloSistema:any = '';
    public dominioSistema:any = '';

    private protocol:string = '';
    private dominio:string = '';
    private urlAuthorize:string = '';
    
    //constantes
    private _transformaMilissegundos = 1000;
    private _tempoParaRefresh = 500000;
    private _grant_type = 'refresh_token';
    private _errorNotANumber = 'NaN:NaN:NaN';
    public _nomeArquivoBarramento = 'barramento'; 


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
        expires_in: 3600

    }

    public nomeDoSistema:any = "";

    constructor (private http:HttpService, private cookieService:CookieService, private httpAngular: HttpClient) {
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
            ResourceOwner.localStorage = variaveisSistema;
            ResourceOwner.client_id = variaveisSistema.client_id;   
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
        return this.httpAngular.get (this.protocoloSistema + '//' + this.dominioSistema + '/'+this.nomeDoSistema+'/'+this._nomeArquivoBarramento,{
            observe:'body',
            responseType:'json'
        })
            .map ((res:any) => { 
                this.dadosDaUrl();
                this.erlangmsUrlMask = res.url_mask;
                if(res.client_secret){
                    this.clientSecret = res.client_secret;
                }
                let array_auth = res.auth_url.split('/');

                this.protocol = array_auth[0];
                this.dominio = array_auth[2];
                this.currentUser.client_id = res.app_id;

                ResourceOwner.client_id = res.app_id;
                
                if(array_auth[3] == 'dados') {
                    array_auth.splice(3,1);
                }

                this.urlAuthorize = array_auth[3];
                this.urlAuthorize = "/dados/"+this.urlAuthorize;

                let url =  this.protocol+'//'+this.dominio+this.urlAuthorize+ '?response_type=code&client_id=' + this.currentUser.client_id + '&state=xyz%20&redirect_uri='+'/'+this.nomeDoSistema+"/index.html/";

                return {url:url}
            });
    }

    getClientCode(client:string):Observable<any> {
        let count:string[] = client.split ("#");
        if (count.length > 1) {
            client = count[0];
        }
      
        return this.http.get (this.base_url + '/auth/client?filter={"name":"' + client + '"}')
            .map ((resposta:any) => {
                this.nomeDoSistema = client;
                let idClient = resposta[0].id;
                this.currentUser.client_id = idClient;
                this.activatedSystem = resposta[0].active;

                let url =  this.protocol+'//'+this.dominio+this.urlAuthorize+ '?response_type=code&client_id=' + idClient + '&state=xyz%20&redirect_uri='+'/'+this.nomeDoSistema+"/index.html/";
                return {code: idClient, url:url}
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
        AuthInterceptor.headers = new HttpHeaders().set('content-type','application/x-www-form-urlencoded');
          return this.httpAngular.post (url,'grant_type=' + grant_type + '&client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + code + '&redirect_uri=' + redirect_uri)
            .map ((resposta:any) => {
                this.addValueUser(resposta, true);
                ResourceOwner.localStorage = resposta;
                EventEmitterService.get('registroToken').emit(resposta.access_token);
                this.cookieService.setCookie("token",this.currentUser.token,this.currentUser.expires_in,'/',this.dominioSistema,false);
                this.periodicIncrement (this.currentUser.expires_in);             
                this.cookieService.setCookie("dateAccessPage",this.currentUser.timer,this.currentUser.expires_in,'/',this.dominioSistema,false);
                AuthInterceptor.headers = new HttpHeaders().set('content-type','application/json; charset=utf-8');

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
            while(this.textDate == this._errorNotANumber){
               this.textDate = this.formatDate(dateFormat); 
            }
            dateFormat = dateFormat - 1;
            if (this.time < this._tempoParaRefresh) {
                if(this.currentUser.refresh_token){
                    this.currentUser.token = '';
                    clearInterval(this.intervalId);
                    this.refreshSessionTime(this._grant_type)
                    .subscribe((validado:any)=>{
                    },(error:any) => {
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
        AuthInterceptor.headers = new HttpHeaders().set('content-type','application/x-www-form-urlencoded')
        .append ("Authorization", "Basic " + btoa (this.currentUser.client_id + ":"+this.clientSecret));

        return this.http.post(this.base_url+'/authorize','grant_type=' + grant_type + '&refresh_token='+this.currentUser.refresh_token)
        .map((resposta: any)=>{
            localStorage.removeItem(this.nomeDoSistema);
            this.addValueUser(resposta, false);
            AuthInterceptor.headers = new HttpHeaders().set('content-type','application/json; charset=utf-8');
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

        this.getUrl()

        .subscribe((resp:any)=>{
            this.cancelPeriodicIncrement ();
            localStorage.removeItem (this.nomeDoSistema);
            this.cookieService.setCookie("token",' ',this.currentUser.expires_in,'/',dominio[0],false);
            this.cookieService.setCookie("dateAccessPage",' ',this.currentUser.expires_in,'/',dominio[0],false);
            this.currentUser = {};
            window.location.href = resp.url;       

        });
    }

    reset ():void {
        let url = window.location.href;
        let array = url.split ('/');
        let dominio = array[2].split(':');
        
        this.getUrl()
        .subscribe((resp:any)=>{   
            this.cancelPeriodicIncrement ();
            localStorage.removeItem (this.nomeDoSistema);
            this.cookieService.setCookie("token",' ',this.currentUser.expires_in,'/',dominio[0],false);
            this.cookieService.setCookie("dateAccessPage",' ',this.currentUser.expires_in,'/',dominio[0],false);
            this.currentUser = {};
        });
    }

    findUser ():Observable<any> {
        return this.http.post ('/resource', '')
            .map ((response:any) => {
                let login = response.resource_owner.login;
                let idPessoa = response.resource_owner.id;
                this.currentUser.resource_owner = response.resource_owner;
                this.currentUser.user = login;
                this.currentUser.codigo = idPessoa;
            });
    }

    verifyServerStabilish(urlAuthorize:string): Observable<any> {
        return this.httpAngular.get (urlAuthorize,{
            observe:'response',
            responseType:'text'
        }).map ((res:any) => { 
                console.log(res);
              return res;  
        });
    }


}
