import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-indicador-status',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './indicador-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadorStatusComponent {
  @Input({ required: true }) status = '';
  @Input() tamanho: 'sm' | 'md' = 'md';

  get classesCor(): string {
    const mapa: Record<string, string> = {
      OPERANDO: 'bg-fabrica-verde/20 text-fabrica-verde border-fabrica-verde',
      EM_ANDAMENTO: 'bg-fabrica-verde/20 text-fabrica-verde border-fabrica-verde',
      CONCLUIDA: 'bg-fabrica-verde/20 text-fabrica-verde border-fabrica-verde',
      MANUTENCAO: 'bg-fabrica-amarelo/20 text-fabrica-amarelo border-fabrica-amarelo',
      PAUSADA: 'bg-fabrica-amarelo/20 text-fabrica-amarelo border-fabrica-amarelo',
      PARADA_EMERGENCIA: 'bg-fabrica-vermelho/20 text-fabrica-vermelho border-fabrica-vermelho',
      CANCELADA: 'bg-fabrica-vermelho/20 text-fabrica-vermelho border-fabrica-vermelho',
      INATIVA: 'bg-fabrica-cinza/20 text-fabrica-cinza border-fabrica-cinza',
      PENDENTE: 'bg-fabrica-cinza/20 text-fabrica-cinza border-fabrica-cinza',
    };
    return mapa[this.status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500';
  }

  get icone(): string {
    const mapa: Record<string, string> = {
      OPERANDO: 'check_circle',
      EM_ANDAMENTO: 'play_circle',
      CONCLUIDA: 'task_alt',
      MANUTENCAO: 'build',
      PAUSADA: 'pause_circle',
      PARADA_EMERGENCIA: 'error',
      CANCELADA: 'cancel',
      INATIVA: 'power_settings_new',
      PENDENTE: 'schedule',
    };
    return mapa[this.status] ?? 'info';
  }

  get label(): string {
    const labels: Record<string, string> = {
      OPERANDO: 'Operando',
      EM_ANDAMENTO: 'Em Andamento',
      CONCLUIDA: 'Concluída',
      MANUTENCAO: 'Manutenção',
      PAUSADA: 'Pausada',
      PARADA_EMERGENCIA: 'Parada',
      CANCELADA: 'Cancelada',
      INATIVA: 'Inativa',
      PENDENTE: 'Pendente',
      ABERTO: 'Aberto',
      FECHADO: 'Fechado',
    };
    return labels[this.status] ?? this.status;
  }
}
