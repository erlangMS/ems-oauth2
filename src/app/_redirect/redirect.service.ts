import {Location} from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";
import {Observable} from 'rxjs/Observable';
import { LoggerService } from '../_logger/logger.service';
import { CookieService } from '../_cookie/cookie.service';

@Injectable()
export class RedirectService implements OnDestroy {

    private initialTime: number = 360000;
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
          AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken()  localStorage.getItem("token") = '+localStorage.getItem("token")+'\n';
          AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken()  localStorage.getItem("dataAccessPage") = '+localStorage.getItem("dataAccessPage")+'\n';

            let timeAccess = Date.now();
            let total = timeAccess - Number(AuthenticationService.currentUser.timer);
            AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken()  localStorage.getItem("dateAccessPage") = '+localStorage.getItem("dateAccessPage")+'\n';
            if(total > 3600000){
              AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() inside if(total > 360000) \n';
                this.authenticationService.reset();
            }
        }

        if (AuthenticationService.currentUser.token) {
              let urlName = window.location.href.split('/');
              AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() inside if (localStorage.getItem ("token"))   localStorage.getItem ("token") = '+localStorage.getItem ("token")+'\n';
              this.authenticationService.periodicIncrement(this.initialTime);
              this.authenticationService.getClientCode(urlName[3])
              .subscribe(res => {
                    
              });

        }

        if (AuthenticationService.currentUser.token && AuthenticationService.currentUser.token != "") {
            AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() inside if (localStorage.getItem ("dateAccessPage") && AuthenticationService.currentUser.token != "")  \n';
            this.verifyTimeTokenExpired ();
        }

        var code = window.location.href.split ('code=')[1];
        AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() code = '+code+'\n';
        if (code == undefined) {
            AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() inside if (code == undefined) \n';
            if (AuthenticationService.currentUser.token == '') {
                AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() inside if (AuthenticationService.currentUser.token == "") \n';
                this.initVerificationRedirect ();
            } else {
                this.authenticationService.periodicIncrement (this.initialTime);
            }
        } else if (AuthenticationService.currentUser.token == '' && code != undefined) {
            AuthenticationService.contentLogger += 'oauth2-client RedirectService startInitVerifySessionToken() inside else if (AuthenticationService.currentUser.token == "" && code != undefined)  \n';
            this.redirectWithCodeUrl (code);
        }

    }


    ngOnDestroy() {

    }

    private verifyTimeTokenExpired() {
        let dateSecoundAccess = Date.now();
        this.localDateTime = Number(AuthenticationService.currentUser.timer);
        AuthenticationService.contentLogger += 'oauth2-client RedirectService verifyTimeTokenExpired()  localStorage.getItem("dataAccessPage") = '+localStorage.getItem("dataAccessPage")+'\n';
        let value = dateSecoundAccess - this.localDateTime;
        if (value >= (this.initialTime * 1000)) {
            this.authenticationService.logout();
        }
    }

    private initVerificationRedirect() {
        if(AuthenticationService.currentUser.timer && AuthenticationService.currentUser.token != ""){
            this.verifyTimeTokenExpired();
        }else{
            if(AuthenticationService.currentUser.token != '') {
                this.authenticationService.periodicIncrement(this.initialTime);
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
          AuthenticationService.contentLogger += 'oauth2-client RedirectService redirectWithCodeUrl(code:string)  url_client = '+url_client+'\n';
          AuthenticationService.contentLogger += 'oauth2-client RedirectService redirectWithCodeUrl(code:string)  array = '+array+'\n';
          AuthenticationService.contentLogger += 'oauth2-client RedirectService redirectWithCodeUrl(code:string)  nomeSistema = '+nomeSistema+'\n';
          AuthenticationService.contentLogger += 'oauth2-client RedirectService redirectWithCodeUrl(code:string)  base_auth = '+base_auth+'\n';
          this.authenticationService.redirectUserTokenAccess(base_auth[0], AuthenticationService.currentUser.client_id,'CPD',code,
              'authorization_code','/'+nomeSistema[0]+'/index.html/' )
            .subscribe(resultado => {
            },
            error => {
              AuthenticationService.contentLogger += 'oauth2_client RedirectService startRedirectFromBarramento()  '+error+'\n';
              this.loggerService.getTokenLogger()
              .subscribe(result =>{
                this.loggerService.sendLogger('error',  AuthenticationService.contentLogger)
                .subscribe(resultado =>{
                });
              });
        });
    }

    private authenticateClient(){
        if(!AuthenticationService.currentUser.token) {
            this.authenticationService.reset();
              let urlName = window.location.href.split('/');
              AuthenticationService.contentLogger += 'oauth2-client RedirectService authenticateClient() urlName = '+urlName+'\n';
              this.authenticationService.getClientCode(urlName[3])
                  .subscribe(res => {
                       let parts =this.auth_url.split('client_id=');
                       let number = parts[1].split('&');
                       AuthenticationService.contentLogger += 'oauth2-client RedirectService authenticateClient() url for redirect = '+parts[0]+'client_id='+res.code+'&'+number[1]+'&'+number[2]+'\n';
                       window.location.href = parts[0]+'client_id='+res.code+'&'+number[1]+'&'+number[2];
                  },
                  error => {
                    AuthenticationService.contentLogger += 'oauth2_client RedirectService startRedirectFromBarramento()  '+error+'\n';
                    this.loggerService.getTokenLogger()
                    .subscribe(result =>{
                      this.loggerService.sendLogger('error',  AuthenticationService.contentLogger)
                      .subscribe(resultado =>{
                      });
                    });
                });
        }
    }


}
