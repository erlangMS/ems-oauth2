import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { AuthenticationService } from "../_services/authentication.service";

@Component({
  selector: 'app-navigation',
  template:
    `
    <!-- User Info -->
		<div class="user-info" *ngIf="verificarUsuarioLogado()">
      <div class="image">
        <img src="assets/images/user.jpeg" width="48" height="48" alt="User" />
      </div>
      <div class="backgroud-color-box info-box bg-blue-unb hover-expand-effect">
          <div class="icon">
              <i class="material-icons">access_time</i>
          </div>
          <div class="content">
              <div class="col-white text">TEMPO DE SESSÃO</div>
              <div class="align-center col-white text count-to" data-from="0" data-to="125" data-speed="1000" data-fresh-interval="20">{{this.authenticationService.textDate}}</div>
          </div>
      </div>
			<div class="info-container">
        <div class="name" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ name_user }}</div>
        <div class="email">{{ email_user }}</div>
        <div class="btn-group user-helper-dropdown">
            <i class="material-icons" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">keyboard_arrow_down</i>
            <ul class="dropdown-menu pull-right">
                <li><a href="javascript:void(0);"><i class="material-icons">person</i>Perfil</a></li>
                <li role="seperator" class="divider"></li>
                <li><a href="javascript:void(0);" (click)="logout()"><i class="material-icons">input</i>Sair</a></li>
            </ul>
        </div>
			</div>
		</div>
		<!-- #User Info -->
    `,
    styles: [
      `
        .backgroud-color-box {
          background-color: #003664;
        }
      `
  ]
})
export class NavigationComponent implements AfterContentInit {

  private name_user:any = '';
  private email_user:any = '';
  private name_system:any = '';

  constructor(private authenticationService: AuthenticationService) { }


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
