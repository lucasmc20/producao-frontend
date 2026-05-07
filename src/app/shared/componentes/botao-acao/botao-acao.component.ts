import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-botao-acao',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './botao-acao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotaoAcaoComponent {
  @Input() rotulo = '';
  @Input() variante: 'primario' | 'secundario' | 'perigo' = 'primario';
  @Input() desabilitado = false;
  @Input() carregando = false;
  @Input() tamanho: 'padrao' | 'grande' = 'padrao';

  @Output() acao = new EventEmitter<void>();

  get corMaterial(): string {
    if (this.variante === 'perigo') return 'warn';
    if (this.variante === 'primario') return 'primary';
    return '';
  }

  executar(): void {
    if (!this.desabilitado && !this.carregando) {
      this.acao.emit();
    }
  }
}
