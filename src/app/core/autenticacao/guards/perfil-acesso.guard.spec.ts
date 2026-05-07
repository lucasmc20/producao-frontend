import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guardPerfilAcesso } from './perfil-acesso.guard';
import { AutenticacaoService } from '../servicos/autenticacao.service';
import { PerfilAcesso } from '../../modelos/perfil-usuario.model';

describe('guardPerfilAcesso', () => {
  let autenticacaoServiceMock: jasmine.SpyObj<AutenticacaoService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    autenticacaoServiceMock = jasmine.createSpyObj('AutenticacaoService', ['obterPerfilUsuario']);
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerMock.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AutenticacaoService, useValue: autenticacaoServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('deve permitir acesso quando perfil está na lista', () => {
    autenticacaoServiceMock.obterPerfilUsuario.and.returnValue('GESTOR');

    const guard = guardPerfilAcesso(['GESTOR', 'ADMINISTRADOR']);
    const resultado = TestBed.runInInjectionContext(() =>
      guard({} as never, {} as never)
    );

    expect(resultado).toBeTrue();
  });

  it('deve redirecionar para /acesso-negado quando perfil não está na lista', () => {
    autenticacaoServiceMock.obterPerfilUsuario.and.returnValue('OPERADOR');

    const guard = guardPerfilAcesso(['ADMINISTRADOR']);
    TestBed.runInInjectionContext(() => guard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/acesso-negado']);
  });

  it('deve redirecionar para /login quando não há perfil (não autenticado)', () => {
    autenticacaoServiceMock.obterPerfilUsuario.and.returnValue(null);

    const guard = guardPerfilAcesso(['OPERADOR']);
    TestBed.runInInjectionContext(() => guard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
