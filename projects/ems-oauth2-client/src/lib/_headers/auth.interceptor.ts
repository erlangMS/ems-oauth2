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
       
        if(RedirectService.getInstance().currentUser.token != '') {
            if(AuthInterceptor.keyHeader == ''){
                AuthInterceptor.headers = new HttpHeaders().set('content-type','application/json; charset=utf-8')
                .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
            }else{
                AuthInterceptor.headers = new HttpHeaders().set(AuthInterceptor.keyHeader,AuthInterceptor.valueHeader)
                .append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
            }
        }

        copieReq.headers = AuthInterceptor.headers;
          
        return next.handle(copieReq.clone({url:copieReq.url}));
    }

} 