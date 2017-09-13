/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import {AuthenticationService} from "../authentication.service";
import {HttpModule, XHRBackend, ResponseOptions} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('AuthenticationService', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                imports:[HttpModule],
                providers: [AuthenticationService,
                    { provide: XHRBackend, useClass: MockBackend },
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
        inject([AuthenticationService, XHRBackend], (service: AuthenticationService, mockBackend:XHRBackend) => {
            let getUrl: string;
            const data: any = require('../../../questionario/barramento.json');

            mockBackend.connections.subscribe((connection) => {
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
        inject([AuthenticationService, XHRBackend], (service: AuthenticationService, mockBackend:XHRBackend) => {
            let code: string;

            mockBackend.connections.subscribe((connection) => {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: [{codigo:168}]
                })));
            });
            service.getClientCode('questionario')
                .subscribe(resultado =>{
                    alert(resultado);
                    code = resultado.codigo;
                    expect(code).toBe(168);
                    expect(localStorage.getItem("client_id")).toBe(168);
                });
        }));

});
