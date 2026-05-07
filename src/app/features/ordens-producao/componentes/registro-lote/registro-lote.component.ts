import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdensProducaoService } from '../../servicos/ordens-producao.service';
import { SaldoEstoqueService } from '../../../inventario/servicos/saldo-estoque.service';
import { validadorSaldoEstoque } from '../../../inventario/validadores/saldo-estoque.validator';
import { Insumo } from '../../../inventario/modelos/insumo.model';
import { UnidadeMedidaPipe } from '../../../../shared/pipes/unidade-medida.pipe';

@Component({
  selector: 'app-registro-lote',
  standalone: true,
  imports: [
    ReactiveFormsModule, UnidadeMedidaPipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './registro-lote.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroLoteComponent implements OnInit {

  @Input({ required: true }) ordemId!: number;
  @Output() loteRegistrado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly ordensService = inject(OrdensProducaoService);
  private readonly saldoService = inject(SaldoEstoqueService);

  readonly insumos = signal<Insumo[]>([]);
  readonly enviando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);

  formulario!: FormGroup;

  ngOnInit(): void {
    this.formulario = this.fb.group({
      insumoId: [null, [Validators.required]],
      quantidade: [null, [Validators.required, Validators.min(0.0001)], [
        validadorSaldoEstoque(this.saldoService, () => this.formulario?.get('insumoId')?.value)
      ]],
      numeroLote: ['', [Validators.required, Validators.maxLength(50)]],
    });

    this.saldoService.listarTodos().subscribe({
      next: lista => this.insumos.set(lista),
    });
  }

  enviar(): void {
    if (this.formulario.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.mensagemSucesso.set(null);

    const valor = this.formulario.getRawValue();
    this.ordensService.registrarConsumo(this.ordemId, {
      insumoId: valor.insumoId,
      numeroLote: valor.numeroLote,
      quantidadeConsumida: valor.quantidade,
    }).subscribe({
      next: () => {
        this.formulario.reset();
        this.enviando.set(false);
        this.mensagemSucesso.set('Consumo registrado com sucesso.');
        this.loteRegistrado.emit();
      },
      error: () => this.enviando.set(false),
    });
  }

  get erroSaldo(): number | null {
    const erros = this.formulario.get('quantidade')?.errors;
    return erros?.['saldoInsuficiente']?.disponivel ?? null;
  }
}
