import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy, RequestOptions, Http, ResponseOptions } from '@angular/http';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';


import { SecurityComponent } from './app.component';
import {AuthGuard} from "./_guards/auth.guard";
import {AuthenticationService} from "./_services/authentication.service";
import {UserService} from "./_services/user.service";
import {DefaultHeaders} from "./_headers/default.headers";
import {CookieService} from "./_cookie/cookie.service";
import {RedirectService} from "./_redirect/redirect.service";
import {DefaultResponse} from "./_response/default.response.service";
import { NavigationComponent } from './navigation/navigation.component';


@NgModule({
  declarations: [
    SecurityComponent,
    NavigationComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule
  ],
  providers: [AuthGuard, AuthenticationService,UserService, CookieService, RedirectService,
    {
      provide: XSRFStrategy,
      useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRF-Token')
    },
    {
      provide: RequestOptions,
      useClass: DefaultHeaders
    },
    {
      provide: ResponseOptions,
      useClass: DefaultResponse
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [SecurityComponent]
})
export class AppModule {

}
