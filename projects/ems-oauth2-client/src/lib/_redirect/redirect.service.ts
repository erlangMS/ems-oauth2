
import { Injectable } from '@angular/core';
import { AuthenticationService } from "../_services/authentication.service";
import { Observable } from 'rxjs';


@Injectable()
export class RedirectService {
    public localDateTime: number = 0;
    private auth_url:string = '';

    private static instanceAuthenticationService: any = '';

    private _aplicacaoInativa = 'inativatedApplication';
    private _rotaAtual = 'erlangms_actualRoute_';

    constructor(private authenticationService: AuthenticationService){
        RedirectService.instanceAuthenticationService = this.authenticationService;
    }

    public static getInstance(): AuthenticationService {
       return RedirectService.instanceAuthenticationService;
    }

    startRedirectFromBarramento(baseUrl:string):Observable<any>{
        let urlName = this.getArrayUrl();
        this.authenticationService.base_url = baseUrl;
        return Observable.create((observer:any) =>{
            this.authenticationService.getUrl()
            .subscribe((result:any) =>{
                this.auth_url = result.url;
                if(this.authenticationService.currentUser.client_id <= 0){
                    this.authenticationService.getClientCode(urlName[3])
                    .subscribe((res:any) => {
                        if(this.authenticationService.activatedSystem){
                            this.startInitVerifySessionToken();
                        } else {
                            localStorage.removeItem(urlName[3]);
                            localStorage.removeItem(this._rotaAtual+''+urlName[3]);
                            var myVal = document.getElementById(this._aplicacaoInativa);
                            if(myVal != null){
                            myVal.innerHTML = `
                                    <h2>Sistema temporariamente indisponível.</h2>
                                    `
                            
                            }
                        }
        
                     },
                     (error:any) => {
                        console.log(error)
                    });
                } else {
                    this.startInitVerifySessionToken();
                }   

            },
            //TODO: retirar o erro 
            (error:any) => {
                console.log(error)
            });
        });
     }


    private startInitVerifySessionToken() {  
        this.VerifyIfHasTokenAndVerifyTime();
        this.VerifyIfhasToken();
        this.verifyIfHasCode();

    }

    private VerifyIfHasTokenAndVerifyTime(){
        if(this.authenticationService.currentUser.token && this.authenticationService.currentUser.timer){
            let timeAccess = Date.now();
            let total = timeAccess - Number(this.authenticationService.currentUser.timer);
             this.verifyTimeWaitMoreThanRefreshToken(total);
        }
    }


    private verifyTimeWaitMoreThanRefreshToken(total:any){
        if(this.authenticationService.currentUser.expires_in != ''){
            if(total > this.authenticationService.currentUser.expires_in * 1000){
                this.authenticationService.reset();
                
            } else {
                this.authenticationService.periodicIncrement(this.authenticationService.currentUser.expires_in);
            }
         }
    }

    private VerifyIfhasToken(){
        if (this.authenticationService.currentUser.token && this.authenticationService.currentUser.token != "") {
            this.verifyTimeTokenExpired ();
        }
    }


    private verifyIfHasCode(){
        var code = window.location.href.split ('code=')[1];
        if (code == undefined) {
            if (this.authenticationService.currentUser.token == '') {
                this.initVerificationRedirect ();
            } else {
                this.authenticationService.periodicIncrement (this.authenticationService.currentUser.expires_in);         
            }
        } else if (this.authenticationService.currentUser.token == '' && code != undefined) {
                this.redirectWithCodeUrl (code);       
        }

    }


    private verifyTimeTokenExpired(){
        let dateSecoundAccess = Date.now();
        this.localDateTime = Number(this.authenticationService.currentUser.timer);
        let value = dateSecoundAccess - this.localDateTime;
        if (value >= (this.authenticationService.currentUser.expires_in * 1000)) {
            this.authenticationService.logout();
        }

    }

    private initVerificationRedirect() {
        if(this.authenticationService.currentUser.timer && this.authenticationService.currentUser.token != ""){
                this.verifyTimeTokenExpired();          
        }else{
            if(this.authenticationService.currentUser.token != '') {         
                this.authenticationService.periodicIncrement(this.authenticationService.currentUser.expires_in);              
            } else {        
                    this.authenticateClient();
            }

        }

    }

    private redirectWithCodeUrl(code:string) {
          
          let nomeSistema = this.getArrayUrl()[3].split('#');
          let base_auth = this.auth_url.split('?');
            this.authenticationService.redirectUserTokenAccess(base_auth[0], this.authenticationService.currentUser.client_id,this.authenticationService.clientSecret,code,
                'authorization_code','/'+nomeSistema[0]+'/index.html/' )
                .subscribe((resposta:any) => {
                })                 
    }

    private authenticateClient(){
        if(!this.authenticationService.currentUser.token) {
            this.authenticationService.reset();
            let parts =this.auth_url.split('client_id=');
            let number = parts[1].split('&');
            window.location.href = parts[0]+'client_id='+this.authenticationService.currentUser.client_id+'&'+number[1]+'&'+number[2];                   
        }
    }

    private getArrayUrl() {
        let url_client = window.location.href;
        return  url_client.split ('/');
    }


}
