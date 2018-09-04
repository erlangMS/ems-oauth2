import { EventEmitter, Injectable } from '@angular/core';



@Injectable()
export class EventEmitterService {

  public static emitters: {
    [nomeEvento:string]: EventEmitter<any>
  } = {};

  static get(nomeEvento:string): EventEmitter<any> {
    if(!this.emitters[nomeEvento]){
      this.emitters[nomeEvento] = new EventEmitter<any>();
    }
    return this.emitters[nomeEvento];
  }

  static contains(nomeEvento:string): boolean {
    if(!this.emitters[nomeEvento]){
      return false;
    }
    return true;
  }

  static dereleAll():void {
    this.emitters =  {};
  }

}
