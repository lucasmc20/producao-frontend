/**
 * @arquivo perfil-acesso.guard.ts
 * @descricao Guard de rota baseado em perfis de acesso via Higher-Order Function.
 * @padroes Higher-Order Function, Strategy Pattern
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';
import { PerfilAcesso } from '../../modelos/perfil-usuario.model';

/**
 * Cria um guard que permite acesso apenas aos perfis informados.
 * Redireciona para /acesso-negado caso o perfil não seja compatível.
 */
export function guardPerfilAcesso(perfisPermitidos: PerfilAcesso[]): CanActivateFn {
  return () => {
    const autenticacao = inject(AutenticacaoService);
    const router = inject(Router);

    const perfilUsuario = autenticacao.obterPerfilUsuario();

    if (!perfilUsuario) {
      return router.createUrlTree(['/login']);
    }

    if (perfisPermitidos.includes(perfilUsuario)) {
      return true;
    }

    return router.createUrlTree(['/acesso-negado']);
  };
}
