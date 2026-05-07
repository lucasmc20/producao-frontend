/**
 * @arquivo app.routes.ts
 * @descricao Definição das rotas principais com lazy loading e guards de perfil.
 * @padroes Lazy Loading, Higher-Order Guard
 */

import { Routes } from '@angular/router';
import { autenticacaoGuard } from './core/autenticacao/guards/autenticacao.guard';
import { guardPerfilAcesso } from './core/autenticacao/guards/perfil-acesso.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'ordens', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/autenticacao/login.component'),
  },
  {
    path: 'ordens',
    loadChildren: () => import('./features/ordens-producao/ordens-producao.routes'),
    canActivate: [autenticacaoGuard, guardPerfilAcesso(['OPERADOR', 'GESTOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'monitoramento',
    loadChildren: () => import('./features/monitoramento/monitoramento.routes'),
    canActivate: [autenticacaoGuard, guardPerfilAcesso(['OPERADOR', 'GESTOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'inventario',
    loadChildren: () => import('./features/inventario/inventario.routes'),
    canActivate: [autenticacaoGuard, guardPerfilAcesso(['GESTOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./features/usuarios/usuarios.routes'),
    canActivate: [autenticacaoGuard, guardPerfilAcesso(['GESTOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'acesso-negado',
    loadComponent: () => import('./shared/componentes/acesso-negado/acesso-negado.component'),
  },
  { path: '**', redirectTo: 'ordens' },
];
