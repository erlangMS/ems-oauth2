
import {throwError as observableThrowError,  Observable } from 'rxjs';
import {  Response }   from '@angular/http';


export class ServiceUtil {

  // extrai lista da resposta http
  public extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

  // manipula erros da resposta http
  public handleError(error: Response | any):Observable<any> {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.message || JSON.stringify(body);
      errMsg = err;

    } else {
      errMsg = error.message != undefined ? error.message : error;
    }

    if(errMsg == "{\"isTrusted\":true}"){
      errMsg= "Servidor de Dados Indisponível Temporariamente.";
    }else if(errMsg == "{\"error\":\"eunavailable_service\"}"){
      errMsg= "Servidor de Dados Indisponível Temporariamente.";
    } else if( errMsg == "{\"error\": \"enoent_service_contract\"}"){
      return new Observable();
    }else if(errMsg == "{\"error\": \"einvalid_request\"}"){
      errMsg = "Requisição inválida."; 
    } else if(errMsg == "{\"error\": \"etimeout_service\"}"){
      errMsg = "Servidor de Dados Indisponível Temporariamente."
    }else if(errMsg == "{\"error\": \"access_denied\"}"){
      return new Observable();
    }  else {
      return observableThrowError(error);
    }
    
    return observableThrowError(errMsg);
  }



}
