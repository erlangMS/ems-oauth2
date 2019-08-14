import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs'

export class ServiceUtil {

 // extrai lista da resposta http
 public extractData(res: Response) {
  let body = res.json();
  return body || { };
}

// manipula erros da resposta http
public handleError(err: HttpErrorResponse | any):Observable<any> {
  let errMsg: string;
  if(err.messagem) {
    errMsg = err.messagem;
  }else if(err.status == 404) {
    errMsg = "Servidor de dados indisponível. Tente mais tarde";
  } else if (err.status == 401) {
    errMsg = "Acesso negado para a funcionalidade requisitada";
  } else if (err.status == 400) {
    errMsg = "Solicitação inválida. Tente mais tarde";
  } else if (err.status == 500) {
    errMsg = "Erro interno do servidor. Tente mais tarde";
  } else {
    errMsg = "Erro indeterminado. Consulte o administrador do sistema"
  }

  return  throwError(errMsg);
}

removeNull(key, value) {
  // Filtering out properties
  if (value === null) {
    return undefined;
  }
  return value;
}



}
