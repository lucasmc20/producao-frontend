/**
 * @arquivo autenticacao.interceptor.ts
 * @descricao Interceptor funcional que injeta o token JWT no header Authorization.
 * @padroes HttpInterceptorFn (Angular 15+), Single Responsibility
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const autenticacaoInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AutenticacaoService).obterToken();

  if (!token) {
    return next(req);
  }

  const reqAutenticada = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(reqAutenticada);
};
