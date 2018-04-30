import { Injectable, OnInit, COMPILER_OPTIONS } from '@angular/core';
import { Headers, RequestOptions, RequestOptionsArgs  } from '@angular/http';
import { RedirectService } from '../_redirect/redirect.service';

@Injectable()
export class DefaultHeaders extends RequestOptions implements OnInit {

    static headers: Headers  = new Headers({ 'content-type': 'application/json; charset=utf-8'});
    public port: string = '';


    constructor() {
      super();
       
    }


    ngOnInit() {
      
    }

    merge(options?: RequestOptionsArgs): RequestOptions {
        let protocol:any[] = [''];
        let url = window.location.href;
        let array = url.split ('/');
        let dominio:any;
        let nomeSistema = array[3].split('#');
        let arrayUrl:any[] =  RedirectService.getInstance().base_url.split('/');
        let urlRedirect:string = '';


        if(array.length == 6){
            dominio = array[5].split('?');
        } else {
            dominio = array[4].split('?');
        }

        if(dominio[0] != "" && dominio[0] != "home" && dominio[0] != "index.html"){ 
                localStorage.setItem("erlangms_actualRoute_"+nomeSistema,dominio[0]);
        } 

        if(options != undefined){
                options.headers = DefaultHeaders.headers;
        }

        if(arrayUrl[3] == 'dados'){
            arrayUrl.splice(3,1);
            urlRedirect = arrayUrl[0]+"//"+arrayUrl[2];
        } else {
            urlRedirect = RedirectService.getInstance().base_url;
        }

        if(RedirectService.getInstance().currentUser.token != '') {
            DefaultHeaders.headers.delete('Authorization');
            DefaultHeaders.headers.append('Authorization', 'Bearer '+RedirectService.getInstance().currentUser.token);
            if(options != undefined) {
                if(options.url != undefined) {
                    protocol = options.url.split (':');
                }
            }
    
            if(protocol[0] == 'http' || protocol[0] == 'https') {         
    
            } else if(options != undefined && RedirectService.getInstance().base_url){
                options.url = urlRedirect + '' + options.url;
            }
        } else if(RedirectService.getInstance().base_url) {
            if(options != undefined) {
                if(options.url != undefined) {
                    protocol = options.url.split (':');
                }
            }
    
            if(protocol[0] == 'http' || protocol[0] == 'https') {
    
            } else if(options != undefined && RedirectService.getInstance().base_url){
                options.url = urlRedirect + '' + options.url;
            }
    
        } else {
          
        }
        
        var result = super.merge(options);
        result.merge = this.merge;
        return result;
    }

    private validateUrl(options:RequestOptionsArgs,protocol:any[],base_url:string):string{
        if(options != undefined) {
            if(options.url != undefined) {
                protocol = options.url.split (':');
            }
        }

        if(protocol[0] == 'http' || protocol[0] == 'https') {
            if(options != undefined) {
                if(options.url != undefined) {
                    return options.url;
                }
            }

        } else if(options != undefined){
            return base_url + '' + options.url;
        }

        return '';
    }

    setHeaders(name: string, value: string) {
      DefaultHeaders.headers.append(name, value);
    }

    removeHeader(name: string){
        DefaultHeaders.headers.delete(name);
    }
}
