/**
 * @arquivo ordem-producao.model.ts
 * @descricao Interfaces de domínio para ordens de produção e lotes.
 * @padroes Value Object
 */

export type StatusOrdem = 'PENDENTE' | 'EM_ANDAMENTO' | 'PAUSADA' | 'CONCLUIDA' | 'CANCELADA';
export type StatusLote = 'ABERTO' | 'FECHADO' | 'CANCELADO';

export interface OrdemProducao {
  id: number;
  codigoOrdem: string;
  descricao: string;
  status: StatusOrdem;
  maquinaId: number | null;
  nomeMaquina: string | null;
  operadorId: number | null;
  loginOperador: string | null;
  quantidadePlanejada: number;
  quantidadeProduzida: number;
  iniciadoEm: string | null;
  finalizadoEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lote {
  id: number;
  numeroLote: string;
  ordemProducaoId: number;
  codigoOrdem: string;
  status: StatusLote;
  insumoId: number;
  nomeInsumo: string;
  quantidadeConsumida: number;
  registradoPorLogin: string;
  registradoEm: string;
}

export interface RequisicaoIniciarLote {
  operadorId: number;
}

export interface RequisicaoFinalizarLote {
  quantidadeProduzida: number;
}

export interface RequisicaoCriarOrdem {
  descricao: string;
  maquinaId: number;
  operadorId: number;
  quantidadePlanejada: number;
  codigoOrdem?: string;
}

export interface RequisicaoRegistroInsumo {
  insumoId: number;
  numeroLote: string;
  quantidadeConsumida: number;
}
