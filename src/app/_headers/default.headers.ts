import { Injectable, OnInit } from '@angular/core';
import { Headers, RequestOptions, RequestOptionsArgs  } from '@angular/http';
import {AuthenticationService} from "../_services/authentication.service";

@Injectable()
export class DefaultHeaders extends RequestOptions implements OnInit {

    static headers: Headers  = new Headers({ 'content-type': 'application/json; charset=utf-8'});
    public static port: string = '';
    public static host: string = '';

    constructor() {
      super();

    }

    ngOnInit() {

    }

    merge(options?: RequestOptionsArgs): RequestOptions {
        let protocol:any[] = [''];
		if(options != undefined){
			options.headers = DefaultHeaders.headers;
        }

      if(localStorage.getItem('token')) {
          DefaultHeaders.headers.delete('Authorization');
          DefaultHeaders.headers.append('Authorization', 'Bearer '+localStorage.getItem ('token'));
          if(options != undefined) {
              if(options.url != undefined) {
                  protocol = options.url.split (':');
              }
          }
          if(protocol != undefined) {
              if (protocol[0] == 'http' || protocol[0] == 'https') {

              } else if (options != undefined && AuthenticationService.base_url == '') {
                  options.url = DefaultHeaders.host + '' + DefaultHeaders.port + '' + options.url;
              } else if (options != undefined) {
                  options.url = AuthenticationService.base_url + '' + options.url;
              }
          }
      }

      var result = super.merge(options);
        result.merge = this.merge;
        return result;
      }

    setHeaders(name: string, value: string) {
      DefaultHeaders.headers.append(name, value);
    }
}


