import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Maquina, StatusMaquina } from '../../modelos/maquina.model';
import { IndicadorStatusComponent } from '../../../../shared/componentes/indicador-status/indicador-status.component';
import { TelemetriaService } from '../../servicos/telemetria.service';
import { AutenticacaoService } from '../../../../core/autenticacao/servicos/autenticacao.service';
import { ModalConfirmacaoComponent } from '../../../../shared/componentes/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-card-status-maquina',
  standalone: true,
  imports: [
    IndicadorStatusComponent, MatCardModule, MatIconModule,
    MatButtonModule, MatSelectModule, MatFormFieldModule, MatDialogModule,
  ],
  templateUrl: './card-status-maquina.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStatusMaquinaComponent {
  @Input({ required: true }) maquina!: Maquina;
  @Output() statusAlterado = new EventEmitter<Maquina>();

  private readonly telemetria = inject(TelemetriaService);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AutenticacaoService);

  readonly novoStatus = signal<StatusMaquina | null>(null);
  readonly alterando = signal(false);

  readonly statusDisponiveis: StatusMaquina[] = ['INATIVA', 'OPERANDO', 'MANUTENCAO', 'PARADA_EMERGENCIA'];

  readonly labelStatus: Record<StatusMaquina, string> = {
    INATIVA: 'Inativa',
    OPERANDO: 'Operando',
    MANUTENCAO: 'Manutenção',
    PARADA_EMERGENCIA: 'Parada de Emergência',
  };

  get classeBorda(): string {
    const mapa: Record<string, string> = {
      OPERANDO: '!border-l-fabrica-verde',
      MANUTENCAO: '!border-l-fabrica-amarelo',
      PARADA_EMERGENCIA: '!border-l-fabrica-vermelho',
      INATIVA: '!border-l-fabrica-cinza',
    };
    return mapa[this.maquina.status] ?? '!border-l-gray-700';
  }

  get podeAlterarStatus(): boolean {
    const p = this.auth.perfilAtual();
    return p === 'GESTOR' || p === 'ADMINISTRADOR';
  }

  confirmarAlteracao(): void {
    const status = this.novoStatus();
    if (!status) return;

    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Alterar Status',
        mensagem: `Alterar status de "${this.maquina.nome}" para "${this.labelStatus[status]}"?`,
        rotuloBotaoConfirmar: 'Alterar',
        variante: 'primario',
      },
    });

    ref.afterClosed().subscribe(confirmou => {
      if (confirmou) this.aplicarAlteracao(status);
    });
  }

  private aplicarAlteracao(status: StatusMaquina): void {
    this.alterando.set(true);
    this.telemetria.alterarStatus(this.maquina.id, status).subscribe({
      next: maquinaAtualizada => {
        this.novoStatus.set(null);
        this.alterando.set(false);
        this.statusAlterado.emit(maquinaAtualizada);
      },
      error: () => this.alterando.set(false),
    });
  }
}

