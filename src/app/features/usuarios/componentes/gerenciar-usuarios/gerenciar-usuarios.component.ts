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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuariosService } from '../../servicos/usuarios.service';
import { Usuario, PerfilAcesso } from '../../modelos/usuario.model';
import { AutenticacaoService } from '../../../../core/autenticacao/servicos/autenticacao.service';
import { ModalConfirmacaoComponent } from '../../../../shared/componentes/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    MatProgressSpinnerModule, MatChipsModule, MatDialogModule,
  ],
  templateUrl: './gerenciar-usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GerenciarUsuariosComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AutenticacaoService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly carregando = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);
  readonly mostrandoFormulario = signal(false);
  readonly usuarioEditando = signal<Usuario | null>(null);

  readonly colunas = ['nome', 'login', 'perfil', 'ativo', 'acoes'];

  readonly perfis: PerfilAcesso[] = ['OPERADOR', 'GESTOR', 'ADMINISTRADOR'];

  readonly labelPerfil: Record<PerfilAcesso, string> = {
    OPERADOR: 'Operador',
    GESTOR: 'Gestor',
    ADMINISTRADOR: 'Administrador',
  };

  formulario!: FormGroup;
  formEdicao!: FormGroup;

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      login: ['', [Validators.required, Validators.maxLength(100)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      perfilAcesso: [null, [Validators.required]],
    });

    this.formEdicao = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      perfilAcesso: [null, [Validators.required]],
      novaSenha: [''],
    });

    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.service.listarTodos().subscribe({
      next: lista => {
        this.usuarios.set(lista);
        this.carregando.set(false);
      },
      error: (err: Error) => {
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  enviar(): void {
    if (this.formulario.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);
    this.sucesso.set(null);

    this.service.cadastrar(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.sucesso.set('Usuário cadastrado com sucesso!');
        this.formulario.reset();
        this.mostrandoFormulario.set(false);
        this.enviando.set(false);
        this.carregarUsuarios();
      },
      error: (err: Error) => {
        this.erro.set(err.message);
        this.enviando.set(false);
      },
    });
  }

  cancelarFormulario(): void {
    this.formulario.reset();
    this.mostrandoFormulario.set(false);
    this.erro.set(null);
  }

  // --- Edição ---
  abrirEdicao(usuario: Usuario): void {
    this.usuarioEditando.set(usuario);
    this.formEdicao.patchValue({
      nome: usuario.nome,
      perfilAcesso: usuario.perfilAcesso,
      novaSenha: '',
    });
    this.erro.set(null);
  }

  salvarEdicao(): void {
    const usuario = this.usuarioEditando();
    if (!usuario || this.formEdicao.invalid || this.enviando()) return;
    this.enviando.set(true);
    this.erro.set(null);

    this.service.atualizar(usuario.id, this.formEdicao.getRawValue()).subscribe({
      next: atualizado => {
        this.usuarios.update(l => l.map(u => u.id === atualizado.id ? atualizado : u));
        this.sucesso.set(`Usuário "${atualizado.nome}" atualizado!`);
        this.usuarioEditando.set(null);
        this.enviando.set(false);
      },
      error: (err: Error) => { this.erro.set(err.message); this.enviando.set(false); },
    });
  }

  cancelarEdicao(): void {
    this.usuarioEditando.set(null);
    this.erro.set(null);
  }

  // --- Desativação ---
  confirmarDesativar(usuario: Usuario): void {
    const ref = this.dialog.open(ModalConfirmacaoComponent, {
      data: {
        titulo: 'Desativar Usuário',
        mensagem: `Deseja desativar o usuário "${usuario.nome}" (${usuario.login})? O usuário perderá o acesso ao sistema.`,
        rotuloBotaoConfirmar: 'Desativar',
        variante: 'perigo',
      },
    });
    ref.afterClosed().subscribe(confirmou => {
      if (!confirmou) return;
      this.service.desativar(usuario.id).subscribe({
        next: () => {
          this.usuarios.update(l => l.filter(u => u.id !== usuario.id));
          this.sucesso.set(`Usuário "${usuario.nome}" desativado.`);
        },
        error: (err: Error) => this.erro.set(err.message),
      });
    });
  }

  isAdministrador(): boolean {
    return this.auth.perfilAtual() === 'ADMINISTRADOR';
  }

  getLabelPerfil(perfil: string): string {
    return this.labelPerfil[perfil as PerfilAcesso] ?? perfil;
  }
}
