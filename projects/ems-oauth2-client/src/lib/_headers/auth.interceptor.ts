import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import { RedirectService } from '../_redirect/redirect.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    static headers: HttpHeaders  = new HttpHeaders().set('content-type','application/json; charset=utf-8');
    public static keyHeader:string = '';
    public static valueHeader:string = '';

    private copieReq:any;
    private protocol:any[] = [''];
    private dominio:any;
    private nomeSistema;
    private arrayUrl:any[];
    private urlInstance: any;
    private urlRedirect:string = '';

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.copieReq = req.clone();
        this.nomeSistema = this.getArrayUrl()[3].split('#');
        this.arrayUrl =  RedirectService.getInstance().base_url.split('/');
        this.urlInstance = RedirectService.getInstance().base_url;

        this.verifyIfStartInAnotherPage();
        this.verifySizeUrl();
        this.VerifyIfHasAnotherRoute();
        this.addDadosInUrl();

        if(RedirectService.getInstance().currentUser.token != '') { 
            this.insertAuthenticationTokenInHeader();
            this.separeteProtocol();
            this.verifyIfHttpOrHttps();
        } else if(this.urlInstance) {
            this.separeteProtocol();
            this.verifyIfHttpOrHttps();
        } 
    
        this.verifyIfCopyUrlChanges();

        return next.handle(this.copieReq.clone({url:this.copieReq.url}));
    }

    private getArrayUrl() {
        let url = window.location.href;
        return url.split ('/');
    }

    private verifyIfStartInAnotherPage(){
        if(this.arrayUrl[0] == "") {
            if(localStorage.getItem(this.nomeSistema + '_url') != null){
                var dados:any = localStorage.getItem(this.nomeSistema + '_url'); 
                this.arrayUrl = dados.split('/');
                this.urlInstance = dados;
            }      
        }
    }

    private verifySizeUrl(){
        if(this.getArrayUrl().length == 6){
            this.dominio = this.getArrayUrl()[5].split('?');
        } else {
            this.dominio = this.getArrayUrl()[4].split('?');
        }
    }

    private VerifyIfHasAnotherRoute(){
        if(this.dominio[0] != "" && this.dominio[0] != "home" && this.dominio[0] != "index.html"){ 
            localStorage.setItem("erlangms_actualRoute_"+this.nomeSistema,this.dominio[0]);
        } 

    }

    private addDadosInUrl(){
        if(this.arrayUrl[3] == 'dados'){
            this.arrayUrl.splice(3,1);
            this.urlRedirect = this.arrayUrl[0]+"//"+this.arrayUrl[2];
        } else {
            this.urlRedirect = this.urlInstance;
        }
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

    private separeteProtocol(){
        if(this.copieReq != undefined) {
            if(this.copieReq.url != undefined) {
                this.protocol = this.copieReq.url.split (':');
            }
        }
    }

    private verifyIfHttpOrHttps(){
        if(this.protocol[0] == 'http' || this.protocol[0] == 'https') {         
    
        } else if(this.copieReq != undefined && this.urlInstance){
            this.copieReq.url = this.urlRedirect + '' + this.copieReq.url;
        }
    }

    private verifyIfCopyUrlChanges() {
        if(this.copieReq != undefined){
           this. copieReq.headers = AuthInterceptor.headers;
        }
    }

} 