/**
 * @arquivo telemetria.service.ts
 * @descricao Serviço de integração com WebSocket (STOMP) e polling HTTP como fallback.
 * @padroes Repository Pattern, Observer Pattern, Strategy Pattern (fallback)
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, timer, retry, shareReplay, distinctUntilChanged, switchMap, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaPadrao } from '../../../core/modelos/perfil-usuario.model';
import { Maquina, EventoStatusMaquina } from '../modelos/maquina.model';

declare const SockJS: unknown;
declare const Stomp: { over: (socket: unknown) => StompClient };

interface StompClient {
  connect: (headers: Record<string, string>, onConnect: () => void, onError: (err: unknown) => void) => void;
  subscribe: (destination: string, callback: (msg: { body: string }) => void) => { unsubscribe: () => void };
  disconnect: (callback?: () => void) => void;
  connected: boolean;
}

@Injectable({ providedIn: 'root' })
export class TelemetriaService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlApi}/machines`;

  private stompClient: StompClient | null = null;
  private readonly eventosSubject = new Subject<EventoStatusMaquina>();

  /** Lista todas as máquinas via HTTP */
  listarMaquinas(): Observable<Maquina[]> {
    return this.http.get<RespostaPadrao<Maquina[]>>(this.baseUrl).pipe(
      map(r => r.dados)
    );
  }

  /**
   * Conecta ao WebSocket STOMP e emite eventos de mudança de status.
   * Inclui retry com backoff exponencial (até 5 tentativas, máximo 30s).
   */
  obterStatusMaquinas(): Observable<EventoStatusMaquina> {
    this.conectarWebSocket();
    return this.eventosSubject.asObservable().pipe(
      shareReplay(1)
    );
  }

  /** Fallback via polling HTTP com intervalo configurável */
  obterStatusViaPolling(intervaloMs?: number): Observable<Maquina[]> {
    const intervalo = intervaloMs ?? environment.intervaloPollingMs;
    return timer(0, intervalo).pipe(
      switchMap(() => this.listarMaquinas()),
      distinctUntilChanged((anterior, atual) =>
        JSON.stringify(anterior) === JSON.stringify(atual)
      ),
      shareReplay(1)
    );
  }

  /** Encerra a conexão WebSocket */
  desconectar(): void {
    if (this.stompClient?.connected) {
      this.stompClient.disconnect();
      this.stompClient = null;
    }
  }

  /** Altera o status de uma máquina via HTTP (GESTOR ou ADMINISTRADOR) */
  alterarStatus(maquinaId: number, novoStatus: Maquina['status']): Observable<Maquina> {
    const params = new HttpParams().set('novoStatus', novoStatus);
    return this.http.patch<RespostaPadrao<Maquina>>(
      `${this.baseUrl}/${maquinaId}/status`,
      null,
      { params }
    ).pipe(map(r => r.dados));
  }

  private conectarWebSocket(tentativa = 0): void {
    const MAX_TENTATIVAS = 5;
    const MAX_DELAY_MS = 30000;

    if (tentativa >= MAX_TENTATIVAS) {
      console.warn('[Telemetria] Máximo de tentativas de reconexão atingido.');
      return;
    }

    const socket = new (SockJS as new (url: string) => unknown)(`${environment.urlApi}/ws`);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      // Inscrição genérica para todos os eventos de máquinas
      this.stompClient!.subscribe('/topic/maquinas/*/status', (msg) => {
        const evento: EventoStatusMaquina = JSON.parse(msg.body);
        this.eventosSubject.next(evento);
      });
    }, () => {
      // Backoff exponencial: 1s, 2s, 4s, 8s, 16s (limitado a 30s)
      const delayMs = Math.min(Math.pow(2, tentativa) * 1000, MAX_DELAY_MS);
      setTimeout(() => this.conectarWebSocket(tentativa + 1), delayMs);
    });
  }
}
