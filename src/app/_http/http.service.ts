import {Injectable, OnInit, Optional} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import { DefaultHeaders } from '../_headers/default.headers';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable ()
export class HttpService implements OnInit {

    constructor(private http: Http){

    }

    ngOnInit(){

    }


    get(url:string,@Optional() header:string=''):Observable<any>{
        return this.http.get(url, header);                 
    } 

    post(url:string,body:string, @Optional() header:string=''):Observable<any>{
        return this.http.post(url,body,header);
    }

    put(url:string,body:string, @Optional() header:string=''):Observable<any>{
        return this.http.put(url,body,header);
    }

    delete(url:string, @Optional() header:string=''):Observable<any>{
        return this.http.delete(url,header);
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