import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SaldoEstoqueService } from '../../servicos/saldo-estoque.service';
import { Insumo } from '../../modelos/insumo.model';
import { IndicadorStatusComponent } from '../../../../shared/componentes/indicador-status/indicador-status.component';
import { UnidadeMedidaPipe } from '../../../../shared/pipes/unidade-medida.pipe';

@Component({
  selector: 'app-consulta-saldo',
  standalone: true,
  imports: [
    FormsModule, IndicadorStatusComponent, UnidadeMedidaPipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressBarModule,
  ],
  templateUrl: './consulta-saldo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultaSaldoComponent implements OnInit {

  private readonly saldoService = inject(SaldoEstoqueService);

  readonly insumos = signal<Insumo[]>([]);
  readonly carregando = signal(false);
  readonly filtro = signal('');

  ngOnInit(): void {
    this.carregarInsumos();
  }

  get insumosFiltrados(): Insumo[] {
    const termo = this.filtro().toLowerCase();
    if (!termo) return this.insumos();
    return this.insumos().filter(i => i.nome.toLowerCase().includes(termo));
  }

  private carregarInsumos(): void {
    this.carregando.set(true);
    this.saldoService.listarTodos().subscribe({
      next: lista => {
        this.insumos.set(lista);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
