import { Injectable } from '@angular/core';


@Injectable()
export class CookieService {

  constructor() {

  }

   getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = name + "=";
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s\+/g, "");
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return "";
  }

   setCookie(name: string, value: string, expireMilisecounds: number, path: string, domain: string, secure: boolean)  {
    let d:Date = new Date();
    d.setTime(d.getTime() + expireMilisecounds );
    let expires:string =  d.toUTCString();

     let cookirFormatado = name + "=" +value +";"+
       ( ( path ) ? " path=" + path+";" : "" ) +
       ( ( domain ) ? " domain=" + domain+"" : "" );
     
     document.cookie = cookirFormatado;
       
  }

}
