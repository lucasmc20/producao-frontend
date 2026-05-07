/**
 * @arquivo autenticacao.service.ts
 * @descricao Serviço responsável pela autenticação JWT e gerenciamento da sessão do usuário.
 * @padroes Repository Pattern (abstrai chamadas HTTP), Singleton (providedIn root)
 */

import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PerfilAcesso, PerfilUsuario, RequisicaoLogin, RespostaPadrao } from '../../modelos/perfil-usuario.model';

const CHAVE_STORAGE = 'producao_auth';

@Injectable({ providedIn: 'root' })
export class AutenticacaoService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly usuarioLogado = signal<PerfilUsuario | null>(this.recuperarSessao());

  readonly usuario = this.usuarioLogado.asReadonly();

  readonly estaAutenticado = computed(() => {
    const u = this.usuarioLogado();
    if (!u) return false;
    return Date.now() < u.expiracaoMs;
  });

  readonly perfilAtual = computed(() => this.usuarioLogado()?.perfil ?? null);

  /** Realiza login e persiste sessão no localStorage */
  autenticar(credenciais: RequisicaoLogin): Observable<RespostaPadrao<PerfilUsuario>> {
    return this.http.post<RespostaPadrao<PerfilUsuario>>(
      `${environment.urlApi}/auth/login`,
      credenciais
    ).pipe(
      tap(resposta => {
        const perfil = resposta.dados;
        const perfilComExpiracao: PerfilUsuario = {
          ...perfil,
          expiracaoMs: Date.now() + perfil.expiracaoMs,
        };
        this.usuarioLogado.set(perfilComExpiracao);
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(perfilComExpiracao));
      })
    );
  }

  /** Retorna o token JWT armazenado ou null */
  obterToken(): string | null {
    return this.usuarioLogado()?.token ?? null;
  }

  /** Retorna o perfil de acesso do usuário corrente */
  obterPerfilUsuario(): PerfilAcesso | null {
    return this.perfilAtual();
  }

  /** Encerra a sessão e redireciona para login */
  encerrarSessao(): void {
    this.usuarioLogado.set(null);
    localStorage.removeItem(CHAVE_STORAGE);
    this.router.navigate(['/login']);
  }

  private recuperarSessao(): PerfilUsuario | null {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    if (!dados) return null;

    try {
      const perfil: PerfilUsuario = JSON.parse(dados);
      if (Date.now() >= perfil.expiracaoMs) {
        localStorage.removeItem(CHAVE_STORAGE);
        return null;
      }
      return perfil;
    } catch {
      localStorage.removeItem(CHAVE_STORAGE);
      return null;
    }
  }
}
