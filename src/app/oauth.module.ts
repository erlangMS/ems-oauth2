import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NavigationComponent } from './navigation/navigation.component';
import { AuthGuard } from './_guards/auth.guard';
import { AuthenticationService } from './_services/authentication.service';
import { CookieService } from './_cookie/cookie.service';
import { RedirectService } from './_redirect/redirect.service';
import { LoggerService } from './_logger/logger.service';
import { HttpService } from './_http/http.service';


@NgModule({
  declarations: [
    NavigationComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule
  ],
  providers: [AuthGuard, AuthenticationService,  CookieService, RedirectService,
    LoggerService, HttpService,
    {
      provide: XSRFStrategy,
      useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRF-Token')
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  exports:[ NavigationComponent ]
})
export class OauthModule {

}