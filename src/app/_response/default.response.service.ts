import { Injectable, OnInit } from '@angular/core';
import { ResponseOptions, ResponseOptionsArgs  } from '@angular/http';
import { CookieService } from '../_cookie/cookie.service';
import { RedirectService } from '../../..';

@Injectable()
export class DefaultResponse extends ResponseOptions  implements OnInit {

    constructor(private cookieService: CookieService){
        super();
    }

    ngOnInit(){

    }

    merge(options?: ResponseOptionsArgs): ResponseOptions{
        let verify:any = undefined;
        let url = window.location.href;
        let array = url.split ('/');
        let nomeSistema:any = array[3].split('#');

        if(options != undefined) {
            if(options.body != undefined) {
               verify =  options.body;
            }
        }

      if(verify == '{"error":"access_denied"}'){
            let url = window.location.href;
            let array = url.split ('/');
            let dominio = array[2].split(':');
            localStorage.removeItem(nomeSistema);
            this.cookieService.setCookie("token",' ',3600,'/',dominio[0],false);
            this.cookieService.setCookie("dateAccessPage",' ',3600,'/',dominio[0],false);
            RedirectService.getInstance().logout();
        }

        var result = super.merge(options);
        result.merge = this.merge;
        return result;
    }

}
