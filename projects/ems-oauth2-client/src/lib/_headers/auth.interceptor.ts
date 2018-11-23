import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import { RedirectService } from '../_redirect/redirect.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    static headers: HttpHeaders  = new HttpHeaders().set('content-type','application/json; charset=utf-8');
    public static keyHeader:string = '';
    public static valueHeader:string = '';


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let copieReq:any = req.clone();
        let protocol:any[] = [''];
        let dominio:any;
        let nomeSistema = this.getArrayUrl()[3].split('#');
        let arrayUrl:any[] =  RedirectService.getInstance().base_url.split('/');
        let urlInstance: any = RedirectService.getInstance().base_url;
        let urlRedirect:string = '';
        let resultObject:any = {};

        resultObject = this.verifyIfStartInAnotherPage(arrayUrl, nomeSistema, urlInstance);
        arrayUrl = resultObject.arrayUrl;
        urlInstance = resultObject.urlInstance;

        resultObject = this.verifySizeUrl(dominio);
        dominio = resultObject.dominio;

        this.VerifyIfHasAnotherRoute(dominio, nomeSistema);
        
        resultObject = this.addDadosInUrl(arrayUrl, urlRedirect, urlInstance);
        urlRedirect = resultObject.urlRedirect;

        if(RedirectService.getInstance().currentUser.token != '') { 
            this.insertAuthenticationTokenInHeader();
            resultObject = this.separeteProtocol(copieReq, protocol);
            protocol = resultObject.protocol;

            resultObject = this.verifyIfHttpOrHttps(protocol, copieReq, urlInstance, urlRedirect);
            copieReq = resultObject.copieReq;
        } else if(urlInstance) {
            resultObject = this.separeteProtocol(copieReq, protocol);
            protocol = resultObject.protocol;

            resultObject = this.verifyIfHttpOrHttps(protocol, copieReq, urlInstance, urlRedirect);
            copieReq = resultObject.copieReq;
        } 
    
       resultObject = this.verifyIfCopyUrlChanges(copieReq);
       copieReq = resultObject.copieReq;

        return next.handle(copieReq.clone({url:copieReq.url}));
    }

    private getArrayUrl() {
        let url = window.location.href;
        return url.split ('/');
    }

    private verifyIfStartInAnotherPage(arrayUrl:any, nomeSistema: any, urlInstance: any){
        if(arrayUrl[0] == "") {
            if(localStorage.getItem(nomeSistema + '_url') != null){
                var dados:any = localStorage.getItem(nomeSistema + '_url'); 
                arrayUrl = dados.split('/');
                urlInstance = dados;
            }      
        }

        return {arrayUrl: arrayUrl, urlInstance: urlInstance}
    }

    private verifySizeUrl(dominio: any){
        if(this.getArrayUrl().length == 6){
            dominio = this.getArrayUrl()[5].split('?');
        } else {
            dominio = this.getArrayUrl()[4].split('?');
        }

        return {dominio: dominio}
    }

    private VerifyIfHasAnotherRoute(dominio: any, nomeSistema:any){
        if(dominio[0] != "" && dominio[0] != "home" && dominio[0] != "index.html"){ 
            localStorage.setItem("erlangms_actualRoute_"+nomeSistema,dominio[0]);
        } 

    }

    private addDadosInUrl(arrayUrl: any, urlRedirect: any, urlInstance: any){
        if(arrayUrl[3] == 'dados'){
            arrayUrl.splice(3,1);
            urlRedirect = arrayUrl[0]+"//"+arrayUrl[2];
        } else {
            urlRedirect = urlInstance;
        }

        return {urlRedirect: urlRedirect}
    }

    private insertAuthenticationTokenInHeader(){
        if(AuthInterceptor.keyHeader == ''){
            AuthInterceptor.headers = new HttpHeaders().set('content-type','application/json; charset=utf-8')
            .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
        }else{
            AuthInterceptor.headers = new HttpHeaders().set(AuthInterceptor.keyHeader,AuthInterceptor.valueHeader)
            .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
        }
    }

    private separeteProtocol(copieReq: any, protocol: any){
        if(copieReq != undefined) {
            if(copieReq.url != undefined) {
                protocol = copieReq.url.split (':');
            }
        }

        return {protocol: protocol}
    }

    private verifyIfHttpOrHttps(protocol: any, copieReq: any, urlInstance: any, urlRedirect: any){
        if(protocol[0] == 'http' || protocol[0] == 'https') {         
    
        } else if(copieReq != undefined && urlInstance){
            copieReq.url = urlRedirect + '' + copieReq.url;
        }

        return {copieReq: copieReq}
    }

    private verifyIfCopyUrlChanges(copieReq: any) {
        if(copieReq != undefined){
            copieReq.headers = AuthInterceptor.headers;
        }
        return {copieReq: copieReq}
    }

} 