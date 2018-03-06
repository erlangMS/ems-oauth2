import {Location} from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";
import {Observable} from 'rxjs/Observable';
import { LoggerService } from '../_logger/logger.service';
import { CookieService } from '../_cookie/cookie.service';

@Injectable()
export class RedirectService implements OnDestroy {

    public localDateTime: number;
    private auth_url:string = '';
    private result:any = '';

    constructor(private authenticationService: AuthenticationService, private loggerService: LoggerService,
                private cookieService: CookieService){
                    
                 this.authenticationService.getUrl()
                    .subscribe(result =>{
                        this.result = result;
                    });
    }

    startRedirectFromBarramento(){
     /*   if(!AuthenticationService.currentUser.token){
            if(this.cookieService.getCookie('token') != ''){
                localStorage.setItem('erlangms_'+this.authenticationService.nomeDoSistema,this.cookieService.getCookie('token'));
                localStorage.setItem ("dateAccessPage", this.cookieService.getCookie('dateAccessPage'));
            }
        } */
        let urlName = window.location.href.split('/');

            this.authenticationService.getClientCode(urlName[3])
                .subscribe(res => {
                    this.auth_url= this.result.url;
                    if(AuthenticationService.activatedSystem){
                        this.startInitVerifySessionToken(); 
                    } else {
                        localStorage.removeItem(urlName[3]);
                        localStorage.removeItem('erlangms_actualRoute_'+urlName[3]);
                        var myVal = document.getElementById("inativatedApplication");
                        if(myVal != null){
                           myVal.innerHTML = `
                                 <h2>Sistema temporariamente indisponível.</h2>
                                `
                          
                        }
                    }

            });      
  }


    startInitVerifySessionToken() {
        if(AuthenticationService.currentUser.token && AuthenticationService.currentUser.timer){
            let timeAccess = Date.now();
            let total = timeAccess - Number(AuthenticationService.currentUser.timer);
           
            if(AuthenticationService.currentUser.expires_in != ''){
                if(total > AuthenticationService.currentUser.expires_in * 1000){
                    this.authenticationService.reset();
                } else {
                    let urlName = window.location.href.split('/');
                    this.authenticationService.periodicIncrement(AuthenticationService.currentUser.expires_in);
                    this.authenticationService.getClientCode(urlName[3])
                    .subscribe(res => {

                    
                     });
                }
             }
        }

        if (AuthenticationService.currentUser.token && AuthenticationService.currentUser.token != "") {
            this.verifyTimeTokenExpired ();
        }

        var code = window.location.href.split ('code=')[1];
        if (code == undefined) {
            if (AuthenticationService.currentUser.token == '') {
                this.initVerificationRedirect ();
            } else {
                this.authenticationService.periodicIncrement (AuthenticationService.currentUser.expires_in);
            }
        } else if (AuthenticationService.currentUser.token == '' && code != undefined) {
             this.redirectWithCodeUrl (code);
        }

    }


    ngOnDestroy() {

    }

    private verifyTimeTokenExpired() {
        let dateSecoundAccess = Date.now();
        this.localDateTime = Number(AuthenticationService.currentUser.timer);
        let value = dateSecoundAccess - this.localDateTime;
        if (value >= (AuthenticationService.currentUser.expires_in * 1000)) {
            this.authenticationService.logout();
        }
    }

    private initVerificationRedirect() {
        if(AuthenticationService.currentUser.timer && AuthenticationService.currentUser.token != ""){
            this.verifyTimeTokenExpired();
        }else{
            if(AuthenticationService.currentUser.token != '') {
                this.authenticationService.periodicIncrement(AuthenticationService.currentUser.expires_in);
            } else {
                this.authenticateClient();
            }

        }

    }

    private redirectWithCodeUrl(code:string) {
          let url_client = window.location.href;
          let array = url_client.split ('/');
          let nomeSistema = array[3].split('#');
          let base_auth = this.auth_url.split('?');

          this.authenticationService.redirectUserTokenAccess(base_auth[0], AuthenticationService.currentUser.client_id,'CPD',code,
              'authorization_code','/'+nomeSistema[0]+'/index.html/' )
            .subscribe(resultado => {
                     
            });
    }

    private authenticateClient(){
        if(!AuthenticationService.currentUser.token) {
            this.authenticationService.reset();
              let urlName = window.location.href.split('/');
              this.authenticationService.getClientCode(urlName[3])
                  .subscribe(res => {
                       let parts =this.auth_url.split('client_id=');
                       let number = parts[1].split('&');
                        window.location.href = parts[0]+'client_id='+res.code+'&'+number[1]+'&'+number[2];
                    });
        }
    }


}
