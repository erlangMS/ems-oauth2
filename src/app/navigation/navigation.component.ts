import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service";

@Component({
  selector: 'app-navigation',
  template: `
    <nav class="navbar navbar-inverse">
       <div class="fundo">
         <div>
            <div class="container">
                <div class="col-sm-8">
                  <div class="logo"></div>
                  <div class="sistema">
                  </div>
                </div>
                <div class="col-sm-2" *ngIf="verificarUsuarioLogado()">
                  <div class="login"> <h5 style="color: #FFFFFF;" class="login"> Seja bem vindo {{ name_user }} <br/>
                    <a class="cor-branca" (click)="logout()">Logout</a></h5> </div>
                </div>
                <div class="col-sm-2" *ngIf="verificarUsuarioLogado()">
                  <div class="login"><h5 class="cor-branca login">Tempo de sessão </h5></div>
                  <p class="cor-branca" style="text-align: center;">{{this.authenticationService.textDate}}</p>
                </div>
            </div>
         </div>
        </div>
     </nav> `,
  styles: [`
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
      }`]
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
    if(AuthenticationService.currentUser.token != ""){
      this.name_user = AuthenticationService.currentUser.resource_owner.name;
      return true;
    }else {
      return false;
    }
  }


}
