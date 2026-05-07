import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { autenticacaoInterceptor } from './autenticacao.interceptor';
import { AutenticacaoService } from '../servicos/autenticacao.service';

describe('autenticacaoInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let autenticacaoServiceMock: jasmine.SpyObj<AutenticacaoService>;

  beforeEach(() => {
    autenticacaoServiceMock = jasmine.createSpyObj('AutenticacaoService', ['obterToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([autenticacaoInterceptor])),
        provideHttpClientTesting(),
        { provide: AutenticacaoService, useValue: autenticacaoServiceMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('deve adicionar header Authorization quando token existe', () => {
    autenticacaoServiceMock.obterToken.and.returnValue('token-jwt-valido');

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-jwt-valido');
    req.flush({});
  });

  it('não deve modificar requisição quando não há token', () => {
    autenticacaoServiceMock.obterToken.and.returnValue(null);

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
