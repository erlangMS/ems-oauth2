
import { Injectable, OnDestroy } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";
import {Observable} from 'rxjs';

import { CookieService } from '../_cookie/cookie.service';


@Injectable()
export class RedirectService implements OnDestroy {
    public localDateTime: number = 0;
    private auth_url:string = '';
    private result:any = '';

    private static instanceAuthenticationService: any = '';

    private _aplicacaoInativa = 'inativatedApplication';
    private _rotaAtual = 'erlangms_actualRoute_';

    constructor(private authenticationService: AuthenticationService, private cookieService: CookieService){
        RedirectService.instanceAuthenticationService = this.authenticationService;
    }

    public static getInstance(): AuthenticationService {
       return RedirectService.instanceAuthenticationService;
    }

    startRedirectFromBarramento(baseUrl:string):Observable<any>{
        let urlName = window.location.href.split('/');
        this.authenticationService.base_url = baseUrl;
  
        return Observable.create((observer:any) =>{
            this.authenticationService.getUrl()
            .subscribe((result:any) =>{
                this.auth_url = result.url;
                if(this.authenticationService.currentUser.client_id <= 0){
                    this.authenticationService.getClientCode(urlName[3])
                    .subscribe((res:any) => {
                        if(this.authenticationService.activatedSystem){
                            this.startInitVerifySessionToken()
                            .subscribe((resp:any) => {
                                return observer;
                            },
                            (error:any) => {
                                console.log(error)
                            })
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
                    this.startInitVerifySessionToken()
                        .subscribe((resp:any) => {
                            return observer;
                        },
                        (error:any) => {
                            console.log(error)
                        })
                }   

            },
            (error:any) => {
                console.log(error)
            });
        });

           
  }


    startInitVerifySessionToken(): Observable<any> {
        if(this.authenticationService.currentUser.token && this.authenticationService.currentUser.timer){
            let timeAccess = Date.now();
            let total = timeAccess - Number(this.authenticationService.currentUser.timer);
            if(this.authenticationService.currentUser.expires_in != ''){
                if(total > this.authenticationService.currentUser.expires_in * 1000){
                    this.authenticationService.reset();
                    return Observable.create((observer:any) =>{
                        return observer;
                    })
                } else {
                    let urlName = window.location.href.split('/');
                    this.authenticationService.periodicIncrement(this.authenticationService.currentUser.expires_in);
                   return Observable.create((observer:any) =>{
                       return observer;
                    })
                }
             }
        }

        if (this.authenticationService.currentUser.token && this.authenticationService.currentUser.token != "") {
            return Observable.create((observer:any) =>{
                this.verifyTimeTokenExpired ()
                .subscribe((resposta:any) => {
                    return observer;
                });
            })
        }

        var code = window.location.href.split ('code=')[1];
        if (code == undefined) {
            if (this.authenticationService.currentUser.token == '') {
                return Observable.create((observer:any) =>{
                    this.initVerificationRedirect ()
                    .subscribe((resp:any)=> {
                        return observer;
                    })
                })
            } else {
                return Observable.create((observer:any) => {
                    this.authenticationService.periodicIncrement (this.authenticationService.currentUser.expires_in)
                    .subscribe((resp:any) => {
                        return observer;
                    })
                })
                
            }
        } else if (this.authenticationService.currentUser.token == '' && code != undefined) {
           return Observable.create((observer:any) => {
                this.redirectWithCodeUrl (code)
                .subscribe((resp:any) =>{
                    return observer;
                })
            }) 
           
        }

        return Observable.create((observer:any) =>{
            return observer;
        });
    }


    ngOnDestroy() {

    }

    private verifyTimeTokenExpired(): Observable<any> {
        let dateSecoundAccess = Date.now();
        this.localDateTime = Number(this.authenticationService.currentUser.timer);
        let value = dateSecoundAccess - this.localDateTime;
        if (value >= (this.authenticationService.currentUser.expires_in * 1000)) {
            this.authenticationService.logout();
        }

        return Observable.create((observer:any) =>{
            return observer;
        })
    }

    private initVerificationRedirect(): Observable<any> {
        if(this.authenticationService.currentUser.timer && this.authenticationService.currentUser.token != ""){
            return Observable.create((observer:any) =>{
                this.verifyTimeTokenExpired()
                .subscribe((resp:any) => {
                   return observer;
                })
            })
           
        }else{
            if(this.authenticationService.currentUser.token != '') {
                return Observable.create((observer:any) =>{
                    this.authenticationService.periodicIncrement(this.authenticationService.currentUser.expires_in)
                    .subscribe((resp:any) => {
                       return observer;
                    })
                })
               
            } else {
                return Observable.create((observer:any) =>{
                    this.authenticateClient()
                    .subscribe((resp:any) => {
                        return observer;
                    })
                })
               
            }

        }

    }

    private redirectWithCodeUrl(code:string): Observable<any> {
          let url_client = window.location.href;
          let array = url_client.split ('/');
          let nomeSistema = array[3].split('#');
          let base_auth = this.auth_url.split('?');
          return Observable.create((observer:any) => {
            this.authenticationService.redirectUserTokenAccess(base_auth[0], this.authenticationService.currentUser.client_id,this.authenticationService.clientSecret,code,
                'authorization_code','/'+nomeSistema[0]+'/index.html/' )
                .subscribe((resposta:any) => {
                    return observer;
                })

          })
                  
    }

    private authenticateClient():Observable<any>{
        if(!this.authenticationService.currentUser.token) {
            this.authenticationService.reset();
              let urlName = window.location.href.split('/');
              return Observable.create((observer:any) =>{
                let parts =this.auth_url.split('client_id=');
                let number = parts[1].split('&');
                window.location.href = parts[0]+'client_id='+this.authenticationService.currentUser.client_id+'&'+number[1]+'&'+number[2];
                return observer;
              });             

        }

        return Observable.create((observer:any) => {
            return observer;
        })
    }


}
