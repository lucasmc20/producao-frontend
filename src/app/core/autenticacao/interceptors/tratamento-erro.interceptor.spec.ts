import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { tratamentoErroInterceptor } from './tratamento-erro.interceptor';

describe('tratamentoErroInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tratamentoErroInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('deve tentar novamente 3x para erro 503', fakeAsync(() => {
    let erroCapturado = false;

    http.get('/api/test').subscribe({
      error: () => { erroCapturado = true; },
    });

    // Primeira tentativa + 3 retries = 4 requisições no total
    for (let i = 0; i < 4; i++) {
      const req = httpTesting.expectOne('/api/test');
      req.flush('Erro', { status: 503, statusText: 'Service Unavailable' });
      tick(Math.pow(2, i) * 1000);
    }

    expect(erroCapturado).toBeTrue();
  }));

  it('deve redirecionar para /login em erro 401', fakeAsync(() => {
    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/test');
    req.flush('', { status: 401, statusText: 'Unauthorized' });
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('não deve tentar novamente para erro 400', fakeAsync(() => {
    let erroCapturado = false;

    http.get('/api/test').subscribe({
      error: () => { erroCapturado = true; },
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush('', { status: 400, statusText: 'Bad Request' });
    tick();

    httpTesting.expectNone('/api/test');
    expect(erroCapturado).toBeTrue();
  }));
});
