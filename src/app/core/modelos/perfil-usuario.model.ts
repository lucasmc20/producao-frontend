/**
 * @arquivo perfil-usuario.model.ts
 * @descricao Tipagens centrais de autenticação e perfil de acesso do usuário.
 * @padroes Value Object
 */

export type PerfilAcesso = 'OPERADOR' | 'GESTOR' | 'ADMINISTRADOR';

export interface PerfilUsuario {
  id: number;
  token: string;
  login: string;
  nome: string;
  perfil: PerfilAcesso;
  expiracaoMs: number;
}

export interface RequisicaoLogin {
  login: string;
  senha: string;
}

export interface RespostaPadrao<T> {
  sucesso: boolean;
  dados: T;
  mensagem: string | null;
}
