/**
 * @arquivo maquinas.store.ts
 * @descricao Store de Signals para o estado reativo do dashboard de máquinas.
 * @padroes Signal Store, Observer Pattern, Singleton
 */

import { Injectable, computed, signal, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TelemetriaService } from '../servicos/telemetria.service';
import { Maquina, EventoStatusMaquina } from '../modelos/maquina.model';

@Injectable({ providedIn: 'root' })
export class MaquinasStore implements OnDestroy {

  private readonly telemetriaService = inject(TelemetriaService);
  private subscriptionPolling: Subscription | null = null;
  private subscriptionWs: Subscription | null = null;

  readonly maquinas = signal<Maquina[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly totalEmOperacao = computed(() =>
    this.maquinas().filter(m => m.status === 'OPERANDO').length
  );

  readonly totalComAlerta = computed(() =>
    this.maquinas().filter(m => m.status === 'MANUTENCAO').length
  );

  readonly totalParadas = computed(() =>
    this.maquinas().filter(m => m.status === 'PARADA_EMERGENCIA' || m.status === 'INATIVA').length
  );

  /** Inicia monitoramento via polling HTTP com atualização incremental via WebSocket */
  iniciarMonitoramento(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.subscriptionPolling = this.telemetriaService.obterStatusViaPolling().subscribe({
      next: lista => {
        this.maquinas.set(lista);
        this.carregando.set(false);
      },
      error: (err: Error) => {
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });

    // WebSocket para atualizações em tempo real
    this.subscriptionWs = this.telemetriaService.obterStatusMaquinas().subscribe({
      next: (evento: EventoStatusMaquina) => this.aplicarEvento(evento),
      error: (err: Error) => this.erro.set(err.message),
    });
  }

  /** Encerra todas as subscriptions e desconecta o WebSocket */
  pararMonitoramento(): void {
    this.subscriptionPolling?.unsubscribe();
    this.subscriptionWs?.unsubscribe();
    this.subscriptionPolling = null;
    this.subscriptionWs = null;
    this.telemetriaService.desconectar();
  }

  ngOnDestroy(): void {
    this.pararMonitoramento();
  }

  private aplicarEvento(evento: EventoStatusMaquina): void {
    const listaAtual = this.maquinas();
    const indice = listaAtual.findIndex(m => m.id === evento.maquinaId);

    if (indice === -1) return;

    const maquinaAtualizada = { ...listaAtual[indice], status: evento.statusAtual };
    const novaLista = [...listaAtual];
    novaLista[indice] = maquinaAtualizada;
    this.maquinas.set(novaLista);
  }

  /** Atualiza uma máquina na lista local após operação bem-sucedida */
  atualizarMaquinaLocal(maquinaAtualizada: Maquina): void {
    const lista = this.maquinas();
    const indice = lista.findIndex(m => m.id === maquinaAtualizada.id);
    if (indice === -1) return;
    const novaLista = [...lista];
    novaLista[indice] = maquinaAtualizada;
    this.maquinas.set(novaLista);
  }
}
