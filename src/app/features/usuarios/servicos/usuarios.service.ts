import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaPadrao } from '../../../core/modelos/perfil-usuario.model';
import { Usuario, RequisicaoCadastroUsuario, RequisicaoAtualizacaoUsuario } from '../modelos/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlApi}/usuarios`;
  private readonly authUrl = `${environment.urlApi}/auth`;

  /** Lista todos os usuários ativos (GESTOR ou ADMINISTRADOR) */
  listarTodos(): Observable<Usuario[]> {
    return this.http.get<RespostaPadrao<Usuario[]>>(this.baseUrl).pipe(
      map(r => r.dados)
    );
  }

  /** Cadastra novo usuário (ADMINISTRADOR apenas) */
  cadastrar(requisicao: RequisicaoCadastroUsuario): Observable<void> {
    return this.http.post<RespostaPadrao<void>>(`${this.authUrl}/cadastro`, requisicao).pipe(
      map(() => undefined)
    );
  }

  /** Atualiza nome, perfil e opcionalmente senha de um usuário (ADMINISTRADOR) */
  atualizar(id: number, requisicao: RequisicaoAtualizacaoUsuario): Observable<Usuario> {
    return this.http.put<RespostaPadrao<Usuario>>(`${this.baseUrl}/${id}`, requisicao).pipe(
      map(r => r.dados)
    );
  }

  /** Desativa um usuário — soft delete (ADMINISTRADOR) */
  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
