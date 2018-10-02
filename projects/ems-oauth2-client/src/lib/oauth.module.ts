import { NgModule } from '@angular/core';
import { HttpService } from './_http/http.service';
import { AuthenticationService } from './_services/authentication.service';
import { RedirectService } from './_redirect/redirect.service';
import { LoggerService } from './_logger/logger.service';
import { CookieService } from './_cookie/cookie.service';
import { NavigationComponent } from './navigation/navigation.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations:[NavigationComponent],
    imports: [
        BrowserModule,
        FormsModule
      ],
      exports: [
        NavigationComponent
      ],
    providers:[HttpService, AuthenticationService, RedirectService, LoggerService, CookieService]
})
export class OauthModule {

}