import {Injectable, OnInit, Optional} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/catch';
import { DefaultHeaders } from '../_headers/default.headers';
import { AuthenticationService } from '../_services/authentication.service';
import { ServiceUtil } from '../_util/service.util';

@Injectable ()
export class HttpService extends ServiceUtil implements OnInit {

    constructor(private http: Http){
        super();
    }

    ngOnInit(){

    }


    get(url:string,@Optional() header:Headers = new Headers()):Observable<any>{
        return this.http.get(this.criptografarUrl(url), {headers:header})
        .catch(this.handleError)
        .publishReplay()
        .refCount();                 
    } 

    post(url:string,body:string, @Optional() header:Headers = new Headers()):Observable<any>{
        return this.http.post(this.criptografarUrl(url),body,{headers:header})
        .catch(this.handleError)
        .publishReplay()
        .refCount();  
    }

    put(url:string,body:string, @Optional() header:Headers = new Headers()):Observable<any>{
        return this.http.put(this.criptografarUrl(url),body,{headers:header})
        .catch(this.handleError)
        .publishReplay()
        .refCount();  
    }

    delete(url:string, @Optional() header:Headers = new Headers()):Observable<any>{
        return this.http.delete(this.criptografarUrl(url),{headers:header})
        .catch(this.handleError)
        .publishReplay()
        .refCount();  
    }

    private criptografarUrl(url:string):string{
        
        if(AuthenticationService.erlangmsUrlMask){
            let array = url.split ('/');
            let urlPart = '';
            let dominio = '';
            let i = 0;
            let protocol = url.split (':');

            if(protocol[0] == 'http' || protocol[0] == 'https'){
            dominio = array[0]+"//"+array[2];
            }

            if(array[1] == ""){
                i = 3;
            }else {
                i = 1;
            }

            for(; i< array.length-1; i++){
                urlPart+=array[i]+"/";
            }
            urlPart+=array[i];
        
            return dominio+"/erl.ms/"+btoa("/"+urlPart);   
        } else {
            return url;
        }     
    }

   
}