import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DadosModalConfirmacao {
  titulo: string;
  mensagem: string;
  rotuloBotaoConfirmar?: string;
  variante?: 'primario' | 'perigo';
}

@Component({
  selector: 'app-modal-confirmacao',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="!text-gray-900 !font-semibold">{{ dados.titulo }}</h2>
    <mat-dialog-content>
      <p class="text-operador-base text-gray-600">{{ dados.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        [color]="dados.variante === 'perigo' ? 'warn' : 'primary'"
        [mat-dialog-close]="true">
        {{ dados.rotuloBotaoConfirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalConfirmacaoComponent {
  readonly dados = inject<DadosModalConfirmacao>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ModalConfirmacaoComponent>);
}
