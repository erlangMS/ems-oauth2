import { Component, AfterContentInit } from '@angular/core';
import { AuthenticationService } from "../_services/authentication.service";

@Component({
  selector: 'app-navigation',
  templateUrl:'./navigation.component.html',
    styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements AfterContentInit {

  public name_user:any = '';
  public email_user:any = '';
  public name_system:any = '';

  constructor(public authenticationService: AuthenticationService) { }


  ngAfterContentInit() {
    let timeAccess = Date.now();
    let total = timeAccess - Number(this.authenticationService.currentUser.timer);
      if(this.authenticationService.currentUser.expires_in != undefined && this.authenticationService.currentUser.timer != ""){
          if(this.authenticationService.currentUser.expires_in != ''){
              if(total > this.authenticationService.currentUser.expires_in * 1000){
                this.authenticationService.logout();
              }
            }
      }
    }



  logout(){
    this.authenticationService.logout();
  }

  verificarUsuarioLogado(){
    if(this.authenticationService.currentUser.token != "" && this.authenticationService.currentUser.token != undefined){
      this.name_user = this.authenticationService.currentUser.resource_owner.name;
      this.email_user = this.authenticationService.currentUser.resource_owner.email;
      this.name_system = this.authenticationService.nomeDoSistema;
      return true;
    }else {
      return false;
    }
  }

}
