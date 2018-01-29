import { Injectable, OnInit } from '@angular/core';
import { ResponseOptions, ResponseOptionsArgs  } from '@angular/http';
import {AuthenticationService} from "../_services/authentication.service";
import { CookieService } from '../_cookie/cookie.service';

@Injectable()
export class DefaultResponse extends ResponseOptions  implements OnInit {

    constructor(private cookieService: CookieService){
        super();
    }

    ngOnInit(){

    }

    merge(options?: ResponseOptionsArgs): ResponseOptions{
        let verify:any = undefined;
        if(options != undefined) {
            if(options.body != undefined) {
               verify =  options.body;
            }
        }

      if(verify == '{"error":"access_denied"}'){
            let url = window.location.href;
            let array = url.split ('/');
            let dominio = array[2].split(':');

            localStorage.removeItem('token');
            localStorage.removeItem("dateAccessPage");
            localStorage.removeItem('user');
            this.cookieService.setCookie("token",' ',3600,'/',dominio[0],false);
            this.cookieService.setCookie("dateAccessPage",' ',3600,'/',dominio[0],false);
            AuthenticationService.currentUser.token = '';
        }

        var result = super.merge(options);
        result.merge = this.merge;
        return result;
    }

}
