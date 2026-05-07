import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { autenticacaoInterceptor } from './app/core/autenticacao/interceptors/autenticacao.interceptor';
import { tratamentoErroInterceptor } from './app/core/autenticacao/interceptors/tratamento-erro.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localePtBr);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([autenticacaoInterceptor, tratamentoErroInterceptor])
    ), provideAnimationsAsync(),
  ],
}).catch(err => console.error(err));
