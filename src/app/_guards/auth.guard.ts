import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';


@Injectable()
export class AuthGuard implements CanActivate {

  public static hasAccess:Array<string> = new Array<string>();

  constructor() { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if( AuthGuard.hasAccess.indexOf(route.data['nome']) != -1) {
      return true;
    }else {
      return false;
    }
  }
}
