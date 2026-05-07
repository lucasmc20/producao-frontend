/**
 * @arquivo autenticacao.guard.ts
 * @descricao Guard funcional que impede acesso a rotas protegidas sem sessão ativa.
 * @padroes Functional Guard (Angular 15+)
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const autenticacaoGuard: CanActivateFn = () => {
  const autenticacao = inject(AutenticacaoService);
  const router = inject(Router);

  if (autenticacao.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
