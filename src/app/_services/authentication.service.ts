import { Injectable } from '@angular/core';
import { Http , Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from "@angular/router";
import 'rxjs/add/operator/map';
import {DefaultHeaders} from "../_headers/default.headers";


@Injectable()
export class AuthenticationService {

  public token: any;

  public time: number = 0;
  intervalId: any = null;

  static client_secret:string = "";


  public static port_server:string = '';

   public static currentUser:any = {
    token: '',
    login: '',
    authorization: '',
    time: '',
    password: ''
  }

  constructor(private http: Http, private route: Router) {
  
  }

  login(url:string, body:string,authorization:string): Observable<boolean> {
    return this.http.post(url,body)
      .map((response) => {
        let token =  response.json();
        if (token) {
          this.token = token;
          localStorage.setItem('currentUser', JSON.stringify(response.json()));
          this.periodicIncrement(3600);
          return true;
        } else {
          return false;
        }
      });
  }
    
    

  getUrlUser(arquivo:string):Observable<any> {
    let arquivoExterno = localStorage.getItem('externalFile');
    if(arquivoExterno){
      arquivo = arquivoExterno;
    }
    return this.http.get(arquivo)
      .map((res) => {
        var json = res.json();
          DefaultHeaders.port = json.port_client;
          DefaultHeaders.host = json.dns_server;
        return {url:json.find_user_client,client_id:json.client_id,client_secret:json.client_secret,grant_type:json.grant_type,
          url_redirect:json.url_redirect, port_client:json.port_client};
      });
  }

  getUrl(arquivo:string):Observable<any> {
    let arquivoExterno = localStorage.getItem('externalFile');
    if(arquivoExterno){
      arquivo = arquivoExterno;
    }
    return this.http.get(arquivo)
      .map((res) => {
          let json = res.json();

          let clientId = json.client_id;
          DefaultHeaders.port = json.port_client;
          DefaultHeaders.host = json.dns_server;
          let url = DefaultHeaders.host+''+DefaultHeaders.port+''+json.url_client+''+json.param_client+''+clientId+''+json.redirect_param+json.url_redirect;
          if(localStorage.getItem('client_id')){
              let parts = url.split('client_id=');
              let number = parts[1].split('&');
              url = parts[0]+'client_id='+localStorage.getItem('client_id')+'&'+number[1]+'&'+number[2];
          }
           let body = json.body_client;
          AuthenticationService.client_secret = json.client_secret;
          let authorization = json.authorization;
          let store = json.store;
          return {url:url,body:body,authorization:authorization,store:store};
      });
  }


    getClientCode(client:string):Observable<any>{
        let count:string[] = client.split("#");
        if(count.length > 1){
            client = count[0];
        }
        return this.http.get(DefaultHeaders.host+''+DefaultHeaders.port+'/auth/client?filter={"name":"'+client+'"}')
            .map((resposta) => {
                let json = resposta.json();
                localStorage.setItem('client_id',json[0].codigo);
                return {code:json[0].codigo}
            });

    }


  redirectUserTokenAccess(url:string, client_id:any, client_secret:string,code:string,grant_type:string,
                          redirect_uri:string):Observable<boolean> {

    var obj = {
      client_id:client_id,
      client_secret:client_secret,
      code:code,
      redirect_uri:redirect_uri,
      grant_type:grant_type
    }
    return this.http.post(DefaultHeaders.host+''+DefaultHeaders.port+''+url+'?grant_type='+grant_type+'&client_id='+client_id+'&client_secret='+client_secret+'&code='+code+'&redirect_uri='+redirect_uri, JSON.stringify(obj))
      .map((resposta) => {
        var resp = resposta.json();
        AuthenticationService.currentUser.token = resp.access_token;
        localStorage.setItem('token',AuthenticationService.currentUser.token);
        this.periodicIncrement(3600);
         let localDateTime = Date.now();
        localStorage.setItem("dateAccessPage",localDateTime.toString());
        return true;
      });
  }


  getUrlForDirectLogin(login:string, senha: string,arquivo:string) {
    let arquivoExterno = localStorage.getItem('externalFile');
    if(arquivoExterno){
      arquivo = arquivoExterno;
    }
    return this.http.get(arquivo)
      .map((res) => {
        var json = res.json();
        let url = json.url_user+''+json.login+''+login+''+json.password+''+senha;
        let body = json.body_user;
        let authorization = json.authorization;
        return {url:url,body:body,authorization:authorization};
      });
  }


  periodicIncrement(sessionTime:number): void {
    this.cancelPeriodicIncrement();
    if(localStorage.getItem('dateAccessPage')){
      let timeAccess = Date.now();
      sessionTime = 3600000 - (timeAccess - Number(localStorage.getItem("dateAccessPage")));
      sessionTime = sessionTime/1000;
    }
    this.time = sessionTime * 1000;
    this.intervalId = setInterval(() => {
      if(this.time == 0 || !localStorage.getItem('token')){
        this.logout();
      } else {
          this.time = this.time - 1000;
          return this.time;
      }
    }, 1000);

  };

  cancelPeriodicIncrement(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.time = 0;
    }
  };

  logout(): void {
    this.cancelPeriodicIncrement();
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem("dateAccessPage");
    localStorage.removeItem('user');
    AuthenticationService.currentUser = {
      token: '',
      login: '',
      authorization: '',
      time: '',
      password: ''
    }
    this.getUrl('/seguranca/url_security.json')
      .subscribe (resultado => {
        window.location.href = resultado.url;
      });
  }

    reset(): void {
        this.cancelPeriodicIncrement();
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem("dateAccessPage");
        localStorage.removeItem('user');
        AuthenticationService.currentUser = {
            token: '',
            login: '',
            authorization: '',
            time: '',
            password: ''
        }
    }

  findUser() {
    return this.http.post('/recurso','')
      .map((response) => {
        let resp = response.json();
        localStorage.setItem('user',resp.resource_owner);
      });
  }


}
