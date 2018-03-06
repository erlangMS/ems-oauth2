import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";

@Component({
  selector: 'app-navigation',
  template: `
  <!-- User Info -->
  <div class="user-info" *ngIf="verificarUsuarioLogado()">
    <div class="image">
      <img src="assets/images/user.png" width="48" height="48" alt="User" />
    </div>
    <div class="info-box bg-blue col-md-8">
        <!--<div class="icon">
            <i class="material-icons" id="ru-icon">refresh</i>
        </div>-->
        <div class="content m-l--20 m-t--5">
            <div class="text">
              TEMPO DE SESSÃO
            </div>
            <div class="number counter-to">
              {{this.authenticationService.textDate}}
            </div>
        </div>
      </div>
    <div class="info-container">
      <div class="name" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ name_user }}</div>
      <div class="email">email@unb.br</div>
      <div class="btn-group user-helper-dropdown">
        <i class="material-icons" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">keyboard_arrow_down</i>
        <ul class="dropdown-menu pull-right">
          <li>
            <a href="javascript:void(0);">
              <i class="material-icons">person</i>Profile
            </a>
          </li>
          <li role="seperator" class="divider"></li>
          <li>
            <a href="javascript:void(0);">
              <i class="material-icons">group</i>Followers
            </a>
          </li>
          <li>
            <a href="javascript:void(0);">
              <i class="material-icons">shopping_cart</i>Sales
            </a>
          </li>
          <li>
            <a href="javascript:void(0);">
              <i class="material-icons">favorite</i>Likes
            </a>
          </li>
          <li role="seperator" class="divider"></li>
          <li>
            <a href="javascript:void(0);" (click)="logout()">
              <i class="material-icons">input</i>Sign Out
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <!-- #User Info -->
  `,
styles: [
  `
    .logo {
      order: 1;
      flex: 1;
      align-self: flex-start;
      text-align: left;
      background: url(assets/img/logo-unb.gif) 10px center no-repeat transparent;
      height: 62px;
      margin: 0 auto;
    }
    .active > a,
    .active > a:hover,
    .active > a:focus {
      color: #FFFFFF;
      background: rgba(181, 176, 183, 0.57);
    }
    li > a:hover, li > a:focus {
      color: #FFFFFF;
    }
    .cor-branca {
      color: #FFFFFF;
    }
    .fundo{
      background-color: #003366;
    }
    .sistema {
      text-align: center;
      margin-left: 200px;
    }
    .login {
      order: 3;
      flex: 1 ;
      align-self: auto;
      text-align: center;
    }
    @media screen and (max-width : 765px) {
      .sistema {
          margin-left: 30px;
      }
    }
  `
  ]
})
export class NavigationComponent implements OnInit {

  private name_user:any = '';

  constructor(private authenticationService: AuthenticationService) { }


  ngOnInit() {

  }

  logout(){
    this.authenticationService.logout();
  }

  verificarUsuarioLogado(){
    if(AuthenticationService.currentUser.token != "" && AuthenticationService.currentUser.token != undefined){
      this.name_user = AuthenticationService.currentUser.resource_owner.name;
      return true;
    }else {
      return false;
    }
  }

}
