import { NgModule } from '@angular/core';
import { HttpService } from './_http/http.service';
import { AuthenticationService } from './_services/authentication.service';
import { RedirectService } from './_redirect/redirect.service';
import { LoggerService } from './_logger/logger.service';
import { CookieService } from './_cookie/cookie.service';

@NgModule({
    providers:[HttpService, AuthenticationService, RedirectService, LoggerService, CookieService]
})
export class OauthModule {

}