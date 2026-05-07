/**
 * @arquivo insumo.model.ts
 * @descricao Interfaces que representam os insumos e saldos de estoque conforme contratos da API.
 * @padroes Value Object
 */

export type UnidadeMedida = 'KG' | 'LITRO' | 'UNIDADE' | 'GRAMA' | 'MILILITRO';

export interface Insumo {
  id: number;
  nome: string;
  descricao: string;
  unidadeMedida: UnidadeMedida;
  saldoDisponivel: number;
  estoqueMinimo: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaldoEstoque {
  insumoId: number;
  nomeInsumo: string;
  unidadeMedida: UnidadeMedida;
  saldoDisponivel: number;
  estoqueMinimo: number;
  saldoSuficiente: boolean;
}

export interface RequisicaoCadastroInsumo {
  nome: string;
  descricao?: string;
  unidadeMedida: UnidadeMedida;
  saldoInicial: number;
  estoqueMinimo: number;
}

export interface RequisicaoAtualizacaoInsumo {
  nome: string;
  descricao?: string;
  unidadeMedida: UnidadeMedida;
  estoqueMinimo: number;
}

export interface RequisicaoEntradaEstoque {
  quantidade: number;
  observacao?: string;
}
