import {Injectable, OnInit, Optional} from '@angular/core';
import {Http, Headers, ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/timeout';
import { ServiceUtil } from '../_util/service.util';
import { RedirectService } from '../_redirect/redirect.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable ()
export class HttpService extends ServiceUtil implements OnInit {

    private dados:string = '/dados/';

    constructor(private http: HttpClient){
        super();
    }

    ngOnInit(){

    }


    get(url:string, @Optional() typeResponse:any = 'json',@Optional() observeResponse:any = 'body',@Optional() header:HttpHeaders = new HttpHeaders(),
         @Optional() responseType:ResponseContentType = ResponseContentType.Text):Observable<any>{
        if(responseType != ResponseContentType.Blob ){
            return this.http.get(this.criptografarUrl(url),{
                headers:header,
                observe:observeResponse,
                responseType: typeResponse
            })
            .catch(this.handleError)
            .publishReplay()
            .refCount();
        } else {
            return this.http.get(this.criptografarUrl(url),{
                responseType:'blob',
                observe:'response'        
            })
            .catch(this.handleError)
            .publishReplay()
            .refCount();
        }            
    } 

    post(url:string,body:string, @Optional() typeResponse:any = 'json',@Optional() observeResponse:any = 'body', 
        @Optional() header:HttpHeaders = new HttpHeaders()):Observable<any>{
        return this.http.post(this.criptografarUrl(url),body,{
            headers:header,
            observe:observeResponse,
            responseType: typeResponse
        })
        .catch(this.handleError)
        .publishReplay()
        .refCount(); 
    }

    put(url:string,body:string, @Optional() typeResponse:any = 'json',@Optional() observeResponse:any = 'body',
        @Optional() header:HttpHeaders = new HttpHeaders()):Observable<any>{
        return this.http.put(this.criptografarUrl(url),body,{
            headers:header,
            observe:observeResponse,
            responseType:typeResponse
        })
        .catch(this.handleError)
        .publishReplay()
        .refCount();  
    }

    delete(url:string, @Optional() typeResponse:any = 'json', @Optional() observeResponse:any = 'body', 
    @Optional() header:HttpHeaders = new HttpHeaders()):Observable<any>{
        return this.http.delete(this.criptografarUrl(url),{
            headers:header,
            observe:observeResponse,
            responseType:typeResponse
        })
        .catch(this.handleError)
        .publishReplay()
        .refCount();  
    }

    private criptografarUrl(url:string):string{

        let array = url.split ('/');
        let urlPart = '';
        let dominio = '';
        let i = 0;
        let protocol = url.split (':');

        
        if(RedirectService.getInstance().erlangmsUrlMask == "true"){
            if(protocol[0] == 'http' || protocol[0] == 'https'){
                dominio = array[0]+"//"+array[2];
            }

            if(array[1] == ""){
                i = 3;
            }else {
                i = 1;
            }

            if(array[3] == 'dados'){
                array.splice(3,1);
            } 

            for(; i< array.length-1; i++){
                urlPart+=array[i]+"/";
            }

            urlPart+=array[i];

            return dominio+"/erl.ms/"+btoa(this.dados+urlPart);   
        } else {
            if(protocol[0] == 'http' || protocol[0] == 'https'){
                dominio = array[0]+"//"+array[2];
            }

            if(array[1] == ""){
                i = 3;
            }else {
                i = 1;
            }

            if(array[3] == 'dados'){
                array.splice(3,1);
            }

            for(; i< array.length-1; i++){
                urlPart+=array[i]+"/";
            }

            urlPart+=array[i];
        
            return dominio+this.dados+urlPart
        }     
    }

   
}