/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import {AuthenticationService} from "../authentication.service";
import {Headers ,HttpModule, XHRBackend, ResponseOptions, Http, BaseRequestOptions} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

describe('AuthenticationService', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                imports:[HttpModule],
                providers: [AuthenticationService, MockBackend, BaseRequestOptions,
                  { provide: XHRBackend, useClass: MockBackend },
                  {
                    provide: Http,
                    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                      return new Http(backend, defaultOptions);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                  }
                ]
         });

    }));

    it('AuthenticationService reset() need to reset all atributes in localStorage',
        inject([AuthenticationService], (service: AuthenticationService) => {
        localStorage.setItem('token',"12345");
        localStorage.setItem("dateAccessPage","3242342");
        localStorage.setItem('user',"geral");
        service.reset();
        let token = localStorage.getItem('token');
        let date = localStorage.getItem('dateAccessPage');
        let user = localStorage.getItem('user');
        expect(token).toBe(null);
        expect(date).toBe(null);
        expect(user).toBe(null);
    }));

    it('AuthenticationService getUrl() get url from barramento file',
        inject([AuthenticationService, XHRBackend], (service: AuthenticationService, mockBackend:any) => {
            let getUrl: string;
            const data: any = require('../../../questionario/barramento.json');

            mockBackend.connections.subscribe((connection:any) => {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: data
                })));
            });

            service.getUrl()
                .subscribe(resultado =>{
                     getUrl = resultado.url;
                    expect(getUrl).toBe("undefined?response_type=code&client_id=null&state=xyz%20&redirect_uri=/context.html/index.html/");
                });

        }));

    it('AuthenticationService getClientCode(client:string) get code of a database client',
        inject([AuthenticationService, XHRBackend], (service: AuthenticationService, mockBackend:any) => {
            let code: string;
            let headers: Headers  = new Headers({ 'content-type': 'application/json; charset=utf-8'});

            mockBackend.connections.subscribe((connection:any) => {
                connection.mockRespond(new Response(new ResponseOptions({
                    headers: headers,
                    body: JSON.stringify([{codigo:168}])
                })));
            });

            service.getClientCode('questionario')
                .subscribe((resultado) =>{
                    alert(resultado);
                    code = resultado.codigo;
                    expect(code).toBe(168);
                    expect(localStorage.getItem("client_id")).toBe(168);
                });
        }))

});
