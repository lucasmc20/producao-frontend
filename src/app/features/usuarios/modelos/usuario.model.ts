export type PerfilAcesso = 'OPERADOR' | 'GESTOR' | 'ADMINISTRADOR';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfilAcesso: PerfilAcesso;
  ativo: boolean;
}

export interface RequisicaoCadastroUsuario {
  nome: string;
  login: string;
  senha: string;
  perfilAcesso: PerfilAcesso;
}

export interface RequisicaoAtualizacaoUsuario {
  nome: string;
  perfilAcesso: PerfilAcesso;
  novaSenha?: string;
}
