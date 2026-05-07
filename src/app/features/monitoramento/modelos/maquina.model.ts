/**
 * @arquivo maquina.model.ts
 * @descricao Interfaces que representam máquinas e eventos de telemetria.
 * @padroes Value Object
 */

export type StatusMaquina = 'INATIVA' | 'OPERANDO' | 'MANUTENCAO' | 'PARADA_EMERGENCIA';

export interface Maquina {
  id: number;
  nome: string;
  tipo: string;
  status: StatusMaquina;
  localizacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventoStatusMaquina {
  maquinaId: number;
  nomeMaquina: string;
  statusAnterior: StatusMaquina;
  statusAtual: StatusMaquina;
  ocorridoEm: string;
}
