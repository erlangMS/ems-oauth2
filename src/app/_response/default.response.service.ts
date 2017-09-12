import { Injectable, OnInit } from '@angular/core';
import { ResponseOptions, ResponseOptionsArgs  } from '@angular/http';
import {AuthenticationService} from "../_services/authentication.service";

@Injectable()
export class DefaultResponse extends ResponseOptions  implements OnInit {

    constructor(){
        super();
    }

    ngOnInit(){

    }
    
    merge(options?: ResponseOptionsArgs): ResponseOptions{
        let verify = undefined;
        if(options != undefined) {
            if(options.body != undefined) {
               verify =  options.body;
            }
        }

      if(verify == '{"error":"access_denied"}'){
            localStorage.removeItem('token');
            localStorage.removeItem("dateAccessPage");
            localStorage.removeItem('user');
        }

        var result = super.merge(options);
        result.merge = this.merge;
        return result;
    }

}