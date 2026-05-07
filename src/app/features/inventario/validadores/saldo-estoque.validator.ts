/**
 * @arquivo saldo-estoque.validator.ts
 * @descricao Validador assíncrono reutilizável que verifica saldo disponível antes do registro.
 * @padroes Factory Function, AsyncValidatorFn
 */

import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { SaldoEstoqueService } from '../servicos/saldo-estoque.service';

/**
 * Cria um validador assíncrono que verifica se o saldo do insumo é suficiente.
 * Requer que o FormGroup pai possua o campo 'insumoId' preenchido.
 */
export function validadorSaldoEstoque(
  servico: SaldoEstoqueService,
  obterInsumoId: () => number | null
): AsyncValidatorFn {
  return (controle: AbstractControl): Observable<ValidationErrors | null> => {
    const quantidade = controle.value;
    const insumoId = obterInsumoId();

    if (!quantidade || !insumoId || quantidade <= 0) {
      return of(null);
    }

    // Debounce para evitar chamadas excessivas durante digitação
    return timer(400).pipe(
      switchMap(() => servico.consultarSaldo(insumoId, quantidade)),
      map(saldo => {
        if (saldo.saldoSuficiente) return null;
        return { saldoInsuficiente: { disponivel: saldo.saldoDisponivel } };
      }),
      // Não punir o usuário por falha de rede
      catchError(() => of(null))
    );
  };
}
