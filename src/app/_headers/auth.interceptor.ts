import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs/Observable';
import { Injectable } from "@angular/core";
import { RedirectService } from '../_redirect/redirect.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    static headers: HttpHeaders  = new HttpHeaders().set('content-type','application/json; charset=utf-8');

    constructor(){
        
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let copieReq:any = req.clone();

        let protocol:any[] = [''];
        let url = window.location.href;
        let array = url.split ('/');
        let dominio:any;
        let nomeSistema = array[3].split('#');
        let arrayUrl:any[] =  RedirectService.getInstance().base_url.split('/');
        let urlRedirect:string = '';
        let arrayTemporario:any[] = [];


        if(array.length == 6){
            dominio = array[5].split('?');
        } else {
            dominio = array[4].split('?');
        }

        if(dominio[0] != "" && dominio[0] != "home" && dominio[0] != "index.html"){ 
                localStorage.setItem("erlangms_actualRoute_"+nomeSistema,dominio[0]);
        } 


        if(arrayUrl[3] == 'dados'){
            arrayUrl.splice(3,1);
            urlRedirect = arrayUrl[0]+"//"+arrayUrl[2];
        } else {
            urlRedirect = RedirectService.getInstance().base_url;
        }

        if(arrayUrl.length == 1){
            arrayTemporario = url.split('/');
            let host = arrayTemporario[2];
            let hostSemPorta = host.split(':');

            urlRedirect = arrayTemporario[0]+'//'+hostSemPorta[0];
        }

        if(RedirectService.getInstance().currentUser.token != '') {
            AuthInterceptor.headers = new HttpHeaders().set('content-type','application/json; charset=utf-8')
            .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
          


            if(copieReq != undefined) {
                if(copieReq.url != undefined) {
                    protocol = copieReq.url.split (':');
                }
            }
    
            if(protocol[0] == 'http' || protocol[0] == 'https') {         
    
            } else if(copieReq != undefined && RedirectService.getInstance().base_url){
                copieReq.url = urlRedirect + '' + copieReq.url;
            }
        } else if(RedirectService.getInstance().base_url) {
            if(copieReq != undefined) {
                if(copieReq.url != undefined) {
                    protocol = copieReq.url.split (':');
                }
            }
    
            if(protocol[0] == 'http' || protocol[0] == 'https') {
    
            } else if(copieReq != undefined && RedirectService.getInstance().base_url){
                copieReq.url = urlRedirect + '' + copieReq.url;
            }
    
        } 
        
        if(arrayTemporario.length > 1){
                copieReq.url = urlRedirect + '' + copieReq.url;
        } 

        if(copieReq != undefined){
            copieReq.headers = AuthInterceptor.headers;
        }

        return next.handle(copieReq.clone({url:copieReq.url}));
    }

} 