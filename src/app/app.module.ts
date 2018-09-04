import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SecurityComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { OauthModule } from './oauth.module';


@NgModule({
  bootstrap: [SecurityComponent],
  declarations: [
    SecurityComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    OauthModule
  ],
  providers: []
})
export class AppModule {

}
