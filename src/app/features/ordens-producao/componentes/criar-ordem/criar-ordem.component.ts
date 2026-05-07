import {
  Component, ChangeDetectionStrategy, OnInit, signal, inject
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdensProducaoService } from '../../servicos/ordens-producao.service';
import { OrdensProducaoStore } from '../../estado/ordens-producao.store';
import { TelemetriaService } from '../../../monitoramento/servicos/telemetria.service';
import { UsuariosService } from '../../../usuarios/servicos/usuarios.service';
import { Maquina } from '../../../monitoramento/modelos/maquina.model';
import { Usuario } from '../../../usuarios/modelos/usuario.model';

@Component({
  selector: 'app-criar-ordem',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './criar-ordem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriarOrdemComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ordensService = inject(OrdensProducaoService);
  private readonly store = inject(OrdensProducaoStore);
  private readonly telemetriaService = inject(TelemetriaService);
  private readonly usuariosService = inject(UsuariosService);

  readonly maquinas = signal<Maquina[]>([]);
  readonly operadores = signal<Usuario[]>([]);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  formulario!: FormGroup;

  ngOnInit(): void {
    this.formulario = this.fb.group({
      descricao: ['', [Validators.required]],
      maquinaId: [null, [Validators.required]],
      operadorId: [null, [Validators.required]],
      quantidadePlanejada: [null, [Validators.required, Validators.min(0.0001)]],
      codigoOrdem: ['', [Validators.maxLength(30)]],
    });

    this.telemetriaService.listarMaquinas().subscribe({
      next: lista => this.maquinas.set(lista),
    });

    this.usuariosService.listarTodos().subscribe({
      next: lista => this.operadores.set(lista.filter(u => u.perfilAcesso === 'OPERADOR')),
    });
  }

  enviar(): void {
    if (this.formulario.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    const valor = this.formulario.getRawValue();
    const requisicao = {
      descricao: valor.descricao,
      maquinaId: valor.maquinaId,
      operadorId: valor.operadorId,
      quantidadePlanejada: valor.quantidadePlanejada,
      ...(valor.codigoOrdem ? { codigoOrdem: valor.codigoOrdem } : {}),
    };

    this.ordensService.criarOrdem(requisicao).subscribe({
      next: ordemCriada => {
        this.store.carregar();
        this.router.navigate(['/ordens', ordemCriada.id]);
      },
      error: (err: Error) => {
        this.erro.set(err.message);
        this.enviando.set(false);
      },
    });
  }
}
