/**
 * @arquivo ordens-producao.routes.ts
 * @descricao Rotas do módulo de ordens de produção.
 */

import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/lista-ordens/lista-ordens.component')
      .then(m => m.ListaOrdensComponent),
  },
  {
    path: 'nova',
    loadComponent: () => import('./componentes/criar-ordem/criar-ordem.component')
      .then(m => m.CriarOrdemComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./componentes/detalhe-ordem/detalhe-ordem.component')
      .then(m => m.DetalheOrdemComponent),
  },
];

export default routes;
