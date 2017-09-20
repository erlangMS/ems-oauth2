import {Location} from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class RedirectService implements OnDestroy {

    public timeSession: number = 3600;
    public localDateTime: number;
    private auth_url:string = '';

    constructor(private authenticationService: AuthenticationService){
    }

    startRedirectFromBarramento(){
        this.authenticationService.getUrl()
            .subscribe(result =>{
                    this.auth_url= result.url;
                    this.startInitVerifySessionToken();
                });

    }

    startInitVerifySessionToken() {
        if(localStorage.getItem("token") && localStorage.getItem("dataAccessPage")){
            let timeAccess = Date.now();
            let total = timeAccess - Number(localStorage.getItem("dateAccessPage"));
            if(total > 360000){
                this.authenticationService.reset();
            }
        }

        if (localStorage.getItem ('token')) {
              this.authenticationService.periodicIncrement(3600);
              AuthenticationService.currentUser.token = localStorage.getItem ('token');

        }

        if (localStorage.getItem ("dateAccessPage") && AuthenticationService.currentUser.token != "") {
            this.verifyTimeTokenExpired ();
        }

        var code = window.location.href.split ('code=')[1];

        if (code == undefined) {
            if (AuthenticationService.currentUser.token == '') {
                this.initVerificationRedirect ();
            } else {
                this.authenticationService.periodicIncrement (3600);
            }
        } else if (AuthenticationService.currentUser.token == '' && code != undefined) {
            this.redirectWithCodeUrl (code);
        }

    }


    ngOnDestroy() {

    }

    private verifyTimeTokenExpired() {
        let dateSecoundAccess = Date.now();
        this.localDateTime = Number(localStorage.getItem("dateAccessPage"));
        let value = dateSecoundAccess - this.localDateTime;
        if (value >= (this.timeSession * 1000)) {
            this.authenticationService.logout();
        }
    }

    private initVerificationRedirect() {
        if(localStorage.getItem("dateAccessPage") && AuthenticationService.currentUser.token != ""){
            this.verifyTimeTokenExpired();
        }else{
            if(AuthenticationService.currentUser.token != '') {
                this.authenticationService.periodicIncrement(this.timeSession);
            } else {
                this.authenticateClient();
            }

        }

    }

    private redirectWithCodeUrl(code:string) {
          let url_client = window.location.href;
          let array = url_client.split ('/');
          let nomeSistema = array[3].split('#');
          let base_auth = this.auth_url.split('?')
          this.authenticationService.redirectUserTokenAccess(base_auth[0], localStorage.getItem('client_id'),'CPD',code,
              'authorization_code','/'+nomeSistema[0]+'/index.html/' )
            .subscribe(resultado => {
                  this.authenticationService.findUser()
                      .subscribe(result => {
                      });
            })
    }

    private authenticateClient(){
        if(!localStorage.getItem('token')) {
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
