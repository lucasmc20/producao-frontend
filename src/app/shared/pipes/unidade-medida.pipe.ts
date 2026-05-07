/**
 * @arquivo unidade-medida.pipe.ts
 * @descricao Pipe que converte o enum UnidadeMedida em label legível para o operador.
 * @padroes Standalone Pipe
 */

import { Pipe, PipeTransform } from '@angular/core';

const LABELS_UNIDADE: Record<string, string> = {
  KG: 'kg',
  LITRO: 'L',
  UNIDADE: 'un',
  GRAMA: 'g',
  MILILITRO: 'mL',
};

@Pipe({
  name: 'unidadeMedida',
  standalone: true,
})
export class UnidadeMedidaPipe implements PipeTransform {

  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    return LABELS_UNIDADE[valor] ?? valor;
  }
}
