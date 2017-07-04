import { Component, OnInit } from '@angular/core';
import {RedirectService} from "./_redirect/redirect.service";
import {AuthenticationService} from "./_services/authentication.service";

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html'
})
export class SecurityComponent implements OnInit {

  constructor(private redirectService: RedirectService, private authenticationService:AuthenticationService){

  }

  ngOnInit() {
    this.authenticationService.getUrlFromBarramento()
        .subscribe(result =>{
          this.redirectService.startInitVerifySessionToken();
            
        },
        error => {
          this.redirectService.startInitVerifySessionToken();
        })


  }


}
