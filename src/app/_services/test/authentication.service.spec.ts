/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import {AuthenticationService} from "../authentication.service";
import {HttpModule} from '@angular/http';

describe('AuthenticationService', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                imports:[HttpModule],
                providers: [AuthenticationService]
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

    it('AuthenticationService getUrl(arquivo:string) get url from config.json file',
        inject([AuthenticationService], (service: AuthenticationService) => {
            let getUrl: string;

            service.getUrl(' C:/desenvolvimento/nova_arquitetura/oauth2-client/src/app/_services/test/config.json')
                .subscribe(resultado =>{
                    let json = resultado.json();
                     getUrl = json.url;
                    expect(getUrl).toBe(null);
                });

        }));

});
