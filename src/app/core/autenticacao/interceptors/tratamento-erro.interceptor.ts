/**
 * @arquivo tratamento-erro.interceptor.ts
 * @descricao Interceptor de erros HTTP com retry exponencial e redirecionamento contextual.
 * @padroes Strategy Pattern (decisão por código HTTP), Retry with Exponential Backoff
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, retry, timer, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

const CODIGOS_TRANSIENTES = new Set([0, 408, 429, 503, 504]);

function traduzirErroHttp(status: number): string {
  const mensagens: Record<number, string> = {
    400: 'Requisição inválida. Verifique os dados informados.',
    404: 'Recurso não encontrado.',
    409: 'Conflito ao processar a requisição.',
    422: 'Dados enviados não puderam ser processados.',
    500: 'Erro interno no servidor. Tente novamente mais tarde.',
  };
  return mensagens[status] ?? `Erro inesperado (código ${status}).`;
}

export const tratamentoErroInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    retry({
      count: environment.maxTentativasRetry,
      delay: (erro: HttpErrorResponse, tentativa: number) => {
        if (!CODIGOS_TRANSIENTES.has(erro.status)) {
          throw erro;
        }
        // Backoff exponencial: 1s, 2s, 4s...
        const delayMs = Math.pow(2, tentativa - 1) * 1000;
        return timer(delayMs);
      },
    }),
    catchError((erro: HttpErrorResponse) => {
      console.error(`[HTTP ${erro.status}] ${req.method} ${req.url}`, erro.message);

      if (erro.status === 401) {
        router.navigate(['/login']);
      } else if (erro.status === 403) {
        router.navigate(['/acesso-negado']);
      }

      const mensagem = traduzirErroHttp(erro.status);
      return throwError(() => new Error(mensagem));
    })
  );
};
