/**
 * @arquivo ordens-producao.store.ts
 * @descricao Store de Signals para gerenciar estado das ordens de produção.
 * @padroes Signal Store, Singleton
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { OrdensProducaoService } from '../servicos/ordens-producao.service';
import { OrdemProducao, StatusOrdem } from '../modelos/ordem-producao.model';

@Injectable({ providedIn: 'root' })
export class OrdensProducaoStore {

  private readonly servico = inject(OrdensProducaoService);

  readonly ordens = signal<OrdemProducao[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly filtroStatus = signal<StatusOrdem | null>(null);

  readonly ordensFiltradas = computed(() => {
    const filtro = this.filtroStatus();
    if (!filtro) return this.ordens();
    return this.ordens().filter(o => o.status === filtro);
  });

  readonly totalPendentes = computed(() =>
    this.ordens().filter(o => o.status === 'PENDENTE').length
  );

  readonly totalEmAndamento = computed(() =>
    this.ordens().filter(o => o.status === 'EM_ANDAMENTO').length
  );

  /** Carrega todas as ordens do backend */
  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.servico.listarTodas().subscribe({
      next: lista => {
        this.ordens.set(lista);
        this.carregando.set(false);
      },
      error: (err: Error) => {
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  /** Atualiza uma ordem na lista local após operação bem-sucedida */
  atualizarOrdemLocal(ordemAtualizada: OrdemProducao): void {
    const lista = this.ordens();
    const indice = lista.findIndex(o => o.id === ordemAtualizada.id);
    if (indice === -1) return;

    const novaLista = [...lista];
    novaLista[indice] = ordemAtualizada;
    this.ordens.set(novaLista);
  }
}
