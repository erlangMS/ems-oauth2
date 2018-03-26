import {Location} from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";
import {Observable} from 'rxjs/Observable';
import { LoggerService } from '../_logger/logger.service';
import { CookieService } from '../_cookie/cookie.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EventEmitterService } from '../_register/event-emitter.service';

@Injectable()
export class RedirectService implements OnDestroy {
    public localDateTime: number;

    private isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private auth_url:string = '';
    private result:any = '';

    private static instanceAuthenticationService: AuthenticationService;

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
  
        return Observable.create(observer =>{
            this.authenticationService.getUrl()
            .subscribe(result =>{
                this.result = result;
                    this.authenticationService.getClientCode(urlName[3])
                    .subscribe(res => {
                        this.auth_url= this.result.url;
                        if(this.authenticationService.activatedSystem){
                            this.startInitVerifySessionToken()
                            .subscribe(resp => {
                                return observer;
                            },
                            error => {
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
                     error => {
                        console.log(error)
                    });   

            },
            error => {
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
                    return Observable.create(observer =>{
                        return observer;
                    })
                } else {
                    let urlName = window.location.href.split('/');
                    this.authenticationService.periodicIncrement(this.authenticationService.currentUser.expires_in);
                   return Observable.create(observer =>{
                        this.authenticationService.getClientCode(urlName[3])
                        .subscribe(res => {
                            return observer;
                        });
                    })
                    
                }
             }
        }

        if (this.authenticationService.currentUser.token && this.authenticationService.currentUser.token != "") {
            return Observable.create(observer =>{
                this.verifyTimeTokenExpired ()
                .subscribe(resposta => {
                    return observer;
                });
            })
        }

        var code = window.location.href.split ('code=')[1];
        if (code == undefined) {
            if (this.authenticationService.currentUser.token == '') {
                return Observable.create(observer =>{
                    this.initVerificationRedirect ()
                    .subscribe(resp=> {
                        return observer;
                    })
                })
            } else {
                return Observable.create(observer => {
                    this.authenticationService.periodicIncrement (this.authenticationService.currentUser.expires_in)
                    .subscribe(resp => {
                        return observer;
                    })
                })
                
            }
        } else if (this.authenticationService.currentUser.token == '' && code != undefined) {
           return Observable.create(observer => {
                this.redirectWithCodeUrl (code)
                .subscribe(resp =>{
                    return observer;
                })
            }) 
           
        }

        return Observable.create(observer =>{
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

        return Observable.create(observer =>{
            return observer;
        })
    }

    private initVerificationRedirect(): Observable<any> {
        if(this.authenticationService.currentUser.timer && this.authenticationService.currentUser.token != ""){
            return Observable.create(observer =>{
                this.verifyTimeTokenExpired()
                .subscribe(resp => {
                   return observer;
                })
            })
           
        }else{
            if(this.authenticationService.currentUser.token != '') {
                return Observable.create(observer =>{
                    this.authenticationService.periodicIncrement(this.authenticationService.currentUser.expires_in)
                    .subscribe(resp => {
                       return observer;
                    })
                })
               
            } else {
                return Observable.create(observer =>{
                    this.authenticateClient()
                    .subscribe(resp => {
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
          return Observable.create(observer => {
            this.authenticationService.redirectUserTokenAccess(base_auth[0], this.authenticationService.currentUser.client_id,this.authenticationService.clientSecret,code,
                'authorization_code','/'+nomeSistema[0]+'/index.html/' )
                .subscribe(resposta => {
                    return observer;
                })

          })
                  
    }

    private authenticateClient():Observable<any>{
        if(!this.authenticationService.currentUser.token) {
            this.authenticationService.reset();
              let urlName = window.location.href.split('/');
              return Observable.create(observer =>{
                this.authenticationService.getClientCode(urlName[3])
                .subscribe(res => {
                     let parts =this.auth_url.split('client_id=');
                     let number = parts[1].split('&');
                      window.location.href = parts[0]+'client_id='+res.code+'&'+number[1]+'&'+number[2];
                      return observer;
                  });
              });             
        }

        return Observable.create(observer => {
            return observer;
        })
    }


}
