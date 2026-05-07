import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-acesso-negado',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-fabrica-fundo text-white p-6">
      <mat-icon class="!text-6xl !w-16 !h-16 text-fabrica-vermelho mb-4">lock</mat-icon>
      <h1 class="text-operador-xl font-bold mb-4">Acesso Negado</h1>
      <p class="text-operador-base text-gray-400 mb-6">Você não possui permissão para acessar esta página.</p>
      <a mat-raised-button color="primary" routerLink="/ordens">
        <mat-icon>arrow_back</mat-icon>
        Voltar para Ordens de Produção
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AcessoNegadoComponent {}
