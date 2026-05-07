import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { validadorSaldoEstoque } from './saldo-estoque.validator';
import { SaldoEstoqueService } from '../servicos/saldo-estoque.service';
import { SaldoEstoque } from '../modelos/insumo.model';

describe('validadorSaldoEstoque', () => {
  let servicoMock: jasmine.SpyObj<SaldoEstoqueService>;

  beforeEach(() => {
    servicoMock = jasmine.createSpyObj('SaldoEstoqueService', ['consultarSaldo']);
  });

  it('deve retornar null quando saldo é suficiente', fakeAsync(() => {
    const saldoResposta: SaldoEstoque = {
      insumoId: 1,
      nomeInsumo: 'Teste',
      unidadeMedida: 'KG',
      saldoDisponivel: 100,
      estoqueMinimo: 10,
      saldoSuficiente: true,
    };
    servicoMock.consultarSaldo.and.returnValue(of(saldoResposta));

    const validador = validadorSaldoEstoque(servicoMock, () => 1);
    const controle = new FormControl(50);

    let resultado: unknown;
    (validador(controle) as ReturnType<typeof of>).subscribe(r => resultado = r);
    tick(500);

    expect(resultado).toBeNull();
  }));

  it('deve retornar erro quando saldo é insuficiente', fakeAsync(() => {
    const saldoResposta: SaldoEstoque = {
      insumoId: 1,
      nomeInsumo: 'Teste',
      unidadeMedida: 'KG',
      saldoDisponivel: 20,
      estoqueMinimo: 10,
      saldoSuficiente: false,
    };
    servicoMock.consultarSaldo.and.returnValue(of(saldoResposta));

    const validador = validadorSaldoEstoque(servicoMock, () => 1);
    const controle = new FormControl(50);

    let resultado: unknown;
    (validador(controle) as ReturnType<typeof of>).subscribe(r => resultado = r);
    tick(500);

    expect(resultado).toEqual({ saldoInsuficiente: { disponivel: 20 } });
  }));

  it('deve retornar null quando API falha (não punir o usuário)', fakeAsync(() => {
    servicoMock.consultarSaldo.and.returnValue(throwError(() => new Error('Network error')));

    const validador = validadorSaldoEstoque(servicoMock, () => 1);
    const controle = new FormControl(50);

    let resultado: unknown;
    (validador(controle) as ReturnType<typeof of>).subscribe(r => resultado = r);
    tick(500);

    expect(resultado).toBeNull();
  }));

  it('deve retornar null quando insumoId é null', fakeAsync(() => {
    const validador = validadorSaldoEstoque(servicoMock, () => null);
    const controle = new FormControl(50);

    let resultado: unknown;
    (validador(controle) as ReturnType<typeof of>).subscribe(r => resultado = r);
    tick(500);

    expect(resultado).toBeNull();
  }));
});
