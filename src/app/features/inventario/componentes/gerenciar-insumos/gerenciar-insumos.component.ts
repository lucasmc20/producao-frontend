import {
  Component, ChangeDetectionStrategy, OnInit, signal, inject
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { SaldoEstoqueService } from '../../servicos/saldo-estoque.service';
import { Insumo, UnidadeMedida } from '../../modelos/insumo.model';
import { UnidadeMedidaPipe } from '../../../../shared/pipes/unidade-medida.pipe';
import { AutenticacaoService } from '../../../../core/autenticacao/servicos/autenticacao.service';
import { ModalConfirmacaoComponent } from '../../../../shared/componentes/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-gerenciar-insumos',
  standalone: true,
  imports: [
    ReactiveFormsModule, DecimalPipe, UnidadeMedidaPipe,
    MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule,
  ],
  templateUrl: './gerenciar-insumos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GerenciarInsumosComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SaldoEstoqueService);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AutenticacaoService);

  readonly insumos = signal<Insumo[]>([]);
  readonly carregando = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);

  readonly mostrandoFormCadastro = signal(false);
  readonly insumoEditando = signal<Insumo | null>(null);
  readonly insumoEntrada = signal<Insumo | null>(null);

  readonly unidades: UnidadeMedida[] = ['KG', 'LITRO', 'UNIDADE', 'GRAMA', 'MILILITRO'];

  readonly colunas = ['nome', 'unidade', 'saldo', 'minimo', 'status', 'acoes'];

  formCadastro!: FormGroup;
  formEdicao!: FormGroup;
  formEntrada!: FormGroup;

  ngOnInit(): void {
    this.formCadastro = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      descricao: [''],
      unidadeMedida: [null, [Validators.required]],
      saldoInicial: [0, [Validators.required, Validators.min(0)]],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]],
    });

    this.formEdicao = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      descricao: [''],
      unidadeMedida: [null, [Validators.required]],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]],
    });

    this.formEntrada = this.fb.group({
      quantidade: [null, [Validators.required, Validators.min(0.0001)]],
      observacao: [''],
    });

    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listarTodos().subscribe({
      next: lista => { this.insumos.set(lista); this.carregando.set(false); },
      error: (e: Error) => { this.erro.set(e.message); this.carregando.set(false); },
    });
  }

  podeGerenciar(): boolean {
    const p = this.auth.perfilAtual();
    return p === 'GESTOR' || p === 'ADMINISTRADOR';
  }

  estoqueBaixo(insumo: Insumo): boolean {
    return insumo.saldoDisponivel <= insumo.estoqueMinimo;
  }

  // --- Cadastro ---
  cadastrar(): void {
    if (this.formCadastro.invalid || this.enviando()) return;
    this.enviando.set(true);
    this.erro.set(null);

    this.service.cadastrar(this.formCadastro.getRawValue()).subscribe({
      next: novo => {
        this.insumos.update(l => [...l, novo]);
        this.sucesso.set(`Insumo "${novo.nome}" cadastrado com sucesso!`);
        this.formCadastro.reset({ saldoInicial: 0, estoqueMinimo: 0 });
        this.mostrandoFormCadastro.set(false);
        this.enviando.set(false);
      },
      error: (e: Error) => { this.erro.set(e.message); this.enviando.set(false); },
    });
  }

  // --- Edição ---
  abrirEdicao(insumo: Insumo): void {
    this.insumoEditando.set(insumo);
    this.formEdicao.patchValue({
      nome: insumo.nome,
      descricao: insumo.descricao,
      unidadeMedida: insumo.unidadeMedida,
      estoqueMinimo: insumo.estoqueMinimo,
    });
    this.erro.set(null);
  }

  salvarEdicao(): void {
    const insumo = this.insumoEditando();
    if (!insumo || this.formEdicao.invalid || this.enviando()) return;
    this.enviando.set(true);
    this.erro.set(null);

    this.service.atualizar(insumo.id, this.formEdicao.getRawValue()).subscribe({
      next: atualizado => {
        this.insumos.update(l => l.map(i => i.id === atualizado.id ? atualizado : i));
        this.sucesso.set(`Insumo "${atualizado.nome}" atualizado!`);
        this.insumoEditando.set(null);
        this.enviando.set(false);
      },
      error: (e: Error) => { this.erro.set(e.message); this.enviando.set(false); },
    });
  }

  cancelarEdicao(): void {
    this.insumoEditando.set(null);
    this.erro.set(null);
  }

  // --- Remoção ---
  confirmarRemocao(insumo: Insumo): void {
    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Remover Insumo',
        mensagem: `Deseja remover permanentemente o insumo "${insumo.nome}"? Esta ação não pode ser desfeita.`,
        rotuloBotaoConfirmar: 'Remover',
        variante: 'perigo',
      },
    });
    ref.afterClosed().subscribe(confirmou => {
      if (!confirmou) return;
      this.service.remover(insumo.id).subscribe({
        next: () => {
          this.insumos.update(l => l.filter(i => i.id !== insumo.id));
          this.sucesso.set(`Insumo "${insumo.nome}" removido.`);
        },
        error: (e: Error) => this.erro.set(e.message),
      });
    });
  }

  // --- Entrada de estoque ---
  abrirEntrada(insumo: Insumo): void {
    this.insumoEntrada.set(insumo);
    this.formEntrada.reset();
    this.erro.set(null);
  }

  confirmarEntrada(): void {
    const insumo = this.insumoEntrada();
    if (!insumo || this.formEntrada.invalid || this.enviando()) return;

    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Confirmar Entrada de Estoque',
        mensagem: `Adicionar ${this.formEntrada.get('quantidade')!.value} ${insumo.unidadeMedida} ao estoque de "${insumo.nome}"?`,
        rotuloBotaoConfirmar: 'Confirmar',
        variante: 'primario',
      },
    });

    ref.afterClosed().subscribe(confirmou => {
      if (!confirmou) return;
      this.enviando.set(true);
      this.service.registrarEntrada(insumo.id, this.formEntrada.getRawValue()).subscribe({
        next: atualizado => {
          this.insumos.update(l => l.map(i => i.id === atualizado.id ? atualizado : i));
          this.sucesso.set(`Entrada registrada! Novo saldo: ${atualizado.saldoDisponivel} ${atualizado.unidadeMedida}`);
          this.insumoEntrada.set(null);
          this.enviando.set(false);
        },
        error: (e: Error) => { this.erro.set(e.message); this.enviando.set(false); },
      });
    });
  }

  cancelarEntrada(): void {
    this.insumoEntrada.set(null);
    this.formEntrada.reset();
  }

  getLabelUnidade(u: string): string {
    const map: Record<string, string> = {
      KG: 'Quilograma (kg)', LITRO: 'Litro (L)',
      UNIDADE: 'Unidade (un)', GRAMA: 'Grama (g)', MILILITRO: 'Mililitro (mL)',
    };
    return map[u] ?? u;
  }
}

