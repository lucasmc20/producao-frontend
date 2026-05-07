/**
 * @arquivo monitoramento.routes.ts
 * @descricao Rotas do módulo de monitoramento de máquinas.
 */

import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard-maquinas/dashboard-maquinas.component')
      .then(m => m.DashboardMaquinasComponent),
  },
];

export default routes;
