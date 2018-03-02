import {Injectable, OnInit, Optional} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import { DefaultHeaders } from '../_headers/default.headers';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable ()
export class HttpService implements OnInit {

    constructor(private http: Http){

    }

    ngOnInit(){

    }


    get(url:string,@Optional() header:string=''):Observable<any>{
        return this.http.get(this.criptografarUrl(url), header)
        .catch((e:any) => {
            return Observable.throw(
              new Error(`${ e.status } ${ e.statusText }`)
            );
        })
        .publishReplay()
        .refCount();                 
    } 

    post(url:string,body:string, @Optional() header:string=''):Observable<any>{
        return this.http.post(this.criptografarUrl(url),body,header)
        .catch((e:any) => {
            return Observable.throw(
              new Error(`${ e.status } ${ e.statusText }`)
            );
        })
        .publishReplay()
        .refCount();  
    }

    put(url:string,body:string, @Optional() header:string=''):Observable<any>{
        return this.http.put(this.criptografarUrl(url),body,header)
        .catch((e:any) => {
            return Observable.throw(
              new Error(`${ e.status } ${ e.statusText }`)
            );
        })
        .publishReplay()
        .refCount();  
    }

    delete(url:string, @Optional() header:string=''):Observable<any>{
        return this.http.delete(this.criptografarUrl(url),header)
        .catch((e:any) => {
            return Observable.throw(
              new Error(`${ e.status } ${ e.statusText }`)
            );
        })
        .publishReplay()
        .refCount();  
    }

    private criptografarUrl(url:string):string{
        let array = url.split ('/');
        let urlPart = '';
        let dominio = '';
        let i = 0;

        if(array[0] == 'http' || array[0] == 'https'){
           dominio = array[0]+"://"+array[2];
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
    }

   
}