import { Injectable, OnInit } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs';

import {map} from 'rxjs/operators';


@Injectable()
export class LoggerService implements OnInit{

  private token:string = '';

  constructor( private http: Http){
  }

  ngOnInit() {
  }

  getTokenLogger(){
    return this.http.post('/authorize?grant_type=client_credentials&client_id='+localStorage.getItem("client_id")+'&client_secret=CPD','')
    .pipe(
      map(result => {
        let getAccess = result.json();
        this.token = getAccess['access_token'];
      })
    )
  }

  sendLogger(type:string,content:string):Observable<any>{
    return this.http.post('/logger/print/'+type+'?token='+this.token,content)
    .pipe(
      map(result =>{

      })
    )
  }

}
