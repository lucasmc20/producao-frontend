import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrdensProducaoService } from '../../servicos/ordens-producao.service';
import { OrdensProducaoStore } from '../../estado/ordens-producao.store';
import { OrdemProducao, Lote } from '../../modelos/ordem-producao.model';
import { AutenticacaoService } from '../../../../core/autenticacao/servicos/autenticacao.service';
import { IndicadorStatusComponent } from '../../../../shared/componentes/indicador-status/indicador-status.component';
import { FormatoLotePipe } from '../../../../shared/pipes/formato-lote.pipe';
import { RegistroLoteComponent } from '../registro-lote/registro-lote.component';
import { ModalConfirmacaoComponent } from '../../../../shared/componentes/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-detalhe-ordem',
  standalone: true,
  imports: [
    RouterLink, DatePipe, ReactiveFormsModule,
    IndicadorStatusComponent, FormatoLotePipe, RegistroLoteComponent,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatListModule,
    MatProgressBarModule, MatDialogModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './detalhe-ordem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheOrdemComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly servico = inject(OrdensProducaoService);
  private readonly store = inject(OrdensProducaoStore);
  readonly auth = inject(AutenticacaoService);
  private readonly dialog = inject(MatDialog);

  readonly ordem = signal<OrdemProducao | null>(null);
  readonly lotes = signal<Lote[]>([]);
  readonly carregando = signal(false);
  readonly processando = signal(false);
  readonly mostrandoFormFinalizar = signal(false);

  formFinalizar!: FormGroup;

  ngOnInit(): void {
    this.formFinalizar = this.fb.group({
      quantidadeProduzida: [null, [Validators.required, Validators.min(0)]],
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarOrdem(id);
    this.carregarLotes(id);
  }

  confirmarIniciarLote(): void {
    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Iniciar Produção',
        mensagem: 'Confirma o início do lote nesta ordem? Esta ação não pode ser desfeita.',
        rotuloBotaoConfirmar: 'Iniciar',
        variante: 'primario',
      },
    });
    ref.afterClosed().subscribe(confirmou => {
      if (confirmou) this.iniciarLote();
    });
  }

  iniciarLote(): void {
    const ordemAtual = this.ordem();
    const usuario = this.auth.usuario();
    if (!ordemAtual || !usuario) return;

    if (!usuario.id) {
      // Sessão antiga sem id — força novo login para obter token atualizado
      this.auth.encerrarSessao();
      return;
    }

    this.processando.set(true);
    this.servico.iniciarLote(ordemAtual.id, { operadorId: usuario.id }).subscribe({
      next: ordemAtualizada => {
        this.ordem.set(ordemAtualizada);
        this.store.atualizarOrdemLocal(ordemAtualizada);
        this.processando.set(false);
      },
      error: () => this.processando.set(false),
    });
  }

  confirmarFinalizar(): void {
    this.mostrandoFormFinalizar.set(true);
  }

  finalizarOrdem(): void {
    if (this.formFinalizar.invalid || this.processando()) return;
    const ordemAtual = this.ordem();
    if (!ordemAtual) return;

    this.processando.set(true);
    const qtd = this.formFinalizar.get('quantidadeProduzida')!.value;
    this.servico.finalizarLote(ordemAtual.id, { quantidadeProduzida: qtd }).subscribe({
      next: ordemAtualizada => {
        this.ordem.set(ordemAtualizada);
        this.store.atualizarOrdemLocal(ordemAtualizada);
        this.mostrandoFormFinalizar.set(false);
        this.processando.set(false);
      },
      error: () => this.processando.set(false),
    });
  }

  confirmarCancelar(): void {
    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Cancelar Ordem',
        mensagem: 'Tem certeza que deseja cancelar esta ordem? Esta ação não pode ser desfeita.',
        rotuloBotaoConfirmar: 'Cancelar Ordem',
        variante: 'perigo',
      },
    });
    ref.afterClosed().subscribe(confirmou => {
      if (confirmou) this.cancelarOrdem();
    });
  }

  cancelarOrdem(): void {
    const ordemAtual = this.ordem();
    if (!ordemAtual) return;

    this.processando.set(true);
    this.servico.cancelar(ordemAtual.id).subscribe({
      next: ordemAtualizada => {
        this.ordem.set(ordemAtualizada);
        this.store.atualizarOrdemLocal(ordemAtualizada);
        this.processando.set(false);
      },
      error: () => this.processando.set(false),
    });
  }

  confirmarFecharLote(lote: Lote): void {
    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Fechar Lote',
        mensagem: `Confirma o fechamento do lote ${lote.numeroLote}?`,
        rotuloBotaoConfirmar: 'Fechar',
        variante: 'primario',
      },
    });
    ref.afterClosed().subscribe(confirmou => {
      if (confirmou) this.fecharLote(lote);
    });
  }

  fecharLote(lote: Lote): void {
    const ordemAtual = this.ordem();
    if (!ordemAtual) return;

    this.servico.fecharLote(ordemAtual.id, lote.id).subscribe({
      next: loteAtualizado => {
        const lista = this.lotes();
        const idx = lista.findIndex(l => l.id === lote.id);
        if (idx !== -1) {
          const nova = [...lista];
          nova[idx] = loteAtualizado;
          this.lotes.set(nova);
        }
      },
    });
  }

  aoRegistrarLote(): void {
    const ordemAtual = this.ordem();
    if (ordemAtual) {
      this.carregarLotes(ordemAtual.id);
    }
  }

  private carregarOrdem(id: number): void {
    this.carregando.set(true);
    this.servico.buscarPorId(id).subscribe({
      next: ordem => {
        this.ordem.set(ordem);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  private carregarLotes(ordemId: number): void {
    this.servico.listarLotes(ordemId).subscribe({
      next: lista => this.lotes.set(lista),
    });
  }
}
