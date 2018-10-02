import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy, RequestOptions,  ResponseOptions } from '@angular/http';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import { SecurityComponent } from './app.component';
import {AuthGuard} from "./_guards/auth.guard";
import {AuthenticationService} from "./_services/authentication.service";
import {CookieService} from "./_cookie/cookie.service";
import {RedirectService} from "./_redirect/redirect.service";
import { NavigationComponent } from './navigation/navigation.component';
import { LoggerService } from './_logger/logger.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './_headers/auth.interceptor';
import { ReponseInterceptor } from './_response/response.interceptor';
import { OauthModule } from './oauth.module';

@NgModule({
  bootstrap: [SecurityComponent],
  declarations: [
    SecurityComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    OauthModule
  ],
  providers: [AuthGuard, AuthenticationService,  CookieService, RedirectService,
    LoggerService,
    {
      provide: XSRFStrategy,
      useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRF-Token')
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ]
})
export class AppModule {

}
