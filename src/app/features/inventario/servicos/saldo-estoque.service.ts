/**
 * @arquivo saldo-estoque.service.ts
 * @descricao Serviço que abstrai consultas de saldo de insumos no estoque.
 * @padroes Repository Pattern, Singleton
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaPadrao } from '../../../core/modelos/perfil-usuario.model';
import { Insumo, SaldoEstoque, RequisicaoCadastroInsumo, RequisicaoAtualizacaoInsumo, RequisicaoEntradaEstoque } from '../modelos/insumo.model';

@Injectable({ providedIn: 'root' })
export class SaldoEstoqueService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlApi}/insumos`;

  /** Lista todos os insumos disponíveis */
  listarTodos(): Observable<Insumo[]> {
    return this.http.get<RespostaPadrao<Insumo[]>>(this.baseUrl).pipe(
      map(r => r.dados)
    );
  }

  /** Busca insumo por ID */
  buscarPorId(id: number): Observable<Insumo> {
    return this.http.get<RespostaPadrao<Insumo>>(`${this.baseUrl}/${id}`).pipe(
      map(r => r.dados)
    );
  }

  /** Consulta saldo disponível de um insumo para a quantidade informada */
  consultarSaldo(insumoId: number, quantidade: number): Observable<SaldoEstoque> {
    const params = new HttpParams().set('quantidade', quantidade.toString());
    return this.http.get<RespostaPadrao<SaldoEstoque>>(
      `${this.baseUrl}/${insumoId}/saldo`,
      { params }
    ).pipe(
      map(r => r.dados)
    );
  }

  /** Cadastra um novo insumo */
  cadastrar(req: RequisicaoCadastroInsumo): Observable<Insumo> {
    return this.http.post<RespostaPadrao<Insumo>>(this.baseUrl, req).pipe(
      map(r => r.dados)
    );
  }

  /** Registra entrada de estoque (soma ao saldo disponível) */
  registrarEntrada(insumoId: number, req: RequisicaoEntradaEstoque): Observable<Insumo> {
    return this.http.patch<RespostaPadrao<Insumo>>(
      `${this.baseUrl}/${insumoId}/entrada`, req
    ).pipe(map(r => r.dados));
  }

  /** Atualiza dados cadastrais de um insumo */
  atualizar(insumoId: number, req: RequisicaoAtualizacaoInsumo): Observable<Insumo> {
    return this.http.put<RespostaPadrao<Insumo>>(`${this.baseUrl}/${insumoId}`, req)
      .pipe(map(r => r.dados));
  }

  /** Remove um insumo */
  remover(insumoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${insumoId}`);
  }
}
