/**
 * @arquivo tamanho-toque.directive.ts
 * @descricao Diretiva de acessibilidade que garante área de toque mínima para ambientes industriais.
 * @padroes WCAG 2.5.5 (Target Size), Standalone Directive
 */

import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appTamanhoToque]',
  standalone: true,
})
export class TamanhoToqueDirective implements OnInit {

  @Input() tamanhoMinimo: 'padrao' | 'grande' = 'padrao';

  private readonly el = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    const elemento = this.el.nativeElement;
    const ehGrande = this.tamanhoMinimo === 'grande';

    elemento.style.minHeight = ehGrande ? '64px' : '48px';
    elemento.style.minWidth = ehGrande ? '64px' : '48px';
    elemento.style.paddingTop = ehGrande ? '16px' : '12px';
    elemento.style.paddingBottom = ehGrande ? '16px' : '12px';
    elemento.style.paddingLeft = '16px';
    elemento.style.paddingRight = '16px';
  }
}
