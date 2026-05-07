import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/gerenciar-usuarios/gerenciar-usuarios.component')
      .then(m => m.GerenciarUsuariosComponent),
  },
];

export default routes;
