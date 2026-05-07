import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { OrdensProducaoStore } from '../../estado/ordens-producao.store';
import { StatusOrdem } from '../../modelos/ordem-producao.model';
import { IndicadorStatusComponent } from '../../../../shared/componentes/indicador-status/indicador-status.component';
import { AutenticacaoService } from '../../../../core/autenticacao/servicos/autenticacao.service';

@Component({
  selector: 'app-lista-ordens',
  standalone: true,
  imports: [
    RouterLink, DatePipe, IndicadorStatusComponent,
    MatCardModule, MatChipsModule, MatIconModule, MatProgressBarModule, MatButtonModule,
  ],
  templateUrl: './lista-ordens.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaOrdensComponent implements OnInit {

  readonly store = inject(OrdensProducaoStore);
  readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly statusDisponiveis: (StatusOrdem | null)[] = [
    null, 'PENDENTE', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA'
  ];

  ngOnInit(): void {
    this.store.carregar();
  }

  alterarFiltro(status: StatusOrdem | null): void {
    this.store.filtroStatus.set(status);
  }

  labelStatus(status: StatusOrdem | null): string {
    if (!status) return 'Todas';
    const labels: Record<StatusOrdem, string> = {
      PENDENTE: 'Pendentes',
      EM_ANDAMENTO: 'Em Andamento',
      PAUSADA: 'Pausadas',
      CONCLUIDA: 'Concluídas',
      CANCELADA: 'Canceladas',
    };
    return labels[status];
  }
}
