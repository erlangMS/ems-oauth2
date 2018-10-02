import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import { RedirectService } from '../_redirect/redirect.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    static headers: HttpHeaders  = new HttpHeaders().set('content-type','application/json; charset=utf-8');

    public static keyHeader:string = '';
    public static valueHeader:string = '';

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

        if(arrayUrl[0] == "") {
            arrayUrl = localStorage.getItem(nomeSistema+'_url').split('/');
        }

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


        if(RedirectService.getInstance().currentUser.token != '') {
            if(AuthInterceptor.keyHeader == ''){
                AuthInterceptor.headers = new HttpHeaders().set('content-type','application/json; charset=utf-8')
                .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
            }else{
                AuthInterceptor.headers = new HttpHeaders().set(AuthInterceptor.keyHeader,AuthInterceptor.valueHeader)
                .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
            }

          


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
        

        if(copieReq != undefined){
            copieReq.headers = AuthInterceptor.headers;
        }

        return next.handle(copieReq.clone({url:copieReq.url}));
    }

} 