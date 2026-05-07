/**
 * @arquivo ordens-producao.service.ts
 * @descricao Serviço que abstrai operações HTTP sobre ordens de produção e lotes.
 * @padroes Repository Pattern, Singleton
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaPadrao } from '../../../core/modelos/perfil-usuario.model';
import {
  OrdemProducao,
  StatusOrdem,
  Lote,
  RequisicaoIniciarLote,
  RequisicaoFinalizarLote,
  RequisicaoCriarOrdem,
  RequisicaoRegistroInsumo,
} from '../modelos/ordem-producao.model';

@Injectable({ providedIn: 'root' })
export class OrdensProducaoService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlApi}/orders`;

  /** Lista todas as ordens, opcionalmente filtrando por status */
  listarTodas(status?: StatusOrdem): Observable<OrdemProducao[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<RespostaPadrao<OrdemProducao[]>>(this.baseUrl, { params }).pipe(
      map(r => r.dados)
    );
  }

  /** Busca uma ordem por ID */
  buscarPorId(id: number): Observable<OrdemProducao> {
    return this.http.get<RespostaPadrao<OrdemProducao>>(`${this.baseUrl}/${id}`).pipe(
      map(r => r.dados)
    );
  }

  /** Inicia o lote de uma ordem */
  iniciarLote(ordemId: number, requisicao: RequisicaoIniciarLote): Observable<OrdemProducao> {
    return this.http.patch<RespostaPadrao<OrdemProducao>>(
      `${this.baseUrl}/${ordemId}/iniciar`,
      requisicao
    ).pipe(map(r => r.dados));
  }

  /** Finaliza o lote de uma ordem */
  finalizarLote(ordemId: number, requisicao: RequisicaoFinalizarLote): Observable<OrdemProducao> {
    return this.http.patch<RespostaPadrao<OrdemProducao>>(
      `${this.baseUrl}/${ordemId}/finalizar`,
      requisicao
    ).pipe(map(r => r.dados));
  }

  /** Cancela uma ordem (apenas admin) */
  cancelar(ordemId: number): Observable<OrdemProducao> {
    return this.http.delete<RespostaPadrao<OrdemProducao>>(`${this.baseUrl}/${ordemId}`).pipe(
      map(r => r.dados)
    );
  }

  /** Lista lotes de uma ordem */
  listarLotes(ordemId: number): Observable<Lote[]> {
    return this.http.get<RespostaPadrao<Lote[]>>(`${this.baseUrl}/${ordemId}/lots`).pipe(
      map(r => r.dados)
    );
  }

  /** Registra consumo de insumo em um lote */
  registrarConsumo(ordemId: number, requisicao: RequisicaoRegistroInsumo): Observable<Lote> {
    return this.http.post<RespostaPadrao<Lote>>(
      `${this.baseUrl}/${ordemId}/lots`,
      requisicao
    ).pipe(map(r => r.dados));
  }

  /** Cria uma nova ordem de produção (GESTOR ou ADMINISTRADOR) */
  criarOrdem(requisicao: RequisicaoCriarOrdem): Observable<OrdemProducao> {
    return this.http.post<RespostaPadrao<OrdemProducao>>(this.baseUrl, requisicao).pipe(
      map(r => r.dados)
    );
  }

  /** Fecha um lote específico de uma ordem */
  fecharLote(ordemId: number, loteId: number): Observable<Lote> {
    return this.http.patch<RespostaPadrao<Lote>>(
      `${this.baseUrl}/${ordemId}/lots/${loteId}/fechar`,
      {}
    ).pipe(map(r => r.dados));
  }
}
