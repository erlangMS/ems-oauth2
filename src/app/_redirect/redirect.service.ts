import {Location} from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";

@Injectable()
export class RedirectService implements OnDestroy {

    public location: Location;

    public timeSession: number = 3600;

    public localDateTime: number;

    private error:string = '';

    constructor(private authenticationService: AuthenticationService, private loc: Location){
        this.location = loc;
    }


    startRedirectFromBarramento(){
        this.authenticationService.getUrlFromBarramento()
            .subscribe(result =>{
                    this.startInitVerifySessionToken();
                },
                error => {
                    this.startInitVerifySessionToken();
                })
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
            this.authenticationService.getUrl()
                .subscribe(resultado =>{
                    this.authenticationService.periodicIncrement(3600);
                    AuthenticationService.currentUser.token = localStorage.getItem ('token');
                });
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
        this.authenticationService.getUrl()
            .subscribe(resultado =>{
                var url = resultado.url;
                var partUrl = url.split('?');
                let url_client = window.location.href;
                let array = url_client.split ('/');
                this.authenticationService.redirectUserTokenAccess(partUrl[0], localStorage.getItem('client_id'),'CPD',code,
                    'client_credentials','/'+array[3]+'/index.html/' )
                    .subscribe(resultado => {
                        this.authenticationService.findUser()
                            .subscribe(result => {
                            });
                    })
            });
    }

    private authenticateClient(){
        if(!localStorage.getItem('token')) {
            this.authenticationService.reset();
            this.authenticationService.getUrl()
                .subscribe (resultado => {
                    let urlName = window.location.href.split('/');
                    this.authenticationService.getClientCode(urlName[3])
                        .subscribe(res => {
                            if (res.code) {
                                resultado.client_id = res.code;
                                let parts = resultado.url.split('client_id=');
                                let number = parts[1].split('&');
                                resultado.url = parts[0]+'client_id='+res.code+'&'+number[1]+'&'+number[2];
                            }
                            window.location.href = resultado.url;
                        })
                });
        } else {
            this.authenticationService.getUrl()
                .subscribe (resultado => {
                    var url = resultado.url;
                    if (resultado.store == 'variable') {
                        AuthenticationService.currentUser.authorization = resultado.authorization;
                    }
                });
        }
    }


}
