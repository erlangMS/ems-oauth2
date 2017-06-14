import { Injectable, OnInit } from '@angular/core';
import { Headers, RequestOptions, RequestOptionsArgs  } from '@angular/http';
import {AuthenticationService} from "../_services/authentication.service";

@Injectable()
export class DefaultHeaders extends RequestOptions implements OnInit {

    static headers: Headers  = new Headers({ 'content-type': 'application/json; charset=utf-8'});
    public static port: string = ''

    constructor() {
      super();

    }

    ngOnInit() {

    }

    merge(options?: RequestOptionsArgs): RequestOptions {
        options.headers = DefaultHeaders.headers;

      let loc  = window.location.href.split(':');
      var client_id = window.location.href.split('code=')[1];
      var name_api = loc[2].split('/');
      if(loc[0] == 'http') {
        DefaultHeaders.port = '2301';
      } else {
        DefaultHeaders.port = '2302';
      }

      if(localStorage.getItem('token')) {
          DefaultHeaders.headers.delete('Authorization');
          DefaultHeaders.headers.append('Authorization', 'Bearer '+localStorage.getItem ('token'));
          options.url = loc[0] + ':' + loc[1] + ':' + DefaultHeaders.port + '' + options.url;

      }

      var result = super.merge(options);
        result.merge = this.merge;
        return result;
      }

    setHeaders(name: string, value: string) {
      DefaultHeaders.headers.append(name, value);
    }
}


