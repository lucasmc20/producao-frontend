/**
 * @arquivo inventario.routes.ts
 * @descricao Rotas do módulo de inventário/estoque.
 */

import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/gerenciar-insumos/gerenciar-insumos.component')
      .then(m => m.GerenciarInsumosComponent),
  },
  {
    path: 'consulta',
    loadComponent: () => import('./componentes/consulta-saldo/consulta-saldo.component')
      .then(m => m.ConsultaSaldoComponent),
  },
];

export default routes;
