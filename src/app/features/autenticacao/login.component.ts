import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AutenticacaoService } from '../../core/autenticacao/servicos/autenticacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-inner">

        <img src="assets/logo-lcs.png" alt="LCS Logo" class="login-logo" />

        <mat-card class="login-card shadow-lg">
          <mat-card-content class="login-card-content">

            <p class="login-subtitle">Faça login para continuar</p>

            @if (erro(); as msg) {
              <div class="login-error">
                <mat-icon>error_outline</mat-icon>
                <p>{{ msg }}</p>
              </div>
            }

            <form [formGroup]="formulario" (ngSubmit)="entrar()" class="login-form">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" floatLabel="always">
                <mat-label>Login</mat-label>
                <input matInput formControlName="login" autocomplete="username" placeholder="Seu login" />
                @if (formulario.controls.login.touched && formulario.controls.login.hasError('required')) {
                  <mat-error>Informe seu login</mat-error>
                }
              </mat-form-field>

              <div class="login-spacer"></div>

              <mat-form-field appearance="outline" subscriptSizing="dynamic" floatLabel="always">
                <mat-label>Senha</mat-label>
                <input matInput type="password" formControlName="senha" autocomplete="current-password" placeholder="Sua senha" />
                @if (formulario.controls.senha.touched && formulario.controls.senha.hasError('required')) {
                  <mat-error>Informe sua senha</mat-error>
                }
              </mat-form-field>

              <div class="login-spacer-lg"></div>

              <button mat-flat-button type="submit" [disabled]="carregando()" class="login-btn">
                @if (carregando()) {
                  <mat-spinner diameter="22"></mat-spinner>
                } @else {
                  <mat-icon>login</mat-icon>
                }
                Entrar
              </button>
            </form>

          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AutenticacaoService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  entrar(): void {
    if (this.formulario.invalid || this.carregando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    const { login, senha } = this.formulario.getRawValue();
    this.auth.autenticar({ login, senha }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/ordens']);
      },
      error: (err: Error) => {
        this.carregando.set(false);
        this.erro.set(err.message || 'Credenciais inválidas.');
      },
    });
  }
}
