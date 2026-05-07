/**
 * @arquivo formato-lote.pipe.ts
 * @descricao Pipe que formata o número do lote para exibição padronizada (ex: LT-0042).
 * @padroes Standalone Pipe
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoLote',
  standalone: true,
})
export class FormatoLotePipe implements PipeTransform {

  transform(valor: string | null | undefined): string {
    if (!valor) return '—';

    // Se já possui prefixo, apenas retorna em uppercase
    if (valor.toUpperCase().startsWith('LT-')) {
      return valor.toUpperCase();
    }

    // Extrai dígitos e formata com padding
    const digitos = valor.replace(/\D/g, '');
    if (!digitos) return valor;

    return `LT-${digitos.padStart(4, '0')}`;
  }
}
