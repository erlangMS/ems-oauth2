import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable } from 'rxjs/Observable';
import { Injectable } from "@angular/core";
import { RedirectService } from '../_redirect/redirect.service';
import { CookieService } from "../_cookie/cookie.service";
import 'rxjs/add/operator/do';

@Injectable()
export class ReponseInterceptor implements HttpInterceptor {

    constructor(private cookieService: CookieService){

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).retry(3).do(
            (event: HttpEvent<any>) => {
                return event;
            },(error: HttpErrorResponse) => {
                console.log(error);
                let verify:any = undefined;
                let url = window.location.href;
                let array = url.split ('/');
                let nomeSistema:any = array[3].split('#');   
        
              if(JSON.stringify(error.error) == '{"error":"access_denied"}'){
                    let url = window.location.href;
                    let array = url.split ('/');
                    let dominio = array[2].split(':');
                    localStorage.removeItem(nomeSistema);
                    this.cookieService.setCookie("token",' ',3600,'/',dominio[0],false);
                    this.cookieService.setCookie("dateAccessPage",' ',3600,'/',dominio[0],false);
                    RedirectService.getInstance().logout();
                }
            }
        );
    }

}