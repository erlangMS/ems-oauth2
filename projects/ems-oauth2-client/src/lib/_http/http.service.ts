import { Injectable, OnInit, Optional } from '@angular/core';
import { ResponseContentType } from '@angular/http';
import { catchError, publishReplay, refCount } from 'rxjs/operators';
import { RedirectService } from '../_redirect/redirect.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { Response } from '@angular/http';
import { AuthenticationService } from '../_services/authentication.service';


@Injectable()
export class HttpService implements OnInit {

    constructor(private http: HttpClient) {

    }

    ngOnInit() {

    }


    get(url: string, @Optional() typeResponse: any = 'json', @Optional() observeResponse: any = 'body', @Optional() header: HttpHeaders = new HttpHeaders(), @Optional() responseType: ResponseContentType = ResponseContentType.Text): Observable<any> {
        if (responseType != ResponseContentType.Blob) {
            return this.http.get(this.criptografarUrl(url), {
                headers: header,
                observe: observeResponse,
                responseType: typeResponse
            }).pipe(
                catchError(this.handleError),
                publishReplay(),
                refCount()
            );

        } else {
            return this.http.get(this.criptografarUrl(url), {
                responseType: 'blob',
                observe: 'response'
            }).pipe(
                catchError(this.handleError),
                publishReplay(),
                refCount()
            );
        }
    }

    post(url: string, body: string, @Optional() typeResponse: any = 'json', @Optional() observeResponse: any = 'body', @Optional() header: HttpHeaders = new HttpHeaders()): Observable<any> {
        return this.http.post(this.criptografarUrl(url), body, {
            headers: header,
            observe: observeResponse,
            responseType: typeResponse
        }).pipe(
            catchError(this.handleError),
            publishReplay(),
            refCount()
        );
    }

    put(url: string, body: string, @Optional() typeResponse: any = 'json', @Optional() observeResponse: any = 'body', @Optional() header: HttpHeaders = new HttpHeaders()): Observable<any> {
        return this.http.put(this.criptografarUrl(url), body, {
            headers: header,
            observe: observeResponse,
            responseType: typeResponse
        }).pipe(
            catchError(this.handleError),
            publishReplay(),
            refCount()
        );
    }

    delete(url: string, @Optional() typeResponse: any = 'json', @Optional() observeResponse: any = 'body', @Optional() header: HttpHeaders = new HttpHeaders()): Observable<any> {
        return this.http.delete(this.criptografarUrl(url), {
            headers: header,
            observe: observeResponse,
            responseType: typeResponse
        }).pipe(
            catchError(this.handleError),
            publishReplay(),
            refCount()
        );
    }

    private criptografarUrl(url: string): string {
        if (RedirectService.getInstance().erlangmsUrlMask == true) {
            return "/erl.ms/" + btoa(AuthenticationService.base_url_temp + url);
        } else {
            return AuthenticationService.base_url_temp + url;
        }
    }

    // extrai lista da resposta http
    public extractData(res: Response) {
        let body = res.json();
        return body.data || {};
    }

    // manipula erros da resposta http
    public handleError(error: Response | any): Observable<any> {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.message || JSON.stringify(body);
            errMsg = err;

        } else {
            errMsg = error.message != undefined ? error.message : error;
        }

        if (errMsg == "{\"isTrusted\":true}") {
            errMsg = "Servidor de Dados Indisponível Temporariamente.";
        } else if (errMsg == "{\"error\":\"eunavailable_service\"}") {
            errMsg = "Servidor de Dados Indisponível Temporariamente.";
        } else if (errMsg == "{\"error\": \"enoent_service_contract\"}") {
            return new Observable();
        } else if (errMsg == "{\"error\": \"einvalid_request\"}") {
            errMsg = "Requisição inválida.";
        } else if (errMsg == "{\"error\": \"etimeout_service\"}") {
            errMsg = "Servidor de Dados Indisponível Temporariamente."
        } else if (errMsg == "{\"error\": \"access_denied\"}") {
            return new Observable();
        }

        return throwError(errMsg);
    }


}